export interface TestResult {
  id: string;
  timestamp: number;
  download: number;
  upload: number;
  ping: number;
  jitter: number;
  healthScore: number;
}

const STORAGE_KEY = "speedtest_history";
const MAX_RESULTS = 1000;

export const storage = {
  /**
   * Save a test result to localStorage
   */
  saveResult(result: TestResult): void {
    try {
      const history = this.getHistory();
      history.unshift(result); // Add to beginning

      // Keep only the most recent MAX_RESULTS
      const trimmed = history.slice(0, MAX_RESULTS);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch (error) {
      console.error("Failed to save test result:", error);
      // Handle quota exceeded or other localStorage errors
      if (
        error instanceof DOMException &&
        error.name === "QuotaExceededError"
      ) {
        // Clear old results and try again
        this.clearOldResults(100);
        this.saveResult(result);
      }
    }
  },

  /**
   * Get all test results from localStorage
   */
  getHistory(): TestResult[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];

      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error("Failed to load test history:", error);
      return [];
    }
  },

  /**
   * Delete a specific test result by ID
   */
  deleteResult(id: string): void {
    try {
      const history = this.getHistory();
      const filtered = history.filter((result) => result.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error("Failed to delete test result:", error);
    }
  },

  /**
   * Clear all test results
   */
  clearAll(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear test history:", error);
    }
  },

  /**
   * Clear old results, keeping only the most recent N items
   */
  clearOldResults(keepCount: number): void {
    try {
      const history = this.getHistory();
      const trimmed = history.slice(0, keepCount);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch (error) {
      console.error("Failed to clear old results:", error);
    }
  },

  /**
   * Export history as JSON string
   */
  exportJSON(): string {
    const history = this.getHistory();
    return JSON.stringify(history, null, 2);
  },

  /**
   * Export history as CSV string
   */
  exportCSV(): string {
    const history = this.getHistory();
    if (history.length === 0) return "";

    // CSV header
    const header =
      "Date,Time,Download (Mbps),Upload (Mbps),Ping (ms),Jitter (ms),Health Score";

    // CSV rows
    const rows = history.map((result) => {
      const date = new Date(result.timestamp);
      const dateStr = date.toLocaleDateString();
      const timeStr = date.toLocaleTimeString();

      return [
        dateStr,
        timeStr,
        result.download.toFixed(2),
        result.upload.toFixed(2),
        result.ping.toFixed(2),
        result.jitter.toFixed(2),
        result.healthScore,
      ].join(",");
    });

    return [header, ...rows].join("\n");
  },

  /**
   * Download data as a file
   */
  downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  /**
   * Export and download as JSON file
   */
  downloadJSON(filename = "speedtest-history.json"): void {
    const content = this.exportJSON();
    this.downloadFile(content, filename, "application/json");
  },

  /**
   * Export and download as CSV file
   */
  downloadCSV(filename = "speedtest-history.csv"): void {
    const content = this.exportCSV();
    this.downloadFile(content, filename, "text/csv");
  },

  /**
   * Get storage usage statistics
   */
  getStorageInfo(): { count: number; estimatedSizeKB: number } {
    const history = this.getHistory();
    const jsonString = JSON.stringify(history);
    const sizeInBytes = new Blob([jsonString]).size;

    return {
      count: history.length,
      estimatedSizeKB: Math.round(sizeInBytes / 1024),
    };
  },
};
