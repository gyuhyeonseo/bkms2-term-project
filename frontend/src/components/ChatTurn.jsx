import React from 'react';
import { Box, Divider, Typography, Stack } from '@mui/material';
import Grid from '@mui/material/Grid2';
import CollectionsBookmarkOutlinedIcon from '@mui/icons-material/CollectionsBookmarkOutlined';
import QuestionAnswerOutlinedIcon from '@mui/icons-material/QuestionAnswerOutlined';
import Markdown from 'markdown-to-jsx';
import '../styles/ChatTurn.scss';

const ChatTurn = ({ messageTitle, messageContent, messageLinks }) => {

  // Replace # with ### in messageContent
  const formattedMessageContent = messageContent.replace(/^#+/gm, '### ');

  return (
    <Box className="chat-turn">
      <Box className="section">
        <Typography variant="h5" gutterBottom>
          {messageTitle}
        </Typography>
      </Box>

      <Box className="section">
        <Stack direction="row" alignItems="center" spacing={1} className="sub-header">
          <CollectionsBookmarkOutlinedIcon />
          <Typography variant="h6" gutterBottom>
            출처
          </Typography>
        </Stack>
        {messageLinks.length > 0 ? (
          <Grid container spacing={2}>
            {messageLinks.map((obj, index) => (
              <Grid xs={12} sm={4} key={index}>
                <Box
                  className="reference-box"
                  onClick={() => window.open(obj.link, '_blank', 'noopener noreferrer')}
                >
                  <Typography variant="body2">Reference URL</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography variant="body2" color="textSecondary">
            출처가 없습니다.
          </Typography>
        )}
      </Box>

      <Box className="section">
        <Stack direction="row" alignItems="center" spacing={1} className="sub-header">
          <QuestionAnswerOutlinedIcon />
          <Typography variant="h6" gutterBottom>
            답변
          </Typography>
        </Stack>
        <Box className="message-content-box">
          <Markdown className="markdown-content">{formattedMessageContent}</Markdown>
        </Box>
      </Box>

      <Divider />
    </Box>
  );
};

export default ChatTurn;
