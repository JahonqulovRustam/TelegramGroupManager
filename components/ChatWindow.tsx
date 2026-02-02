
import React, { useState, useRef, useEffect } from 'react';
import { Send, Zap, Reply, CheckCheck, MessageSquare, Shield, User, Heart, Search, X, Share2, Bookmark, Smile, Image as ImageIcon } from 'lucide-react';
import { Message, ChatGroup } from '../types';
import { getSmartReply } from '../services/geminiService';
import BroadcastModal from './BroadcastModal';

interface ChatWindowProps {
  activeGroup: ChatGroup | null;
  messages: Message[];
  onSendMessage: (text: string, replyToId?: string) => void;
  onSendMedia: (type: 'sticker' | 'gif', data: string, replyToId?: string) => void;
  availableGroups: ChatGroup[];
  onBroadcast: (text: string, groupIds: number[]) => Promise<void>;
}

// Telegram sendSticker URL orqali .webp fayllarni yaxshi qabul qiladi
const MOCK_STICKERS = [
  { id: 's1', url: 'https://www.gstatic.com/webp/gallery/1.webp' },
  { id: 's2', url: 'https://www.gstatic.com/webp/gallery/2.webp' },
  { id: 's3', url: 'https://www.gstatic.com/webp/gallery/5.webp' }
];

// Telegram sendAnimation URL orqali to'g'ridan-to'g'ri GIF yoki MP4 linklarni qabul qiladi
const MOCK_GIFS = [
  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJqZ3R4Z3R4Z3R4Z3R4Z3R4Z3R4Z3R4Z3R4Z3R4Z3R4JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/vFKqnCdLPNOKc/giphy.gif',
  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJqZ3R4Z3R4Z3R4Z3R4Z3R4Z3R4Z3R4Z3R4Z3R4Z3R4JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/JIX9t2j0ZTN9S/giphy.gif',
  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJqZ3R4Z3R4Z3R4Z3R4Z3R4Z3R4Z3R4Z3R4Z3R4Z3R4JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKVUn7XYMh/giphy.gif'
];

