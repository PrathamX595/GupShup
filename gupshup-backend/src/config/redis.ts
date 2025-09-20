import { createClient } from "redis";
import { v4 as uuidv4 } from "uuid";

interface IRoom {
  status: string;
  members: string;
  user1?: string;
  user2?: string;
}

const redis = createClient({
  url: process.env.REDIS_URL,
  password: process.env.REDIS_PASSWORD || undefined,
});
const availableRoomKey = process.env.REDIS_ROOM_SET;
const hashprefix = "room:";

if (!availableRoomKey) {
  throw new Error(
    "REDIS_ROOM_SET environment variable is required but not defined"
  );
}

redis.on("error", (err) => {
  console.error("Redis Client Error", err);
});

redis.on("connect", () => {
  console.log("Redis connected successfully");
});

const setHash = async (
  id: string,
  status: string,
  members: number,
  user1?: string,
  user2?: string
) => {
  const key = `${hashprefix}${id}`;
  const roomData: any = {
    status: status,
    members: members.toString(),
    createdAt: Date.now().toString(),
  };

  if (user1) roomData.user1 = user1;
  if (user2) roomData.user2 = user2;

  await redis.hSet(key, roomData);
  await redis.expire(key, 600);
};

const findOrCreateRoom = async (userId: string) => {
  const roomId = await redis.sPop(availableRoomKey);

  if (roomId) {
    const roomData = await redis.hGetAll(`${hashprefix}${roomId}`);
    await setHash(roomId, "active", 2, roomData.user1, userId);
    return roomId;
  } else {
    const newRoomId = uuidv4();
    await setHash(newRoomId, "waiting", 1, userId);
    await redis.sAdd(availableRoomKey, newRoomId);
    return newRoomId;
  }
};

const leaveRoom = async (roomId: string, userId: string) => {
  const key = `${hashprefix}${roomId}`;
  const roomData = await redis.hGetAll(key);
  let otherUser = null;
  if (roomData.members === "2") {
    otherUser = roomData.user1 === userId ? roomData.user2 : roomData.user1;
  }

  await redis.del(key);
  await redis.sRem(availableRoomKey, roomId);

  return otherUser;
};

const getRoomInfo = async (roomId: string) => {
  return await redis.hGetAll(`${hashprefix}${roomId}`);
};

const deleteRoom = async (roomId: string) => {
  const key = `${hashprefix}${roomId}`;
  await redis.del(key);
  await redis.sRem(availableRoomKey, roomId);
};

export { redis, setHash, getRoomInfo, leaveRoom, findOrCreateRoom, deleteRoom };
