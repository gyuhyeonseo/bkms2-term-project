import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Typography, IconButton, CircularProgress } from '@mui/material';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import { createChat } from '../apis/api'; 
import useChatStore from '../stores/useChatStore';
import '../styles/Home.scss';

const Home = () => {
  const [query, setQeury] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const textFieldRef = useRef(null);

  const sessionId = useChatStore((state) => state.sessionId);
  const addChat = useChatStore((state) => state.addChat);

  useEffect(() => {
    if (textFieldRef.current) {
      textFieldRef.current.focus();
    }
  }, []);

  const handleSearch = async () => {
    if (loading || query.trim() === '') return;
    setLoading(true);
    setError(null);
  
    try {
      const data = await createChat(sessionId, query);
      const newChat = {
        chatId: data.chatId,
        chatTitle: data.chatTitle,
        lastUpdatedTime: data.createdTime,
      };
      addChat(newChat);
      navigate(`/chats/${data.chatId}`);
    } catch (err) {
      console.error(err);
      setError(err || '검색 요청 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // 기본 동작 방지
      if (!loading) {
        handleSearch();
      }
    }
  };
  

  return (
    <Box className="home-container">
      <Typography variant="h5" className="home-title">
        무엇이든 검색하세요
      </Typography>
      <Box className="home-input-box">
        <TextField
          inputRef={textFieldRef}
          variant="outlined"
          fullWidth
          multiline
          minRows={2}
          maxRows={8}
          placeholder="검색어를 입력하세요 (Shift + Enter로 줄바꿈)"
          value={query}
          onChange={(e) => setQeury(e.target.value)}
          onKeyDown={handleKeyPress}
          className="home-textarea"
        />
        <Box className="home-send-icon-wrapper">
          <IconButton
            onClick={() => {
              if (!loading && query.trim() !== '') {
                handleSearch();
              }
            }}
            disabled={query.trim() === '' || loading}
            className="home-send-icon-button"
          >
            {loading ? <CircularProgress size={24} color="success" /> : <ArrowForwardOutlinedIcon />}
          </IconButton>
        </Box>
      </Box>
      {error && <Typography variant="body2" color="error">{error}</Typography>}
    </Box>
  );
};

export default Home;
