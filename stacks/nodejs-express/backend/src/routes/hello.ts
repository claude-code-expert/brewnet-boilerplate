import { Router, Request, Response } from "express";

const router = Router();

router.get("/api/hello", (_req: Request, res: Response) => {
  res.json({
    message: "Hello from Express!",
    lang: "node",
    version: process.version.replace("v", ""),
  });
});

export default router;
