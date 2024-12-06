import React from 'react';
import { Box, Divider, Typography, Grid2, Link, Stack } from '@mui/material';
import CollectionsBookmarkOutlinedIcon from '@mui/icons-material/CollectionsBookmarkOutlined';
import QuestionAnswerOutlinedIcon from '@mui/icons-material/QuestionAnswerOutlined';
import Markdown from 'markdown-to-jsx';
import '../styles/ChatTurn.scss';


const ChatTurn = ({ title, sources, message }) => {
  return (
    <Box className="chat-turn">
      <Box className="section">
        <Typography variant="h5" gutterBottom>
          {title}
        </Typography>
      </Box>

      <Box className="section">
        <Stack direction="row" alignItems="center" spacing={1} className="sub-header">
          <CollectionsBookmarkOutlinedIcon />
          <Typography variant="h6" gutterBottom>
            출처
          </Typography>
        </Stack>
        {sources.length > 0 ? (
          <Grid2 container spacing={2}>
            {sources.map((link, index) => (
              <Grid2 item xs={12} sm={4} key={index}>
                <Box className="reference-box">
                  <Link href={link.url} target="_blank" rel="noopener" underline="hover">
                    Visit URL
                  </Link>
                  <br />
                  <Link
                    href={`data:application/octet-stream;charset=utf-8;base64,${link.file}`}
                    download={link.fileName}
                    underline="hover"
                  >
                    {link.fileName}
                  </Link>
                </Box>
              </Grid2>
            ))}
          </Grid2>
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
        <Box className="message-box">
          <Markdown>{message}</Markdown>
        </Box>
      </Box>

      <Divider />
    </Box>
  );
};

export default ChatTurn;
