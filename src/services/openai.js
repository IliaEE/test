import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

// Fallback questions for different roles
const FALLBACK_QUESTIONS = {
  default: [
    {
      id: '1',
      type: 'theory',
      content: 'Explain your approach to problem-solving.',
      expectedAnswer: 'Looking for structured approach and analytical thinking',
      maxScore: 10
    },
    {
      id: '2',
      type: 'coding',
      content: 'Write a function to reverse a string.',
      expectedAnswer: 'function reverse(str) { return str.split("").reverse().join(""); }',
      maxScore: 10
    }
  ],
  frontend: [
    {
      id: '1',
      type: 'theory',
      content: 'Explain the difference between props and state in React.',
      expectedAnswer: 'Props are read-only and passed from parent, state is internal and mutable',
      maxScore: 10
    },
    {
      id: '2',
      type: 'coding',
      content: 'Write a function to debounce event handlers.',
      expectedAnswer: 'function debounce(fn, delay) { let timeout; return (...args) => { clearTimeout(timeout); timeout = setTimeout(() => fn(...args), delay); }; }',
      maxScore: 10
    }
  ],
  backend: [
    {
      id: '1',
      type: 'theory',
      content: 'Explain RESTful API design principles.',
      expectedAnswer: 'Should cover: statelessness, resource-based URLs, HTTP methods, status codes',
      maxScore: 10
    },
    {
      id: '2',
      type: 'coding',
      content: 'Write a function to implement rate limiting.',
      expectedAnswer: 'Should implement token bucket or sliding window algorithm',
      maxScore: 10
    }
  ]
};

// Fallback chat responses
const FALLBACK_CHAT_RESPONSES = [
  'Could you elaborate more on your experience with this technology?',
  'What challenges did you face in your previous projects?',
  'How do you approach debugging complex issues?',
  'Tell me about a technical problem you solved recently.',
  'What are your thoughts on best practices in software development?',
  'How do you stay updated with new technologies?',
  'What\'s your experience with team collaboration tools?',
  'How do you handle code reviews?'
];

// Get appropriate fallback questions based on position
const getFallbackQuestions = (position = '') => {
  const pos = position.toLowerCase();
  if (pos.includes('front') || pos.includes('react') || pos.includes('ui')) {
    return FALLBACK_QUESTIONS.frontend;
  }
  if (pos.includes('back') || pos.includes('api') || pos.includes('server')) {
    return FALLBACK_QUESTIONS.backend;
  }
  return FALLBACK_QUESTIONS.default;
};

// Evaluate answer without OpenAI
const evaluateAnswerLocally = (answer = '') => {
  // Basic evaluation based on answer length and keywords
  const length = answer.length;
  let score = 0;
  let feedback = '';

  if (length < 50) {
    score = 3;
    feedback = 'Answer is too brief. Please provide more details.';
  } else if (length < 100) {
    score = 5;
    feedback = 'Answer could be more comprehensive.';
  } else if (length < 200) {
    score = 7;
    feedback = 'Good answer, but could include more examples.';
  } else {
    score = 8;
    feedback = 'Comprehensive answer with good detail.';
  }

  // Check for code-like patterns
  if (answer.includes('function') || answer.includes('class') || answer.includes('const')) {
    score += 1;
    feedback += ' Shows good coding practices.';
  }

  return {
    score: Math.min(score, 10),
    feedback
  };
};

// Generate interview questions
export const generateQuestions = async (position, skills = [], level = 'mid') => {
  try {
    console.log('Generating questions for:', { position, skills, level });
    
    // Return fallback questions when OpenAI is rate limited
    return getFallbackQuestions(position);
  } catch (error) {
    console.error('Error generating questions:', error);
    return getFallbackQuestions(position);
  }
};

// Evaluate candidate's answer
export const evaluateAnswer = async (question, answer, options = {}) => {
  try {
    console.log('Evaluating answer for question:', question.content);
    
    // Use local evaluation when OpenAI is rate limited
    return evaluateAnswerLocally(answer);
  } catch (error) {
    console.error('Error evaluating answer:', error);
    return evaluateAnswerLocally(answer);
  }
};

// Chat with AI interviewer
export const chatWithAI = async (messages, context = {}) => {
  try {
    console.log('Chat context:', context);
    
    // Return a random fallback response when OpenAI is rate limited
    const response = FALLBACK_CHAT_RESPONSES[
      Math.floor(Math.random() * FALLBACK_CHAT_RESPONSES.length)
    ];
    
    return {
      reply: response,
      feedback: {
        score: null,
        comments: 'Using fallback response due to API limitations'
      }
    };
  } catch (error) {
    console.error('Error in chat:', error);
    return {
      reply: FALLBACK_CHAT_RESPONSES[0],
      feedback: {
        score: null,
        comments: 'Error occurred, using fallback response'
      }
    };
  }
};
