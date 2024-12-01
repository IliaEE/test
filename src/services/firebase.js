import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  where,
  orderBy,
  updateDoc,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { evaluateAnswer } from './openai';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Collection names
const COLLECTIONS = {
  INTERVIEWS: 'interviews',
  CANDIDATES: 'candidates',
  RESPONSES: 'responses'
};

// Firebase service functions
const firebaseService = {
  /**
   * Create a new interview
   * @param {object} interviewData - Interview data
   * @returns {object} Created interview
   */
  createInterview: async (interviewData) => {
    try {
      console.log('Creating interview with data:', interviewData);
      
      if (!interviewData.position || !interviewData.companyId) {
        throw new Error('Missing required fields: position and companyId are required');
      }

      // Generate a unique 6-character code
      const code = uuidv4().substring(0, 6).toUpperCase();
      
      // Create interview document with initial structure
      const interview = {
        ...interviewData,
        code,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'active',
        skills: interviewData.skills || [],
        level: interviewData.level || 'middle',
        answers: {},
        evaluations: {},
        totalScore: 0,
        questions: [
          {
            id: '1',
            type: 'coding',
            content: 'Write a function to reverse a string without using built-in reverse methods.',
            expectedAnswer: 'function reverseString(str) {\n  let result = "";\n  for (let i = str.length - 1; i >= 0; i--) {\n    result += str[i];\n  }\n  return result;\n}',
            maxScore: 10
          },
          {
            id: '2',
            type: 'theory',
            content: 'Explain the difference between var, let, and const in JavaScript.',
            expectedAnswer: 'var is function-scoped and can be redeclared, let and const are block-scoped. let can be reassigned, const cannot be reassigned but its properties can be modified.',
            maxScore: 10
          }
        ]
      };

      const docRef = await addDoc(collection(db, COLLECTIONS.INTERVIEWS), interview);
      console.log('Interview created successfully:', docRef.id);
      
      return { 
        id: docRef.id, 
        ...interview,
        createdAt: new Date().toISOString() 
      };
    } catch (error) {
      console.error('Error creating interview:', error);
      throw new Error(error.message || 'Failed to create interview');
    }
  },

  /**
   * Get all interviews for a company
   * @param {string} companyId - Company ID
   * @returns {array} Interviews for the company
   */
  getCompanyInterviews: async (companyId) => {
    try {
      console.log('Fetching interviews for company:', companyId);
      
      if (!companyId) {
        throw new Error('CompanyId is required');
      }

      const interviewsQuery = query(
        collection(db, COLLECTIONS.INTERVIEWS),
        where('companyId', '==', companyId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(interviewsQuery);
      const interviews = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date()
      }));

      console.log('Successfully fetched interviews:', interviews.length);
      return interviews;
    } catch (error) {
      console.error('Error fetching interviews:', error);
      throw new Error('Failed to fetch interviews. Please try again.');
    }
  },

  /**
   * Delete an interview
   * @param {string} interviewId - Interview ID
   */
  deleteInterview: async (interviewId) => {
    try {
      console.log('Deleting interview:', interviewId);
      
      if (!interviewId) {
        throw new Error('InterviewId is required');
      }

      await deleteDoc(doc(db, COLLECTIONS.INTERVIEWS, interviewId));
      console.log('Interview deleted successfully');
    } catch (error) {
      console.error('Error deleting interview:', error);
      throw new Error('Failed to delete interview');
    }
  },

  /**
   * Get a specific interview by code
   * @param {string} code - Interview code
   * @returns {object} Interview
   */
  getInterviewByCode: async (code) => {
    try {
      console.log('Fetching interview by code:', code);
      
      if (!code) {
        throw new Error('Interview code is required');
      }

      const interviewQuery = query(
        collection(db, COLLECTIONS.INTERVIEWS),
        where('code', '==', code)
      );

      const querySnapshot = await getDocs(interviewQuery);
      
      if (querySnapshot.empty) {
        throw new Error('Interview not found');
      }

      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date()
      };
    } catch (error) {
      console.error('Error fetching interview by code:', error);
      throw new Error(error.message || 'Failed to fetch interview');
    }
  },

  /**
   * Subscribe to real-time interview updates
   * @param {string} code - Interview code
   * @param {function} callback - Callback function
   */
  subscribeToInterview: (code, callback) => {
    const interviewQuery = query(
      collection(db, COLLECTIONS.INTERVIEWS),
      where('code', '==', code)
    );
    
    return onSnapshot(interviewQuery, (snapshot) => {
      if (snapshot.empty) {
        callback(null);
        return;
      }
      
      const doc = snapshot.docs[0];
      callback({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date()
      });
    }, (error) => {
      console.error('Error subscribing to interview:', error);
      callback(null);
    });
  },

  /**
   * Save candidate information
   * @param {string} interviewId - Interview ID
   * @param {object} candidateInfo - Candidate information
   * @returns {object} Saved candidate information
   */
  saveCandidateInfo: async (interviewId, candidateInfo) => {
    try {
      console.log('Saving candidate info for interview:', interviewId);
      
      const candidate = {
        ...candidateInfo,
        interviewId,
        createdAt: serverTimestamp(),
        status: 'in_progress'
      };

      const docRef = await addDoc(collection(db, COLLECTIONS.CANDIDATES), candidate);
      console.log('Candidate info saved:', docRef.id);

      // Update interview with candidate reference
      await updateDoc(doc(db, COLLECTIONS.INTERVIEWS, interviewId), {
        candidateId: docRef.id,
        status: 'in_progress',
        updatedAt: serverTimestamp()
      });

      return {
        id: docRef.id,
        ...candidate,
        createdAt: new Date()
      };
    } catch (error) {
      console.error('Error saving candidate info:', error);
      throw new Error('Failed to save candidate information');
    }
  },

  /**
   * Submit answer
   * @param {string} interviewId - Interview ID
   * @param {number} questionIndex - Question index
   * @param {string} answer - Answer
   * @returns {object} Evaluation
   */
  submitAnswer: async (interviewId, questionIndex, answer) => {
    try {
      console.log('Submitting answer for question:', questionIndex);
      
      // Get interview document reference
      const interviewRef = doc(db, COLLECTIONS.INTERVIEWS, interviewId);
      
      // Save response data
      const responseData = {
        answer,
        submittedAt: serverTimestamp()
      };

      // Get evaluation from OpenAI
      const evaluation = await evaluateAnswer(
        { content: answer },
        answer,
        { type: 'coding', maxScore: 10 }
      );

      // Update interview document with new answer and evaluation
      await updateDoc(interviewRef, {
        [`answers.${questionIndex}`]: answer,
        [`evaluations.${questionIndex}`]: evaluation,
        updatedAt: serverTimestamp()
      });

      return evaluation;
    } catch (error) {
      console.error('Error submitting answer:', error);
      throw new Error('Failed to submit answer');
    }
  },

  /**
   * Complete interview
   * @param {string} interviewId - Interview ID
   */
  completeInterview: async (interviewId) => {
    try {
      console.log('Completing interview:', interviewId);
      
      await updateDoc(doc(db, COLLECTIONS.INTERVIEWS, interviewId), {
        status: 'completed',
        completedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      console.log('Interview completed successfully');
    } catch (error) {
      console.error('Error completing interview:', error);
      throw new Error('Failed to complete interview');
    }
  }
};

// Export all functions
export const {
  createInterview,
  getCompanyInterviews,
  deleteInterview,
  getInterviewByCode,
  subscribeToInterview,
  saveCandidateInfo,
  submitAnswer,
  completeInterview
} = firebaseService;
