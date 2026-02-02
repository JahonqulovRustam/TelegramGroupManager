
import React from 'react';
import { X, BarChart3, TrendingUp, MessageSquare } from 'lucide-react';
import { ChatGroup, Message } from '../types';

interface StatsPanelProps {
  onClose: () => void;
  groups: ChatGroup[];
  messages: Message[];
}

const StatsPanel: React.FC<StatsPanelProps> = ({ onClose, groups, messages }) => {
  const stats = groups.map(group => {
    const count = messages.filter(m => m.chatId === group.id).length;
    return { title: group.title, count };
  }).sort((a, b) => b.count - a.count);

  const totalMessages = messages.length;

  return (
    <div className="fixed inset-0 z-[110] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-6 animate-fade-in">
      <div className="max-w-2xl w-full bg-slate-900 border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-indigo-600/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Statistika</h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Xabarlar Faolligi</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all text-slate-400"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-8 overflow-y-auto space-y-8">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/40 p-6 rounded-3xl border border-white/5">
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1">Jami Xabarlar</p>
              <h4 className="text-3xl font-black text-indigo-400">{totalMessages}</h4>
            </div>
            <div className="bg-slate-800/40 p-6 rounded-3xl border border-white/5">
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1">Eng Faol Guruh</p>
              <h4 className="text-xl font-black text-emerald-400 truncate">{stats[0]?.title || '—'}</h4>
            </div>
          </div>

          <div className="space-y-4">
             <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
               <TrendingUp className="w-4 h-4 text-indigo-500" /> Guruhlar Reytingi
             </h3>
             {stats.map((item, index) => (
               <div key={index} className="space-y-2">
                 <div className="flex justify-between text-sm">
                   <span className="font-bold text-slate-200">{item.title}</span>
                   <span className="font-black text-indigo-400">{item.count} <span className="text-[10px] text-slate-600">xabar</span></span>
                 </div>
                 <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                   <div 
                    className="h-full bg-indigo-600 rounded-full transition-all duration-1000" 
                    style={{ width: `${totalMessages > 0 ? (item.count / totalMessages) * 100 : 0}%` }}
                   ></div>
                 </div>
               </div>
             ))}
             {stats.length === 0 && <p className="text-center py-10 text-slate-600 italic">Ma'lumotlar yetarli emas</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;
