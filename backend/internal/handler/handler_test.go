package handler

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

// setupRouter creates a gin router with all routes registered for testing.
func setupRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	r.GET("/", Root)
	r.GET("/health", Health)
	r.GET("/api/hello", Hello)
	r.POST("/api/echo", Echo)
	return r
}

func TestGetRoot(t *testing.T) {
	router := setupRouter()
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/", nil)
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", w.Code)
	}

	var body map[string]interface{}
	if err := json.Unmarshal(w.Body.Bytes(), &body); err != nil {
		t.Fatalf("failed to parse response JSON: %v", err)
	}

	if body["status"] != "running" {
		t.Errorf("expected status=running, got %v", body["status"])
	}
	if _, ok := body["service"]; !ok {
		t.Error("expected 'service' field in response")
	}
	if body["service"] != "gin-backend" {
		t.Errorf("expected service=gin-backend, got %v", body["service"])
	}
}

func TestGetHealth(t *testing.T) {
	router := setupRouter()
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/health", nil)
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", w.Code)
	}

	var body map[string]interface{}
	if err := json.Unmarshal(w.Body.Bytes(), &body); err != nil {
		t.Fatalf("failed to parse response JSON: %v", err)
	}

	if body["status"] != "ok" {
		t.Errorf("expected status=ok, got %v", body["status"])
	}
	if _, ok := body["timestamp"]; !ok {
		t.Error("expected 'timestamp' field in response")
	}
}

func TestGetApiHello(t *testing.T) {
	router := setupRouter()
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/api/hello", nil)
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", w.Code)
	}

	var body map[string]interface{}
	if err := json.Unmarshal(w.Body.Bytes(), &body); err != nil {
		t.Fatalf("failed to parse response JSON: %v", err)
	}

	if _, ok := body["message"]; !ok {
		t.Error("expected 'message' field in response")
	}
	if body["lang"] != "go" {
		t.Errorf("expected lang=go, got %v", body["lang"])
	}
	if _, ok := body["version"]; !ok {
		t.Error("expected 'version' field in response")
	}
}

func TestPostApiEcho(t *testing.T) {
	router := setupRouter()

	payload := map[string]interface{}{
		"key":   "value",
		"count": 42,
	}
	jsonBytes, _ := json.Marshal(payload)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("POST", "/api/echo", bytes.NewReader(jsonBytes))
	req.Header.Set("Content-Type", "application/json")
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", w.Code)
	}

	var body map[string]interface{}
	if err := json.Unmarshal(w.Body.Bytes(), &body); err != nil {
		t.Fatalf("failed to parse response JSON: %v", err)
	}

	if body["key"] != "value" {
		t.Errorf("expected key=value, got %v", body["key"])
	}
	// JSON numbers are decoded as float64 by encoding/json
	if body["count"] != float64(42) {
		t.Errorf("expected count=42, got %v", body["count"])
	}
}
