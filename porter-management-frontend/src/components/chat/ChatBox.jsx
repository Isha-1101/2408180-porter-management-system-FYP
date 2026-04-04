import React, { useState, useEffect, useRef } from "react";
import { Send, X } from "lucide-react";
import socket from "../../utils/socket";
import axiosInstance from "../../apis/axiosInstance";
import { useAuthStore } from "../../store/auth.store";
import toast from "react-hot-toast";

const ChatBox = ({ bookingId, currentUserModel, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const bottomRef = useRef(null);
  const user = useAuthStore((state) => state.user);

  const currentUserId = user?._id || user?.id;

  useEffect(() => {
    const strBookingId =
      typeof bookingId === "object"
        ? String(bookingId._id || bookingId.id)
        : String(bookingId);

    const fetchHistory = async () => {
      try {
        const response = await axiosInstance.get(`/chat/${strBookingId}`);
        if (response.data && response.data.success) {
          setMessages(response.data.messages || []);
        }
      } catch (error) {
        console.error("Error fetching chat history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();

    const joinRoom = () => socket.emit("join-chat", strBookingId);

    if (socket.connected) {
      joinRoom();
    }

    socket.on("connect", joinRoom);

    const handleReceiveMessage = (message) => {
      setMessages((prev) => {
        if (
          prev.some(
            (m) =>
              m.text === message.text &&
              m.senderId === message.senderId &&
              Math.abs(
                new Date(m.createdAt || Date.now()) -
                  new Date(message.createdAt),
              ) < 5000,
          )
        ) {
          return prev;
        }
        return [...prev, message];
      });
    };

    const handleMessageError = (data) => {
      toast.error(data?.error || "Failed to send message");
    };

    socket.on("receive-message", handleReceiveMessage);
    socket.on("message-error", handleMessageError);

    return () => {
      socket.off("connect", joinRoom);
      socket.off("receive-message", handleReceiveMessage);
      socket.off("message-error", handleMessageError);
    };
  }, [bookingId]);

  useEffect(() => {
    if (bottomRef.current) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    }
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !currentUserId) {
      return;
    }

    const strBookingId =
      typeof bookingId === "object"
        ? String(bookingId._id || bookingId.id)
        : String(bookingId);

    const tempMsg = {
      _id: "temp-" + Date.now(),
      bookingId: strBookingId,
      senderId: currentUserId,
      senderModel: currentUserModel,
      text: newMessage,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMsg]);
    setIsSending(true);

    socket.emit("send-message", {
      bookingId: strBookingId,
      senderId: currentUserId,
      senderModel: currentUserModel,
      text: newMessage,
    });

    setNewMessage("");
    setTimeout(() => setIsSending(false), 1000);
  };

  return (
    <div className="flex flex-col h-[400px] w-full max-w-sm bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden relative">
      <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground">
        <h3 className="font-semibold text-white">Chat</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-400 text-sm">Loading chat...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-400 text-sm">No messages yet. Send a hi!</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = String(msg.senderId) === String(currentUserId);
            return (
              <div
                key={idx}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                    isMe
                      ? "bg-primary text-white rounded-tr-none"
                      : "bg-white text-gray-800 border border-gray-100 rounded-tl-none"
                  }`}
                >
                  <p>{msg.text}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSendMessage} className="flex items-center gap-2 p-3 bg-white border-t border-gray-100">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || isSending}
          className="p-2 rounded-full bg-primary text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default ChatBox;
