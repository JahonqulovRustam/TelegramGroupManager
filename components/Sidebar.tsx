
import React, { useState } from 'react';
import { Users, ShieldCheck, Settings, Volume2, MessageCircle, User, VolumeX, LayoutDashboard, Type, Search, BarChart2, Bookmark } from 'lucide-react';
import { ChatGroup } from '../types';

interface SidebarProps {
  groups: ChatGroup[];
  activeChatId: number | null;
  onSelectGroup: (id: number) => void;
  onUpdateGroupSettings: (id: number, settings: Partial<ChatGroup>) => void;
  isAdmin: boolean;
  onOpenAdmin: () => void;
  onOpenStats: () => void;
  onOpenGlobalSearch: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  groups, 
  activeChatId, 
  onSelectGroup, 
  onUpdateGroupSettings, 
  isAdmin, 
  onOpenAdmin, 
  onOpenStats,
  onOpenGlobalSearch 
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredGroups = groups.filter(g => 
    g.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Guruh ID-siga qarab rangli fon chiqarish (Visual Distinction)
  const getGroupColorClass = (id: number) => {
    const colors = [
      'bg-indigo-500 text-white',
      'bg-emerald-500 text-white',
      'bg-rose-500 text-white',
      'bg-amber-500 text-white',
      'bg-purple-500 text-white',
      'bg-sky-500 text-white',
      'bg-fuchsia-500 text-white'
    ];
    return colors[Math.abs(id) % colors.length];
  };

  return (
    <div className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col h-full overflow-hidden transition-colors">
      <div className="p-6 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/20">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-black text-lg tracking-tight text-white">CRM</h1>
            <p className="text-[8px] text-slate-500 font-black uppercase tracking-[0.2em]">Control Center</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={onOpenGlobalSearch}
            className="p-2 bg-slate-800/50 rounded-lg hover:bg-indigo-600 transition-all text-slate-400 hover:text-white"
            title="Xabarlarni qidirish"
          >
            <Search className="w-4 h-4" />
          </button>
          <button 
            onClick={onOpenStats}
            className="p-2 bg-slate-800/50 rounded-lg hover:bg-slate-700 transition-all text-slate-400 hover:text-white"
            title="Statistika"
          >
            <BarChart2 className="w-4 h-4" />
          </button>
          {isAdmin && (
            <button 
              onClick={onOpenAdmin}
              className="p-2 bg-slate-800/50 rounded-lg hover:bg-slate-700 transition-all text-slate-400 hover:text-white"
              title="Sozlamalar"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Saved Messages Section */}
        <button 
          onClick={() => onSelectGroup(0)}
          className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all border ${
            activeChatId === 0 
              ? 'bg-amber-500 shadow-xl shadow-amber-500/20 border-amber-400 text-white' 
              : 'bg-slate-800/30 border-white/5 text-slate-400 hover:bg-slate-800'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${activeChatId === 0 ? 'bg-white text-amber-500' : 'bg-slate-800 text-amber-500'}`}>
            <Bookmark className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-black tracking-tight">Saqlanganlar</h3>
            <p className="text-[10px] opacity-60 font-bold">Xabarlar shabloni</p>
          </div>
        </button>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
          <input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Guruhlarni qidirish..." 
            className="w-full bg-slate-800/50 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white outline-none focus:border-indigo-500 transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <div className="flex items-center justify-between px-3 mb-2">
           <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Guruhlar</span>
           <span className="bg-slate-800 px-2 py-0.5 rounded-md text-[10px] font-bold text-slate-400">{filteredGroups.length}</span>
        </div>
        
        {filteredGroups.map((group) => (
          <div 
            key={group.id}
            className={`relative rounded-2xl transition-all duration-300 border group ${
              activeChatId === group.id 
                ? 'bg-indigo-600 shadow-xl shadow-indigo-600/20 border-indigo-500' 
                : 'hover:bg-slate-800/50 border-transparent'
            }`}
          >
            <button onClick={() => onSelectGroup(group.id)} className="w-full text-left p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center font-black text-sm shadow-inner ${activeChatId === group.id ? 'bg-white text-indigo-600' : getGroupColorClass(group.id)}`}>
                {group.title.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0 pr-6">
                <div className="flex justify-between items-center">
                  <h3 className={`font-bold text-sm truncate ${activeChatId === group.id ? 'text-white' : 'text-slate-300'}`}>{group.title}</h3>
                  {group.unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-md font-black animate-pulse shadow-lg shadow-red-500/30">{group.unreadCount}</span>
                  )}
                </div>
                <p className={`text-[10px] truncate font-medium opacity-60 ${activeChatId === group.id ? 'text-indigo-100' : 'text-slate-500'}`}>{group.lastMessage || 'Xabar yo\'q'}</p>
              </div>
            </button>

            <div className="absolute top-1/2 -translate-y-1/2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
              <button 
                onClick={(e) => { e.stopPropagation(); onUpdateGroupSettings(group.id, { announceGroup: !group.announceGroup }); }}
                className={`p-1 rounded-md border transition-all ${group.announceGroup ? 'bg-indigo-500 border-indigo-400 text-white' : 'bg-slate-800 border-white/5 text-slate-600'}`}
              >
                <Users className="w-3 h-3" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onUpdateGroupSettings(group.id, { announceSender: !group.announceSender }); }}
                className={`p-1 rounded-md border transition-all ${group.announceSender ? 'bg-amber-500 border-amber-400 text-white' : 'bg-slate-800 border-white/5 text-slate-600'}`}
              >
                <User className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}

        {filteredGroups.length === 0 && (
          <div className="text-center py-20 opacity-20">
            <Users className="w-10 h-10 mx-auto mb-2" />
            <p className="text-[10px] font-black uppercase tracking-widest">Guruh topilmadi</p>
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-900/80 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50"></div>
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Monitoring Faol</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
