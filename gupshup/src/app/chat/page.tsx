"use client";
import { Footer } from "../components/Footer";
import Link from "next/link";
import { Button } from "../components/Button";
import { useRouter } from "next/navigation";
import useAuth from "../hooks/useAuth";
import Image from "next/image";
import { socket } from "../services/socket";
import { useEffect, useState, useRef } from "react";
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
  const [peer, setPeer] = useState<RTCPeerConnection>();
  const [stream, setStream] = useState<MediaStream>();
  const [incomingStream, setIncomingStream] = useState<MediaStream>();
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const streamRef = useRef<MediaStream | undefined>(undefined);
  const peerRef = useRef<RTCPeerConnection | undefined>(undefined);
  const userRef = useRef(user);

  useEffect(() => {
    streamRef.current = stream;
  }, [stream]);

  useEffect(() => {
    peerRef.current = peer;
  }, [peer]);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    if (localVideoRef.current && stream) {
      localVideoRef.current.srcObject = stream;
      console.log("✅ Local video source updated");
    }
  }, [stream]);

  // Direct approach to setting remote video
  useEffect(() => {
    if (remoteVideoRef.current && incomingStream) {
      console.log("🎥 Setting remote stream directly");
      remoteVideoRef.current.srcObject = incomingStream;
    }
  }, [incomingStream]);

  const createPeerConnection = () => {
    const newPeer = new RTCPeerConnection({
      iceServers: [
        {
          urls: [
            "stun:stun.l.google.com:19302",
            "stun:global.stun.twilio.com:3478",
          ],
        },
      ],
    });

    newPeer.ontrack = (e) => {
      console.log("🎥 Received remote track:", e.track.kind);
      console.log("🎥 Track details:", {
        id: e.track.id,
        kind: e.track.kind,
        readyState: e.track.readyState,
        enabled: e.track.enabled,
        muted: e.track.muted,
      });
      
      if (e.streams && e.streams[0]) {
        const stream = e.streams[0];
        console.log("🎥 Stream details:", {
          id: stream.id,
          active: stream.active,
          videoTracks: stream.getVideoTracks().length,
          audioTracks: stream.getAudioTracks().length,
        });
        
        setIncomingStream(stream);
      }
    };

    newPeer.onconnectionstatechange = () => {
      console.log("🔗 Peer connection state:", newPeer.connectionState);
    };

    newPeer.oniceconnectionstatechange = () => {
      console.log("🧊 ICE connection state:", newPeer.iceConnectionState);
    };

    return newPeer;
  };

  const sendCallReq = async () => {
    const newPeer = createPeerConnection();
    setPeer(newPeer);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        newPeer.addTrack(track, streamRef.current!);
        console.log(`Added ${track.kind} track to peer connection`);
      });
    }

    const offer = await newPeer.createOffer();
    await newPeer.setLocalDescription(offer);
    return offer;
  };

  const handleChatBtn = () => {
    const msg: Imessages = {
      message: selfMessage.trim(),
      type: "self",
    };
    if (msg.message !== "") {
      setMessages((prev) => [...prev, msg]);
      socket.emit("getMessage", { message: msg.message });
    }
    setSelfMessage("");
    setIsEmojiOpen(false);
  };

  const handleNextRoom = () => {
    if (peerRef.current) {
      peerRef.current.close();
      setPeer(undefined);
    }
    setIncomingStream(undefined);
    setMessages([]);
    setRoomStatus("searching");
    socket.emit("leaveRoom");
  };

  const getUserMedia = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setStream(mediaStream);
      console.log("Got user media successfully");
    } catch (error) {
      console.error("Error accessing media devices:", error);
    }
  };

  // Simple manual play function
  const handleManualPlay = async () => {
    if (remoteVideoRef.current && incomingStream) {
      try {
        console.log("🔴 Manual play attempt");
        const video = remoteVideoRef.current;
        
        // Force the stream assignment
        video.srcObject = incomingStream;
        video.muted = false; // Try unmuted
        
        await video.play();
        console.log("✅ Video playing!");
      } catch (error) {
        console.error("❌ Play failed:", error);
        
        // Try muted
        try {
          const video = remoteVideoRef.current;
          video.muted = true;
          await video.play();
          console.log("✅ Video playing muted!");
          
          // Unmute after 1 second
          setTimeout(() => {
            if (video) video.muted = false;
          }, 1000);
        } catch (mutedError) {
          console.error("❌ Even muted play failed:", mutedError);
        }
      }
    }
  };

  useEffect(() => {
    console.log("Initializing socket connection...");

    if (!socket.connected) {
      socket.connect();
    }

    const handleConnect = () => {
      console.log("Socket connected with ID:", socket.id);
      setIsSocketConnected(true);
      socket.emit("findRoom", { userId: userRef.current?._id || socket.id });
    };

    const handleDisconnect = () => {
      console.log("Socket disconnected");
      setIsSocketConnected(false);
    };

    const handleRoomAssigned = async (data: any) => {
      console.log("Assigned to room:", data.roomId);
      console.log("members:", data.members);
      console.log("Room status:", data.status);
      setRoomStatus(data.status);

      if (data.status === "active" && streamRef.current) {
        const offer = await sendCallReq();
        socket.emit("call-req", { socketId: socket.id, offer });
      }
    };

    const handleGotReq = async (data: any) => {
      const { socketId, offer } = data;
      console.log("Got call request from:", socketId);

      if (!streamRef.current) {
        console.error("No local stream available");
        return;
      }

      const newPeer = createPeerConnection();
      setPeer(newPeer);
      streamRef.current.getTracks().forEach((track) => {
        newPeer.addTrack(track, streamRef.current!);
        console.log(`Added ${track.kind} track for answer`);
      });

      await newPeer.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await newPeer.createAnswer();
      await newPeer.setLocalDescription(answer);
      socket.emit("call-accepted", { socketId, answer });
    };

    const handleCallAccepted = async (data: any) => {
      const { answer } = data;
      console.log("Call accepted:", answer);
      if (peerRef.current) {
        await peerRef.current.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
        console.log("Remote description set successfully");
      }
    };

    const handleUserJoined = (data: any) => {
      console.log("User joined room:", data.userId || "Unknown User");
      setMessages([]);
      setRoomStatus("active");
    };

    const handleUserLeft = (data: any) => {
      console.log("User left room:", data.userId || "Unknown User");
      setRoomStatus("searching");
      setIncomingStream(undefined);
      if (peerRef.current) {
        peerRef.current.close();
        setPeer(undefined);
      }
    };

    const handleFindNewRoom = () => {
      console.log("Finding new room...");
      setMessages([]);
      setRoomStatus("searching");
      setIncomingStream(undefined);
      if (peerRef.current) {
        peerRef.current.close();
        setPeer(undefined);
      }
      socket.emit("searchNewRoom");
    };

    const handleSendMessage = (arg: any) => {
      const msg: Imessages = {
        message: arg.message,
        type: "friend",
      };
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("roomAssigned", handleRoomAssigned);
    socket.on("got-req", handleGotReq);
    socket.on("call-accepted", handleCallAccepted);
    socket.on("userJoined", handleUserJoined);
    socket.on("userLeft", handleUserLeft);
    socket.on("findNewRoom", handleFindNewRoom);
    socket.on("sendMessage", handleSendMessage);

    return () => {
      console.log("Cleaning up socket listeners...");
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("roomAssigned", handleRoomAssigned);
      socket.off("got-req", handleGotReq);
      socket.off("call-accepted", handleCallAccepted);
      socket.off("userJoined", handleUserJoined);
      socket.off("userLeft", handleUserLeft);
      socket.off("findNewRoom", handleFindNewRoom);
      socket.off("sendMessage", handleSendMessage);

      if (peerRef.current) {
        peerRef.current.close();
      }

      if (socket.connected) {
        socket.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    getUserMedia();
  }, []);

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
                <div className="text-[#5A5A5A] text-sm">
                  {isSocketConnected ? "🟢 Connected" : "🔴 Disconnected"}
                </div>
              </div>
            </div>
            <div className="w-full h-full mx-5 pb-5">
              {/* Local video */}
              <div className="border-3 border-black rounded-md bg-[#FDC62E] h-1/2 w-full my-2 relative">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover rounded-md"
                />
                <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                  You
                </div>
              </div>

              {/* Remote video - SIMPLIFIED */}
              <div className="border-3 border-black rounded-md bg-[#FDC62E] h-1/2 w-full my-2 relative">
                {incomingStream ? (
                  <>
                    <video
                      ref={remoteVideoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover rounded-md bg-black"
                      onLoadedMetadata={() => {
                        console.log("📺 Remote video metadata loaded");
                        if (remoteVideoRef.current) {
                          remoteVideoRef.current.play().catch(e => {
                            console.log("Auto play failed, will need manual play:", e);
                          });
                        }
                      }}
                      onError={(e) => {
                        console.error("❌ Video error:", e);
                      }}
                      onPlay={() => {
                        console.log("✅ Remote video is playing!");
                      }}
                    />
                    <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                      Stranger
                    </div>
                    
                    <button
                      onClick={handleManualPlay}
                      className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      ▶️ PLAY
                    </button>
                    
                    {/* Debug info */}
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                      <div>Stream: {incomingStream.active ? '✅ Active' : '❌ Inactive'}</div>
                      <div>Video Tracks: {incomingStream.getVideoTracks().length}</div>
                      <div>Audio Tracks: {incomingStream.getAudioTracks().length}</div>
                      {incomingStream.getVideoTracks()[0] && (
                        <div>Video State: {incomingStream.getVideoTracks()[0].readyState}</div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-600">
                    <div className="text-4xl mb-2">
                      {roomStatus === "searching" ? "🔍" : "⏳"}
                    </div>
                    <div>
                      {roomStatus === "searching"
                        ? "Searching for partner..."
                        : "Waiting for video..."}
                    </div>
                  </div>
                )}
              </div>
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
                    handleChatBtn();
                  }}
                  suppressHydrationWarning={true}
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
                    suppressHydrationWarning={true}
                  />

                  <button
                    type="submit"
                    className="absolute right-2 p-2 rounded-xl hover:bg-[#e5e5e5]"
                    aria-label="Send message"
                    onClick={handleChatBtn}
                    suppressHydrationWarning={true}
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