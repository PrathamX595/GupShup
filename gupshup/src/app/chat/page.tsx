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

interface Imessages {
  message: string;
  type: "self" | "friend";
}

export default function Chat() {
  const router = useRouter();
  const { user } = useAuth();
  const [selfMessage, setSelfMessage] = useState<string>("");
  const [frndMessage, setFrndMessage] = useState<string>("");
  const [messages, setMessages] = useState<Imessages[]>([]);
  const handleChatBtn = () => {
    const msg: Imessages = {
      message: selfMessage,
      type: "self",
    };
    setMessages((prev) => [...prev, msg]);
    setSelfMessage("");
  };

  useEffect(() => {
    if (!socket.connected) socket.connect();

    return () => {
      socket.off("connect");
      socket.disconnect();
    };
  }, []);

  return (
    <div className="text-black font-[family-name:var(--font-kiwi-regular)] flex flex-col">
      <div className="flex flex-col h-screen">
        <div className="border-b-[1px] border-black h-fit pb-2 w-full">
          <div className="bg-[#FDC62E] min-w-full h-6"></div>
          <div className="flex items-center justify-between px-10">
            <div className="flex items-center gap-5">
              <Link href="/">
                <img src="/fullLogo.svg" alt="logo" className="w-fit h-15" />
              </Link>
              <div className="flex gap-1 items-center">
                <div className="text-2xl">Chatroom</div>
                <div className="text-[#5A5A5A] text-sm">(00:34:07)</div>
              </div>
            </div>
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
                onClick={() => router.push("/chat")}
              />
            </div>
          </div>
        </div>
        <div className="flex flex-grow w-full overflow-hidden">
          <div className="w-2/3 h-full flex flex-col items-end mr-10">
            <div className="border-3 border-black rounded-md bg-[#FDC62E] h-1/2 w-9/12 my-2">
              <div></div>
            </div>
            <div className="border-3 border-black rounded-md bg-[#FDC62E] h-1/2 w-9/12 my-2"></div>
          </div>
          <div className="flex flex-col w-1/3 h-full border-l border-black px-5">
            <div className="text-2xl">chat</div>
            <div className="flex-grow overflow-y-auto">
              <MessageBox data={messages} />
            </div>
            <div className="mb-4">
              <form className="relative flex items-center" onSubmit={(e)=>{e.preventDefault();}}>
                <input
                  type="text"
                  placeholder="Type a message"
                  className="w-full px-4 py-3 bg-[#F2F2F2] placeholder:text-[#898989] placeholder:text-sm rounded-xl border-none focus:outline-none focus:ring-0 pr-12"
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
                  <img src="/submitArrow.svg" alt="Send" className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
