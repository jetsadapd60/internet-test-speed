import { useEffect, useRef, useState, useCallback } from "react";

type TestPhase = "idle" | "ping" | "download" | "upload" | "complete" | "error";

interface TestResult {
  ping: number;
  jitter: number;
  download: number;
  upload: number;
}

interface GraphPoint {
  timestamp: number;
  value: number;
}

export function useSpeedTest() {
  const [phase, setPhase] = useState<TestPhase>("idle");
  const [progress, setProgress] = useState(0); // 0-100 overall
  const [realtimeSpeed, setRealtimeSpeed] = useState(0); // Current Mbps for Gauge
  const [results, setResults] = useState<TestResult>({
    ping: 0,
    jitter: 0,
    download: 0,
    upload: 0,
  });
  const [graphData, setGraphData] = useState<GraphPoint[]>([]);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    // Initialize Worker
    workerRef.current = new Worker(
      new URL("../workers/speed-test.worker.ts", import.meta.url),
    );

    // Set config target (should be env var in real app)
    const engineUrl =
      process.env.NEXT_PUBLIC_ENGINE_URL || "http://localhost:3000";
    workerRef.current.postMessage({
      type: "config",
      payload: { baseUrl: engineUrl },
    });

    workerRef.current.onmessage = (e) => {
      const { type, phase: workerPhase, value, data, timestamp } = e.data;

      switch (type) {
        case "progress":
          if (["download", "upload"].includes(workerPhase)) {
            setRealtimeSpeed(value);
            if (timestamp) {
              setGraphData((prev) =>
                [...prev, { timestamp, value }].slice(-50),
              );
            }
          }
          if (workerPhase === "ping") {
            // value here is RTT
            setResults((prev) => ({ ...prev, ping: value }));
          }
          break;

        case "result":
          if (workerPhase === "ping") {
            setResults((prev) => ({
              ...prev,
              ping: Math.round(data.ping),
              jitter: Math.round(data.jitter),
            }));
          } else if (workerPhase === "download") {
            setResults((prev) => ({
              ...prev,
              download: parseFloat(data.speed.toFixed(2)),
            }));
          } else if (workerPhase === "upload") {
            setResults((prev) => ({
              ...prev,
              upload: parseFloat(data.speed.toFixed(2)),
            }));
          }
          break;

        case "done":
          handlePhaseCompletion(workerPhase);
          break;

        case "error":
          console.error("Worker error:", e.data.error);
          setPhase("error");
          break;

        case "log":
          console.log(`[Worker] ${e.data.message}`);
          break;
      }
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const handlePhaseCompletion = (completedPhase: string) => {
    if (completedPhase === "ping") {
      setPhase("download");
      setGraphData([]); // Clear graph for next phase
      workerRef.current?.postMessage({ type: "start-download" });
    } else if (completedPhase === "download") {
      setPhase("upload");
      setGraphData([]);
      workerRef.current?.postMessage({ type: "start-upload" });
    } else if (completedPhase === "upload") {
      handleComplete();
    }
  };

  const handleComplete = () => {
    setPhase("complete");
    setRealtimeSpeed(0);
  };

  const startTest = useCallback(() => {
    if (!workerRef.current) return;
    setPhase("ping");
    setResults({ ping: 0, jitter: 0, download: 0, upload: 0 });
    setGraphData([]);
    setRealtimeSpeed(0);
    workerRef.current.postMessage({ type: "start-ping" });
  }, []);

  return {
    phase,
    results,
    realtimeSpeed,
    graphData,
    startTest,
  };
}
