package handlers

import (
	"io"
	"io/ioutil"
	"net/http"
)

// UploadHandler accepts data upload and discards it
func UploadHandler(w http.ResponseWriter, r *http.Request) {
	// Discard the body
	_, err := io.Copy(ioutil.Discard, r.Body)
	if err != nil {
		http.Error(w, "Failed to read body", http.StatusInternalServerError)
		return
	}
	
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("OK"))
}
