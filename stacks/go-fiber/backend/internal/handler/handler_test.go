package handler

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"testing"

	"github.com/gofiber/fiber/v3"
)

// setupApp creates a Fiber app with all routes registered for testing.
func setupApp() *fiber.App {
	app := fiber.New()
	app.Get("/", Root)
	app.Get("/health", Health)
	app.Get("/api/hello", Hello)
	app.Post("/api/echo", Echo)
	return app
}

func TestGetRoot(t *testing.T) {
	app := setupApp()

	req, _ := http.NewRequest(http.MethodGet, "/", nil)
	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("app.Test failed: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected status 200, got %d", resp.StatusCode)
	}

	bodyBytes, _ := io.ReadAll(resp.Body)
	var body map[string]interface{}
	if err := json.Unmarshal(bodyBytes, &body); err != nil {
		t.Fatalf("failed to parse response JSON: %v", err)
	}

	if body["status"] != "running" {
		t.Errorf("expected status=running, got %v", body["status"])
	}
	if _, ok := body["service"]; !ok {
		t.Error("expected 'service' field in response")
	}
	if body["service"] != "fiber-backend" {
		t.Errorf("expected service=fiber-backend, got %v", body["service"])
	}
}

func TestGetHealth(t *testing.T) {
	app := setupApp()

	req, _ := http.NewRequest(http.MethodGet, "/health", nil)
	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("app.Test failed: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected status 200, got %d", resp.StatusCode)
	}

	bodyBytes, _ := io.ReadAll(resp.Body)
	var body map[string]interface{}
	if err := json.Unmarshal(bodyBytes, &body); err != nil {
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
	app := setupApp()

	req, _ := http.NewRequest(http.MethodGet, "/api/hello", nil)
	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("app.Test failed: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected status 200, got %d", resp.StatusCode)
	}

	bodyBytes, _ := io.ReadAll(resp.Body)
	var body map[string]interface{}
	if err := json.Unmarshal(bodyBytes, &body); err != nil {
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
	app := setupApp()

	payload := map[string]interface{}{
		"key":   "value",
		"count": 42,
	}
	jsonBytes, _ := json.Marshal(payload)

	req, _ := http.NewRequest(http.MethodPost, "/api/echo", bytes.NewReader(jsonBytes))
	req.Header.Set("Content-Type", "application/json")
	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("app.Test failed: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected status 200, got %d", resp.StatusCode)
	}

	bodyBytes, _ := io.ReadAll(resp.Body)
	var body map[string]interface{}
	if err := json.Unmarshal(bodyBytes, &body); err != nil {
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
