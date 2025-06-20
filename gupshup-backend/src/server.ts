import express, { Request, Response, Router } from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db";
import healthCheckRouter from "../src/routes/healthCheck.route";
import authRouter from "../src/routes/auth.route"
import passport from "passport"
import passportConfig from "./config/passport";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(Router());

passportConfig();
app.use(passport.initialize());

const PORT = process.env.PORT || 5000;

app.get("/", (request: Request, response: Response) => {
  response.status(200).send("Hello World");
});

app.use("/api/healthCheck", healthCheckRouter);
app.use("/api/auth/", authRouter);


connectDB().then(() => {
  app
    .listen(PORT, () => {
      console.log("Server running at PORT: ", PORT);
    })
    .on("error", (error) => {
      throw new Error(error.message);
    });
});
