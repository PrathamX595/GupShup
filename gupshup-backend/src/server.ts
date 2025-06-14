import express, { Request, Response, Router } from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db";
import healthCheckRouter from "../src/routes/healthCheck.route"

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(Router())

const PORT = process.env.PORT || 2000;

app.get("/", (request: Request, response: Response) => {
  response.status(200).send("Hello World");
});

app.use("/api/healthCheck", healthCheckRouter);

connectDB().then(() => {
  app
    .listen(PORT, () => {
      console.log("Server running at PORT: ", PORT);
    })
    .on("error", (error) => {
      throw new Error(error.message);
    });
});
