
import React, { useState } from 'react';
import { X, Send, CheckCircle2, Loader2, Users } from 'lucide-react';
import { ChatGroup } from '../types';

interface BroadcastModalProps {
  onClose: () => void;
  groups: ChatGroup[];
  messageText: string;
  onSend: (groupIds: number[]) => Promise<void>;
}

const BroadcastModal: React.FC<BroadcastModalProps> = ({ onClose, groups, messageText, onSend }) => {
  const [selectedGroups, setSelectedGroups] = useState<number[]>([]);
  const [isSending, setIsSending] = useState(false);

  const toggleGroup = (id: number) => {
    setSelectedGroups(prev => 
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  const handleBroadcast = async () => {
    if (selectedGroups.length === 0) return;
    setIsSending(true);
    await onSend(selectedGroups);
    setIsSending(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-6 animate-fade-in">
      <div className="max-w-md w-full bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-white">Xabarni yuborish</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Guruhlarni tanlang</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {groups.map(group => (
            <button 
              key={group.id}
              onClick={() => toggleGroup(group.id)}
              className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                selectedGroups.includes(group.id) 
                  ? 'bg-indigo-600/20 border-indigo-500/50 text-white' 
                  : 'bg-slate-800/30 border-transparent text-slate-400 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center text-[10px] font-black">
                  {group.title.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-bold truncate max-w-[200px]">{group.title}</span>
              </div>
              {selectedGroups.includes(group.id) && <CheckCircle2 className="w-5 h-5 text-indigo-400" />}
            </button>
          ))}
          {groups.length === 0 && (
            <div className="text-center py-10 opacity-20">
              <Users className="w-10 h-10 mx-auto mb-2" />
              <p className="text-xs font-black uppercase tracking-widest">Faol guruhlar yo'q</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-white/5 bg-slate-950/50">
          <div className="bg-slate-800/50 p-4 rounded-2xl border border-white/5 mb-4">
             <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">Xabar matni:</p>
             <p className="text-xs text-slate-300 line-clamp-3 italic">"{messageText}"</p>
          </div>
          <button 
            disabled={selectedGroups.length === 0 || isSending}
            onClick={handleBroadcast}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-20 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3"
          >
            {isSending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>{selectedGroups.length} ta guruhga yuborish</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BroadcastModal;
