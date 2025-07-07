import express, { Request, Response, Router } from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db";
import healthCheckRouter from "../src/routes/healthCheck.route";
import authRouter from "../src/routes/auth.route";
import passport from "passport";
import passportConfig from "./config/passport";
import session from "express-session";
import cookieParser from "cookie-parser";
import { createServer } from "node:http";
import { Server } from "socket.io";

dotenv.config();
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("new user connected", socket.id);
  socket.on("getMessage", (arg) => {
    socket.emit("sendMessage", { message: arg.message });
  });
});

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true, // Important for cookies
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(cookieParser());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "secretkeylol",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
passportConfig();

const PORT = process.env.PORT || 5000;

app.get("/", (request: Request, response: Response) => {
  response.status(200).send("Hello World");
});

app.use("/api/healthCheck", healthCheckRouter);
app.use("/api/auth", authRouter);

connectDB().then(() => {
  server
    .listen(PORT, () => {
      console.log("Server running at PORT: ", PORT);
    })
    .on("error", (error) => {
      throw new Error(error.message);
    });
});
