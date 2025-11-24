"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { uploadMedia } from "@/lib/media-upload";

export default function ConversationPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.id as string;
  const [conversation, setConversation] = useState<any>(null);
  const [messageBody, setMessageBody] = useState("");
  const [isPaidMessage, setIsPaidMessage] = useState(false);
  const [paidPrice, setPaidPrice] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    Promise.all([api.get("/auth/me"), api.get(`/messages/conversations/${conversationId}`)])
      .then(([userRes, convRes]) => {
        setUser(userRes.data);
        setConversation(convRes.data);
      })
      .catch(() => {
        router.push("/login");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [conversationId, router]);

  const sendMessage = async () => {
    if (!messageBody.trim() && !mediaUrl.trim()) return;

    try {
      if (isPaidMessage && user?.role === "CREATOR" && paidPrice) {
        await api.post(`/messages/conversations/${conversationId}/send-paid`, {
          body: messageBody,
          mediaUrl: mediaUrl || undefined,
          price: parseFloat(paidPrice),
        });
      } else {
        await api.post("/messages/conversations", {
          creatorId: conversation.creatorId === user.id ? conversation.fanId : conversation.creatorId,
          body: messageBody,
          mediaUrl: mediaUrl || undefined,
        });
      }
      setMessageBody("");
      setMediaUrl("");
      setIsPaidMessage(false);
      setPaidPrice("");
      // Reload conversation
      const res = await api.get(`/messages/conversations/${conversationId}`);
      setConversation(res.data);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to send message");
    }
  };

  const unlockMessage = async (messageId: string) => {
    try {
      await api.post(`/messages/${messageId}/unlock`);
      // Reload conversation
      const res = await api.get(`/messages/conversations/${conversationId}`);
      setConversation(res.data);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to unlock message");
    }
  };

  if (loading || !conversation || !user) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  const otherUser =
    user.role === "CREATOR" ? conversation.fan : conversation.creator;
  const isCreator = user.role === "CREATOR";

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="border rounded-lg h-[600px] flex flex-col">
        {/* Header */}
        <div className="border-b p-4">
          <h2 className="font-semibold">{otherUser?.displayName || otherUser?.username}</h2>
          <p className="text-sm text-gray-600">@{otherUser?.username}</p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {conversation.messages.map((msg: any) => {
            const isOwn = msg.senderId === user.id || (msg.senderType === "CREATOR" && isCreator) || (msg.senderType === "AI" && isCreator);
            const isLocked = msg.isLocked && !msg.unlocked && !isOwn;

            return (
              <div
                key={msg.id}
                className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-4`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isOwn ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"
                  } ${isLocked ? "opacity-75" : ""}`}
                >
                  {isLocked ? (
                    <div className="text-center">
                      <p className="font-semibold mb-2">🔒 Locked Message</p>
                      <p className="text-sm mb-2">Unlock for ${Number(msg.price).toFixed(2)}</p>
                      <button
                        onClick={() => unlockMessage(msg.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Unlock
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start gap-2">
                        {msg.body && <p className="flex-1">{msg.body}</p>}
                        {msg.senderType === "AI" && isCreator && (
                          <span className="text-xs bg-blue-800 px-2 py-0.5 rounded whitespace-nowrap" title="AI-generated reply">
                            auto
                          </span>
                        )}
                      </div>
                      {msg.mediaUrl && (
                        <div className="mt-2">
                          <img
                            src={msg.mediaUrl}
                            alt="Message media"
                            className="max-w-full rounded"
                          />
                        </div>
                      )}
                      {msg.price && msg.isLocked && (
                        <p className="text-xs mt-1">💰 ${Number(msg.price).toFixed(2)}</p>
                      )}
                    </>
                  )}
                  <p className={`text-xs mt-1 ${isOwn ? "text-blue-100" : "text-gray-500"}`}>
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input */}
        <div className="border-t p-4">
          {isCreator && (
            <div className="mb-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isPaidMessage}
                  onChange={(e) => setIsPaidMessage(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">Make this a paid message</span>
              </label>
              {isPaidMessage && (
                <input
                  type="number"
                  placeholder="Price (e.g., 5.00)"
                  value={paidPrice}
                  onChange={(e) => setPaidPrice(e.target.value)}
                  className="mt-2 w-full px-3 py-2 border rounded"
                  min="0.01"
                  step="0.01"
                />
              )}
            </div>
          )}
          <div className="mb-2">
            <input
              type="file"
              accept="image/*,video/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setUploading(true);
                try {
                  const url = await uploadMedia(file, "MESSAGE");
                  setMediaUrl(url);
                } catch (err: any) {
                  alert(err.response?.data?.message || "Upload failed");
                } finally {
                  setUploading(false);
                }
              }}
              className="w-full px-3 py-2 border rounded"
              disabled={uploading}
            />
            {uploading && <p className="text-sm text-gray-600 mt-1">Uploading...</p>}
            {mediaUrl && (
              <div className="mt-2">
                <img
                  src={mediaUrl}
                  alt="Preview"
                  className="max-w-xs rounded"
                  onError={() => {
                    // If not an image, show as link
                  }}
                />
                <button
                  onClick={() => setMediaUrl("")}
                  className="mt-1 text-sm text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Type a message..."
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              className="flex-1 px-3 py-2 border rounded"
            />
            <button
              onClick={sendMessage}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

