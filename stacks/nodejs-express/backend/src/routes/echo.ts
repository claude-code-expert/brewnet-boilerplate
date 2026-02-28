import { Router, Request, Response } from "express";

const router = Router();

router.post("/api/echo", (req: Request, res: Response) => {
  const body = req.body;
  if (body === undefined || body === null || Object.keys(body).length === 0) {
    res.json({});
    return;
  }
  res.json(body);
});

export default router;
