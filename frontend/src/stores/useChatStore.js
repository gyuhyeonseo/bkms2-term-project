import { create } from 'zustand';

const useChatStore = create((set) => ({
  sessionId: null,
  setSessionId: (sessionId) => set(() => ({ sessionId })),
  chatHistory: [], // chatList를 저장
  setChatHistory: (chatList) => set(() => ({ chatHistory: chatList })), // chatList를 업데이트
  addChat: (chat) => set((state) => ({ chatHistory: [...state.chatHistory, chat] })), // 새로운 채팅 추가
  removeChat: (chatId) =>
    set((state) => ({
      chatHistory: state.chatHistory.filter((chat) => chat.chatId !== chatId),
    })), // 특정 채팅 제거
  clearChats: () => set(() => ({ chatHistory: [] })), // 모든 채팅 삭제
}));

export default useChatStore;
