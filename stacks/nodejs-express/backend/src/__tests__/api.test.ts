import { describe, test, expect, vi } from "vitest";
import request from "supertest";

// Mock the database module to avoid requiring a real DB connection
vi.mock("../database", () => ({
  default: {},
  checkConnection: vi.fn().mockResolvedValue(false),
}));

import app from "../index";

describe("API Endpoints", () => {
  test("GET / returns service info", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("service", "express-backend");
    expect(res.body).toHaveProperty("status", "running");
    expect(res.body).toHaveProperty("message");
  });

  test("GET /health returns ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("status", "ok");
    expect(res.body).toHaveProperty("timestamp");
  });

  test("GET /api/hello returns greeting", async () => {
    const res = await request(app).get("/api/hello");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", "Hello from Express!");
    expect(res.body).toHaveProperty("lang", "node");
    expect(res.body).toHaveProperty("version");
  });

  test("POST /api/echo echoes body", async () => {
    const payload = { test: "brewnet" };
    const res = await request(app)
      .post("/api/echo")
      .send(payload)
      .set("Content-Type", "application/json");
    expect(res.status).toBe(200);
    expect(res.body).toEqual(payload);
  });
});
