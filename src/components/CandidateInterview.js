import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Alert,
  CircularProgress,
  TextField
} from '@mui/material';
import Editor from '@monaco-editor/react';

const baseQuestions = [
  {
    type: 'coding',
    text: 'Write a function that finds the first non-repeated character in a string.',
    hint: 'Consider using a hash map to track character frequencies.',
    template: `function findFirstNonRepeatedChar(str) {
  // Your code here
}`
  },
  {
    type: 'coding',
    text: 'Implement a function to check if a binary tree is balanced.',
    hint: 'A balanced tree has a height difference of at most 1 between left and right subtrees.',
    template: `class TreeNode {
  constructor(val) {
    this.val = val;
    this.left = null;
    this.right = null;
  }
}

function isBalanced(root) {
  // Your code here
}`
  },
  {
    type: 'coding',
    text: 'Design a cache with a maximum size that removes the least recently used item when full.',
    hint: 'Consider using a combination of hash map and doubly linked list.',
    template: `class LRUCache {
  constructor(capacity) {
    // Your code here
  }
  
  get(key) {
    // Your code here
  }
  
  put(key, value) {
    // Your code here
  }
}`
  }
];

const CandidateInterview = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [interview, setInterview] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [explanation, setExplanation] = useState('');
  const [answers, setAnswers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  useEffect(() => {
    const loadInterview = async () => {
      try {
        const interviewsRef = collection(db, 'interviews');
        const q = query(interviewsRef, where('code', '==', code));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          setError('Invalid interview code');
          setLoading(false);
          return;
        }

        const interviewData = querySnapshot.docs[0].data();
        const interviewId = querySnapshot.docs[0].id;
        setInterview({ id: interviewId, ...interviewData });

        // Verify candidate info
        const candidateInfo = JSON.parse(sessionStorage.getItem('candidateInfo') || '{}');
        if (!candidateInfo.name || !candidateInfo.email) {
          navigate('/start-interview');
          return;
        }

        // Customize questions based on position and level
        const customizedQuestions = baseQuestions.map(q => ({
          ...q,
          text: `${q.text} (${interviewData.position}${interviewData.level ? ` - ${interviewData.level} level` : ''})`,
        }));

        setQuestions(customizedQuestions);
        setAnswer(customizedQuestions[0].template || '');
        setLoading(false);
      } catch (err) {
        console.error('Error loading interview:', err);
        if (retryCount < MAX_RETRIES) {
          setRetryCount(prev => prev + 1);
          setTimeout(loadInterview, 1000 * (retryCount + 1)); // Exponential backoff
        } else {
          setError('Failed to load interview. Please try again.');
          setLoading(false);
        }
      }
    };

    loadInterview();
  }, [code, navigate, retryCount]);

  const handleAnswerSubmit = async () => {
    try {
      if (!answer.trim() && !explanation.trim()) {
        setError('Please provide either code or explanation before proceeding');
        return;
      }

      // Calculate score based on code and explanation quality
      const score = Math.min(100, Math.floor(
        (answer.trim().length / 10) + (explanation.trim().length / 5)
      ));

      // Save answer
      const newAnswers = [...answers, {
        questionIndex: currentQuestionIndex,
        code: answer,
        explanation,
        score
      }];
      setAnswers(newAnswers);

      // Move to next question or finish
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setAnswer(questions[currentQuestionIndex + 1].template || '');
        setExplanation('');
        setError('');
      } else {
        await submitResults(newAnswers);
      }
    } catch (err) {
      console.error('Error submitting answer:', err);
      setError('Failed to submit answer. Please try again.');
    }
  };

  const submitResults = async (finalAnswers) => {
    try {
      const candidateInfo = JSON.parse(sessionStorage.getItem('candidateInfo') || '{}');
      
      const totalScore = finalAnswers.reduce((sum, ans) => sum + ans.score, 0) / questions.length;
      
      const result = {
        interviewId: interview.id,
        candidateName: candidateInfo.name,
        candidateEmail: candidateInfo.email,
        answers: finalAnswers,
        totalScore: Math.round(totalScore),
        completedAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'results'), result);
      navigate('/interview-complete');
    } catch (err) {
      console.error('Error submitting results:', err);
      setError('Failed to submit results. Please try again.');
    }
  };

  if (loading) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Box sx={{ mt: 2 }}>
          <Button variant="contained" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </Box>
      </Container>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Question {currentQuestionIndex + 1} of {questions.length}
        </Typography>
        
        <Typography variant="h6" gutterBottom>
          {currentQuestion?.text}
        </Typography>
        
        {currentQuestion?.hint && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Hint: {currentQuestion.hint}
          </Typography>
        )}

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Your Code
          </Typography>
          <Editor
            height="300px"
            defaultLanguage="javascript"
            theme="vs-light"
            value={answer}
            onChange={setAnswer}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              wordWrap: 'on',
              automaticLayout: true
            }}
          />
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Explanation
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="Explain your approach and any assumptions made..."
          />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAnswerSubmit}
            disabled={!answer.trim() && !explanation.trim()}
          >
            {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Interview'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default CandidateInterview;
