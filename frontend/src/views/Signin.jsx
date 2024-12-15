import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Typography, IconButton, CircularProgress } from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import { signinSession } from '../apis/api';
import useChatStore from '../stores/useChatStore'; 
import '../styles/Signin.scss';

const Signin = () => {
  const [sessionId, setSessionIdInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const textFieldRef = useRef(null);

  const setSessionId = useChatStore((state) => state.setSessionId);
  const setChatList = useChatStore((state) => state.setChatList);

  const sessionIdRegex = /^[a-zA-Z0-9\-]{8,16}$/;

  useEffect(() => {
    if (textFieldRef.current) {
      textFieldRef.current.focus();
    }

    const storedSessionId = localStorage.getItem('sessionId');
    if (storedSessionId) {
      navigate('/');
    }
  }, [navigate]);

  const handleLogin = async () => {
    if (sessionId.trim() === '') {
      setError('Session ID를 입력하세요.');
      return;
    }
    if (!sessionIdRegex.test(sessionId)) {
      setError('Session ID는 8~16자 사이의 영어 대소문자, 숫자, "-"만 포함해야 합니다.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await signinSession(sessionId);
      setSessionId(data.sessionId);
      setChatList(data.chatList);
      localStorage.setItem('sessionId', data.sessionId);
      navigate('/');
    } catch (err) {
      console.error(err);
      setError(err.message || '로그인 요청 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <Box className="login-container">
      <Box className="login-box">
        <Typography variant="h6" sx={{marginBottom:'10px'}}>
          Session ID를 입력하세요
        </Typography>
        <Box className="login-input-box">
          <TextField
            inputRef={textFieldRef}
            variant="outlined"
            fullWidth
            placeholder="Session ID"
            value={sessionId}
            onChange={(e) => {
              setSessionIdInput(e.target.value);
              setError(null);
            }}
            onKeyDown={handleKeyPress}
            className="login-textfield"
            error={!!error}
            helperText={error || ''}
          />
          <IconButton
            onClick={handleLogin}
            disabled={loading || sessionId.trim() === ''}
            className="login-send-button"
          >
            {loading ? <CircularProgress size={24} color="success" /> : <LoginIcon />}
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default Signin;
