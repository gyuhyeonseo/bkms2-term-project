import axios from 'axios';

// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: 'https://virtserver.swaggerhub.com/kyongshikl/BKMS2/1.0.0/', // 공통 베이스 URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// session으로 로그인
export const signIn = async (sessionId) => {
  try {
    const response = await apiClient.put(`/session/${sessionId}`);
    return response.data; // 서버 응답 데이터 반환
  } catch (error) {
    console.error('Error during signIn:', error.response || error);
    throw error;
  }
};

// Home화면에서 채팅 시작
export const createChat = async (sessionId, query) => {
  try {
    const response = await apiClient.post(`/session/${sessionId}/chats`, {
      query: query,
    });
    return response.data;
  } catch (error) {
    console.error('Error during createChat:', error.response?.data || error);
    throw error.response?.data || { error: 'Unknown error occurred' };
  }
};

// 특정 chat에서 후속질문
export const sendFollowUpMessage = async (sessionId, chatId, query) => {
  try {
    const response = await apiClient.post(`/session/${sessionId}/chats/${chatId}`, {
      query: query,
    });
    return response.data; // 서버 응답 데이터 반환
  } catch (error) {
    console.error('Error during sendFollowUpMessage:', error.response?.data || error);
    throw error.response?.data || { error: 'Unknown error occurred' }; // 에러 응답 데이터 반환
  }
};

// sidebar에서 특정 chat history 가져오기
export const getChatHistory = async (sessionId, chatId) => {
  try {
    const response = await apiClient.get(`/session/${sessionId}/chats/${chatId}`);
    return response.data; // 서버 응답 데이터 반환
  } catch (error) {
    console.error('Error during getChatHistory:', error.response?.data || error);
    throw error.response?.data || { error: 'Unknown error occurred' }; // 에러 응답 데이터 반환
  }
};

export const deleteChat = async (sessionId, chatId) => {
  try {
    const response = await apiClient.delete(`/session/${sessionId}/chats/${chatId}`);
    return response.data; // 서버 응답 데이터 반환
  } catch (error) {
    console.error('Error during deleteChat:', error.response?.data || error);
    throw error.response?.data || { error: 'Unknown error occurred' }; // 에러 응답 데이터 반환
  }
};


export const deleteAllChats = async (sessionId) => {
  try {
    const response = await apiClient.delete(`/session/${sessionId}/chats`);
    return response.data;
  } catch (error) {
    console.error('Error during deleteAllChats:', error.response?.data || error);
    throw error.response?.data || { error: 'Unknown error occurred' };
  }
};
