import { createClient } from "redis";
import { v4 as uuidv4 } from "uuid";

interface IRoom {
  status: string;
  members: string;
}

const redis = createClient();
const availableRoomKey = process.env.REDIS_ROOM_SET || "private";
const hashprefix = "room:";

redis.on("error", (err) => {
  console.error("Redis Client Error", err);
});

redis.on("connect", () => {
  console.log("Redis connected successfully");
});

const setHashes = async (id: string, status: string, members: number) => {
  const hash: IRoom = {
    status: status,
    members: members.toString(),
  };

  const key = `${hashprefix}${id}`;

  await redis.hSet(key, { ...hash });
  await redis.expire(key, 600);
};

const findOrCreateRoom = async () => {
  const roomid = await redis.sPop(availableRoomKey);
  if (roomid) {
    await redis.hSet(`${hashprefix}${roomid}`, {
      status: "full",
      members: "2",
    });
    return roomid;
  } else {
    const newRoomId = uuidv4();
    await redis.sAdd(availableRoomKey, newRoomId);
    await setHashes(newRoomId, "waiting", 1);
    return newRoomId;
  }
};

const leaveRoom = async (roomId: string) => {
  const key = `${hashprefix}${roomId}`;
  const roomData = await redis.hGetAll(key);
  if (roomData.users == "2") {
    await setHashes(key, "waiting", 1);
    await redis.sAdd(availableRoomKey, roomId);
  } else {
    await redis.del(key);
    await redis.sRem(availableRoomKey, roomId);
  }
};

const getRoomInfo = async (roomId: string) => {
  return await redis.hGetAll(`${hashprefix}${roomId}`);
};

export { redis, setHashes, getRoomInfo, leaveRoom, findOrCreateRoom };
