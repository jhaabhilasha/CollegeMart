import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Avatar from '../../components/ui/Avatar';
import { fetchWithAuth } from '../../lib/api';
import {
  Send,
  Plus,
  Search,
  ArrowLeft,
  ShoppingBag,
  MessageSquare,
  Sparkles,
  X,
  ExternalLink,
  ShieldCheck,
  CheckCheck,
} from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  _id: string;
  text: string;
  senderId: any;
  receiverId: any;
  listingId?: any;
  isRead?: boolean;
  createdAt: string;
}

interface ConversationItem {
  key: string;
  receiverId: string;
  listingId: string | null;
  name: string;
  profileImage?: string | null;
  lastMessage: string;
  lastMessageTime: string;
  listingTitle?: string;
  listingPrice?: number;
  listingImage?: string;
  unreadCount: number;
}

const QUICK_REPLIES = [
  'Is this still available?',
  'Can we meet at the campus library?',
  "What is your best price?",
  'Can you share more pictures or details?',
];

const MessagesPage: React.FC = () => {
  const { listingId: urlListingId, receiverId: urlReceiverId, userId: urlUserId } = useParams<{
    listingId?: string;
    receiverId?: string;
    userId?: string;
  }>();

  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [allListings, setAllListings] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<{
    receiverId: string;
    listingId: string | null;
    name: string;
    profileImage?: string | null;
    listingTitle?: string;
    listingPrice?: number;
    listingImage?: string;
  } | null>(null);

  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Real-time socket message handler
  const { sendMessage: emitSocketMessage } = useSocket((newMsg: Message) => {
    const senderIdStr = typeof newMsg.senderId === 'object' ? newMsg.senderId?._id : newMsg.senderId;
    const receiverIdStr = typeof newMsg.receiverId === 'object' ? newMsg.receiverId?._id : newMsg.receiverId;
    const listingIdStr = typeof newMsg.listingId === 'object' ? newMsg.listingId?._id : newMsg.listingId;

    // Check if the received message belongs to the current active chat
    if (
      activeChat &&
      (senderIdStr === activeChat.receiverId || receiverIdStr === activeChat.receiverId) &&
      (!activeChat.listingId || listingIdStr === activeChat.listingId)
    ) {
      setMessages((prev) => {
        if (prev.some((m) => m._id === newMsg._id)) return prev;
        return [...prev, newMsg];
      });
    }

    // Refresh conversation list preview
    loadConversations();
  });

  // Load all user conversations
  const loadConversations = async () => {
    if (!user || !token) return;
    try {
      const res = await fetchWithAuth('/api/messages');
      if (!res.ok) return;
      const allMsgs: Message[] = await res.json();

      const convMap: Record<string, ConversationItem> = {};

      allMsgs.forEach((m) => {
        const senderIdStr = typeof m.senderId === 'object' ? m.senderId?._id : m.senderId;
        const receiverIdStr = typeof m.receiverId === 'object' ? m.receiverId?._id : m.receiverId;
        const otherPartyId = senderIdStr === user.id ? receiverIdStr : senderIdStr;
        const otherPartyObj = senderIdStr === user.id ? m.receiverId : m.senderId;

        const otherName =
          typeof otherPartyObj === 'object' && otherPartyObj?.username
            ? otherPartyObj.username
            : 'Campus Student';
        const otherImage =
          typeof otherPartyObj === 'object' && otherPartyObj?.profileImage
            ? otherPartyObj.profileImage
            : null;

        const listingIdStr =
          m.listingId && typeof m.listingId === 'object'
            ? m.listingId?._id
            : m.listingId || null;

        const convKey = `${listingIdStr || 'direct'}_${otherPartyId}`;

        if (!convMap[convKey]) {
          convMap[convKey] = {
            key: convKey,
            receiverId: otherPartyId,
            listingId: listingIdStr,
            name: otherName,
            profileImage: otherImage,
            lastMessage: m.text,
            lastMessageTime: m.createdAt,
            unreadCount: !m.isRead && receiverIdStr === user.id ? 1 : 0,
          };
        } else {
          convMap[convKey].lastMessage = m.text;
          convMap[convKey].lastMessageTime = m.createdAt;
          if (!m.isRead && receiverIdStr === user.id) {
            convMap[convKey].unreadCount += 1;
          }
        }
      });

      setConversations(Object.values(convMap).reverse());
    } catch (err) {
      console.warn('Could not load conversations:', err);
    }
  };

  useEffect(() => {
    loadConversations();
  }, [user, token]);

  // Fetch all listings and users for new chat modal and header metadata
  useEffect(() => {
    fetch('/api/listings')
      .then((res) => res.json())
      .then((data) => setAllListings(data.listings || []))
      .catch(() => {});

    fetch('/api/users')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAllUsers(data.filter((u: any) => u._id !== user?.id));
        }
      })
      .catch(() => {});
  }, [user?.id]);

  // Handle URL parameters to determine initial active chat
  useEffect(() => {
    const targetReceiverId = urlReceiverId || urlUserId;
    const targetListingId =
      urlListingId && urlListingId !== 'undefined' && urlListingId !== 'direct'
        ? urlListingId
        : null;

    if (targetReceiverId && targetReceiverId !== 'undefined') {
      // Find listing info if available
      const foundListing = allListings.find((l) => l._id === targetListingId || l.id === targetListingId);
      const foundUser = allUsers.find((u) => u._id === targetReceiverId);

      setActiveChat({
        receiverId: targetReceiverId,
        listingId: targetListingId,
        name: foundUser?.username || foundUser?.name || 'Seller',
        profileImage: foundUser?.profileImage || null,
        listingTitle: foundListing?.title,
        listingPrice: foundListing?.price,
        listingImage: foundListing?.images?.[0],
      });
    } else if (conversations.length > 0 && !activeChat && !urlReceiverId && !urlUserId) {
      // Auto-select first conversation if on /messages
      const first = conversations[0];
      const foundListing = allListings.find((l) => l._id === first.listingId || l.id === first.listingId);
      setActiveChat({
        receiverId: first.receiverId,
        listingId: first.listingId,
        name: first.name,
        profileImage: first.profileImage,
        listingTitle: foundListing?.title || first.listingTitle,
        listingPrice: foundListing?.price || first.listingPrice,
        listingImage: foundListing?.images?.[0] || first.listingImage,
      });
    }
  }, [urlListingId, urlReceiverId, urlUserId, allListings, allUsers, conversations.length]);

  // Fetch messages for active chat
  useEffect(() => {
    if (!activeChat || !token || !user) return;

    const endpoint = activeChat.listingId
      ? `/api/messages/${activeChat.listingId}`
      : `/api/messages`;

    fetchWithAuth(endpoint)
      .then((res) => res.json())
      .then((data: Message[]) => {
        if (!Array.isArray(data)) {
          setMessages([]);
          return;
        }

        const filtered = data.filter((m) => {
          const senderIdStr = typeof m.senderId === 'object' ? m.senderId?._id : m.senderId;
          const receiverIdStr = typeof m.receiverId === 'object' ? m.receiverId?._id : m.receiverId;
          const listingIdStr = typeof m.listingId === 'object' ? m.listingId?._id : m.listingId;

          const isBetweenUsers =
            (senderIdStr === user.id && receiverIdStr === activeChat.receiverId) ||
            (senderIdStr === activeChat.receiverId && receiverIdStr === user.id);

          if (activeChat.listingId) {
            return isBetweenUsers && listingIdStr === activeChat.listingId;
          }
          return isBetweenUsers;
        });

        setMessages(filtered);

        // Mark messages as read
        fetchWithAuth('/api/messages/mark-read', {
          method: 'POST',
          body: JSON.stringify({
            senderId: activeChat.receiverId,
            listingId: activeChat.listingId,
          }),
        }).catch(() => {});
      })
      .catch((err) => {
        console.error('Failed to fetch messages:', err);
        setMessages([]);
      });

    // Focus input when active chat changes
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, [activeChat?.receiverId, activeChat?.listingId, token, user]);

  // Scroll to bottom when new message arrives
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send a message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim() || !activeChat || !user || isSending) return;

    const messageText = text.trim();
    setText('');
    setIsSending(true);

    try {
      const payload = {
        text: messageText,
        receiverId: activeChat.receiverId,
        listingId: activeChat.listingId || undefined,
      };

      const endpoint = activeChat.listingId
        ? `/api/messages/${activeChat.listingId}`
        : `/api/messages`;

      const res = await fetchWithAuth(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to send message');
      }

      const createdMsg: Message = await res.json();

      // Add to local chat
      setMessages((prev) => [...prev, createdMsg]);

      // Emit via socket
      emitSocketMessage(createdMsg);

      // Refresh conversation preview
      loadConversations();
    } catch (err: any) {
      toast.error(err.message || 'Could not send message. Please try again.');
      setText(messageText); // Restore unsent text
    } finally {
      setIsSending(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  };

  // Quick reply click
  const handleQuickReply = (reply: string) => {
    setText(reply);
    inputRef.current?.focus();
  };

  // Filter conversations based on search
  const filteredConversations = conversations.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.listingTitle && c.listingTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
    c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-orange-50/50 via-white to-orange-100/30 py-4 sm:py-6 px-2 sm:px-4 lg:px-6">
      <div className="max-w-7xl mx-auto h-[82vh] bg-white rounded-3xl shadow-xl border border-orange-100 overflow-hidden flex flex-col md:flex-row">
        {/* ================= LEFT PANEL: CONVERSATIONS ================= */}
        <div
          className={`w-full md:w-80 lg:w-96 border-r border-orange-100 flex flex-col bg-white shrink-0 ${
            activeChat ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Left Panel Header */}
          <div className="p-4 border-b border-orange-100 bg-orange-50/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-[#ef6c13] to-[#f3701a] text-white shadow-sm">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-extrabold text-gray-900">Messages</h1>
            </div>

            <button
              onClick={() => setShowNewChatModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-sm transition hover:scale-105"
              title="Start a new message"
            >
              <Plus className="w-4 h-4" />
              <span>New Chat</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="p-3 border-b border-orange-50">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none transition"
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5 custom-scrollbar">
            {filteredConversations.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-6 text-center text-gray-400">
                <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center text-orange-400 mb-3">
                  <MessageSquare className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-gray-700 text-sm mb-1">No Conversations Yet</h3>
                <p className="text-xs text-gray-400 mb-4">Start a chat with any student or browse campus listings.</p>
                <button
                  onClick={() => setShowNewChatModal(true)}
                  className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition shadow"
                >
                  Start a Conversation
                </button>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected =
                  activeChat?.receiverId === conv.receiverId &&
                  activeChat?.listingId === conv.listingId;

                return (
                  <button
                    key={conv.key}
                    onClick={() => {
                      const foundListing = allListings.find(
                        (l) => l._id === conv.listingId || l.id === conv.listingId
                      );
                      setActiveChat({
                        receiverId: conv.receiverId,
                        listingId: conv.listingId,
                        name: conv.name,
                        profileImage: conv.profileImage,
                        listingTitle: foundListing?.title || conv.listingTitle,
                        listingPrice: foundListing?.price || conv.listingPrice,
                        listingImage: foundListing?.images?.[0] || conv.listingImage,
                      });
                    }}
                    className={`w-full text-left p-3 rounded-2xl transition flex items-center gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-orange-100/70 border border-orange-200 shadow-sm'
                        : 'hover:bg-orange-50/60 border border-transparent'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <Avatar src={conv.profileImage} alt={conv.name} size="md" />
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-bold text-sm text-gray-900 truncate">{conv.name}</span>
                        <span className="text-[10px] text-gray-400 shrink-0">
                          {new Date(conv.lastMessageTime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      {conv.listingTitle && (
                        <div className="flex items-center gap-1 text-[11px] text-orange-600 font-semibold mb-0.5 truncate">
                          <ShoppingBag className="w-3 h-3 shrink-0" />
                          <span className="truncate">{conv.listingTitle}</span>
                        </div>
                      )}

                      <p className="text-xs text-gray-500 truncate">{conv.lastMessage}</p>
                    </div>

                    {conv.unreadCount > 0 && (
                      <span className="shrink-0 px-2 py-0.5 rounded-full bg-orange-600 text-white text-[10px] font-extrabold">
                        {conv.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ================= RIGHT PANEL: ACTIVE CHAT ================= */}
        <div
          className={`flex-1 flex flex-col bg-white overflow-hidden ${
            !activeChat ? 'hidden md:flex' : 'flex'
          }`}
        >
          {activeChat ? (
            <>
              {/* Active Chat Header */}
              <div className="p-4 border-b border-orange-100 bg-white flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Back button for mobile */}
                  <button
                    onClick={() => setActiveChat(null)}
                    className="md:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100"
                    title="Back to conversations"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <div className="relative">
                    <Avatar src={activeChat.profileImage} alt={activeChat.name} size="md" />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="font-extrabold text-base text-gray-900 truncate">
                        {activeChat.name}
                      </h2>
                      <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                        <ShieldCheck className="w-3 h-3" /> Campus Verified
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">Active student</span>
                  </div>
                </div>

                {/* Attached Listing Info Pill */}
                {activeChat.listingTitle && (
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-orange-50 border border-orange-100 max-w-xs">
                    {activeChat.listingImage && (
                      <img
                        src={activeChat.listingImage}
                        alt={activeChat.listingTitle}
                        className="w-7 h-7 rounded-lg object-cover"
                      />
                    )}
                    <div className="min-w-0 text-left">
                      <p className="text-xs font-bold text-gray-900 truncate">
                        {activeChat.listingTitle}
                      </p>
                      {activeChat.listingPrice != null && (
                        <p className="text-[11px] font-semibold text-orange-600">
                          ₹{activeChat.listingPrice}
                        </p>
                      )}
                    </div>
                    {activeChat.listingId && (
                      <Link
                        to={`/listings/${activeChat.listingId}`}
                        target="_blank"
                        className="p-1 text-gray-400 hover:text-orange-600 transition"
                        title="Open listing in new tab"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                )}
              </div>

              {/* Chat Messages Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gradient-to-b from-orange-50/20 via-white to-orange-50/30 space-y-4 custom-scrollbar">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6">
                    <div className="w-16 h-16 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mb-3 shadow-inner">
                      <Sparkles className="w-8 h-8" />
                    </div>
                    <h3 className="font-extrabold text-gray-900 text-lg mb-1">
                      Say Hello to {activeChat.name}!
                    </h3>
                    <p className="text-sm text-gray-500 max-w-sm mb-6">
                      Send a message below or click one of the quick suggestions to start your inquiry.
                    </p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const senderIdStr = typeof msg.senderId === 'object' ? msg.senderId?._id : msg.senderId;
                    const isMe = senderIdStr === user?.id;

                    return (
                      <div
                        key={msg._id || idx}
                        className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isMe && (
                          <Avatar
                            src={activeChat.profileImage}
                            alt={activeChat.name}
                            size="sm"
                            className="shrink-0 mb-1"
                          />
                        )}

                        <div
                          className={`max-w-[85%] sm:max-w-[70%] px-4 py-2.5 rounded-2xl shadow-sm text-sm break-words leading-relaxed ${
                            isMe
                              ? 'bg-gradient-to-r from-[#ef6c13] to-[#f3701a] text-white rounded-br-xs font-medium'
                              : 'bg-white border border-gray-100 text-gray-900 rounded-bl-xs'
                          }`}
                        >
                          <p>{msg.text}</p>
                          <div
                            className={`text-[10px] mt-1 flex items-center gap-1 justify-end ${
                              isMe ? 'text-orange-100' : 'text-gray-400'
                            }`}
                          >
                            <span>
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            {isMe && <CheckCheck className="w-3 h-3" />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Quick Reply Pills */}
              <div className="px-4 py-2 bg-orange-50/40 border-t border-orange-100/60 overflow-x-auto">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-orange-700 shrink-0">Suggestions:</span>
                  {QUICK_REPLIES.map((reply, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleQuickReply(reply)}
                      className="shrink-0 px-3 py-1 rounded-full bg-white hover:bg-orange-100/80 border border-orange-200 text-xs text-gray-700 font-medium transition hover:scale-102 shadow-2xs cursor-pointer"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Input Box (ALWAYS ENABLED) */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 sm:p-4 bg-white border-t border-orange-100 flex items-center gap-2 sm:gap-3"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={`Message ${activeChat.name}... (Press Enter to send)`}
                  className="flex-1 px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:bg-white focus:outline-none transition shadow-inner"
                  autoFocus
                />

                <button
                  type="submit"
                  disabled={!text.trim() || isSending}
                  className="inline-flex items-center justify-center p-3 sm:px-5 sm:py-3 rounded-2xl bg-gradient-to-r from-[#ef6c13] to-[#f3701a] hover:from-[#e65c00] hover:to-[#f3701a] text-white font-bold shadow-md hover:scale-105 transition disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed cursor-pointer"
                  title="Send message"
                >
                  <Send className="w-5 h-5 sm:mr-1.5" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </form>
            </>
          ) : (
            /* Empty State when no conversation is selected */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-orange-50/10">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-400 to-[#ef6c13] text-white flex items-center justify-center shadow-lg mb-4">
                <MessageSquare className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2">CollegeConnect Messages</h2>
              <p className="text-gray-500 text-sm max-w-md mb-6">
                Connect directly with students and campus sellers. Coordinate meetups, ask questions about items, and close safe campus deals.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowNewChatModal(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#ef6c13] to-[#f3701a] text-white font-bold text-sm shadow-md hover:scale-105 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Start New Chat</span>
                </button>
                <Link
                  to="/listings"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white border border-gray-200 text-gray-700 font-bold text-sm shadow-xs hover:bg-gray-50 transition"
                >
                  <ShoppingBag className="w-4 h-4 text-orange-600" />
                  <span>Browse Listings</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================= NEW CHAT MODAL ================= */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-lg relative border border-orange-100 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-4 border-b border-orange-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-orange-100 text-orange-700">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-gray-900">Start a Conversation</h3>
                  <p className="text-xs text-gray-400">Choose a fellow student or ask about a campus listing</p>
                </div>
              </div>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="p-1 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Students List */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 custom-scrollbar">
              <div>
                <span className="block text-xs font-bold text-orange-900 uppercase tracking-wider mb-2">
                  Campus Members:
                </span>
                {allUsers.length === 0 ? (
                  <p className="text-xs text-gray-400">No other registered users found</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {allUsers.map((u) => (
                      <button
                        key={u._id}
                        type="button"
                        onClick={() => {
                          setActiveChat({
                            receiverId: u._id,
                            listingId: null,
                            name: u.username || u.name || 'Student',
                            profileImage: u.profileImage,
                          });
                          setShowNewChatModal(false);
                          navigate(`/messages/${u._id}`);
                        }}
                        className="flex items-center gap-2.5 p-2.5 rounded-2xl border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition text-left cursor-pointer"
                      >
                        <Avatar src={u.profileImage} alt={u.username || 'User'} size="sm" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-gray-900 truncate">{u.username || u.name}</p>
                          <p className="text-[10px] text-gray-400 truncate">{u.email}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Listings List */}
              <div className="pt-2 border-t border-gray-100">
                <span className="block text-xs font-bold text-orange-900 uppercase tracking-wider mb-2">
                  Inquire About a Listing:
                </span>
                {allListings.length === 0 ? (
                  <p className="text-xs text-gray-400">No active listings</p>
                ) : (
                  <div className="space-y-2">
                    {allListings.slice(0, 6).map((item) => (
                      <button
                        key={item._id}
                        type="button"
                        onClick={() => {
                          const ownerId = typeof item.ownerId === 'object' ? item.ownerId?._id : item.ownerId;
                          setActiveChat({
                            receiverId: ownerId,
                            listingId: item._id,
                            name: item.ownerName || 'Seller',
                            profileImage: item.ownerImage,
                            listingTitle: item.title,
                            listingPrice: item.price,
                            listingImage: item.images?.[0],
                          });
                          setShowNewChatModal(false);
                          navigate(`/messages/${item._id}/${ownerId}`);
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-2xl border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {item.images?.[0] && (
                            <img
                              src={item.images[0]}
                              alt={item.title}
                              className="w-9 h-9 rounded-xl object-cover bg-gray-100 shrink-0"
                            />
                          )}
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-gray-900 truncate">{item.title}</p>
                            <p className="text-[11px] text-orange-600 font-semibold">₹{item.price}</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-orange-600 px-2 py-1 rounded-xl bg-orange-100 shrink-0">
                          Chat
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesPage;