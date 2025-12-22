import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import cors from "cors";

const app = express();
const PORT = 6000;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: false,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "ngrok-skip-browser-warning",
    ],
  })
);

app.use((req, _, next) => {
  console.log("Gateway received:", req.method, req.url);
  next();
});

app.use(
  "/auth",
  createProxyMiddleware({
    target: "http://localhost:7003",
    changeOrigin: true,
    onProxyReq(proxyReq, req) {
      if (req.headers.authorization) {
        proxyReq.setHeader("authorization", req.headers.authorization);
      }
      if (req.headers["ngrok-skip-browser-warning"]) {
        proxyReq.setHeader(
          "ngrok-skip-browser-warning",
          req.headers["ngrok-skip-browser-warning"]
        );
      }
    },
  })
);

app.use(
  "/user",
  createProxyMiddleware({
    target: "http://localhost:8000",
    changeOrigin: true,
    onProxyReq(proxyReq, req) {
      if (req.headers.authorization) {
        proxyReq.setHeader("authorization", req.headers.authorization);
      }
      if (req.headers["ngrok-skip-browser-warning"]) {
        proxyReq.setHeader(
          "ngrok-skip-browser-warning",
          req.headers["ngrok-skip-browser-warning"]
        );
      }
    },
  })
);

// frontend last
app.use(
  "/",
  createProxyMiddleware({
    target: "http://localhost:5173",
    changeOrigin: true,
  })
);

app.listen(PORT, () => {
  console.log("Gateway running on " + PORT);
});