import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Send,
  Paperclip,
  Loader2,
  CheckCheck,
  MessageCircle,
  File,
  Image as ImageIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

/**
 * Enhanced Chat Component with File Sharing and Typing Indicators
 */
export const EnhancedChat = ({ bookingId, socket, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const [uploading, setUploading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadChatHistory();
    getUnreadCount();

    // Join chat room
    if (socket) {
      socket.emit("join-chat", bookingId);

      // Listen for incoming messages
      socket.on("receive-message", (message) => {
        setMessages((prev) => [...prev, message]);
        markMessageAsRead(message._id);
        setUnreadCount((prev) => Math.max(0, prev - 1));
      });

      // Listen for typing indicators
      socket.on("user-typing", (data) => {
        if (data.isTyping) {
          setTypingUsers((prev) => ({
            ...prev,
            [data.userId]: data.userName,
          }));
        } else {
          setTypingUsers((prev) => {
            const updated = { ...prev };
            delete updated[data.userId];
            return updated;
          });
        }
      });

      // Listen for read receipts
      socket.on("message-read-receipt", (data) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === data.messageId
              ? {
                  ...msg,
                  readBy: msg.readBy
                    ? [...msg.readBy, { id: data.readBy.id, name: data.readBy.name }]
                    : [{ id: data.readBy.id, name: data.readBy.name }],
                }
              : msg
          )
        );
      });

      return () => {
        socket.off("receive-message");
        socket.off("user-typing");
        socket.off("message-read-receipt");
      };
    }
  }, [bookingId, socket]);

  const loadChatHistory = async () => {
    try {
      const response = await axios.get(`/core-api/chat/${bookingId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setMessages(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error("Error loading chat:", error);
      setLoading(false);
    }
  };

  const getUnreadCount = async () => {
    try {
      const response = await axios.get(
        `/core-api/chat/${bookingId}/unread-count`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setUnreadCount(response.data.data.unreadCount);
    } catch (error) {
      console.error("Error getting unread count:", error);
    }
  };

  const markMessageAsRead = async (messageId) => {
    try {
      await axios.put(`/core-api/chat/${messageId}/read`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (socket) {
        socket.emit("message-read", {
          messageId,
          bookingId,
          readerId: currentUser._id,
          readerName: currentUser.name,
        });
      }
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim()) {
      return;
    }

    // Stop typing indicator
    if (socket) {
      socket.emit("typing-stop", {
        bookingId,
        userId: currentUser._id,
        userName: currentUser.name,
      });
    }

    setSending(true);
    try {
      const response = await axios.post(
        `/core-api/chat/${bookingId}/message`,
        { text: newMessage },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      const sentMessage = response.data.data;
      setMessages((prev) => [...prev, sentMessage]);
      setNewMessage("");

      // Emit to socket
      if (socket) {
        socket.emit("send-message", {
          bookingId,
          senderId: currentUser._id,
          senderModel: currentUser.role === "user" ? "User" : "Porters",
          text: newMessage,
        });
      }
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("caption", newMessage || "");

      const response = await axios.post(
        `/core-api/chat/${bookingId}/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const sentMessage = response.data.data;
      setMessages((prev) => [...prev, sentMessage]);
      setNewMessage("");
      toast.success("File sent successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const handleTyping = () => {
    if (socket) {
      socket.emit("typing-start", {
        bookingId,
        userId: currentUser._id,
        userName: currentUser.name,
      });
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    handleTyping();
  };

  const renderMessage = (msg) => {
    return (
      <div
        key={msg._id}
        className={`flex ${
          msg.senderId === currentUser._id ? "justify-end" : "justify-start"
        } mb-3`}
      >
        <div
          className={`max-w-xs ${
            msg.senderId === currentUser._id
              ? "bg-blue-500 text-white rounded-l-lg rounded-tr-lg"
              : "bg-gray-200 text-gray-900 rounded-r-lg rounded-tl-lg"
          } px-4 py-2`}
        >
          {msg.fileUrl ? (
            <div className="space-y-2">
              {msg.fileType?.startsWith("image/") ? (
                <img
                  src={msg.fileUrl}
                  alt={msg.fileName}
                  className="max-w-xs rounded"
                />
              ) : (
                <a
                  href={msg.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:underline"
                >
                  <File className="w-4 h-4" />
                  {msg.fileName}
                </a>
              )}
              {msg.text && <p className="text-sm">{msg.text}</p>}
            </div>
          ) : (
            <p className="text-sm">{msg.text}</p>
          )}

          {/* Read Receipts */}
          {msg.senderId === currentUser._id && msg.readBy && (
            <div className="flex items-center gap-1 mt-1 text-xs opacity-70">
              <CheckCheck className="w-3 h-3" />
              {msg.readBy.length > 0 && <span>Read</span>}
            </div>
          )}

          <p className="text-xs opacity-70 mt-1">
            {new Date(msg.createdAt).toLocaleTimeString()}
          </p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Loading chat...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-96 flex flex-col">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Chat
          </CardTitle>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
              {unreadCount}
            </span>
          )}
        </div>
      </CardHeader>

      {/* Messages Area */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 ? (
          <p className="text-center text-gray-500 text-sm">No messages yet</p>
        ) : (
          messages.map(renderMessage)
        )}

        {/* Typing Indicator */}
        {Object.keys(typingUsers).length > 0 && (
          <div className="text-sm text-gray-600 italic">
            {Object.values(typingUsers).join(", ")} is typing...
          </div>
        )}
      </CardContent>

      {/* Message Input */}
      <div className="border-t p-4 space-y-2">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <div className="relative flex-1">
            <Input
              value={newMessage}
              onChange={handleInputChange}
              placeholder="Type a message..."
              disabled={sending || uploading}
              className="pr-12"
            />
            <label className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer">
              <Paperclip className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              <input
                type="file"
                onChange={(e) => handleFileUpload(e.target.files?.[0])}
                disabled={uploading}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx"
              />
            </label>
          </div>
          <Button
            type="submit"
            disabled={sending || uploading || !newMessage.trim()}
            size="sm"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
        <p className="text-xs text-gray-500">
          Attach files up to 10MB (images, PDFs, documents)
        </p>
      </div>
    </Card>
  );
};

export default EnhancedChat;
