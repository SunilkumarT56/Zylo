import swaggerUi from "swagger-ui-express";
import express from "express";
const app = express();

app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup({
    openapi: "3.0.0",
    info: {
      title: "Your API",
      version: "1.0.0",
    },
  })
);
