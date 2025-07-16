"use client";
import { Footer } from "../components/Footer";
import Link from "next/link";
import { Button } from "../components/Button";
import { useRouter } from "next/navigation";
import useAuth from "../hooks/useAuth";
import Image from "next/image";
import { socket } from "../services/socket";
import { useEffect, useState } from "react";
import MessageBox from "../components/MessageBox";
import EmojiPicker from "emoji-picker-react";

interface Imessages {
  message: string;
  type: "self" | "friend";
}

export default function Chat() {
  const router = useRouter();
  const { user } = useAuth();
  const [selfMessage, setSelfMessage] = useState<string>("");
  const [messages, setMessages] = useState<Imessages[]>([]);
  const [roomStatus, setRoomStatus] = useState<string>("searching");
  const [isEmojiOpen, setIsEmojiOpen] = useState<boolean>(false);

  const handleChatBtn = () => {
    const msg: Imessages = {
      message: selfMessage.trim(),
      type: "self",
    };
    if (msg.message != "") {
      setMessages((prev) => [...prev, msg]);
      socket.emit("getMessage", { message: msg.message });
    }
    setSelfMessage("");
    setIsEmojiOpen(false);
  };

  const handleNextRoom = () => {
    setMessages([]);
    setRoomStatus("searching");
    socket.emit("leaveRoom");
  };

  useEffect(() => {
    if (!socket.connected) socket.connect();

    socket.emit("findRoom", { userId: socket.id });

    socket.on("roomAssigned", (data) => {
      console.log("Assigned to room:", data.roomId);
      console.log("members:", data.members);
      console.log("Room status:", data.status);
      setRoomStatus(data.status);
    });

    socket.on("userJoined", (data) => {
      setMessages([]);
      setRoomStatus("active");
      console.log("User joined room:", data.userId);
    });

    socket.on("userLeft", (data) => {
      console.log("User left room:", data.userId);
      setRoomStatus("searching");
    });

    socket.on("findNewRoom", () => {
      setMessages([]);
      setRoomStatus("searching");
      socket.emit("searchNewRoom");
    });

    const handleSendMessage = (arg: any) => {
      const msg: Imessages = {
        message: arg.message,
        type: "friend",
      };
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("sendMessage", handleSendMessage);

    return () => {
      socket.off("sendMessage", handleSendMessage);
      socket.off("roomAssigned");
      socket.off("userJoined");
      socket.off("userLeft");
      socket.off("findNewRoom");
      socket.disconnect();
    };
  }, [user]);

  return (
    <div className="text-black font-[family-name:var(--font-kiwi-regular)] flex flex-col">
      <div className="flex flex-col h-screen">
        <div className="bg-[#FDC62E] min-w-full h-6"></div>
        <div className="flex flex-grow w-full overflow-hidden">
          <div className="w-2/3 h-full flex items-end">
            <div className="flex flex-col h-full px-5 border-r items-center gap-2">
              <Link href="/">
                <img src="/fullLogo.svg" alt="logo" className="w-fit h-15" />
              </Link>
              <div className="flex gap-1 items-center">
                <div className="text-xl">Chatroom</div>
                <div className="text-[#5A5A5A] text-sm">(00:34:07)</div>
              </div>
            </div>
            <div className="w-full h-full mx-5 pb-5">
              <div className="border-3 border-black rounded-md bg-[#FDC62E] h-1/2 w-full my-2"></div>
              <div className="border-3 border-black rounded-md bg-[#FDC62E] h-1/2 w-full my-2"></div>
            </div>
          </div>
          <div className="flex flex-col w-1/3 h-full border-l border-black">
            <div className=" flex border-b border-black justify-end py-4  pr-5">
              <div className="flex items-center gap-10">
                {user ? (
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    {user.avatar ? (
                      <Image
                        src={user.avatar}
                        alt="Profile"
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600">
                        {user.userName?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    className="text-[#5A5A5A] underline-[#5A5A5A] underline underline-offset-3 text-2xl hover:cursor-pointer"
                    href="login"
                  >
                    Log In
                  </Link>
                )}
                <Button
                  buttonText="Next room [spacebar] ➜"
                  className="h-10"
                  onClick={handleNextRoom}
                />
              </div>
            </div>
            <div className="flex flex-col mx-5 h-full">
              <div className="text-2xl">chat</div>
              <div className="flex-grow overflow-y-auto">
                <MessageBox data={messages} />
              </div>
              <div className="mb-4">
                <form
                  className="relative flex items-center"
                  onSubmit={(e) => {
                    e.preventDefault();
                  }}
                >
                  <button
                    type="button"
                    className="right-12 px-4 py-3 rounded-tl-2xl rounded-bl-2xl bg-[#F2F2F2] hover:bg-[#e5e5e5]"
                    onClick={() => setIsEmojiOpen(!isEmojiOpen)}
                    suppressHydrationWarning={true}
                  >
                    😊
                  </button>
                  {isEmojiOpen && (
                    <div className="absolute bottom-16 right-0 z-50">
                      <EmojiPicker
                        onEmojiClick={(emojiData) => {
                          setSelfMessage((prev) => prev + emojiData.emoji);
                        }}
                      />
                    </div>
                  )}

                  <input
                    type="text"
                    placeholder="Type a message"
                    className="w-full px-1 py-3 bg-[#F2F2F2] placeholder:text-[#898989] placeholder:text-sm rounded-br-2xl rounded-tr-2xl border-none focus:outline-none focus:ring-0 pr-20"
                    value={selfMessage}
                    onChange={(e) => {
                      setSelfMessage(e.target.value);
                    }}
                  />

                  <button
                    type="submit"
                    className="absolute right-2 p-2 rounded-xl hover:bg-[#e5e5e5]"
                    aria-label="Send message"
                    onClick={handleChatBtn}
                  >
                    <img
                      src="/submitArrow.svg"
                      alt="Send"
                      className="w-5 h-5"
                    />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
