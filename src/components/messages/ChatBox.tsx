import React, { useEffect } from 'react';
import Avatar from '../ui/Avatar';
import { Link } from 'react-router-dom';
import { LogOut, MessageCircle, ShoppingBag, Home, PlusCircle, Bell, User } from 'lucide-react';

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
  profileImage?: string | null;
}

interface ChatBoxProps {
  messages: Message[];
  user: { id: string; name?: string; profileImage?: string | null } | null;
  userMap: Record<string, UserInfo>;
  text: string;
  setText: (t: string) => void;
  error: string | null;
  onSend: (e: React.FormEvent) => void;
  chatEndRef: React.RefObject<HTMLDivElement>;
}

const Header: React.FC<{ onLogout?: () => void }> = ({ onLogout }) => (
  <header className="w-full flex items-center justify-between px-8 py-3 bg-white shadow z-50">
    <div className="flex items-center gap-2">
      <Home className="text-primary h-6 w-6 mr-1" />
      <span className="font-extrabold text-lg text-black tracking-tight">CollegeConnect</span>
    </div>
    <div className="flex-1 flex items-center justify-center">
      <div className="relative w-full max-w-xs">
        <input
          type="text"
          placeholder="Search listings..."
          className="w-full pl-10 pr-4 py-1.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm text-sm"
        />
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M21 21l-4.35-4.35M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
    </div>
    <nav className="flex items-center gap-6 text-sm font-medium">
      <Link to="/listings" className="flex items-center gap-1 hover:text-primary transition"><ShoppingBag className="h-5 w-5" />Browse</Link>
      <Link to="/messages" className="flex items-center gap-1 hover:text-primary transition"><MessageCircle className="h-5 w-5" />Messages</Link>
      <Link to="/dashboard" className="flex items-center gap-1 hover:text-primary transition"><User className="h-5 w-5" />Dashboard</Link>
      <Link to="/listings/create" className="flex items-center gap-1 hover:text-primary transition"><PlusCircle className="h-5 w-5" />Post Item</Link>
      <button onClick={onLogout} className="flex items-center gap-1 hover:text-primary transition font-bold"><LogOut className="h-5 w-5" />Logout</button>
      <button className="relative group" title="Notifications">
        <Bell className="h-5 w-5 text-gray-500 hover:text-primary transition" />
        <span className="absolute -top-1 -right-2 bg-primary text-white text-xs rounded-full px-1.5 py-0.5 font-bold">3</span>
      </button>
    </nav>
  </header>
);

const Footer: React.FC = () => (
  <footer className="w-full bg-gradient-to-r from-[#232526] to-[#414345] py-6 px-4 flex flex-col md:flex-row items-center justify-between text-gray-300 mt-8 shadow-inner">
    <div className="flex items-center gap-2 mb-2 md:mb-0">
      <span className="font-bold text-white">CollegeConnect</span>
      <span className="ml-2 text-xs">© {new Date().getFullYear()} All rights reserved.</span>
    </div>
    <div className="flex gap-6 text-sm">
      <a href="#about" className="hover:text-primary transition">About</a>
      <a href="#contact" className="hover:text-primary transition">Contact</a>
      <a href="#privacy" className="hover:text-primary transition">Privacy Policy</a>
      <a href="#terms" className="hover:text-primary transition">Terms</a>
    </div>
  </footer>
);

const ChatBox: React.FC<ChatBoxProps> = ({
  messages,
  user,
  userMap,
  text,
  setText,
  error,
  onSend,
  chatEndRef
}) => {
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatEndRef]);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#18181b] via-[#232526] to-[#232526]">
      <Header onLogout={() => {}} />
      <main className="flex-1 flex flex-col justify-between p-4 sm:p-6 rounded-b-2xl shadow-inner w-full max-w-full">
        <div className="flex-1 overflow-y-auto custom-scrollbar pb-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-48 sm:h-64 text-gray-400">
              <span className="text-4xl mb-2">💬</span>
              <span className="text-lg font-semibold text-center">No messages yet. Start the conversation!</span>
            </div>
          )}
          {messages.length > 0 && (
            <ul className="space-y-4">
              {messages.map((msg, idx) => {
                const isMe = msg.senderId === user?.id;
                return (
                  <li key={msg._id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[90vw] sm:max-w-[70%] px-4 py-2 rounded-2xl shadow-lg text-base break-words ${isMe ? 'bg-primary text-white rounded-br-none' : 'bg-gray-800 text-gray-100 rounded-bl-none'}`} style={{wordBreak:'break-word'}}>
                      <div className="flex items-center gap-2 mb-1">
                        <Avatar src={userMap[msg.senderId]?.profileImage ?? undefined} alt={userMap[msg.senderId]?.name} size="sm" />
                        <span className="font-semibold text-xs text-gray-300">{userMap[msg.senderId]?.name || msg.senderId.slice(-6)}</span>
                      </div>
                      <span>{msg.text}</span>
                      <div className="text-xs text-gray-400 mt-1 text-right">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </li>
                );
              })}
              <div ref={chatEndRef} />
            </ul>
          )}
        </div>
        {/* User prompt for messaging the seller */}
        <div className="mb-4 px-4 py-2 bg-blue-50 border border-blue-200 rounded text-blue-900 text-sm">
          <div className="font-semibold mb-1">Send a message to the seller below.</div>
          <div>The seller will receive your message and can reply to you directly. Please include any details or questions you have about the product or service.</div>
          <div className="mt-2 italic text-blue-700">Example: "Hi, I’m interested in this product. Could you tell me if it’s available in other colors?"</div>
        </div>
        <form onSubmit={onSend} className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 mt-4 w-full">
          <input
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 rounded-xl bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary shadow w-full"
          />
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-primary text-white font-bold shadow hover:bg-primary/80 transition-all duration-150"
            disabled={!text.trim()}
          >
            Send
          </button>
        </form>
        {error && <div className="text-red-500 mt-2 text-sm font-semibold text-center">{error}</div>}
      </main>
      <Footer />
    </div>
  );
};

export default ChatBox;
