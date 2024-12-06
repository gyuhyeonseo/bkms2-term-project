import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Typography,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import useChatStore from '../stores/useChatStore';
import { deleteChat, deleteAllChats } from '../apis/api'; // API 호출 추가
import '../styles/LeftBar.scss';

const LeftBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const sessionId = useChatStore((state) => state.sessionId); // sessionId 가져오기
  const chatHistory = useChatStore((state) => state.chatHistory); // chatHistory 가져오기
  const removeChat = useChatStore((state) => state.removeChat); // 특정 채팅 제거
  const clearChats = useChatStore((state) => state.clearChats); // 모든 채팅 제거

  const [openDialog, setOpenDialog] = React.useState(false);
  const [chatToDelete, setChatToDelete] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const handleDelete = async (chatId) => {
    setLoading(true);
    setError(null);
    try {
      await deleteChat(sessionId, chatId); // API 호출
      removeChat(chatId); // zustand 상태 업데이트
      if (location.pathname.endsWith(chatId)) {
        navigate('/'); // 현재 채팅이 삭제되면 홈으로 이동
      }
    } catch (err) {
      console.error('Failed to delete chat:', err);
      setError(err.error || '채팅 삭제 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearChats = async () => {
    setLoading(true);
    setError(null);
    try {
      await deleteAllChats(sessionId); // API 호출
      clearChats(); // zustand 상태 업데이트
      navigate('/'); // 홈으로 이동
    } catch (err) {
      console.error('Failed to delete all chats:', err);
      setError(err.error || '모든 채팅 삭제 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
      setOpenDialog(false);
    }
  };

  const confirmDeleteChat = () => {
    if (chatToDelete === 'all') {
      handleClearChats();
    } else {
      handleDelete(chatToDelete);
    }
    setOpenDialog(false);
  };

  return (
    <Box className="left-panel">
      <Button className="btn new-chat-btn" onClick={() => navigate('/')}>
        + New Chat
      </Button>

      <List className="chat-list">
        {loading && (
          <Box className="loading-container">
            <CircularProgress size={24} />
          </Box>
        )}
        {!loading && chatHistory.length > 0 ? (
          chatHistory.map((chat) => {
            const isActive = location.pathname.endsWith(`${chat.chatId}`);
            return (
              <ListItem
                key={chat.chatId}
                className={`chat-item ${isActive ? 'active-chat-item' : ''}`}
                onClick={() => navigate(`/chat/${chat.chatId}`)}
              >
                <ListItemText
                  primary={<Typography className="chat-title">{chat.chatTitle || 'Untitled Chat'}</Typography>}
                  secondary={
                    <Typography className="chat-date">
                      {new Date(chat.lastUpdatedTime).toLocaleString()}
                    </Typography>
                  }
                />
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    setChatToDelete(chat.chatId);
                    setOpenDialog(true);
                  }}
                  size="small"
                >
                  <Delete />
                </IconButton>
              </ListItem>
            );
          })
        ) : (
          <Typography className="no-chats-message">No chats available</Typography>
        )}
      </List>

      <Button
        className="btn clear-btn"
        onClick={() => setOpenDialog(true)}
        disabled={chatHistory.length === 0 || loading}
      >
        Clear All Chats
      </Button>

      {error && (
        <Typography variant="body2" color="error" className="error-message">
          {error}
        </Typography>
      )}

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
      >
        <DialogTitle id="dialog-title">
          {chatToDelete === 'all' ? 'Clear All Chats?' : 'Delete Chat?'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="dialog-description">
            {chatToDelete === 'all'
              ? 'Are you sure you want to delete all chats? This action cannot be undone.'
              : 'Are you sure you want to delete this chat? This action cannot be undone.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDeleteChat} color="error">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LeftBar;
