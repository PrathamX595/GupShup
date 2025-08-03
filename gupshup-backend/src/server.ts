import express, { Request, Response, Router } from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db";
import healthCheckRouter from "../src/routes/healthCheck.route";
import authRouter from "../src/routes/auth.route";
import voteRouter from "../src/routes/upvote.route";
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

const userSockets = new Map();

io.on("connection", (socket) => {
  console.log("new user connected", socket.id);
  let currentRoomId: string | null = null;
  let currentUserId: string | null = null;
  let isLoggedIn: boolean = false;

  socket.on("findRoom", async (data) => {
    try {
      const { userId, isLoggedIn: userLoggedIn } = data;
      currentUserId = userId;
      isLoggedIn = userLoggedIn || false;
      userSockets.set(socket.id, { userId, socketId: socket.id, isLoggedIn });

      currentRoomId = await findOrCreateRoom(userId);
      socket.join(currentRoomId);

      const roomInfo = await getRoomInfo(currentRoomId);

      socket.emit("roomAssigned", {
        roomId: currentRoomId,
        members: roomInfo.members,
        status: roomInfo.status,
      });

      if (roomInfo.members === "2") {
        socket.to(currentRoomId).emit("userJoined", {
          userId,
          roomId: currentRoomId,
          isLoggedIn: isLoggedIn,
        });

        socket.to(currentRoomId).emit("requestAuthStatus");
      }
    } catch (error) {
      console.error("Error finding room:", error);
      socket.emit("error", { message: "Failed to find room" });
    }
  });

  socket.on("userAuthStatus", (data) => {
    const { isLoggedIn: authStatus } = data;
    if (currentRoomId) {
      socket.to(currentRoomId).emit("userAuthStatus", {
        isLoggedIn: authStatus,
        from: socket.id,
      });
    }
  });

  socket.on("requestAuthStatus", () => {
    if (currentRoomId) {
      socket.to(currentRoomId).emit("userAuthStatus", {
        isLoggedIn: isLoggedIn,
        from: socket.id,
      });
    }
  });

  socket.on("call-req", async (data) => {
    const { socketId, offer } = data;
    if (currentRoomId) {
      socket.to(currentRoomId).emit("got-req", { socketId, offer });
    }
  });

  socket.on("call-accepted", (data) => {
    const { socketId, answer } = data;
    socket.to(socketId).emit("call-accepted", { answer });
  });

  socket.on("ice-candidate", (data) => {
    const { candidate } = data;
    if (currentRoomId) {
      socket.to(currentRoomId).emit("ice-candidate", {
        candidate,
        from: socket.id,
      });
    }
  });

  socket.on("getMessage", (arg) => {
    if (currentRoomId) {
      socket.to(currentRoomId).emit("sendMessage", {
        message: arg.message,
      });
    }
  });

  socket.on("leaveRoom", async () => {
    if (currentRoomId && currentUserId) {
      try {
        const otherUserId = await leaveRoom(currentRoomId, currentUserId);

        socket.to(currentRoomId).emit("userLeft", {
          userId: currentUserId,
          message: "User left the room - room deleted",
        });

        if (otherUserId) {
          socket.to(currentRoomId).emit("findNewRoom");
        }

        socket.leave(currentRoomId);
        userSockets.set(socket.id, {
          userId: currentUserId,
          socketId: socket.id,
          isLoggedIn,
        });

        currentRoomId = await findOrCreateRoom(currentUserId);
        socket.join(currentRoomId);

        const roomInfo = await getRoomInfo(currentRoomId);
        socket.emit("roomAssigned", {
          roomId: currentRoomId,
          members: roomInfo.members,
          status: roomInfo.status,
        });

        console.log(`User ${currentUserId} moved to new room ${currentRoomId}`);
      } catch (error) {
        console.error("Error leaving room:", error);
      }
    }
  });

  socket.on("micToggled", (data) => {
    console.log("SERVER: Received micToggled event with data:", data);
    
    if (currentRoomId) {
      socket.to(currentRoomId).emit("peerMicToggled", data);
      console.log("SERVER: Forwarded peerMicToggled to room:", currentRoomId);
    } else {
      console.log("SERVER: No current room to forward mic toggle");
    }
  });

  socket.on("vidToggled", (data) => {
    console.log("SERVER: Received vidToggled event with data:", data);
    
    if (currentRoomId) {
      socket.to(currentRoomId).emit("peerVidToggled", data);
      console.log("SERVER: Forwarded peerVidToggled to room:", currentRoomId);
    } else {
      console.log("SERVER: No current room to forward video toggle");
    }
  });

  socket.on("searchNewRoom", async (data) => {
    if (currentUserId) {
      try {
        if (data && typeof data.isLoggedIn !== "undefined") {
          isLoggedIn = data.isLoggedIn;
          userSockets.set(socket.id, {
            userId: currentUserId,
            socketId: socket.id,
            isLoggedIn,
          });
        }

        if (currentRoomId) {
          socket.leave(currentRoomId);
        }

        currentRoomId = await findOrCreateRoom(currentUserId);
        socket.join(currentRoomId);

        const roomInfo = await getRoomInfo(currentRoomId);
        socket.emit("roomAssigned", {
          roomId: currentRoomId,
          members: roomInfo.members,
          status: roomInfo.status,
        });

        if (roomInfo.members === "2") {
          socket.to(currentRoomId).emit("userJoined", {
            userId: currentUserId,
            roomId: currentRoomId,
            isLoggedIn: isLoggedIn,
          });

          socket.to(currentRoomId).emit("requestAuthStatus");
        }

        console.log(
          `User ${currentUserId} found new room ${currentRoomId} with auth status: ${isLoggedIn}`
        );
      } catch (error) {
        console.error("Error searching new room:", error);
      }
    }
  });

  socket.on("disconnect", async () => {
    console.log("User disconnected:", socket.id);

    if (currentRoomId && currentUserId) {
      try {
        const otherUserId = await leaveRoom(currentRoomId, currentUserId);

        socket.to(currentRoomId).emit("userLeft", {
          userId: currentUserId,
          message: "User disconnected - room deleted",
        });

        if (otherUserId) {
          socket.to(currentRoomId).emit("findNewRoom");
        }

        socket.leave(currentRoomId);
      } catch (error) {
        console.error("Error handling disconnect:", error);
      }
    }

    userSockets.delete(socket.id);
  });
});

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
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
app.use("/api/upvote", voteRouter);

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