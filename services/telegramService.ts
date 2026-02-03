
import { Message, ChatGroup } from '../types';

export const getBotInfo = async (token: string) => {
  try {
    const url = `/api/telegram/bot${token}/getMe`;
    console.log("Fetching Bot Info:", url); // DEBUG log
    const response = await fetch(url);
    const json = await response.json();
    console.log("Fetch Result:", json); // DEBUG log
    return json;
  } catch (error) {
    console.error("Telegram getMe Error:", error);
    return null;
  }
};

export const sendTelegramReply = async (token: string, chatId: number, text: string, replyToMessageId?: string) => {
  try {
    const response = await fetch(`/api/telegram/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        reply_to_message_id: replyToMessageId ? parseInt(replyToMessageId) : undefined,
      })
    });
    const data = await response.json();
    if (!data.ok) console.error("Telegram sendMessage Error:", data);
    return data;
  } catch (error) {
    console.error("Telegram Fetch Error:", error);
    return null;
  }
};

export const sendTelegramSticker = async (token: string, chatId: number, stickerUrl: string, replyToMessageId?: string) => {
  try {
    const response = await fetch(`/api/telegram/bot${token}/sendSticker`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        sticker: stickerUrl,
        reply_to_message_id: replyToMessageId ? parseInt(replyToMessageId) : undefined,
      })
    });
    const data = await response.json();
    if (!data.ok) console.error("Telegram sendSticker Error:", data);
    return data;
  } catch (error) {
    console.error("Telegram Sticker Fetch Error:", error);
    return null;
  }
};

export const sendTelegramAnimation = async (token: string, chatId: number, gifUrl: string, caption?: string, replyToMessageId?: string) => {
  try {
    const response = await fetch(`/api/telegram/bot${token}/sendAnimation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        animation: gifUrl,
        caption: caption,
        reply_to_message_id: replyToMessageId ? parseInt(replyToMessageId) : undefined,
      })
    });
    const data = await response.json();
    if (!data.ok) console.error("Telegram sendAnimation Error:", data);
    return data;
  } catch (error) {
    console.error("Telegram Animation Fetch Error:", error);
    return null;
  }
};

export const getChatInfo = async (token: string, chatIdOrUsername: string | number) => {
  try {
    let identifier = chatIdOrUsername.toString();
    if (!identifier.startsWith('-') && isNaN(Number(identifier)) && !identifier.startsWith('@')) {
      identifier = '@' + identifier;
    }
    const response = await fetch(`/api/telegram/bot${token}/getChat?chat_id=${identifier}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Telegram getChat Error:", error);
    return null;
  }
};

export const getTelegramUpdates = async (token: string, offset: number) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);
    const response = await fetch(`/api/telegram/bot${token}/getUpdates?offset=${offset}&timeout=15`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (!response.ok) return [];
    const data = await response.json();
    return data.ok ? data.result : [];
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.warn("Telegram polling timeout");
    }
    return [];
  }
};

export const parseTelegramUpdate = (update: any): { message: Message, chat: ChatGroup } | null => {
  const tgMsg = update.message || update.edited_message;
  if (!tgMsg || !tgMsg.chat) return null;

  let messageType: Message['type'] = 'text';
  let fileId = undefined;
  let text = tgMsg.text || "";

  if (tgMsg.sticker) {
    messageType = 'sticker';
    fileId = tgMsg.sticker.file_id;
    text = "[Stiker]";
  } else if (tgMsg.animation) {
    messageType = 'gif';
    fileId = tgMsg.animation.file_id;
    text = tgMsg.caption || "[GIF]";
  }

  const chat: ChatGroup = {
    id: tgMsg.chat.id,
    title: tgMsg.chat.title || tgMsg.chat.first_name || "Noma'lum Chat",
    type: tgMsg.chat.type,
    memberCount: 0,
    unreadCount: 0,
    lastMessage: text
  };

  const message: Message = {
    id: tgMsg.message_id.toString(),
    chatId: tgMsg.chat.id,
    from: {
      id: tgMsg.from.id,
      first_name: tgMsg.from.first_name,
      username: tgMsg.from.username
    },
    text: text,
    timestamp: tgMsg.date * 1000,
    replyToId: tgMsg.reply_to_message?.message_id.toString(),
    type: messageType,
    fileId: fileId
  };

  return { message, chat };
};
