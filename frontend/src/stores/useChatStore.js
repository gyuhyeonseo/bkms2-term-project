import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useChatStore = create(
  persist(
    (set) => ({
      sessionId: null,
      setSessionId: (sessionId) => set(() => ({ sessionId })),
      chatList: [],
      setChatList: (chatList) => set(() => ({ chatList })),
      addChat: (chat) => set((state) => ({ chatList: [chat, ...state.chatList] })),
      removeChat: (chatId) =>
        set((state) => ({
          chatList: state.chatList.filter((chat) => chat.chatId !== chatId),
        })),
      clearChats: () => set(() => ({ chatList: [] })),
    }),
    {
      name: 'chat-storage',
      getStorage: () => localStorage,
    }
  )
);

export default useChatStore;