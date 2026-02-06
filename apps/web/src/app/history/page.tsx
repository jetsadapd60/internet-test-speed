"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Upload, Activity, Timer, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/confirm-modal";

import { storage, type TestResult } from "@/lib/storage";

export default function HistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<TestResult[]>([]);

  useEffect(() => {
    // Load history from storage service
    const results = storage.getHistory();
    setHistory(results); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  /* Modal State */
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    type: "clear" | "delete";
    itemId?: string;
    title: string;
    description: string;
  }>({
    type: "clear",
    title: "",
    description: "",
  });

  const confirmAction = () => {
    if (modalConfig.type === "clear") {
      storage.clearAll();
      setHistory([]);
    } else if (modalConfig.type === "delete" && modalConfig.itemId) {
      storage.deleteResult(modalConfig.itemId);
      setHistory(storage.getHistory());
    }
    setModalOpen(false);
  };

  const handleClearClick = () => {
    setModalConfig({
      type: "clear",
      title: "Clear All History",
      description:
        "Are you sure you want to delete all test results? This action cannot be undone.",
    });
    setModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setModalConfig({
      type: "delete",
      itemId: id,
      title: "Delete Result",
      description: "Are you sure you want to delete this test result?",
    });
    setModalOpen(true);
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <ConfirmModal
        isOpen={modalOpen}
        title={modalConfig.title}
        description={modalConfig.description}
        variant="destructive"
        confirmText="Delete"
        onConfirm={confirmAction}
        onCancel={() => setModalOpen(false)}
      />

      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Test History</h1>
            <p className="mt-2 text-sm text-slate-400">
              View your past speed test results
            </p>
          </div>
          <div className="flex gap-2">
            {history.length > 0 && (
              <>
                <Button
                  variant="outline"
                  onClick={() => storage.downloadCSV()}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  CSV
                </Button>
                <Button
                  variant="outline"
                  onClick={() => storage.downloadJSON()}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  JSON
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClearClick}
                  className="gap-2 text-red-400 hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear All
                </Button>
              </>
            )}
          </div>
        </div>

        {/* History Table */}
        {history.length === 0 ? (
          <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-white/10 bg-background/50 backdrop-blur-xl">
            <div className="text-center">
              <p className="text-slate-400">No test history yet</p>
              <Button onClick={() => router.push("/")} className="mt-4">
                Run Your First Test
              </Button>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-background/50 backdrop-blur-xl">
            {/* Desktop Table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full">
                <thead className="border-b border-white/10 bg-white/5">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                      Date & Time
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                      <div className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Download
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                      <div className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        Upload
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Ping
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                      <div className="flex items-center gap-2">
                        <Timer className="h-4 w-4" />
                        Jitter
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                      Health Score
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-slate-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {history.map((item) => (
                    <tr
                      key={item.id}
                      className="transition-colors hover:bg-white/5"
                    >
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-white">
                        {new Date(item.timestamp).toLocaleString()}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-blue-400">
                        {item.download.toFixed(2)} Mbps
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-purple-400">
                        {item.upload.toFixed(2)} Mbps
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-green-400">
                        {item.ping.toFixed(0)} ms
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-orange-400">
                        {item.jitter.toFixed(1)} ms
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`text-sm font-bold ${getHealthColor(item.healthScore)}`}
                        >
                          {item.healthScore}/100
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(item.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="space-y-4 p-4 md:hidden">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border border-white/10 bg-white/5 p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(item.id)}
                      className="h-8 w-8 p-0 text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-slate-400">Download</div>
                      <div className="mt-1 text-lg font-semibold text-blue-400">
                        {item.download.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Upload</div>
                      <div className="mt-1 text-lg font-semibold text-purple-400">
                        {item.upload.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Ping</div>
                      <div className="mt-1 text-lg font-semibold text-green-400">
                        {item.ping.toFixed(0)} ms
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Health Score</div>
                      <div
                        className={`mt-1 text-lg font-semibold ${getHealthColor(item.healthScore)}`}
                      >
                        {item.healthScore}/100
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
