import { 
    collection, 
    doc, 
    getDoc, 
    getDocs, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    query, 
    where, 
    onSnapshot,
    serverTimestamp 
} from 'firebase/firestore';
import { useFirebase } from '../contexts/FirebaseContext';

// Generate a random interview code
const generateInterviewCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 5; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};

// Interview Functions
export const getInterviewByCode = async (db, code) => {
    const interviewsRef = collection(db, 'interviews');
    const q = query(interviewsRef, where('code', '==', code));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
        return null;
    }
    
    const interview = {
        id: querySnapshot.docs[0].id,
        ...querySnapshot.docs[0].data()
    };

    // Check if interview is still active
    const endDate = new Date(interview.endDate);
    const now = new Date();
    interview.status = endDate >= now ? 'active' : 'inactive';
    
    return interview;
};

export const createInterview = async (db, interviewData) => {
    const interviewsRef = collection(db, 'interviews');
    
    // Generate a unique code
    let code;
    let isUnique = false;
    
    while (!isUnique) {
        code = generateInterviewCode();
        // Check if code already exists
        const q = query(interviewsRef, where('code', '==', code));
        const querySnapshot = await getDocs(q);
        isUnique = querySnapshot.empty;
    }
    
    const interview = {
        ...interviewData,
        code,
        createdAt: serverTimestamp(),
        status: new Date(interviewData.endDate) >= new Date() ? 'active' : 'inactive',
        candidates: [],
        questions: [],
        answers: {},
        evaluations: {}
    };
    
    const docRef = await addDoc(interviewsRef, interview);
    
    return {
        id: docRef.id,
        code
    };
};

export const getCompanyInterviews = async (db, companyId) => {
    const interviewsRef = collection(db, 'interviews');
    const q = query(interviewsRef, where('companyId', '==', companyId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
};

export const deleteInterview = async (db, interviewId) => {
    const interviewRef = doc(db, 'interviews', interviewId);
    await deleteDoc(interviewRef);
};

export const subscribeToInterview = (db, interviewId, callback) => {
    const interviewRef = doc(db, 'interviews', interviewId);
    return onSnapshot(interviewRef, (doc) => {
        if (doc.exists()) {
            callback({ id: doc.id, ...doc.data() });
        }
    });
};

export const saveCandidateInfo = async (db, interviewId, candidateInfo) => {
    const interviewRef = doc(db, 'interviews', interviewId);
    await updateDoc(interviewRef, {
        candidate: candidateInfo,
        startedAt: serverTimestamp()
    });
};

export const submitAnswer = async (db, interviewId, questionIndex, answer) => {
    const interviewRef = doc(db, 'interviews', interviewId);
    const interview = await getDoc(interviewRef);
    
    if (!interview.exists()) {
        throw new Error('Interview not found');
    }
    
    const answers = interview.data().answers || {};
    answers[questionIndex] = answer;
    
    await updateDoc(interviewRef, { answers });
    return answers;
};

export const completeInterview = async (db, interviewId) => {
    const interviewRef = doc(db, 'interviews', interviewId);
    await updateDoc(interviewRef, {
        status: 'completed',
        completedAt: serverTimestamp()
    });
};
