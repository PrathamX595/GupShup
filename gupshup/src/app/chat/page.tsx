"use client";
import { Footer } from "../components/Footer";
import Link from "next/link";
import { Button } from "../components/Button";
import { useRouter } from "next/navigation";
import useAuth from "../hooks/useAuth";
import Image from "next/image";
import { socket } from "../services/socket";
import { useEffect, useState, useRef, useCallback } from "react";
import MessageBox from "../components/MessageBox";
import EmojiPicker from "emoji-picker-react";
import {
  FaVideo,
  FaVideoSlash,
  FaMicrophone,
  FaMicrophoneSlash,
} from "react-icons/fa";

interface Imessages {
  message: string;
  type: "self" | "friend" | "system";
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
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [connectionState, setConnectionState] = useState<string>("new");
  const [iceCandidates, setIceCandidates] = useState<RTCIceCandidate[]>([]);
  const [hasVideo, setHasVideo] = useState<boolean>(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const streamRef = useRef<MediaStream | undefined>(undefined);
  const peerRef = useRef<RTCPeerConnection | undefined>(undefined);
  const userRef = useRef(user);

  const handleMicToggle = () => {
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMicOn(!isMicOn);

      const systemMsg: Imessages = {
        message: isMicOn ? "Microphone turned off" : "Microphone turned on",
        type: "system",
      };
      setMessages((prev) => [...prev, systemMsg]);
    }
  };

  const handleVideoToggle = () => {
    if (streamRef.current) {
      const videoTracks = streamRef.current.getVideoTracks();
      videoTracks.forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsVideoOn(!isVideoOn);
      const systemMsg: Imessages = {
        message: isVideoOn ? "Camera turned off" : "Camera turned on",
        type: "system",
      };
      setMessages((prev) => [...prev, systemMsg]);
      if (localVideoRef.current) {
        if (!isVideoOn) {
          localVideoRef.current.srcObject = streamRef.current;
        }
      }
    }
  };

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
      console.log("Local video source updated");
      const videoTracks = stream.getVideoTracks();
      const audioTracks = stream.getAudioTracks();
      
      videoTracks.forEach(track => {
        track.enabled = isVideoOn;
      });
      
