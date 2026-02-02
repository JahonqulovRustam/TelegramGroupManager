
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

// Telegram WebApp SDK funksiyalarini ishga tushiramiz
if ((window as any).Telegram?.WebApp) {
  const tg = (window as any).Telegram.WebApp;
  
  // Ilova tayyorligini bildirish
  tg.ready();
  
  // Ilovani to'liq ekranga yoyish
  if (tg.expand) tg.expand();
  
  // Ranglarni Telegram mavzusiga moslashtirish (Faqat 6.1+ versiyalarda va funksiya mavjud bo'lsa)
  try {
    if (tg.isVersionAtLeast && tg.isVersionAtLeast('6.1') && tg.setHeaderColor) {
      tg.setHeaderColor(tg.colorScheme === 'dark' ? '#0b141a' : '#f8fafc');
    }
  } catch (e) {
    console.warn("Telegram HeaderColor settings skipped:", e);
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
