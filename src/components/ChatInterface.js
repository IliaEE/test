import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  CircularProgress,
  useTheme,
} from '@mui/material';
import { Send } from 'lucide-react';
import { evaluateAnswer, chatWithAI } from '../services/openai';

const ChatInterface = ({ 
  question, 
  onSubmit, 
  disabled = false, 
  loading = false,
  feedback = null,
  context = {}
}) => {
  const theme = useTheme();
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { 
      role: 'assistant', 
      content: "Hello! I'm your technical interviewer today. " + question.content 
    }
  ]);
  const [submitting, setSubmitting] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || disabled || submitting) return;

    try {
      setSubmitting(true);
      
      // Add user message to chat
      const userMessage = { role: 'user', content: message };
      setChatHistory(prev => [...prev, userMessage]);
      setMessage('');

      // Get AI response
      const aiResponse = await chatWithAI(
        [...chatHistory, userMessage],
        context
      );
      
      // Add AI response to chat
      setChatHistory(prev => [...prev, aiResponse]);

      // Evaluate the answer
      const evaluation = await evaluateAnswer(question, message);
      
      // Notify parent component
      if (onSubmit) {
        onSubmit(message, evaluation);
      }
    } catch (error) {
      console.error('Error in chat:', error);
      setChatHistory(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        error: true
      }]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        height: '500px', 
        display: 'flex', 
        flexDirection: 'column',
        bgcolor: theme.palette.background.default
      }}
    >
      {/* Chat messages */}
      <Box 
        sx={{ 
          flex: 1, 
          overflowY: 'auto', 
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}
      >
        {chatHistory.map((msg, index) => (
          <Box
            key={index}
            sx={{
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '80%'
            }}
          >
            <Paper
              elevation={1}
              sx={{
                p: 2,
                bgcolor: msg.role === 'user' 
                  ? theme.palette.primary.main 
                  : theme.palette.background.paper,
                color: msg.role === 'user' 
                  ? theme.palette.primary.contrastText 
                  : theme.palette.text.primary,
                ...(msg.error && {
                  bgcolor: theme.palette.error.main,
                  color: theme.palette.error.contrastText
                })
              }}
            >
              <Typography variant="body1">
                {msg.content}
              </Typography>
            </Paper>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input area */}
      <Box 
        component="form" 
        onSubmit={handleSubmit}
        sx={{ 
          p: 2, 
          borderTop: 1, 
          borderColor: 'divider',
          bgcolor: theme.palette.background.paper
        }}
      >
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={disabled || submitting}
            sx={{ bgcolor: theme.palette.background.default }}
          />
          <IconButton 
            type="submit" 
            color="primary" 
            disabled={!message.trim() || disabled || submitting}
          >
            {submitting ? <CircularProgress size={24} /> : <Send />}
          </IconButton>
        </Box>
      </Box>
    </Paper>
  );
};

export default ChatInterface;
