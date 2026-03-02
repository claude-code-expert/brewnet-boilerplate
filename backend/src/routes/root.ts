import { Router, Request, Response } from "express";
import { checkConnection } from "../database";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
  res.json({
    service: "express-backend",
    status: "running",
    message: "🍺 Brewnet says hello!",
  });
});

router.get("/health", async (_req: Request, res: Response) => {
  const dbConnected = await checkConnection();
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    db_connected: dbConnected,
  });
});

export default router;
