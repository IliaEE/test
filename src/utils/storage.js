// Local storage keys
const STORAGE_KEYS = {
  INTERVIEWS: 'interviews',
  CURRENT_INTERVIEW: 'currentInterview',
  CANDIDATE_PROGRESS: 'candidateProgress',
};

// Save interviews data
export const saveInterviews = (interviews) => {
  localStorage.setItem(STORAGE_KEYS.INTERVIEWS, JSON.stringify(interviews));
};

// Get interviews data
export const getInterviews = () => {
  const data = localStorage.getItem(STORAGE_KEYS.INTERVIEWS);
  return data ? JSON.parse(data) : [];
};

// Save current interview data
export const saveCurrentInterview = (interview) => {
  localStorage.setItem(STORAGE_KEYS.CURRENT_INTERVIEW, JSON.stringify(interview));
};

// Get current interview data
export const getCurrentInterview = () => {
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_INTERVIEW);
  return data ? JSON.parse(data) : null;
};

// Save candidate progress
export const saveCandidateProgress = (progress) => {
  localStorage.setItem(STORAGE_KEYS.CANDIDATE_PROGRESS, JSON.stringify(progress));
};

// Get candidate progress
export const getCandidateProgress = () => {
  const data = localStorage.getItem(STORAGE_KEYS.CANDIDATE_PROGRESS);
  return data ? JSON.parse(data) : null;
};

// Clear candidate progress
export const clearCandidateProgress = () => {
  localStorage.removeItem(STORAGE_KEYS.CANDIDATE_PROGRESS);
};
