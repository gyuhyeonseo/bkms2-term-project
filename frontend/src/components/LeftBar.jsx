import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import useChatStore from '../stores/useChatStore';
import { deleteChat, deleteAllChats } from '../apis/api';
import '../styles/LeftBar.scss';

const LeftBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const sessionId = useChatStore((state) => state.sessionId);
  const chatList = useChatStore((state) => state.chatList);
  const setChatList = useChatStore((state) => state.setChatList);
  const removeChat = useChatStore((state) => state.removeChat);
  const clearChats = useChatStore((state) => state.clearChats);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);

  useEffect(() => {
    if (!sessionId) {
      navigate('/signin');
    }
  }, [sessionId, navigate]);

  const handleDelete = async (chatId) => {
    setLoading(true);
    setError(null);

    try {
      await deleteChat(sessionId, chatId);
      removeChat(chatId);
      if (location.pathname.endsWith(chatId)) {
        navigate('/');
      }
    } catch (err) {
      console.error('Failed to delete chat:', err);
      setError('채팅 삭제 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearChats = async () => {
    setLoading(true);
    setError(null);

    try {
      await deleteAllChats(sessionId);
      clearChats();
      navigate('/');
    } catch (err) {
      console.error('Failed to clear all chats:', err);
      setError('모든 채팅 삭제 중 오류가 발생했습니다.');
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
        {chatList.length > 0 ? (
          chatList.map((chat) => {
            const isActive = location.pathname.endsWith(`${chat.chatId}`);
            return (
              <ListItem
                key={chat.chatId}
                className={`chat-item ${isActive ? 'active-chat-item' : ''}`}
                onClick={() => navigate(`/chats/${chat.chatId}`)}
              >
                <ListItemText
                  primary={<Typography variant="body2" className="chat-title">{chat.chatTitle || 'Untitled Chat'}</Typography>}
                  secondary={
                    <Typography className="chat-date">
                      {new Date(chat.lastUpdatedTime).toLocaleString()}
                    </Typography>
                  }
                />
                <IconButton
                  className="delete-icon"
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
          <Typography variant="body2" className="no-chats-message">채팅 목록이 비어 있습니다.</Typography>
        )}
      </List>

      <Button
        className="btn clear-btn"
        onClick={() => {
          setChatToDelete('all');
          setOpenDialog(true);
        }}
        disabled={chatList.length === 0 || loading}
        variant="outlined"
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
          {chatToDelete === 'all' ? '모든 대화 목록 삭제' : '대화를 삭제하시겠습니까?'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="dialog-description">
            {chatToDelete === 'all'
              ? '모든 대화 목록을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.'
              : '대화를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} variant="outlined">
            취소
          </Button>
          <Button onClick={confirmDeleteChat} variant="contained" className="confirm-delete-btn">
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LeftBar;
