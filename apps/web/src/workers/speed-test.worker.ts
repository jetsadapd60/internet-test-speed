/* eslint-disable no-restricted-globals */

// Speed Test Worker
// Handles Ping (WS), Download (Fetch/Stream), and Upload (XHR/Fetch)

interface WorkerConfig {
  baseUrl: string; // e.g., 'http://localhost:8080'
}

let config: WorkerConfig = {
  baseUrl: "http://localhost:3000",
};

self.onmessage = async (e: MessageEvent) => {
  const { type, payload } = e.data;

  switch (type) {
    case "config":
      config = payload;
      // Handle Mixed Content: Upgrade to https/wss if we are in a secure context (HTTPS)
      if (self.isSecureContext || self.location.protocol === "https:") {
        if (config.baseUrl.startsWith("http://")) {
          config.baseUrl = config.baseUrl.replace("http://", "https://");
        }
      }
      break;
    case "start-ping":
      await runPingTest();
      break;
    case "start-download":
      await runDownloadTest();
      break;
    case "start-upload":
      await runUploadTest();
      break;
    default:
      console.error("Unknown worker command:", type);
  }
};

async function runPingTest() {
  const wsUrl = config.baseUrl.replace(/^http/, "ws") + "/ping";
  const ws = new WebSocket(wsUrl);

  const pings: number[] = [];
  const maxPings = 10;
  let completed = 0;

  ws.onopen = () => {
    sendPing();
  };

  const sendPing = () => {
    if (completed >= maxPings) {
      ws.close();
      // Calculate jitter (std dev) and average
      const avg = pings.reduce((a, b) => a + b, 0) / pings.length;
      const jitter = calculateJitter(pings);
      self.postMessage({
        type: "result",
        phase: "ping",
        data: { ping: avg, jitter },
      });
      self.postMessage({ type: "done", phase: "ping" });
      return;
    }
    ws.send(Date.now().toString());
  };

  ws.onmessage = (e) => {
    const start = parseInt(e.data);
    const now = Date.now();
    const rtt = now - start;
    pings.push(rtt);
    completed++;

    self.postMessage({ type: "progress", phase: "ping", value: rtt });

    // Gap between pings
    setTimeout(sendPing, 100);
  };

  ws.onerror = (e) => {
    self.postMessage({
      type: "error",
      phase: "ping",
      error: "WebSocket connection failed",
    });
  };
}

async function runDownloadTest() {
  const duration = 10000; // 10s
  const startTime = Date.now();
  const concurrency = 10; // Use 10 parallel streams for download

  let totalLoaded = 0;
  const controller = new AbortController();

  // Reporting setup
  let lastReportTime = startTime;
  let lastTotalLoaded = 0;

  const reportInterval = setInterval(() => {
    const now = Date.now();
    const timeDiff = (now - lastReportTime) / 1000;
    if (timeDiff > 0.2) {
      const chunkLoaded = totalLoaded - lastTotalLoaded;
      const speedMbps = (chunkLoaded * 8) / timeDiff / (1024 * 1024);
      self.postMessage({
        type: "progress",
        phase: "download",
        value: speedMbps,
        timestamp: now,
      });
      lastTotalLoaded = totalLoaded;
      lastReportTime = now;
    }
  }, 200);

  const downloadTask = async () => {
    try {
      const url = `${config.baseUrl}/download?duration=10&t=${Math.random()}`;
      const response = await fetch(url, { signal: controller.signal });
      if (!response.body) return;
      const reader = response.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        totalLoaded += value.length;
      }
    } catch (e) {
      // Ignore abort errors
    }
  };

  try {
    const tasks = Array(concurrency)
      .fill(null)
      .map(() => downloadTask());

    // Timeout to stop the test
    setTimeout(() => controller.abort(), duration);

    await Promise.all(tasks);
    clearInterval(reportInterval);

    const totalTime = (Date.now() - startTime) / 1000;
    const finalSpeed = (totalLoaded * 8) / totalTime / (1024 * 1024);

    self.postMessage({
      type: "result",
      phase: "download",
      data: { speed: finalSpeed },
    });
    self.postMessage({ type: "done", phase: "download" });
  } catch (err: any) {
    clearInterval(reportInterval);
    self.postMessage({ type: "error", phase: "download", error: err.message });
  }
}

async function runUploadTest() {
  const duration = 8000; // 8s upload test
  const startTime = Date.now();
  const endTime = startTime + duration;
  const url = `${config.baseUrl}/upload`;

  // Use larger chunk for high-speed connections (2MB)
  const chunkSize = 2 * 1024 * 1024;
  const chunk = new Uint8Array(chunkSize);

  // crypto.getRandomValues has a limit of 64KB per call
  const maxSafeSize = 65536;
  for (let i = 0; i < chunkSize; i += maxSafeSize) {
    const size = Math.min(maxSafeSize, chunkSize - i);
    crypto.getRandomValues(chunk.subarray(i, i + size));
  }

  const controller = new AbortController();
  const signal = controller.signal;

  let keepGoing = true;
  let bytesSent = 0;
  let lastReportTime = startTime;
  let lastBytesSent = 0;

  const reportInterval = setInterval(() => {
    const now = Date.now();
    const timeDiff = (now - lastReportTime) / 1000;
    if (timeDiff > 0.2) {
      const diffBytes = bytesSent - lastBytesSent;
      const speedMbps = (diffBytes * 8) / timeDiff / (1024 * 1024);
      self.postMessage({
        type: "progress",
        phase: "upload",
        value: speedMbps,
        timestamp: now,
      });
      lastReportTime = now;
      lastBytesSent = bytesSent;
    }
  }, 200);

  try {
    const concurrency = 10; // Use 10 parallel uploads
    const promises = [];

    for (let i = 0; i < concurrency; i++) {
      promises.push(
        (async () => {
          while (keepGoing && Date.now() < endTime) {
            try {
              const response = await fetch(url, {
                method: "POST",
                body: chunk,
                cache: "no-store",
                signal: signal,
                // Mode 'no-cors' might be slightly faster but we need results
              });
              await response.text();
              if (response.ok) {
                bytesSent += chunkSize;
              }
            } catch (e: any) {
              if (e.name === "AbortError") break;
              await new Promise((r) => setTimeout(r, 10));
            }
          }
        })(),
      );
    }

    // Stop after duration
    setTimeout(() => {
      keepGoing = false;
      controller.abort();
    }, duration);

    await Promise.all(promises);
    clearInterval(reportInterval);

    const totalTime = (Date.now() - startTime) / 1000;
    const finalSpeed = (bytesSent * 8) / totalTime / (1024 * 1024);

    self.postMessage({
      type: "result",
      phase: "upload",
      data: { speed: finalSpeed },
    });
    self.postMessage({ type: "done", phase: "upload" });
  } catch (err: any) {
    clearInterval(reportInterval);
    self.postMessage({ type: "error", phase: "upload", error: err.message });
  }
}

function calculateJitter(values: number[]): number {
  if (values.length < 2) return 0;
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / values.length;
  return Math.sqrt(variance);
}
