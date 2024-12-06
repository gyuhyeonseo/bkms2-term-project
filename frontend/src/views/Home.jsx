import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Typography, IconButton, CircularProgress } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { createChat } from '../apis/api'; // Import API function
import useChatStore from '../stores/useChatStore'; // Zustand store
import '../styles/Home.scss';

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const textFieldRef = useRef(null);

  const sessionId = useChatStore((state) => state.sessionId); // Get sessionId from Zustand
  const addChat = useChatStore((state) => state.addChat); // Add chat to chat history

  useEffect(() => {
    if (textFieldRef.current) {
      textFieldRef.current.focus();
    }
  }, []);

  const handleSearch = async () => {
    if (searchTerm.trim() === '') return;
    setLoading(true);
    setError(null);

    try {
      const data = await createChat(sessionId, searchTerm); // API call
      const newChat = {
        chatId: data.chatId,
        chatTitle: data.chatTitle,
        lastUpdatedTime: data.createdTime,
      };
      addChat(newChat);
      navigate(`/chat/${data.chatId}`);
    } catch (err) {
      console.error(err);
      setError(err || '검색 요청 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSearch();
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
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyPress}
          className="home-textarea"
        />
        <Box className="home-send-icon-wrapper">
          <IconButton
            onClick={handleSearch}
            disabled={searchTerm.trim() === '' || loading}
            className="home-send-icon-button"
          >
            {loading ? <CircularProgress size={24} /> : <SendIcon />}
          </IconButton>
        </Box>
      </Box>
      {error && <Typography variant="body2" color="error">{error}</Typography>}
    </Box>
  );
};

export default Home;
