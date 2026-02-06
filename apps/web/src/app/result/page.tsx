"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Download,
  Upload,
  Activity,
  Timer,
  Share2,
  ArrowLeft,
} from "lucide-react";

interface TestResult {
  id: string;
  timestamp: number;
  download: number;
  upload: number;
  ping: number;
  jitter: number;
  healthScore: number;
}

function calculateHealthScore(
  download: number,
  upload: number,
  ping: number,
  jitter: number,
): number {
  // Health Score algorithm (0-100)
  // Download: 40%, Upload: 30%, Ping: 20%, Jitter: 10%
  const downloadScore = Math.min((download / 100) * 100, 100); // 100 Mbps = 100%
  const uploadScore = Math.min((upload / 50) * 100, 100); // 50 Mbps = 100%
  const pingScore = Math.max(100 - ping, 0); // Lower is better, 0ms = 100%
  const jitterScore = Math.max(100 - jitter * 10, 0); // Lower is better

  const score =
    downloadScore * 0.4 +
    uploadScore * 0.3 +
    pingScore * 0.2 +
    jitterScore * 0.1;

  return Math.round(score);
}

function ResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [result, setResult] = useState<TestResult | null>(null);
  const savedRef = useRef(false);

  useEffect(() => {
    // Try to get result from URL params or localStorage
    const downloadParam = searchParams.get("download");
    const uploadParam = searchParams.get("upload");
    const pingParam = searchParams.get("ping");
    const jitterParam = searchParams.get("jitter");

    if (
      downloadParam &&
      uploadParam &&
      pingParam &&
      jitterParam &&
      !savedRef.current
    ) {
      savedRef.current = true;
      const download = parseFloat(downloadParam);
      const upload = parseFloat(uploadParam);
      const ping = parseFloat(pingParam);
      const jitter = parseFloat(jitterParam);
      const healthScore = calculateHealthScore(download, upload, ping, jitter);

      setResult({
        id: Date.now().toString(),
        timestamp: Date.now(),
        download,
        upload,
        ping,
        jitter,
        healthScore,
      });

      // Save to localStorage for history
      const history = JSON.parse(
        localStorage.getItem("speedtest_history") || "[]",
      );
      history.unshift({
        id: Date.now().toString(),
        timestamp: Date.now(),
        download,
        upload,
        ping,
        jitter,
        healthScore,
      });
      localStorage.setItem(
        "speedtest_history",
        JSON.stringify(history.slice(0, 20)),
      ); // Keep last 20
    }
  }, [searchParams]);

  const handleShare = () => {
    if (!result) return;
    const text = `My Internet Speed:\n↓ ${result.download.toFixed(2)} Mbps | ↑ ${result.upload.toFixed(2)} Mbps | 🏓 ${result.ping.toFixed(0)}ms\nHealth Score: ${result.healthScore}/100`;
    if (navigator.share) {
      navigator.share({ text });
    } else {
      navigator.clipboard.writeText(text);
      alert("Result copied to clipboard!");
    }
  };

  if (!result) {
    return (
      <div className="container mx-auto flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <p className="text-slate-400">No test result found</p>
          <Button onClick={() => router.push("/")} className="mt-4">
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  const getHealthColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getHealthLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Poor";
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Test
          </Button>
          <Button onClick={handleShare} className="gap-2">
            <Share2 className="h-4 w-4" />
            Share Result
          </Button>
        </div>

        {/* Health Score Circle */}
        <div className="mb-12 flex flex-col items-center justify-center gap-8">
          <div className="relative">
            <div className="absolute -inset-4 rounded-full bg-linear-to-r from-primary to-accent opacity-20 blur-2xl"></div>
            <div className="relative flex h-64 w-64 items-center justify-center rounded-full border-8 border-primary/30 bg-background/50 backdrop-blur-xl">
              <div className="text-center">
                <div
                  className={`text-6xl font-bold ${getHealthColor(result.healthScore)}`}
                >
                  {result.healthScore}
                </div>
                <div className="mt-2 text-sm font-medium text-slate-400">
                  {getHealthLabel(result.healthScore)}
                </div>
                <div className="mt-1 text-xs text-slate-500">Health Score</div>
              </div>
            </div>
          </div>

          <Button
            size="lg"
            onClick={() => router.push("/")}
            className="rounded-full px-8 text-lg shadow-[0_0_20px_rgba(14,165,233,0.3)] transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(14,165,233,0.5)]"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Test Again
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Download */}
          <div className="rounded-2xl border border-white/10 bg-background/50 p-6 backdrop-blur-xl transition-all hover:border-primary/50">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
                <Download className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium text-slate-400">
                Download
              </span>
            </div>
            <div className="text-3xl font-bold text-white">
              {result.download.toFixed(2)}
            </div>
            <div className="mt-1 text-xs text-slate-500">Mbps</div>
          </div>

          {/* Upload */}
          <div className="rounded-2xl border border-white/10 bg-background/50 p-6 backdrop-blur-xl transition-all hover:border-primary/50">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400">
                <Upload className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium text-slate-400">Upload</span>
            </div>
            <div className="text-3xl font-bold text-white">
              {result.upload.toFixed(2)}
            </div>
            <div className="mt-1 text-xs text-slate-500">Mbps</div>
          </div>

          {/* Ping */}
          <div className="rounded-2xl border border-white/10 bg-background/50 p-6 backdrop-blur-xl transition-all hover:border-primary/50">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20 text-green-400">
                <Activity className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium text-slate-400">Ping</span>
            </div>
            <div className="text-3xl font-bold text-white">
              {result.ping.toFixed(0)}
            </div>
            <div className="mt-1 text-xs text-slate-500">ms</div>
          </div>

          {/* Jitter */}
          <div className="rounded-2xl border border-white/10 bg-background/50 p-6 backdrop-blur-xl transition-all hover:border-primary/50">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/20 text-orange-400">
                <Timer className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium text-slate-400">Jitter</span>
            </div>
            <div className="text-3xl font-bold text-white">
              {result.jitter.toFixed(1)}
            </div>
            <div className="mt-1 text-xs text-slate-500">ms</div>
          </div>
        </div>

        {/* Test Info */}
        <div className="mt-8 rounded-2xl border border-white/10 bg-background/50 p-6 backdrop-blur-xl">
          <h3 className="mb-4 text-lg font-semibold">Test Information</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Test Date:</span>
              <span className="text-white">
                {new Date(result.timestamp).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Test ID:</span>
              <span className="font-mono text-xs text-white">{result.id}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResultContent />
    </Suspense>
  );
}
