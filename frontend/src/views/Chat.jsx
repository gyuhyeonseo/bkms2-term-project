import React, { useRef, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, TextField, InputAdornment, IconButton, CircularProgress, Typography } from '@mui/material';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import ChatTurn from '../components/ChatTurn';
import { getChatHistory, submitFollowupQuery } from '../apis/api';
import useChatStore from '../stores/useChatStore';
import '../styles/Chat.scss';

const Chat = () => {
  const { chat_id } = useParams();
  const sessionId = useChatStore((state) => state.sessionId);
  const chatEndRef = useRef(null);
  const textFieldRef = useRef(null);
  const [messageHistory, setMessageHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState(''); 

  useEffect(() => {
    const fetchmessageHistory = async () => {
      setLoading(true);
      try {
        const response = await getChatHistory(sessionId, chat_id);
        setMessageHistory(response.messageHistory);
      } catch (err) {
        console.error('Failed to fetch chat data:', err);
        setError('채팅 데이터를 가져오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchmessageHistory();
  }, [chat_id, sessionId]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messageHistory]);

  useEffect(() => {
    if (textFieldRef.current) {
      textFieldRef.current.focus();
    }
  }, []);

  const handleSend = async () => {
    if (sending || !query.trim()) return;
    setSending(true);
    setError(null);

    try {
      const response = await submitFollowupQuery(sessionId, chat_id, query);
      setMessageHistory((prev) => [...prev, response]);
      setQuery('');
    } catch (err) {
      console.error('Failed to send follow-up message:', err);
      setError('질문을 전송하는 중 오류가 발생했습니다.');
    } finally {
      setSending(false);
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
          {messageHistory.map((chat, index) => (
            <ChatTurn
              key={index}
              messageTitle={chat.messageTitle}
              messageContent={chat.messageContent}
              messageLinks={chat.messageLinks}
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
                <IconButton onClick={handleSend} disabled={sending}>
                  {sending ? <CircularProgress size={24} color="success" /> : <ArrowForwardOutlinedIcon />}
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