const ChatWindow: React.FC<ChatWindowProps> = ({ activeGroup, messages, onSendMessage, onSendMedia, availableGroups, onBroadcast }) => {
  const [inputText, setInputText] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [msgSearchTerm, setMsgSearchTerm] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState<string | null>(null);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [mediaTab, setMediaTab] = useState<'STICKERS' | 'GIFS'>('STICKERS');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isSearching) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isSearching]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText, replyTo?.id);
    setInputText('');
    setReplyTo(null);
  };

  const filteredMessages = msgSearchTerm 
    ? messages.filter(m => m.text.toLowerCase().includes(msgSearchTerm.toLowerCase()))
    : messages;

  const getNameColor = (name: string) => {
    const colors = ['text-orange-400', 'text-blue-400', 'text-emerald-400', 'text-pink-400', 'text-purple-400', 'text-yellow-400'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  if (!activeGroup) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-800 bg-[#0b141a]">
        <div className="p-16 rounded-[4rem] bg-slate-900/5 border border-white/5 mb-8">
           <MessageSquare className="w-20 h-20 opacity-5" />
        </div>
        <h2 className="text-xl font-black opacity-10 tracking-[0.3em] uppercase">Xabar Yo'q</h2>
      </div>
    );
  }

  const isSavedMessages = activeGroup.id === 0;

  return (
    <div className="flex-1 flex flex-col bg-[#0b141a] overflow-hidden">
      {/* Header */}
      <div className="px-8 py-5 border-b border-white/5 bg-slate-900/30 backdrop-blur-3xl flex items-center justify-between z-10 transition-all">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black border border-white/10 text-xl shadow-xl ${isSavedMessages ? 'bg-amber-500' : 'bg-indigo-600'}`}>
            {isSavedMessages ? <Bookmark className="w-6 h-6" /> : activeGroup.title.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="font-bold text-lg text-white leading-tight">{activeGroup.title}</h2>
            <div className="flex items-center gap-2">
               <div className={`w-1.5 h-1.5 rounded-full animate-pulse shadow-lg ${isSavedMessages ? 'bg-amber-500 shadow-amber-500/50' : 'bg-emerald-500 shadow-emerald-500/50'}`}></div>
               <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em]">{isSavedMessages ? 'Shablonlar' : activeGroup.type}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isSearching ? (
            <div className="flex items-center bg-slate-800 rounded-xl px-3 py-1.5 animate-slide-in">
              <Search className="w-3.5 h-3.5 text-slate-500 mr-2" />
              <input 
                autoFocus
                value={msgSearchTerm}
                onChange={(e) => setMsgSearchTerm(e.target.value)}
                placeholder="Xabarlarda qidirish..."
                className="bg-transparent border-none text-xs text-white outline-none w-48 placeholder:text-slate-600"
              />
              <button onClick={() => { setIsSearching(false); setMsgSearchTerm(''); }} className="ml-2 text-slate-500 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button onClick={() => setIsSearching(true)} className="p-2.5 bg-slate-800/50 hover:bg-slate-700 rounded-xl transition-all text-slate-400">
              <Search className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 scroll-smooth bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] bg-fixed">
        {filteredMessages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.isReply ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            <div className={`flex items-end gap-3 max-w-[85%] md:max-w-[70%] group relative`}>
              <div className={`relative px-5 py-3.5 rounded-[1.5rem] shadow-xl border transition-all ${
                msg.isReply 
                  ? 'bg-indigo-950/40 border-indigo-500/20 text-slate-100 rounded-br-none' 
                  : 'bg-slate-900 border-white/5 text-slate-200 rounded-bl-none'
              }`}>
                <div className="flex items-center justify-between gap-6 mb-2">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${msg.isReply ? 'text-indigo-400' : getNameColor(msg.from.first_name)} flex items-center gap-2`}>
                    {msg.from.first_name}
                    {msg.isReply && <span className="text-[8px] bg-indigo-500/10 px-1.5 py-0.5 rounded font-bold text-indigo-400/80">OPERATOR</span>}
                  </span>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    {isSavedMessages && (
                      <button 
                        onClick={() => setBroadcastMessage(msg.text)} 
                        title="Guruhlarga yuborish"
                        className="text-amber-500 hover:text-amber-400 bg-amber-500/10 p-1.5 rounded-lg"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {!msg.isReply && !isSavedMessages && (
                      <button onClick={() => setReplyTo(msg)} className="text-slate-600 hover:text-white p-1.5 hover:bg-slate-800 rounded-lg"><Reply className="w-3.5 h-3.5" /></button>
                    )}
                  </div>
                </div>
                
                {msg.type === 'sticker' && msg.fileUrl ? (
                  <img src={msg.fileUrl} alt="Sticker" className="w-32 h-32 object-contain" />
                ) : msg.type === 'gif' && msg.fileUrl ? (
                  <div className="relative group/gif">
                    <img src={msg.fileUrl} alt="GIF" className="max-w-full rounded-lg shadow-lg" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/gif:opacity-100 transition-opacity rounded-lg"></div>
                  </div>
                ) : (
                  <p className="text-[14px] leading-relaxed break-words font-medium">{msg.text}</p>
                )}

                <div className="flex items-center justify-end gap-1.5 mt-2 opacity-30">
                  <span className="text-[8px] font-black">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {msg.isReply && <CheckCheck className="w-3.5 h-3.5 text-indigo-400" />}
                </div>
              </div>
            </div>
          </div>
        ))}
        {filteredMessages.length === 0 && (
          <div className="text-center py-20 opacity-20">
             {isSavedMessages ? (
               <div className="space-y-4">
                 <Bookmark className="w-12 h-12 mx-auto" />
                 <p className="text-xs font-black uppercase tracking-widest max-w-[200px] mx-auto leading-loose">Shablonlarni shu yerga yozib qo'ying va guruhlarga yuboring</p>
               </div>
             ) : (
               <p className="text-xs font-black uppercase tracking-widest">Xabar topilmadi</p>
             )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-8 bg-slate-900/40 border-t border-white/5 backdrop-blur-3xl relative">
        {showMediaPicker && (
          <div className="absolute bottom-full left-8 mb-4 w-80 bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-slide-in z-50">
            <div className="flex border-b border-white/5 bg-slate-800/50">
              <button 
                onClick={() => setMediaTab('STICKERS')}
                className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${mediaTab === 'STICKERS' ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Stikerlar
              </button>
              <button 
                onClick={() => setMediaTab('GIFS')}
                className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${mediaTab === 'GIFS' ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-500 hover:text-slate-300'}`}
              >
                GIFlar
              </button>
            </div>
            <div className="p-5 grid grid-cols-3 gap-3 max-h-72 overflow-y-auto custom-scrollbar bg-slate-900/80">
              {mediaTab === 'STICKERS' ? (
                MOCK_STICKERS.map(s => (
                  <button key={s.id} onClick={() => { onSendMedia('sticker', s.url, replyTo?.id); setShowMediaPicker(false); setReplyTo(null); }} className="hover:scale-110 transition-transform p-1 hover:bg-white/5 rounded-xl">
                    <img src={s.url} className="w-full h-auto object-contain" alt="Sticker" />
                  </button>
                ))
              ) : (
                MOCK_GIFS.map((g, i) => (
                  <button key={i} onClick={() => { onSendMedia('gif', g, replyTo?.id); setShowMediaPicker(false); setReplyTo(null); }} className="hover:scale-110 transition-transform overflow-hidden rounded-lg bg-slate-800 aspect-square">
                    <img src={g} className="w-full h-full object-cover" alt="GIF" />
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {replyTo && (
          <div className="flex items-center justify-between mb-4 p-4 bg-indigo-600/5 rounded-2xl border-l-4 border-indigo-600 animate-slide-in">
            <div className="text-xs">
              <p className="text-indigo-400 font-black uppercase tracking-widest mb-1">{replyTo.from.first_name} ga javob</p>
              <p className="text-slate-500 truncate max-w-lg italic">"{replyTo.text}"</p>
            </div>
            <button onClick={() => setReplyTo(null)} className="p-2 hover:bg-slate-800 rounded-lg"><X className="w-4 h-4 text-slate-500" /></button>
          </div>
        )}
        <div className="flex items-end gap-4 max-w-5xl mx-auto">
          <div className="flex-1 bg-slate-800/20 rounded-[1.5rem] border border-white/5 focus-within:border-indigo-500/30 transition-all flex items-end p-2">
            <button 
              onClick={() => setShowMediaPicker(!showMediaPicker)}
              className={`p-3 rounded-xl transition-all ${showMediaPicker ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-600 hover:text-white'}`}
            >
              <Smile className="w-5 h-5" />
            </button>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isSavedMessages ? "Yangi shablon yozing..." : "Xabar yozing..."}
              className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-3 px-5 text-sm text-white h-[50px] max-h-32"
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            />
            {!isSavedMessages && (
              <button 
                onClick={async () => {
                  const lastUserMsg = [...messages].reverse().find(m => !m.isReply);
                  if (lastUserMsg) {
                    setIsAiLoading(true);
                    const suggestion = await getSmartReply(lastUserMsg.text);
                    setInputText(suggestion);
                    setIsAiLoading(false);
                  }
                }}
                className={`p-3 rounded-xl transition-all ${isAiLoading ? 'bg-amber-500/10 text-amber-500 animate-pulse' : 'text-slate-600 hover:text-amber-400'}`}
              >
                <Zap className="w-5 h-5 fill-current" />
              </button>
            )}
          </div>
          <button 
            onClick={handleSend}
            disabled={!inputText.trim()}
            className={`p-4 disabled:opacity-20 text-white rounded-2xl transition-all shadow-lg ${isSavedMessages ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20'}`}
          >
            <Send className="w-6 h-6" />
          </button>
        </div>
      </div>

      {broadcastMessage && (
        <BroadcastModal 
          messageText={broadcastMessage}
          groups={availableGroups}
          onClose={() => setBroadcastMessage(null)}
          onSend={(ids) => onBroadcast(broadcastMessage, ids)}
        />
      )}
    </div>
  );
};

export default ChatWindow;
