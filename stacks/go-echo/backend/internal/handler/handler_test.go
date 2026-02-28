package handler

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/labstack/echo/v4"
)

func TestGetRoot(t *testing.T) {
	e := echo.New()
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	if err := Root(c); err != nil {
		t.Fatalf("handler returned error: %v", err)
	}

	if rec.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", rec.Code)
	}

	var body map[string]interface{}
	if err := json.Unmarshal(rec.Body.Bytes(), &body); err != nil {
		t.Fatalf("failed to parse response JSON: %v", err)
	}

	if body["status"] != "running" {
		t.Errorf("expected status=running, got %v", body["status"])
	}
	if _, ok := body["service"]; !ok {
		t.Error("expected 'service' field in response")
	}
	if body["service"] != "echo-backend" {
		t.Errorf("expected service=echo-backend, got %v", body["service"])
	}
}

func TestGetHealth(t *testing.T) {
	e := echo.New()
	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	if err := Health(c); err != nil {
		t.Fatalf("handler returned error: %v", err)
	}

	if rec.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", rec.Code)
	}

	var body map[string]interface{}
	if err := json.Unmarshal(rec.Body.Bytes(), &body); err != nil {
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
	e := echo.New()
	req := httptest.NewRequest(http.MethodGet, "/api/hello", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	if err := Hello(c); err != nil {
		t.Fatalf("handler returned error: %v", err)
	}

	if rec.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", rec.Code)
	}

	var body map[string]interface{}
	if err := json.Unmarshal(rec.Body.Bytes(), &body); err != nil {
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
	e := echo.New()

	payload := map[string]interface{}{
		"key":   "value",
		"count": 42,
	}
	jsonBytes, _ := json.Marshal(payload)

	req := httptest.NewRequest(http.MethodPost, "/api/echo", bytes.NewReader(jsonBytes))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	if err := Echo(c); err != nil {
		t.Fatalf("handler returned error: %v", err)
	}

	if rec.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", rec.Code)
	}

	var body map[string]interface{}
	if err := json.Unmarshal(rec.Body.Bytes(), &body); err != nil {
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
