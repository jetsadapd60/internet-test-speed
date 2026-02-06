package handlers

import (
	"crypto/rand"
	"net/http"
	"strconv"
	"time"
)

// DownloadHandler streams random data to the client
// Query params:
// - size: Size in bytes to download (e.g. 104857600 for 100MB). Default: stream for 10s.
// - duration: Duration in seconds to stream if size is not set. Default: 10.
func DownloadHandler(w http.ResponseWriter, r *http.Request) {
	// Set headers to prevent caching and buffering
	w.Header().Set("Content-Type", "application/octet-stream")
	w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
	w.Header().Set("Pragma", "no-cache")
	w.Header().Set("Expires", "0")

	// Get size from query string
	sizeStr := r.URL.Query().Get("size")
	if sizeStr != "" {
		size, err := strconv.ParseInt(sizeStr, 10, 64)
		if err == nil && size > 0 {
			streamBytes(w, size)
			return
		}
	}

	// Default: Stream for a specific duration (default 10s)
	durationStr := r.URL.Query().Get("duration")
	duration := 10 * time.Second
	if durationStr != "" {
		if d, err := strconv.Atoi(durationStr); err == nil && d > 0 {
			duration = time.Duration(d) * time.Second
		}
	}

	streamForDuration(w, duration)
}

func streamBytes(w http.ResponseWriter, size int64) {
	bufferSize := 32 * 1024 // 32KB buffer
	buffer := make([]byte, bufferSize)
	// Fill buffer once with random data (perf optimization)
	rand.Read(buffer)

	written := int64(0)
	for written < size {
		remaining := size - written
		toWrite := int64(bufferSize)
		if remaining < toWrite {
			toWrite = remaining
		}
		n, err := w.Write(buffer[:toWrite])
		if err != nil {
			return
		}
		written += int64(n)
	}
}

func streamForDuration(w http.ResponseWriter, duration time.Duration) {
	bufferSize := 32 * 1024 // 32KB buffer
	buffer := make([]byte, bufferSize)
	rand.Read(buffer)

	timeout := time.After(duration)
	for {
		select {
		case <-timeout:
			return
		default:
			_, err := w.Write(buffer)
			if err != nil {
				return
			}
		}
	}
}
