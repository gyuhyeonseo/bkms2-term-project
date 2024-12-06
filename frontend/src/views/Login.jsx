import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Typography, IconButton, CircularProgress } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { signIn } from '../apis/api'; // API 호출 함수
import useChatStore from '../stores/useChatStore'; // zustand 스토어
import '../styles/Login.scss';

const Login = () => {
  const [sessionId, setSessionIdInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const textFieldRef = useRef(null);

  const setSessionId = useChatStore((state) => state.setSessionId);
  const setChatHistory = useChatStore((state) => state.setChatHistory);

  const sessionIdRegex = /^[a-zA-Z0-9\-]{8,16}$/;

  useEffect(() => {
    if (textFieldRef.current) {
      textFieldRef.current.focus();
    }
  }, []);

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
      const data = await signIn(sessionId); // API 호출
      setSessionId(data.sessionId); // zustand 스토어에 sessionId 설정
      setChatHistory(data.chatList); // zustand에 chatList 설정
      localStorage.setItem('sessionId', data.sessionId); // 로컬스토리지에 저장
      navigate('/'); // 홈 화면으로 이동
    } catch (err) {
      console.error(err);
      setError(err.message || '로그인 요청 중 오류가 발생했습니다.'); // 에러 메시지 설정
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
        <Typography variant="h5" className="login-title">
          Session ID를 입력하세요
        </Typography>
        <Box className="login-input-box">
          <TextField
            inputRef={textFieldRef}
            variant="outlined"
            fullWidth
            placeholder="Session ID"
            value={sessionId}
            onChange={(e) => setSessionIdInput(e.target.value)}
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
            {loading ? <CircularProgress size={24} /> : <SendIcon />}
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
