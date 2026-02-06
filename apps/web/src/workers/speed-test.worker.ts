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
  const url = `${config.baseUrl}/download?duration=10`; // Ask server to stream for 10s

  let loaded = 0;
  let lastLoaded = 0;
  let lastTime = startTime;

  try {
    const response = await fetch(url);
    if (!response.body) throw new Error("No response body");

    const reader = response.body.getReader();

    // Interval for reporting speed
    const reportInterval = setInterval(() => {
      const now = Date.now();
      const timeDiff = (now - lastTime) / 1000; // seconds

      if (timeDiff > 0.2) {
        // Update every 200ms
        const chunkLoaded = loaded - lastLoaded;
        const bitsLoaded = chunkLoaded * 8;
        const speedMbps = bitsLoaded / timeDiff / (1024 * 1024);

        // Instant speed
        self.postMessage({
          type: "progress",
          phase: "download",
          value: speedMbps,
          timestamp: now,
        });

        lastLoaded = loaded;
        lastTime = now;
      }
    }, 200);

    const checkTimeout = Date.now() + duration;

    while (true) {
      const { done, value } = await reader.read();
      if (done || Date.now() > checkTimeout) break;
      loaded += value.length;
    }

    clearInterval(reportInterval);

    // Final Calculation
    const totalTime = (Date.now() - startTime) / 1000;
    const finalSpeed = (loaded * 8) / totalTime / (1024 * 1024);

    self.postMessage({
      type: "result",
      phase: "download",
      data: { speed: finalSpeed },
    });
    self.postMessage({ type: "done", phase: "download" });
  } catch (err: any) {
    self.postMessage({ type: "error", phase: "download", error: err.message });
  }
}

async function runUploadTest() {
  const duration = 3000; // 3s upload test
  const startTime = Date.now();
  const endTime = startTime + duration;
  const url = `${config.baseUrl}/upload`;

  // Use smaller chunk to prevent clogging (64KB)
  const chunkSize = 64 * 1024;
  const chunk = new Uint8Array(chunkSize);
  crypto.getRandomValues(chunk);

  const controller = new AbortController();
  const signal = controller.signal;

  let keepGoing = true;
  let bytesSent = 0;
  let lastReportTime = startTime;
  let lastBytesSent = 0;

  self.postMessage({ type: "log", message: "Starting Upload Test" });

  const timeout = setTimeout(() => {
    self.postMessage({ type: "log", message: "Upload timeout fired" });
    keepGoing = false;
    controller.abort();
  }, duration + 500); // Trigger abort slightly after expected end to allow graceful finish

  const reportInterval = setInterval(() => {
    const now = Date.now();
    const timeDiff = (now - lastReportTime) / 1000;
    if (timeDiff > 0.25) {
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
  }, 250);

  try {
    const concurrency = 2;
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
              });

              // Ensure we consume the response to free resources
              await response.text();

              if (response.ok) {
                bytesSent += chunkSize;
              }
            } catch (e: any) {
              if (e.name === "AbortError") break;
              // Wait a bit on error
              await new Promise((resolve) => setTimeout(resolve, 50));
            }
          }
          self.postMessage({ type: "log", message: "Upload loop exited" });
        })(),
      );
    }

    await Promise.all(promises);
    clearTimeout(timeout);
    clearInterval(reportInterval);

    self.postMessage({ type: "log", message: "All upload promises resolved" });

    const totalTime = (Date.now() - startTime) / 1000;
    const finalSpeed = (bytesSent * 8) / totalTime / (1024 * 1024);

    self.postMessage({
      type: "log",
      message: `Upload complete: ${bytesSent} bytes in ${totalTime}s = ${finalSpeed} Mbps`,
    });

    self.postMessage({
      type: "result",
      phase: "upload",
      data: { speed: finalSpeed },
    });
    self.postMessage({ type: "done", phase: "upload" });
  } catch (err: any) {
    clearTimeout(timeout);
    clearInterval(reportInterval);
    self.postMessage({ type: "log", message: `Upload error: ${err.message}` });
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
