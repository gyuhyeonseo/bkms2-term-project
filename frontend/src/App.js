import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "./styles/theme";

import LeftBar from './components/LeftBar';
import Signin from './views/Signin';
import Home from './views/Home';
import Chat from './views/Chat';
import useChatStore from './stores/useChatStore';

const App = () => {
  const sessionId = useChatStore((state) => state.sessionId);
  const setSessionId = useChatStore((state) => state.setSessionId);

  useEffect(() => {
    const storedSessionId = localStorage.getItem('sessionId');
    if (storedSessionId) {
      setSessionId(storedSessionId);
    }
  }, [setSessionId]);

  const isLoggedIn = !!sessionId;

  return (
    <ThemeProvider theme={theme}> 
      <CssBaseline />
      <Router>
        <div style={{ display: 'flex' }}>
          {isLoggedIn && <LeftBar />}

          <Routes>
            <Route
              path="/signin"
              element={isLoggedIn ? <Navigate to="/" /> : <Signin />}
            />
            <Route
              path="/"
              element={isLoggedIn ? <Home /> : <Navigate to="/signin" />}
            />
            <Route
              path="/chats/:chat_id"
              element={isLoggedIn ? <Chat /> : <Navigate to="/signin" />}
            />
            <Route path="*" element={<Navigate to={isLoggedIn ? "/" : "/signin"} />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
};

export default App;
