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
import { BiUpvote, BiSolidUpvote } from "react-icons/bi";
import { votingService } from "../services/api";
import Reactions from "../components/Reactions";
import { getAvatarUrl } from "../services/avatar";

interface Imessages {
  message: string;
  type: "self" | "friend" | "system";
}

interface PeerInfo {
  userName: string;
  email: string;
  upvotes: number;
  isLoggedIn: boolean;
}

export default function Chat() {
  const router = useRouter();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const localVideoContainerRef = useRef<HTMLDivElement>(null);
  const peerVideoContainerRef = useRef<HTMLDivElement>(null);
  const selfReactionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const peerReactionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isReactionOpen, setIsReactionOpen] = useState<boolean>(true);
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
  const [isPeerVideoOn, setIsPeerVideoOn] = useState(false);
  const [isPeerMicOn, setIsPeerMicOn] = useState(false);
  const [connectionState, setConnectionState] = useState<string>("new");
  const [iceCandidates, setIceCandidates] = useState<RTCIceCandidate[]>([]);
  const [hasVideo, setHasVideo] = useState<boolean>(false);
  const [peerInfo, setPeerInfo] = useState<PeerInfo | null>(null);
  const [hasUpvoted, setHasUpvoted] = useState<boolean>(false);
  const [isUpvoting, setIsUpvoting] = useState<boolean>(false);
  const [selfReaction, setSelfReaction] = useState<string>("");
  const [peerReaction, setPeerReaction] = useState<string>("");

  const [isOtherUserLoggedIn, setIsOtherUserLoggedIn] =
    useState<boolean>(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const chatRef = useRef<HTMLFormElement>(null);

  const streamRef = useRef<MediaStream | undefined>(undefined);
  const peerRef = useRef<RTCPeerConnection | undefined>(undefined);
  const userRef = useRef(user);

  const areBothUsersLoggedIn = () => {
    return user && isOtherUserLoggedIn;
  };
  const handleUpvote = async () => {
    if (!user || !peerInfo || isUpvoting || hasUpvoted) return;

    console.log("Starting upvote process for:", peerInfo.userName);
    setIsUpvoting(true);

    try {
      console.log("Step 1: Adding upvote to peer");
      await votingService.addVote(peerInfo.userName, peerInfo.email);

      console.log("Step 2: Updating upvote list");
      await votingService.updateList(peerInfo.userName, peerInfo.email);

      setHasUpvoted(true);
      setPeerInfo((prev) =>
        prev ? { ...prev, upvotes: prev.upvotes + 1 } : null
      );

      socket.emit("upvoteGiven", {
        fromUser: user.userName,
        toUser: peerInfo.userName,
        newUpvoteCount: peerInfo.upvotes + 1,
      });

      const systemMsg: Imessages = {
        message: `You upvoted ${peerInfo.userName}`,
        type: "system",
      };
      setMessages((prev) => [...prev, systemMsg]);
    } catch (error: any) {
      console.error("Upvote error:", error);

      let errorMessage = "Failed to upvote. Please try again.";

      if (error.response?.status === 401) {
        errorMessage = "Please log in again to upvote.";
      } else if (error.response?.status === 400) {
        errorMessage =
          error.response.data?.message || "Invalid upvote request.";
      } else if (error.response?.status === 404) {
        errorMessage = "User not found.";
      }

      const errorMsg: Imessages = {
        message: errorMessage,
        type: "system",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsUpvoting(false);
    }
  };

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };

  const handleRemoveUpvote = async () => {
    if (!user || !peerInfo || isUpvoting || !hasUpvoted) return;

    setIsUpvoting(true);

    try {
      await votingService.removeUpvote(peerInfo.userName, peerInfo.email);

      await votingService.removeFromList(peerInfo.email);

      setHasUpvoted(false);
      setPeerInfo((prev) =>
        prev ? { ...prev, upvotes: Math.max(0, prev.upvotes - 1) } : null
      );

      socket.emit("upvoteRemoved", {
        fromUser: user.userName,
        toUser: peerInfo.userName,
        newUpvoteCount: Math.max(0, peerInfo.upvotes - 1),
      });
    } catch (error: any) {
      console.error("Remove upvote error:", error);

      let errorMessage = "Failed to remove upvote. Please try again.";

      if (error.response?.status === 401) {
        errorMessage = "Please log in again to remove upvote.";
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || "Invalid request.";
      } else if (error.response?.status === 404) {
        errorMessage = "User not found.";
      }

      const errorMsg: Imessages = {
        message: errorMessage,
        type: "system",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsUpvoting(false);
    }
  };

  const handleMicToggle = () => {
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      audioTracks.forEach((track, i) => {
        track.enabled = !track.enabled;
      });

      const newState = !isMicOn;
      setIsMicOn(newState);

      const systemMsg: Imessages = {
        message: isMicOn ? "Microphone turned off" : "Microphone turned on",
        type: "system",
      };
      setMessages((prev) => [...prev, systemMsg]);

      socket.emit("micToggled", { isRemotePeerMicOn: newState });
    } else {
      console.error("ERROR: No stream available!");
    }
  };

  const handleVideoToggle = () => {
    if (streamRef.current) {
      const videoTracks = streamRef.current.getVideoTracks();

      videoTracks.forEach((track, i) => {
        track.enabled = !track.enabled;
      });

      const newState = !isVideoOn;
      setIsVideoOn(newState);

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

      socket.emit("vidToggled", { isRemotePeerVideoOn: newState });
    } else {
      console.error("ERROR: No stream available!");
    }
  };

  const handlePeerVidToggle = (data: any) => {
    if (!data) {
      console.error("No data received for peer video toggle");
      return;
    }

    const { isRemotePeerVideoOn } = data;
    setIsPeerVideoOn(isRemotePeerVideoOn);
  };

  const handlePeerMicToggle = (data: any) => {
    if (!data) {
      console.error("No data received for peer mic toggle");
      return;
    }
    const { isRemotePeerMicOn } = data;
    setIsPeerMicOn(isRemotePeerMicOn);
  };

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
      setConnectionState(newPeer.connectionState);

      if (newPeer.connectionState === "failed") {
        console.log("Connection failed - this explains the black screen");
      }
    };

    newPeer.oniceconnectionstatechange = () => {
      if (newPeer.iceConnectionState === "failed") {
        console.log("ICE connection failed - video won't display");
      }
    };

    newPeer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", { candidate: event.candidate });
      }
    };

    newPeer.ontrack = (e) => {
      if (e.streams && e.streams[0]) {
        const stream = e.streams[0];
        console.log("Stream details:", {
          id: stream.id,
          active: stream.active,
          videoTracks: stream.getVideoTracks().length,
          audioTracks: stream.getAudioTracks().length,
        });

        console.log("Setting incoming stream");
        setIncomingStream(stream);
      }
    };

    return newPeer;
  }, []);

  const handleSelfReaction = (emoji: string) => {
    setSelfReaction(emoji);

    if (selfReactionTimerRef.current) {
      clearTimeout(selfReactionTimerRef.current);
    }

    selfReactionTimerRef.current = setTimeout(() => {
      setSelfReaction("");
    }, 3000);
  };

  const sendCallReq = async () => {
    try {
      const newPeer = createPeerConnection();
      setPeer(newPeer);
      peerRef.current = newPeer;

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          newPeer.addTrack(track, streamRef.current!);
          console.log(
            `Added ${track.kind} track to peer connection (enabled: ${track.enabled})`
          );
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

    setTimeout(() => {
      scrollToBottom();
    }, 50);
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
    setIsOtherUserLoggedIn(false);
    setPeerInfo(null);
    setHasUpvoted(false);
    setIsUpvoting(false);

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

      mediaStream.getAudioTracks().forEach((track) => {
        track.enabled = false;
        console.log("Audio track disabled by default for privacy");
      });

      mediaStream.getVideoTracks().forEach((track) => {
        track.enabled = false;
        console.log("Video track disabled by default for privacy");
      });

      setStream(mediaStream);
      console.log(
        "Got user media with ideal constraints - tracks disabled by default"
      );
    } catch (error) {
      console.error("Error with ideal constraints:", error);

      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });

        mediaStream.getAudioTracks().forEach((track) => {
          track.enabled = false;
          console.log("Audio track disabled by default for privacy");
        });

        mediaStream.getVideoTracks().forEach((track) => {
          track.enabled = false;
          console.log("Video track disabled by default for privacy");
        });

        setStream(mediaStream);
        console.log(
          "Got user media with minimal constraints - tracks disabled by default"
        );
      } catch (minimalError) {
        console.error("Error with minimal constraints:", minimalError);

        try {
          const audioOnlyStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: false,
          });

          audioOnlyStream.getAudioTracks().forEach((track) => {
            track.enabled = false;
            console.log("Audio track disabled by default for privacy");
          });

          setStream(audioOnlyStream);
          console.log("Fallback to audio only - tracks disabled by default");
        } catch (audioError) {
          console.error("Complete media access failure:", audioError);
        }
      }
    }
  };

  useEffect(() => {
    const localContainer = localVideoContainerRef.current;
    const remoteContainer = peerVideoContainerRef.current;
    const inputElement = chatRef.current?.querySelector(
      'input[type="text"]'
    ) as HTMLInputElement;

    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === " ") {
        event.preventDefault();
      }

      switch (event.key) {
        case " ":
          handleNextRoom();
          break;
        case "v":
          handleVideoToggle();
          break;
        case "m":
          handleMicToggle();
          break;
        case "/":
          event.preventDefault();
          inputElement?.focus();
          break;
      }
    };

    const handleBackToVid = (event: KeyboardEvent) => {
      switch (event.key) {
        case "Escape":
          localContainer?.focus();
          break;
      }
    };

    if (inputElement) {
      inputElement.addEventListener("keydown", handleBackToVid);
    }

    if (localContainer) {
      localContainer.addEventListener("keydown", handleKeyPress);
      localContainer.tabIndex = 0;
    }

    if (remoteContainer) {
      remoteContainer.addEventListener("keydown", handleKeyPress);
      remoteContainer.tabIndex = 0;
    }

    return () => {
      if (inputElement) {
        inputElement.removeEventListener("keydown", handleBackToVid);
      }

      if (localContainer) {
        localContainer.removeEventListener("keydown", handleKeyPress);
      }

      if (remoteContainer) {
        remoteContainer.removeEventListener("keydown", handleKeyPress);
      }
    };
  }, [handleNextRoom, handleVideoToggle, handleMicToggle]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      const videoTracks = stream.getVideoTracks();
      const audioTracks = stream.getAudioTracks();

      videoTracks.forEach((track, i) => {
        track.enabled = isVideoOn;
      });

      audioTracks.forEach((track, i) => {
        track.enabled = isMicOn;
      });
    }
  }, [stream, isVideoOn, isMicOn]);

  useEffect(() => {
    if (remoteVideoRef.current && incomingStream) {
      remoteVideoRef.current.srcObject = incomingStream;

      const videoTracks = incomingStream.getVideoTracks();
      const audioTracks = incomingStream.getAudioTracks();

      setHasVideo(videoTracks.length > 0);

      if (videoTracks.length > 0) {
        videoTracks.forEach((track, i) => {
          console.log(`Video track ${i} details:`, {
            label: track.label,
            enabled: track.enabled,
            readyState: track.readyState,
            muted: track.muted,
            id: track.id,
            kind: track.kind,
          });
        });
      }

      const videoElement = remoteVideoRef.current;
      videoElement.onloadedmetadata = () => {
        videoElement
          .play()
          .then(() => {
            console.log("Remote video playing successfully");
          })
          .catch((error) => {
            console.error("Remote video failed to play:", error);
          });
      };

      videoElement.oncanplay = () => console.log("Remote video can play");
      videoElement.onplaying = () => console.log("Remote video is playing");
      videoElement.onpause = () => console.log("Remote video paused");
      videoElement.onerror = (e) => console.error("Remote video error:", e);
      videoElement.onstalled = () => console.log("Remote video stalled");
      videoElement.onwaiting = () => console.log("Remote video waiting");
    }
  }, [incomingStream]);

  useEffect(() => {
    if (peer && iceCandidates.length > 0) {
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

  useEffect(() => {
    const checkUpvoteStatus = async () => {
      if (user && peerInfo && peerInfo.email) {
        try {
          const response = await votingService.checkUpvoteStatus(
            peerInfo.email
          );
          setHasUpvoted(response.data.data.hasUpvoted);
        } catch (error) {
          console.error("Error checking upvote status:", error);
          setHasUpvoted(false);
        }
      }
    };

    checkUpvoteStatus();
  }, [peerInfo, user]);

  useEffect(() => {
    console.log("Initializing socket connection...");

    if (!socket.connected) {
      socket.connect();
    }

    const handleConnect = () => {
      console.log("Socket connected with ID:", socket.id);
      setIsSocketConnected(true);
      socket.emit("findRoom", {
        userId: userRef.current?._id || socket.id,
        isLoggedIn: !!userRef.current,
        userName: userRef.current?.userName || "",
        email: userRef.current?.email || "",
        upvotes: userRef.current?.upvotes || 0,
      });
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

      if (data.status === "active") {
        console.log("Room is active, sending auth status to other user");
        socket.emit("userAuthStatus", {
          isLoggedIn: !!userRef.current,
        });
      }

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
          console.log(
            `Added ${track.kind} track for answer (enabled: ${track.enabled})`
          );
        });

        await newPeer.setRemoteDescription(new RTCSessionDescription(offer));
        console.log("Remote description set for incoming call");

        const answer = await newPeer.createAnswer();
        await newPeer.setLocalDescription(answer);

        socket.emit("call-accepted", { socketId, answer });
        if (iceCandidates.length > 0) {
          console.log(
            `Adding ${iceCandidates.length} stored ICE candidates after setting remote description`
          );
          for (const candidate of iceCandidates) {
            try {
              await newPeer.addIceCandidate(candidate);
              console.log("Stored ICE candidate added successfully");
            } catch (err) {
              console.error("Error adding stored ICE candidate:", err);
            }
          }
          setIceCandidates([]);
        }
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
          if (iceCandidates.length > 0) {
            console.log(
              `Adding ${iceCandidates.length} stored ICE candidates after remote description`
            );
            for (const candidate of iceCandidates) {
              try {
                await peerRef.current.addIceCandidate(candidate);
                console.log("Stored ICE candidate added successfully");
              } catch (err) {
                console.error("Error adding stored ICE candidate:", err);
              }
            }
            setIceCandidates([]);
          }
        } else {
          console.error("No peer connection available");
        }
      } catch (error) {
        console.error("Error setting remote description:", error);
      }
    };

    const handleIceCandidate = async (data: any) => {
      const { candidate, from } = data;
      console.log("Received ICE candidate from peer");

      if (peerRef.current && peerRef.current.remoteDescription) {
        try {
          await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
          console.log("ICE candidate added successfully");
        } catch (error) {
          console.error("Error adding ICE candidate:", error);
        }
      } else {
        console.log(
          "Storing ICE candidate for later - no remote description yet"
        );
        setIceCandidates((prev) => [...prev, new RTCIceCandidate(candidate)]);
      }
    };

    const handleUserJoined = (data: any) => {
      console.log("User joined room:", data.userId || "Unknown User");
      console.log("Other user login status:", data.isLoggedIn);

      setMessages([]);
      setRoomStatus("active");
      setIsOtherUserLoggedIn(data.isLoggedIn || false);
      if (data.isLoggedIn && data.userName && data.email) {
        setPeerInfo({
          userName: data.userName,
          email: data.email,
          upvotes: data.upvotes || 0,
          isLoggedIn: true,
        });
      } else {
        setPeerInfo(null);
      }

      setIsPeerMicOn(false);
      setIsPeerVideoOn(false);
      setHasUpvoted(false);

      console.log("Sending our auth status to new user");
      socket.emit("userAuthStatus", {
        isLoggedIn: !!userRef.current,
        userName: userRef.current?.userName || "",
        email: userRef.current?.email || "",
        upvotes: userRef.current?.upvotes || 0,
      });

      setTimeout(() => {
        console.log("Sending current media states to new user:", {
          myVideo: isVideoOn,
          myMic: isMicOn,
        });
        socket.emit("vidToggled", { isRemotePeerVideoOn: isVideoOn });
        socket.emit("micToggled", { isRemotePeerMicOn: isMicOn });
      }, 1000);
    };

    const handleUserLeft = (data: any) => {
      console.log("User left room:", data.userId || "Unknown User");
      setRoomStatus("searching");
      setIncomingStream(undefined);
      setConnectionState("new");
      setHasVideo(false);
      setIsOtherUserLoggedIn(false);

      setIsPeerMicOn(false);
      setIsPeerVideoOn(false);
      setPeerInfo(null);
      setHasUpvoted(false);
      setIsUpvoting(false);

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
      setIsOtherUserLoggedIn(false);
      setPeerInfo(null);
      setHasUpvoted(false);
      setIsUpvoting(false);

      if (peerRef.current) {
        peerRef.current.close();
        setPeer(undefined);
        peerRef.current = undefined;
      }

      socket.emit("searchNewRoom", {
        isLoggedIn: !!userRef.current,
        userName: userRef.current?.userName || "",
        email: userRef.current?.email || "",
        upvotes: userRef.current?.upvotes || 0,
      });
    };

    const handleSendMessage = (arg: any) => {
      const msg: Imessages = {
        message: arg.message,
        type: "friend",
      };
      setMessages((prev) => [...prev, msg]);
    };

    const handleUserAuthStatus = (data: any) => {
      console.log("Received other user auth status:", data.isLoggedIn);
      setIsOtherUserLoggedIn(data.isLoggedIn);

      if (data.isLoggedIn && data.userName && data.email) {
        setPeerInfo({
          userName: data.userName,
          email: data.email,
          upvotes: data.upvotes || 0,
          isLoggedIn: true,
        });
      } else {
        setPeerInfo(null);
      }
    };

    const handleUpvoteReceived = (data: any) => {
      const { fromUser, newUpvoteCount } = data;
      if (user && data.toUser === user.userName) {
        userRef.current = {
          ...userRef.current!,
          upvotes: newUpvoteCount || (userRef.current?.upvotes || 0) + 1,
        };
      }

      const systemMsg: Imessages = {
        message: `${fromUser} upvoted you!`,
        type: "system",
      };
      setMessages((prev) => [...prev, systemMsg]);
    };

    const handleUpvoteRemoved = (data: any) => {
      const { fromUser, newUpvoteCount } = data;
      if (user && data.toUser === user.userName) {
        userRef.current = {
          ...userRef.current!,
          upvotes:
            newUpvoteCount || Math.max(0, (userRef.current?.upvotes || 0) - 1),
        };
      }
    };

    const handlePeerMicToggleEvent = (data: any) => {
      handlePeerMicToggle(data);
    };

    const handlePeerVidToggleEvent = (data: any) => {
      handlePeerVidToggle(data);
    };

    const handlePeerReaction = (data: any) => {
      const { emoji } = data;
      setPeerReaction(emoji);

      if (peerReactionTimerRef.current) {
        clearTimeout(peerReactionTimerRef.current);
      }

      peerReactionTimerRef.current = setTimeout(() => {
        setPeerReaction("");
      }, 3000);
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
    socket.on("userAuthStatus", handleUserAuthStatus);
    socket.on("upvoteReceived", handleUpvoteReceived);
    socket.on("upvoteRemoved", handleUpvoteRemoved);
    socket.on("peerMicToggled", handlePeerMicToggleEvent);
    socket.on("peerVidToggled", handlePeerVidToggleEvent);
    socket.on("sendReaction", handlePeerReaction);

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
      socket.off("userAuthStatus", handleUserAuthStatus);
      socket.off("upvoteReceived", handleUpvoteReceived);
      socket.off("upvoteRemoved", handleUpvoteRemoved);
      socket.off("peerMicToggled", handlePeerMicToggleEvent);
      socket.off("peerVidToggled", handlePeerVidToggleEvent);
      socket.off("sendReaction", handlePeerReaction);

      if (peerRef.current) {
        peerRef.current.close();
      }

      if (socket.connected) {
        socket.disconnect();
      }
    };
  }, [createPeerConnection]);

  useEffect(() => {
    if (roomStatus === "active") {
      console.log("Media states changed, sending to peer:", {
        isVideoOn,
        isMicOn,
      });
      socket.emit("vidToggled", { isRemotePeerVideoOn: isVideoOn });
      socket.emit("micToggled", { isRemotePeerMicOn: isMicOn });
    }
  }, [isVideoOn, isMicOn, roomStatus]);

  useEffect(() => {
    getUserMedia();
  }, []);

  useEffect(() => {
    return () => {
      if (selfReactionTimerRef.current) {
        clearTimeout(selfReactionTimerRef.current);
      }
      if (peerReactionTimerRef.current) {
        clearTimeout(peerReactionTimerRef.current);
      }
    };
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
                    {isSocketConnected ? "Connected" : "Disconnected"}
                  </div>
                </div>

                <div className="flex flex-col items-center gap-5 mt-4">
                  <div className="text-sm text-gray-700 p-3 bg-gray-50 rounded-lg border w-48">
                    <div className="font-bold text-center mb-2">Upvotes</div>
                    <div className="flex justify-between items-center">
                      <div className="text-center">
                        <div className="font-medium">You</div>
                        <div className="text-lg font-bold text-[#FDC62E]">
                          {user?.upvotes || 0}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">Peer</div>
                        <div className="text-lg font-bold text-[#FDC62E]">
                          {peerInfo?.upvotes || 0}
                        </div>
                      </div>
                    </div>
                    {peerInfo && (
                      <div className="text-xs text-center mt-2 text-black">
                        {peerInfo.userName}
                      </div>
                    )}
                  </div>

                  <div className="w-48">
                    <Reactions
                      onReactionClick={(emoji) => {
                        console.log("Reaction clicked:", emoji);
                        handleSelfReaction(emoji);
                        socket.emit("getReaction", { emoji });
                      }}
                    />
                  </div>
                </div>

                {/* <div className="text-xs text-gray-500 mt-2 max-w-48 bg-gray-100 p-2 rounded">
                  <div className="font-bold">Debug:</div>
                  <div>
                    My: Video{isVideoOn ? "ON" : "OFF"} Mic
                    {isMicOn ? "ON" : "OFF"}
                  </div>
                  <div>
                    Peer: Video{isPeerVideoOn ? "ON" : "OFF"} Mic
                    {isPeerMicOn ? "ON" : "OFF"}
                  </div>
                  <div>Room: {roomStatus}</div>
                  <div>Conn: {connectionState}</div>
                  <div>Stream: {incomingStream ? "YES" : "NO"}</div>
                </div> */}
              </div>

              <div className="flex flex-col gap-5">
                <div>
                  {areBothUsersLoggedIn() && peerInfo ? (
                    <button
                      onClick={hasUpvoted ? handleRemoveUpvote : handleUpvote}
                      disabled={isUpvoting}
                      className={`flex items-center gap-2 justify-center py-3 px-4 border-4 rounded-full text-md transition-colors ${
                        isUpvoting
                          ? "bg-gray-400 text-white border-gray-400 cursor-not-allowed"
                          : hasUpvoted
                          ? "bg-[#FDC62E] hover:bg-[#f5bb1f] border-black cursor-pointer"
                          : "bg-[#FDC62E] hover:bg-[#f5bb1f] border-black cursor-pointer"
                      }`}
                    >
                      {isUpvoting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          {hasUpvoted ? "Removing..." : "Upvoting..."}
                        </>
                      ) : hasUpvoted ? (
                        <>
                          <BiSolidUpvote size={20} className="text-white" />
                          Remove
                        </>
                      ) : (
                        <>
                          <BiUpvote size={20} />
                          Upvote
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 justify-center py-3 px-4 border-4 rounded-full bg-gray-300 text-gray-600 text-md">
                      {user
                        ? isOtherUserLoggedIn
                          ? "Both users must be logged in"
                          : "Peer not login"
                        : "Login to upvote"}
                    </div>
                  )}
                </div>
                <div className="w-full flex justify-center gap-10 mb-10">
                  {isVideoOn ? (
                    <div
                      className="w-13 h-13 flex justify-center items-center rounded-full bg-[#FDC62E] cursor-pointer hover:bg-[#f5bb1f] transition-colors"
                      onClick={() => {
                        handleVideoToggle();
                      }}
                    >
                      <FaVideo color="black" size={20} />
                    </div>
                  ) : (
                    <div
                      className="w-13 h-13 flex justify-center items-center rounded-full bg-red-600 cursor-pointer hover:bg-red-700 transition-colors"
                      onClick={() => {
                        handleVideoToggle();
                      }}
                    >
                      <FaVideoSlash color="white" size={20} />
                    </div>
                  )}
                  {isMicOn ? (
                    <div
                      className="w-13 h-13 flex justify-center items-center rounded-full bg-[#FDC62E] cursor-pointer hover:bg-[#f5bb1f] transition-colors"
                      onClick={() => {
                        handleMicToggle();
                      }}
                    >
                      <FaMicrophone color="black" size={20} />
                    </div>
                  ) : (
                    <div
                      className="w-13 h-13 flex justify-center items-center rounded-full bg-red-600 cursor-pointer hover:bg-red-700 transition-colors"
                      onClick={() => {
                        handleMicToggle();
                      }}
                    >
                      <FaMicrophoneSlash color="white" size={20} />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="w-full h-full mx-5 pb-5">
              <div
                className="border-3 border-black rounded-md bg-[#FDC62E] h-1/2 w-full my-2 relative"
                ref={localVideoContainerRef}
                tabIndex={0}
              >
                {isVideoOn ? (
                  <>
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
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col justify-center items-center">
                    {user?.avatar ? (
                      <Image
                        src={getAvatarUrl(user.avatar) || "/gupshupLogo.svg"}
                        alt="Profile"
                        width={70}
                        height={70}
                        className="object-cover rounded-full"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#FDC62E] flex items-center justify-center">
                        <Image
                          src={"/gupshupLogo.svg"}
                          alt="Profile"
                          width={70}
                          height={70}
                          className="object-cover bg-white rounded-full"
                        />
                      </div>
                    )}
                  </div>
                )}

                {selfReaction && (
                  <div className="absolute top-2 right-2 z-10">
                    <div className="text-xl bg-white rounded-full animate-bounce p-2 shadow-lg">
                      {selfReaction}
                    </div>
                  </div>
                )}
              </div>

              <div
                className="border-3 border-black rounded-md bg-[#FDC62E] h-1/2 w-full my-2 relative"
                ref={peerVideoContainerRef}
                tabIndex={0}
              >
                {incomingStream ? (
                  <>
                    <video
                      ref={remoteVideoRef}
                      autoPlay
                      playsInline
                      className={`w-full h-full object-cover rounded-md bg-black ${
                        isPeerVideoOn ? "opacity-100" : "opacity-0"
                      }`}
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
                      Peer {isPeerVideoOn ? "Video" : "Video OFF"}
                    </div>
                    {!isPeerVideoOn && (
                      <div className="absolute inset-0 flex items-center justify-center bg-[#FDC62E] text-black rounded-md">
                        <div className="text-center">
                          <Image
                            src={"/gupshupLogo.svg"}
                            alt="Profile"
                            width={70}
                            height={70}
                            className="object-cover bg-white rounded-full"
                          />
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-600">
                    <div className="text-black flex flex-col justify-center items-center">
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
                {peerReaction && (
                  <div className="absolute top-2 right-2 z-10">
                    <div className="text-xl bg-white rounded-full animate-bounce p-2 shadow-lg">
                      {peerReaction}
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
                        src={getAvatarUrl(user.avatar) || "/gupshupLogo.svg"}
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
            <div className="flex flex-col mx-5 min-h-0 h-full">
              <div className="text-2xl py-3 flex-shrink-0">chat</div>
              <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto mb-4 pr-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200"
                id="messages-container"
              >
                <MessageBox data={messages} />
                <div ref={messagesEndRef} />
              </div>
              <div className="mb-4 flex-shrink-0">
                <form
                  ref={chatRef}
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
