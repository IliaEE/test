const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
});

const getExperienceLevelPrompt = (level) => {
  const prompts = {
    junior: `
      Focus on fundamental concepts and basic implementations.
      - Assess understanding of core programming concepts
      - Include questions about basic data structures and algorithms
      - Ask about common programming patterns and practices
      - Keep technical scenarios simple and straightforward
      - Include questions about debugging and problem-solving approaches
    `,
    mid: `
      Focus on practical experience and system design considerations.
      - Include questions about design patterns and best practices
      - Ask about optimization and performance considerations
      - Include scenarios about scaling and maintainability
      - Test knowledge of advanced programming concepts
      - Include questions about testing and deployment
    `,
    senior: `
      Focus on architecture, leadership, and complex problem-solving.
      - Include questions about system architecture and design
      - Ask about managing technical debt and refactoring
      - Include scenarios about team leadership and mentoring
      - Test knowledge of distributed systems and scalability
      - Include questions about technical strategy and trade-offs
    `
  };
  return prompts[level] || prompts.junior;
};

const getDifficultyProgression = (questionNumber, totalQuestions) => {
  const progress = questionNumber / totalQuestions;
  if (progress < 0.3) return 'Start with fundamental concepts to assess baseline knowledge.';
  if (progress < 0.6) return 'Move to intermediate topics to test deeper understanding.';
  if (progress < 0.9) return 'Present advanced scenarios to evaluate expert knowledge.';
  return 'Conclude with complex, open-ended questions to assess overall expertise.';
};

app.post('/api/interview/question', async (req, res) => {
  try {
    const { systemPrompt, userPrompt, position, level = 'junior' } = req.body;
    const experienceLevelPrompt = getExperienceLevelPrompt(level.toLowerCase());
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { 
          role: "system", 
          content: `${systemPrompt}
            ${experienceLevelPrompt}
            
            Guidelines for question generation:
            1. Ensure questions are clear, specific, and unambiguous
            2. Include a mix of theoretical concepts and practical scenarios
            3. When appropriate, ask for code examples or system design approaches
            4. Align difficulty with the candidate's experience level
            5. Focus on real-world applications and problem-solving
            
            Position-specific focus for ${position}:
            - Include questions relevant to daily tasks in this role
            - Test both theoretical knowledge and practical skills
            - Consider modern tools and technologies used in this field`
        },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.8,
      max_tokens: 500,
    });
    res.json({ response: response.choices[0].message.content });
  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).json({ error: 'Failed to generate question' });
  }
});

app.post('/api/interview/evaluate', async (req, res) => {
  try {
    const { question, answer, questionNumber, totalQuestions, level = 'junior', position } = req.body;
    const experienceLevelPrompt = getExperienceLevelPrompt(level.toLowerCase());
    const difficultyProgression = getDifficultyProgression(questionNumber, totalQuestions);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { 
          role: "system", 
          content: `You are evaluating technical interview responses for a ${level} ${position} position.
            ${experienceLevelPrompt}
            
            Evaluation Guidelines:
            1. Score from 0-100 based on:
               - Technical accuracy (40%)
               - Problem-solving approach (30%)
               - Communication clarity (20%)
               - Best practices & standards (10%)
            
            2. Consider the candidate's experience level when scoring
            3. Provide constructive feedback with specific improvements
            4. If generating next question:
               ${difficultyProgression}
            
            Format your response as follows:
            Score: [0-100]
            Feedback: [detailed evaluation with specific examples]
            Areas for Improvement: [concrete suggestions]
            Next Question: [if not final question]`
        },
        { 
          role: "user", 
          content: `Question ${questionNumber}/${totalQuestions}:
            ${question}
            
            Candidate's Answer:
            ${answer}
            
            Note: This is a ${level}-level position for ${position}.`
        }
      ],
      temperature: 0.7,
      max_tokens: 800,
    });
    res.json({ response: response.choices[0].message.content });
  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).json({ error: 'Failed to evaluate answer' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
