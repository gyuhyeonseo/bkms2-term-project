import React, { useRef, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, TextField, InputAdornment, IconButton, CircularProgress, Typography } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ChatTurn from '../components/ChatTurn';
import { getChatHistory, sendFollowUpMessage } from '../apis/api'; // API 호출
import useChatStore from '../stores/useChatStore';
import '../styles/Chat.scss';

const Chat = () => {
  const { chat_id } = useParams(); // URL에서 chat_id 가져오기
  const sessionId = useChatStore((state) => state.sessionId); // Zustand에서 sessionId 가져오기
  const chatEndRef = useRef(null);
  const textFieldRef = useRef(null); // TextField에 대한 ref 생성
  const [chatData, setChatData] = useState([]); // 채팅 데이터를 저장
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState(null); // 에러 상태
  const [query, setQuery] = useState(''); // 사용자가 입력한 질문

  // API 호출 및 데이터 로드
  useEffect(() => {
    const fetchChatData = async () => {
      setLoading(true);
      try {
        const response = await getChatHistory(sessionId, chat_id); // getChatHistory 호출
        const messages = response.messageHistory.map((msg) => ({
          title: msg.chatTitle,
          message: msg.messageContent,
          sources: msg.sources.map((src) => ({
            url: src.url,
            fileName: 'Reference File',
            file: src.file,
          })),
          createdTime: msg.createdTime,
        }));
        setChatData(messages);
      } catch (err) {
        console.error('Failed to fetch chat data:', err);
        setError('채팅 데이터를 가져오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchChatData();
  }, [chat_id, sessionId]);

  // 스크롤을 맨 아래로 이동
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatData]);

  // TextField 자동 포커스
  useEffect(() => {
    if (textFieldRef.current) {
      textFieldRef.current.focus();
    }
  }, []);

  // 메시지 전송
  const handleSend = async () => {
    if (!query.trim()) return; // 빈 입력은 무시
    try {
      const response = await sendFollowUpMessage(sessionId, chat_id, query); // 후속 질문 API 호출
      const newMessage = {
        title: response.chatTitle,
        message: response.messageContent,
        sources: response.sources.map((src) => ({
          url: src.url,
          fileName: 'Reference File',
          file: src.file,
        })),
        createdTime: response.createdTime,
      };
      setChatData((prev) => [...prev, newMessage]); // 새 메시지 추가
      setQuery(''); // 입력 필드 초기화
    } catch (err) {
      console.error('Failed to send follow-up message:', err);
      setError('질문을 전송하는 중 오류가 발생했습니다.');
    }
  };

  // Enter 키 이벤트 처리
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  if (loading) {
    return (
      <Box className="chat-container">
        <CircularProgress />
        <Typography>Loading chat...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="chat-container">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box className="chat-container">
      <Box className="chat-turn-box">
        <Box className="chat-turn-box-content">
          {chatData.map((chat, index) => (
            <ChatTurn
              key={index}
              title={chat.title}
              sources={chat.sources}
              message={chat.message}
              createdTime={chat.createdTime}
            />
          ))}
          <div ref={chatEndRef}></div>
        </Box>
      </Box>

      <Box className="chat-input-box">
        <TextField
          fullWidth
          multiline
          maxRows={8}
          placeholder="후속 질문하기"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          inputRef={textFieldRef}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleSend}>
                  <SendIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          className="chat-textarea"
        />
      </Box>
    </Box>
  );
};

export default Chat;
