import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LeftBar from './components/LeftBar'; // 좌측 패널 컴포넌트
import Login from './views/Login';
import Home from './views/Home';
import Chat from './views/Chat';
import useChatStore from './stores/useChatStore'; // zustand 스토어

const App = () => {
  const sessionId = useChatStore((state) => state.sessionId); // zustand에서 sessionId 가져오기
  const setSessionId = useChatStore((state) => state.setSessionId);

  useEffect(() => {
    const storedSessionId = localStorage.getItem('sessionId');
    if (storedSessionId) {
      setSessionId(storedSessionId); // 로컬스토리지 세션을 zustand에 설정
    }
  }, [setSessionId]);

  const isLoggedIn = !!sessionId; // sessionId가 존재하면 로그인 상태

  return (
    <Router>
      <div style={{ display: 'flex' }}>
        {isLoggedIn && <LeftBar />}

        <Routes>
          <Route
            path="/login"
            element={isLoggedIn ? <Navigate to="/" /> : <Login />}
          />
          <Route
            path="/"
            element={isLoggedIn ? <Home /> : <Navigate to="/login" />}
          />
          <Route
            path="/chat/:chat_id"
            element={isLoggedIn ? <Chat /> : <Navigate to="/login" />}
          />
          <Route path="*" element={<Navigate to={isLoggedIn ? "/" : "/login"} />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
