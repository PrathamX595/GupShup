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
import {
  redis,
  findOrCreateRoom,
  getRoomInfo,
  leaveRoom,
} from "./config/redis";

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
  let currentRoomId: string | null = null;

  socket.on("findRoom", async (data) => {
    try {
      const { userId } = data;
      currentRoomId = await findOrCreateRoom();

      socket.join(currentRoomId);

      const roomInfo = await getRoomInfo(currentRoomId);

      socket.emit("roomAssigned", {
        roomId: currentRoomId,
        members: roomInfo.members,
        status: roomInfo.status,
      });

      socket.to(currentRoomId).emit("userJoined", {
        userId,
        roomId: currentRoomId,
      });
    } catch (error) {
      console.error("Error finding room:", error);
      socket.emit("error", { message: "Failed to find room" });
    }
  });

  socket.on("getMessage", (arg) => {
    if (currentRoomId) {
      socket.to(currentRoomId).emit("sendMessage", {
        message: arg.message,
      });
    }
  });

  socket.on("disconnect", async () => {
    console.log("User disconnected:", socket.id);
    if (currentRoomId) {
      await leaveRoom(currentRoomId);
      socket.to(currentRoomId).emit("userLeft", { userId: socket.id });
    }
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

redis.connect().catch(console.error);

connectDB().then(() => {
  server
    .listen(PORT, () => {
      console.log("Server running at PORT: ", PORT);
    })
    .on("error", (error) => {
      throw new Error(error.message);
    });
});
