import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { io, Socket } from 'socket.io-client';
import { useSocket } from '../../hooks/useSocket';
import { useParams, useNavigate } from 'react-router-dom';
import ChatBox from '../../components/messages/ChatBox';
import { FaPlus } from 'react-icons/fa';
import { fetchWithAuth } from '../../lib/api';

const SOCKET_URL = 'http://localhost:5000'; // Adjust if needed

// Message type
interface Message {
  _id: string;
  text: string;
  senderId: string;
  receiverId: string;
  listingId: string;
  createdAt: string;
  senderName?: string;
  senderImage?: string;
}

interface UserInfo {
  _id: string;
  name: string;
  profileImage?: string;
}

const MessagesPage: React.FC = () => {
  const { listingId, receiverId } = useParams<{ listingId: string; receiverId: string }>();
  const { token, user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [userMap, setUserMap] = useState<Record<string, UserInfo>>({});
  const [conversations, setConversations] = useState<{ listingId: string; receiverId: string; name: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const { sendMessage } = useSocket((msg) => {
    setMessages((prev) => [...prev, msg]);
  });
  const navigate = useNavigate();

  // Add state for new chat modal
  const [showNewChat, setShowNewChat] = useState(false);
  const [newListingId, setNewListingId] = useState('');
  const [newReceiverId, setNewReceiverId] = useState('');
  const [allListings, setAllListings] = useState<{ _id: string; title: string; price?: number }[]>([]);
  const [allUsers, setAllUsers] = useState<{ _id: string; username?: string; name?: string; email?: string }[]>([]);

  // Fetch all conversations for the user
  useEffect(() => {
    if (!user || !token) return;
    fetchWithAuth('/api/messages')
      .then(res => res.json())
      .then((msgs: Message[]) => {
        const convMap: Record<string, { listingId: string; receiverId: string; name: string }> = {};
        msgs.forEach(m => {
          // For each message, if the logged-in user is either sender or receiver, the other party is the conversation partner
          if (m.senderId === user.id || m.receiverId === user.id) {
            const otherId = m.senderId === user.id ? m.receiverId : m.senderId;
            const convKey = `${m.listingId}_${otherId}`;
            if (!convMap[convKey]) {
              convMap[convKey] = { listingId: m.listingId, receiverId: otherId, name: otherId };
            }
          }
        });
        // Optimistically add current chat if not present
        if (listingId && receiverId) {
          const convKey = `${listingId}_${receiverId}`;
          if (!convMap[convKey]) {
            convMap[convKey] = { listingId, receiverId, name: receiverId };
          }
        }
        setConversations(Object.values(convMap));
      });
  }, [user, token, listingId, receiverId]);

  // Fetch messages for this listing
  useEffect(() => {
    if (!listingId || !token) return;
    fetchWithAuth(`/api/messages/${listingId}`)
      .then(res => res.json())
      .then(async (msgs: Message[]) => {
        // Show all messages between the logged-in user and the selected user for this listing
        let filtered = msgs;
        if (receiverId && user) {
          filtered = msgs.filter(m =>
            (m.senderId === user.id && m.receiverId === receiverId) ||
            (m.senderId === receiverId && m.receiverId === user.id)
          );
        }
        setMessages(filtered);
        // Fetch user info for avatars/names
        const userIds = Array.from(new Set(filtered.flatMap(m => [m.senderId, m.receiverId])));
        const userInfoMap: Record<string, UserInfo> = {};
        await Promise.all(userIds.map(async (id) => {
          if (!userMap[id]) {
            const res = await fetch(`/api/users/${id}`);
            if (res.ok) {
              const u = await res.json();
              userInfoMap[id] = { _id: u._id, name: u.username || u.name, profileImage: u.profileImage };
            }
          }
        }));
        setUserMap(prev => ({ ...prev, ...userInfoMap }));
      });
  }, [listingId, token, receiverId, user, userMap]);

  // Setup socket connection (only once on mount)
  useEffect(() => {
    socketRef.current = io(SOCKET_URL);
    socketRef.current.on('receiveMessage', (msg: Message) => {
      console.log('Received message via socket:', msg);
      if (msg.listingId === listingId && (msg.senderId === receiverId || msg.receiverId === receiverId)) {
        // Message for the currently open chat
        setMessages((prev) => [...prev, msg]);
        // Fetch sender info if not present
        if (!userMap[msg.senderId]) {
          fetch(`/api/users/${msg.senderId}`)
            .then(res => res.json())
            .then(u => setUserMap(prev => ({ ...prev, [msg.senderId]: { _id: u._id, name: u.username || u.name, profileImage: u.profileImage } })));
        }
      } else {
        // Message for another chat: update conversation list
        setConversations(prev => {
          const exists = prev.some(c => c.listingId === msg.listingId && c.receiverId === (msg.senderId === user?.id ? msg.receiverId : msg.senderId));
          if (!exists) {
            // Add new conversation to the list
            return [
              ...prev,
              {
                listingId: msg.listingId,
                receiverId: msg.senderId === user?.id ? msg.receiverId : msg.senderId,
                name: userMap[msg.senderId]?.name || userMap[msg.receiverId]?.name || 'New Chat'
              }
            ];
          }
          return prev;
        });
        // Optionally, show a notification or badge here
      }
    });
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [listingId, receiverId, userMap, user]);

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send a new message
  const sendNewMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!text.trim() || !listingId || !receiverId) return;
    try {
      const res = await fetchWithAuth(`/api/messages/${listingId}`, {
        method: 'POST',
        body: JSON.stringify({ text, receiverId, listingId })
      });
      if (!res.ok) {
        const errMsg = await res.text();
        setError(`Failed to send: ${res.status} ${errMsg}`);
        console.error('Send message error:', res.status, errMsg);
        return;
      }
      const newMsg: Message = await res.json();
      setMessages(prev => [...prev, newMsg]);
      setText('');
      sendMessage(newMsg);
      setConversations(prev => {
        if (!prev.find(c => c.listingId === listingId && c.receiverId === receiverId)) {
          const name = receiverId && userMap[receiverId]?.name ? userMap[receiverId].name : (receiverId || '');
          return [...prev, { listingId, receiverId: receiverId || '', name }];
        }
        return prev;
      });
    } catch (err) {
      setError('Network or server error.');
      console.error('Send message exception:', err);
    }
  };

  // Conversation list UI
  const renderConversationList = () => (
    <div className="mb-6">
      <h2 className="text-lg font-bold mb-2 text-white">Your Conversations</h2>
      {conversations.length === 0 ? (
        <div className="text-gray-400">No conversations yet.</div>
      ) : (
        <ul className="space-y-2">
          {conversations.map(conv => (
            <li key={`${conv.listingId}_${conv.receiverId}`}
                className="cursor-pointer hover:bg-gray-700 rounded px-2 py-1 text-white"
                onClick={() => navigate(`/messages/${conv.listingId}/${conv.receiverId}`)}>
              <span className="font-semibold">Listing:</span> {conv.listingId.slice(-6)}
              <span className="ml-2 font-semibold">User:</span> {conv.receiverId.slice(-6)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  // Fetch all listings (used for chat header title/price, and the new chat modal)
  useEffect(() => {
    fetch('/api/listings')
      .then(res => res.json())
      .then(data => setAllListings(data.listings || []));
  }, []);

  // Fetch all users for new chat modal
  useEffect(() => {
    if (showNewChat) {
      fetch('/api/users').then(res => res.json()).then(setAllUsers);
    }
  }, [showNewChat]);

  // Show prompt if params are missing or invalid
  if (!listingId || !receiverId || listingId === 'undefined' || receiverId === 'undefined') {
    return (
      <div className="flex items-center justify-center min-h-[80vh] bg-gradient-to-br from-[#1e293b] via-[#0f172a] to-[#312e81]">
        <div className="w-full max-w-2xl mx-auto rounded-2xl shadow-2xl bg-white/10 backdrop-blur-md flex flex-col overflow-hidden">
          {/* Chatbox Header */}
          <div className="flex items-center gap-4 px-6 py-4 border-b bg-gradient-to-r from-[#ef6c13] to-[#f3701a]">
            <div className="w-12 h-12 rounded bg-white/30 flex items-center justify-center overflow-hidden">
              <span className="text-2xl">💬</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-lg text-white truncate">Messages</div>
              <div className="text-xs text-orange-100 truncate">Select a conversation to start chatting</div>
            </div>
          </div>
          {/* Chatbox Body */}
          <div className="flex-1 flex flex-col px-6 py-6 bg-gradient-to-b from-white/30 to-orange-50/30 min-h-[300px]">
            {renderConversationList()}
            <div className="flex-1 flex flex-col justify-center items-center py-6">
              <div className="text-3xl text-orange-400 mb-2">🗨️</div>
              <div className="text-lg font-semibold text-white mb-1 drop-shadow">No chat selected</div>
              <div className="text-gray-200 mb-4 text-center">Please choose a conversation from the sidebar or start a new one from a listing page.</div>
              <div className="mt-2 text-orange-100 text-sm">Your messages will appear here.</div>
            </div>
          </div>
          {/* Chatbox Input (disabled) */}
          <div className="border-t bg-white/20 px-6 py-4 flex items-center gap-2">
            <input
              type="text"
              disabled
              placeholder="Select a conversation to start typing..."
              className="flex-1 rounded-full border-2 border-orange-200 bg-gray-50/60 px-4 py-3 text-lg shadow placeholder-gray-400 opacity-60 cursor-not-allowed"
            />
            <button disabled className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#ef6c13] to-[#f3701a] text-white font-bold shadow opacity-60 cursor-not-allowed">Send</button>
          </div>
        </div>
      </div>
    );
  }

  // --- ChatBox UI ---
  const listing = allListings.find(l => l._id === listingId);
  const userInfo = userMap[receiverId] || {};
  const listingTitle = listing?.title || 'Listing';
  const price = listing?.price != null ? `₹ ${listing.price}` : '';
  const details = userInfo?.name ? `Chat with ${userInfo.name}` : '';

  return (
    <div className="flex flex-col md:flex-row min-h-[80vh] bg-gradient-to-br from-orange-50 via-white to-orange-100 px-2 sm:px-4 py-4 sm:py-8 max-w-3xl mx-auto">
      <div className="w-full max-w-full md:max-w-2xl mx-auto rounded-2xl shadow-2xl bg-white/10 backdrop-blur-md flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-4 px-6 py-4 border-b bg-gray-50">
          <div className="w-12 h-12 rounded bg-gray-200 flex items-center justify-center overflow-hidden">
            <span className="text-2xl">🏠</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-lg truncate">{listingTitle}</div>
            <div className="text-xs text-gray-500 truncate">{price} &nbsp;|&nbsp; {details}</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-orange-100 px-3 py-1 text-xs text-orange-700 font-bold">Chat</span>
          </div>
        </div>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 bg-gradient-to-b from-white to-orange-50">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">No messages yet. Start the conversation!</div>
          ) : (
            <ul className="flex flex-col gap-4">
              {messages.map((msg, idx) => {
                const isMe = msg.senderId === user?.id;
                return (
                  <li key={msg._id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex items-end gap-2 max-w-[80%]`}>
                      {!isMe && (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold">
                          {userMap[msg.senderId]?.name?.[0] || 'U'}
                        </div>
                      )}
                      <div className={`px-4 py-2 rounded-2xl shadow text-base break-words ${isMe ? 'bg-gradient-to-r from-[#ef6c13] to-[#f3701a] text-white rounded-br-none' : 'bg-gray-100 text-gray-900 rounded-bl-none'}`}>
                        {msg.text}
                        <div className="text-xs text-gray-400 mt-1 text-right">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                      {isMe && (
                        <div className="w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center text-lg font-bold text-orange-700">
                          {user?.name?.[0] || 'M'}
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
              <div ref={chatEndRef} />
            </ul>
          )}
        </div>
        {/* Quick Replies */}
        <div className="border-t bg-gray-50 px-6 py-2">
          <div className="flex gap-2 flex-wrap text-xs mb-2">
            <button type="button" className="bg-gray-200 px-3 py-1 rounded-full">Is it still available?</button>
            <button type="button" className="bg-gray-200 px-3 py-1 rounded-full">Let's meet up?</button>
            <button type="button" className="bg-gray-200 px-3 py-1 rounded-full">What is the current location?</button>
            <button type="button" className="bg-gray-200 px-3 py-1 rounded-full">Can you share more pictures?</button>
          </div>
        </div>
        {/* Message input */}
        <form onSubmit={sendNewMessage} className="flex items-center gap-2 px-6 py-4 border-t border-gray-100 bg-white">
          <input
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Type a message"
            className="flex-1 rounded-full border-2 border-orange-200 bg-gray-50 px-4 py-3 text-lg shadow focus:border-orange-700 focus:ring-2 focus:ring-orange-200 focus:outline-none placeholder-gray-400 transition-all duration-200"
          />
          <button type="submit" className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#ef6c13] to-[#f3701a] text-white font-bold shadow hover:from-[#e65c00] hover:to-[#f3701a] text-lg">Send</button>
        </form>
      </div>
    </div>
  );
};

export default MessagesPage;