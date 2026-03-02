import express from "express";
import cors from "cors";
import rootRouter from "./routes/root";
import helloRouter from "./routes/hello";
import echoRouter from "./routes/echo";

const app = express();
const port = process.env.BACKEND_PORT || 8080;

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

app.use(rootRouter);
app.use(helloRouter);
app.use(echoRouter);

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Node backend listening on port ${port}`);
  });
}

export default app;
