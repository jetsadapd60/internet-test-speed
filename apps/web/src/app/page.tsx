"use client";

import { Button } from "@/components/ui/button";
import { SpeedGauge } from "@/components/speed-gauge";
import { RealTimeGraph } from "@/components/real-time-graph";
import { useSpeedTest } from "@/hooks/use-speed-test";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const router = useRouter();
  const { phase, results, realtimeSpeed, graphData, startTest } =
    useSpeedTest();

  const isTesting =
    phase === "ping" || phase === "download" || phase === "upload";

  // Redirect to result page when test completes
  useEffect(() => {
    if (results && !isTesting && phase === "complete") {
      const params = new URLSearchParams({
        download: results.download.toFixed(2),
        upload: results.upload.toFixed(2),
        ping: results.ping.toFixed(2),
        jitter: results.jitter.toFixed(2),
      });
      router.push(`/result?${params.toString()}`);
    }
  }, [results, isTesting, phase, router]);

  const getGaugeMax = (value: number) => {
    if (value <= 100) return 100;
    if (value <= 500) return 500;
    if (value <= 1000) return 1000;
    if (value <= 2500) return 2500;
    if (value <= 5000) return 5000;
    return 10000;
  };

  const gaugeMax = getGaugeMax(realtimeSpeed);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-b from-background to-secondary/30 p-8 sm:p-20 font-(family-name:--font-geist-sans)">
      <main className="flex flex-col gap-8 items-center text-center max-w-2xl w-full">
        <div className="space-y-4">
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-linear-to-r from-primary via-accent to-blue-600 animate-pulse-slow">
            {phase === "complete" ? "Test Completed" : "Speed Test"}
          </h1>
          <p className="text-xl text-muted-foreground">
            {phase !== "idle"
              ? `Current Status: ${phase.toUpperCase()}`
              : "Analyze your internet quality including speed, latency, and jitter."}
          </p>
        </div>

        <div className="py-8 w-full flex flex-col items-center justify-center gap-8">
          {/* Visual Placeholder for the Gauge */}
          <div className="relative group">
            <div
              className={`absolute -inset-1 bg-linear-to-r from-primary to-accent rounded-full blur opacity-25 transition duration-1000 ${isTesting ? "opacity-75 animate-spin-slow" : "group-hover:opacity-50"}`}
            ></div>
            <div className="relative bg-background/50 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
              <SpeedGauge value={Math.round(realtimeSpeed)} max={gaugeMax} />
              <div className="mt-8">
                <Button
                  size="lg"
                  onClick={startTest}
                  disabled={isTesting}
                  className="rounded-full px-12 text-xl shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:shadow-[0_0_30px_rgba(14,165,233,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isTesting ? "TESTING..." : "START TEST"}
                </Button>
              </div>
            </div>
          </div>

          {/* Real-time Graph Display */}
          {(isTesting || phase === "complete") && (
            <div className="w-full max-w-md h-[150px] relative bg-background/30 backdrop-blur-sm rounded-xl border border-white/5 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="absolute top-2 left-4 text-xs font-bold text-muted-foreground z-10">
                {phase === "ping" ? "LATENCY (ms)" : "SPEED (Mbps)"}
              </div>
              <RealTimeGraph
                data={graphData}
                color={phase === "upload" ? "#a855f7" : "#0ea5e9"}
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 w-full mt-4">
          <div
            className={`p-4 rounded-2xl border transition-all duration-300 ${phase === "download" ? "bg-primary/10 border-primary shadow-lg scale-105" : "bg-white/5 border-white/10"}`}
          >
            <div className="text-2xl font-bold text-primary mb-1">
              {results.download > 0 ? results.download.toFixed(2) : "---"}
            </div>
            <div className="text-sm text-muted-foreground">Download Mbps</div>
          </div>
          <div
            className={`p-4 rounded-2xl border transition-all duration-300 ${phase === "upload" ? "bg-accent/10 border-accent shadow-lg scale-105" : "bg-white/5 border-white/10"}`}
          >
            <div className="text-2xl font-bold text-accent mb-1">
              {results.upload > 0 ? results.upload.toFixed(2) : "---"}
            </div>
            <div className="text-sm text-muted-foreground">Upload Mbps</div>
          </div>
          <div
            className={`p-4 rounded-2xl border transition-all duration-300 ${phase === "ping" ? "bg-green-500/10 border-green-500 shadow-lg scale-105" : "bg-white/5 border-white/10"}`}
          >
            <div className="text-2xl font-bold text-green-500 mb-1">
              {results.ping > 0 ? `${results.ping} ms` : "---"}
            </div>
            <div className="text-sm text-muted-foreground">
              Ping / Jitter {results.jitter > 0 && `(${results.jitter}ms)`}
            </div>
          </div>
        </div>
      </main>

      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center mt-16 text-sm text-muted-foreground">
        <p>© 2026 Internet Quality Intelligence</p>
      </footer>
    </div>
  );
}
