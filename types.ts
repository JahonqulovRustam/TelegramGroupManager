
export interface TelegramUser {
  id: number;
  first_name: string;
  username?: string;
}

export type MessageType = 'text' | 'sticker' | 'gif';

export interface Message {
  id: string;
  chatId: number;
  from: TelegramUser;
  text: string;
  timestamp: number;
  isReply?: boolean;
  replyToId?: string;
  type?: MessageType;
  fileId?: string;
  fileUrl?: string;
}

export interface ChatGroup {
  id: number;
  title: string;
  type: string;
  memberCount: number;
  lastMessage?: string;
  lastMessageTimestamp?: number;
  unreadCount: number;
  announceGroup?: boolean;
  announceSender?: boolean;
  readContent?: boolean;
  isActive?: boolean;
}

export interface CRMUser {
  id: string;
  username: string;
  password: string;
  fullName: string;
  role: 'SUPERADMIN' | 'ADMIN' | 'DISPATCHER';
  parentId?: string; // Kim tomonidan yaratilganligi (Adminni Superadmin, Dispetcherni Admin yaratadi)
}

export type Theme = 'dark' | 'light';
export type AppPath = 'CRM' | 'MEDDATA' | 'OPTX';

export interface AppState {
  groups: ChatGroup[];
  messages: Message[];
  activeChatId: number | null;
  isLoading: boolean;
  theme: Theme;
  currentPath: AppPath;
}
