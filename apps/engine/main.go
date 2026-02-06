package main

import (
	"log"
	"net/http"
	"os"

	"test-speed/engine/handlers"
	"test-speed/engine/middleware"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Wrap handlers with CORS middleware
	http.HandleFunc("/download", middleware.CORS(handlers.DownloadHandler))
	http.HandleFunc("/upload", middleware.CORS(handlers.UploadHandler))
	http.HandleFunc("/ping", handlers.PingHandler)

	log.Printf("Starting Speed Test Engine on port %s", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatal(err)
	}
}
