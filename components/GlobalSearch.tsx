
import React, { useState } from 'react';
import { Search, X, MessageSquare, ArrowRight, User } from 'lucide-react';
import { Message, ChatGroup } from '../types';

interface GlobalSearchProps {
  onClose: () => void;
  messages: Message[];
  groups: ChatGroup[];
  onSelectResult: (chatId: number) => void;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ onClose, messages, groups, onSelectResult }) => {
  const [query, setQuery] = useState('');

  const results = query.trim().length > 1 
    ? messages.filter(m => m.text.toLowerCase().includes(query.toLowerCase()))
    : [];

  const getGroupName = (chatId: number) => groups.find(g => g.id === chatId)?.title || "Noma'lum guruh";

  return (
    <div className="fixed inset-0 z-[150] bg-slate-950/80 backdrop-blur-2xl flex items-start justify-center p-4 md:p-20 animate-fade-in">
      <div className="max-w-3xl w-full bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Search Header */}
        <div className="p-6 border-b border-white/5 flex items-center gap-4">
          <Search className="w-6 h-6 text-indigo-500" />
          <input 
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Xabarlarni barcha guruhlardan qidirish..."
            className="flex-1 bg-transparent border-none text-xl text-white outline-none placeholder:text-slate-600 font-medium"
          />
          <button onClick={onClose} className="p-3 bg-slate-800 hover:bg-slate-700 rounded-2xl text-slate-400 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {query.trim().length <= 1 ? (
            <div className="h-60 flex flex-col items-center justify-center opacity-20">
               <Search className="w-16 h-16 mb-4" />
               <p className="font-black uppercase tracking-[0.3em] text-xs">Qidirishni boshlang...</p>
            </div>
          ) : results.length > 0 ? (
            results.map((msg) => (
              <button 
                key={msg.id}
                onClick={() => { onSelectResult(msg.chatId); onClose(); }}
                className="w-full text-left bg-slate-800/30 hover:bg-slate-800 p-5 rounded-3xl border border-white/5 transition-all group flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 flex items-center justify-center text-indigo-500 shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                   <MessageSquare className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                   <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{getGroupName(msg.chatId)}</span>
                      <span className="text-[9px] text-slate-600">{new Date(msg.timestamp).toLocaleString()}</span>
                   </div>
                   <div className="flex items-center gap-2 mb-2">
                      <User className="w-3 h-3 text-slate-500" />
                      <span className="text-xs font-bold text-slate-300">{msg.from.first_name}</span>
                   </div>
                   <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed italic">"{msg.text}"</p>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-700 mt-4 group-hover:text-indigo-500 transition-colors" />
              </button>
            ))
          ) : (
            <div className="h-60 flex flex-col items-center justify-center opacity-20">
               <X className="w-16 h-16 mb-4" />
               <p className="font-black uppercase tracking-[0.3em] text-xs">Hech narsa topilmadi</p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 bg-slate-950/50 border-t border-white/5 text-center">
           <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest">Barcha {messages.length} ta xabar tahlil qilindi</p>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearch;