      audioTracks.forEach(track => {
        track.enabled = isMicOn;
      });
    }
  }, [stream, isVideoOn, isMicOn]);

  useEffect(() => {
    if (remoteVideoRef.current && incomingStream) {
      console.log("Setting remote stream directly");
      remoteVideoRef.current.srcObject = incomingStream;

      const videoTracks = incomingStream.getVideoTracks();
      setHasVideo(videoTracks.length > 0);

      if (videoTracks.length > 0) {
        console.log("Video track details:", {
          label: videoTracks[0].label,
          enabled: videoTracks[0].enabled,
          readyState: videoTracks[0].readyState,
        });
      }
    }
  }, [incomingStream]);

  useEffect(() => {
    if (peer && iceCandidates.length > 0) {
      console.log(`Adding ${iceCandidates.length} stored ICE candidates`);
      iceCandidates.forEach(async (candidate) => {
        try {
          await peer.addIceCandidate(candidate);
        } catch (err) {
          console.error("Error adding stored ICE candidate:", err);
        }
      });
      setIceCandidates([]);
    }
  }, [peer, iceCandidates]);

  const createPeerConnection = useCallback(() => {
    const newPeer = new RTCPeerConnection({
      iceServers: [
        {
          urls: [
            "stun:stun.l.google.com:19302",
            "stun:global.stun.twilio.com:3478",
            "stun:stun1.l.google.com:19302",
            "stun:stun2.l.google.com:19302",
          ],
        },
      ],
      iceCandidatePoolSize: 10,
    });

    newPeer.onconnectionstatechange = () => {
      console.log("Peer connection state:", newPeer.connectionState);
      setConnectionState(newPeer.connectionState);

      if (newPeer.connectionState === "failed") {
        console.log("Connection failed - this explains the black screen");
      }
    };

    newPeer.oniceconnectionstatechange = () => {
      console.log("ICE connection state:", newPeer.iceConnectionState);

      if (newPeer.iceConnectionState === "failed") {
        console.log("ICE connection failed - video won't display");
      }
    };

    newPeer.onicecandidate = (event) => {
      if (event.candidate) {
        console.log(
          "Generated ICE candidate:",
          event.candidate.candidate.substring(0, 50) + "..."
        );
        socket.emit("ice-candidate", { candidate: event.candidate });
      }
    };

    newPeer.ontrack = (e) => {
      console.log("Received remote track:", e.track.kind);
      console.log("Track details:", {
        id: e.track.id,
        kind: e.track.kind,
        readyState: e.track.readyState,
        enabled: e.track.enabled,
        muted: e.track.muted,
      });

      if (e.streams && e.streams[0]) {
        const stream = e.streams[0];
        console.log("Stream details:", {
          id: stream.id,
          active: stream.active,
          videoTracks: stream.getVideoTracks().length,
          audioTracks: stream.getAudioTracks().length,
        });

        setIncomingStream(stream);
      }
    };

    return newPeer;
  }, []);

  const sendCallReq = async () => {
    try {
      const newPeer = createPeerConnection();
      setPeer(newPeer);
      peerRef.current = newPeer;

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          newPeer.addTrack(track, streamRef.current!);
          console.log(`Added ${track.kind} track to peer connection`);
        });
      } else {
        console.error("No local stream available to send");
      }

      const offer = await newPeer.createOffer();
      await newPeer.setLocalDescription(offer);
      return offer;
    } catch (error) {
      console.error("Error creating call request:", error);
      throw error;
    }
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
      peerRef.current = undefined;
    }
    setIncomingStream(undefined);
    setMessages([]);
    setRoomStatus("searching");
    setConnectionState("new");
    setIceCandidates([]);
    setHasVideo(false);
    socket.emit("leaveRoom");
  };

  const getUserMedia = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
        },
      });
      setStream(mediaStream);
      console.log("Got user media with ideal constraints");
    } catch (error) {
      console.error("Error with ideal constraints:", error);

      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });
        setStream(mediaStream);
        console.log("Got user media with minimal constraints");
      } catch (minimalError) {
        console.error("Error with minimal constraints:", minimalError);

        try {
          const audioOnlyStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: false,
          });
          setStream(audioOnlyStream);
          console.log("Fallback to audio only");
        } catch (audioError) {
          console.error("Complete media access failure:", audioError);
        }
      }
    }
  };

  const handleManualPlay = async () => {
    if (!remoteVideoRef.current || !incomingStream) {
      console.log("Missing video element or stream");
      return;
    }

    try {
      console.log("Manual play attempt");
      const video = remoteVideoRef.current;

      const videoTracks = incomingStream.getVideoTracks();
      console.log(
        `Stream has ${videoTracks.length} video tracks and is ${
          incomingStream.active ? "active" : "inactive"
        }`
      );

      if (videoTracks.length > 0) {
        console.log("Video track state:", videoTracks[0].readyState);
        videoTracks.forEach((track) => {
          track.enabled = true;
        });
      }

      video.srcObject = incomingStream;
      video.muted = false;

      await video.play();
      console.log("Video playing");
    } catch (error) {
      console.error(" Play failed:", error);

      try {
        const video = remoteVideoRef.current;
        video.muted = true;
        await video.play();
        console.log("Video playing muted!");

        setTimeout(() => {
          if (video) video.muted = false;
        }, 1000);
      } catch (mutedError) {
        console.error("Even muted play failed:", mutedError);

        alert("Click OK to enable video playback");
        try {
          if (remoteVideoRef.current) {
            await remoteVideoRef.current.play();
          }
        } catch (finalError) {
          console.error("All play attempts failed:", finalError);
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
        try {
          const offer = await sendCallReq();
          socket.emit("call-req", { socketId: socket.id, offer });
        } catch (error) {
          console.error("Failed to send call request:", error);
        }
      }
    };

    const handleGotReq = async (data: any) => {
      const { socketId, offer } = data;
      console.log("Got call request from:", socketId);

      if (!streamRef.current) {
        console.error("No local stream available");
        return;
      }

      try {
        const newPeer = createPeerConnection();
        setPeer(newPeer);
        peerRef.current = newPeer;

        streamRef.current.getTracks().forEach((track) => {
          newPeer.addTrack(track, streamRef.current!);
          console.log(`Added ${track.kind} track for answer`);
        });

        await newPeer.setRemoteDescription(new RTCSessionDescription(offer));

        const answer = await newPeer.createAnswer();
        await newPeer.setLocalDescription(answer);

        socket.emit("call-accepted", { socketId, answer });
      } catch (error) {
        console.error("Error handling call request:", error);
      }
    };

    const handleCallAccepted = async (data: any) => {
      const { answer } = data;
      console.log("Call accepted, setting remote description");

      try {
        if (peerRef.current) {
          await peerRef.current.setRemoteDescription(
            new RTCSessionDescription(answer)
          );
          console.log("Remote description set successfully");
        } else {
          console.error("No peer connection available");
        }
      } catch (error) {
        console.error("Error setting remote description:", error);
      }
    };

    const handleIceCandidate = async (data: any) => {
      const { candidate, from } = data;
      console.log(" Received ICE candidate from peer");

      if (peerRef.current && peerRef.current.remoteDescription) {
        try {
          await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
          console.log("ICE candidate added successfully");
        } catch (error) {
          console.error("Error adding ICE candidate:", error);
        }
      } else {
        console.log("Storing ICE candidate for later");
        setIceCandidates((prev) => [...prev, new RTCIceCandidate(candidate)]);
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
      setConnectionState("new");
      setHasVideo(false);

      if (peerRef.current) {
        peerRef.current.close();
        setPeer(undefined);
        peerRef.current = undefined;
      }
    };

    const handleFindNewRoom = () => {
      console.log("Finding new room...");
      setMessages([]);
      setRoomStatus("searching");
      setIncomingStream(undefined);
      setConnectionState("new");
      setHasVideo(false);

      if (peerRef.current) {
        peerRef.current.close();
        setPeer(undefined);
        peerRef.current = undefined;
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

    // Set up all the event listeners
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("roomAssigned", handleRoomAssigned);
    socket.on("got-req", handleGotReq);
    socket.on("call-accepted", handleCallAccepted);
    socket.on("ice-candidate", handleIceCandidate);
    socket.on("userJoined", handleUserJoined);
    socket.on("userLeft", handleUserLeft);
    socket.on("findNewRoom", handleFindNewRoom);
    socket.on("sendMessage", handleSendMessage);

    // Clean up function
    return () => {
      console.log("Cleaning up socket listeners...");
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("roomAssigned", handleRoomAssigned);
      socket.off("got-req", handleGotReq);
      socket.off("call-accepted", handleCallAccepted);
      socket.off("ice-candidate", handleIceCandidate);
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
  }, [createPeerConnection]);

  useEffect(() => {
    getUserMedia();
  }, []);

  return (
    <div className="text-black font-[family-name:var(--font-kiwi-regular)] flex flex-col">
      <div className="flex flex-col h-screen">
        <div className="bg-[#FDC62E] min-w-full h-6"></div>
        <div className="flex flex-grow w-full overflow-hidden">
          <div className="w-2/3 h-full flex items-end">
            <div className="flex flex-col h-full px-5 border-r justify-between items-center gap-2">
              <div className="flex flex-col">
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

              <div className="w-full flex justify-center gap-10 mb-10">
                {isVideoOn ? (
                  <div
                    className="w-13 h-13 flex justify-center items-center rounded-full bg-[#FDC62E]"
                    onClick={handleVideoToggle}
                  >
                    <FaVideo color="black" size={20} />
                  </div>
                ) : (
                  <div
                    className="w-13 h-13 flex justify-center items-center rounded-full bg-red-600"
                    onClick={handleVideoToggle}
                  >
                    <FaVideoSlash color="white" size={20} />
                  </div>
                )}
                {isMicOn ? (
                  <div
                    className="w-13 h-13 flex justify-center items-center rounded-full bg-[#FDC62E]"
                    onClick={handleMicToggle}
                  >
                    <FaMicrophone color="black" size={20} />
                  </div>
                ) : (
                  <div
                    className="w-13 h-13 flex justify-center items-center rounded-full bg-red-600"
                    onClick={handleMicToggle}
                  >
                    <FaMicrophoneSlash color="white" size={20} />
                  </div>
                )}
              </div>
            </div>
            <div className="w-full h-full mx-5 pb-5">
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

              <div className="border-3 border-black rounded-md bg-[#FDC62E] h-1/2 w-full my-2 relative">
                {incomingStream ? (
                  <>
                    <video
                      ref={remoteVideoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover rounded-md bg-black"
                      onLoadedMetadata={() => {
                        if (remoteVideoRef.current) {
                          remoteVideoRef.current.play().catch((e) => {
                            console.log(
                              "Auto play failed, will need manual play:",
                              e
                            );
                          });
                        }
                      }}
                      onError={(e) => {
                        console.error("Video error:", e);
                      }}
                      onPlay={() => {
                        console.log("Remote video is playing!");
                      }}
                    />
                    <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                      Stranger
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-600">
                    <div className="text-black">
                      {roomStatus === "searching"
                        ? "Searching for partner..."
                        : connectionState === "connecting"
                        ? "Connecting to peer..."
                        : connectionState === "failed"
                        ? "Connection failed, try next room"
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
