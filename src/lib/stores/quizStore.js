import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';

const STATS_STORAGE_KEY = 'quiz_stats';

function loadStats() {
  if (!browser) return {};
  const savedStats = localStorage.getItem(STATS_STORAGE_KEY);
  return savedStats ? JSON.parse(savedStats) : {};
}

function saveStats(stats) {
  if (!browser) return;
  localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
}

function createQuizStore() {
  const store = writable({
    questions: [],
    currentQuestion: null,
    questionQueue: [],
    sessionQueue: [],
    stats: loadStats(),
  });

  return {
    subscribe: store.subscribe,
    
    setQuestions: (questions) => {
      const initialQueue = [...questions].sort(() => Math.random() - 0.5);
      store.update(s => ({
        ...s,
        questions,
        questionQueue: initialQueue,
        sessionQueue: [...initialQueue],
        currentQuestion: initialQueue[0] || null,
      }));
    },
    
    answerQuestion: (answer) => {
      store.update(s => {
        const currentQuestion = s.currentQuestion;
        if (!currentQuestion) return s;
        
        // Update stats
        const questionStats = s.stats[currentQuestion.id] || { attempts: 0, correct: 0, successRate: 0 };
        const isCorrect = answer === currentQuestion.correct_answer;
        const newStats = {
          attempts: questionStats.attempts + 1,
          correct: questionStats.correct + (isCorrect ? 1 : 0),
          successRate: (questionStats.correct + (isCorrect ? 1 : 0)) / (questionStats.attempts + 1),
        };
        
        // Save stats to localStorage
        const updatedStats = { ...s.stats, [currentQuestion.id]: newStats };
        saveStats(updatedStats);
        
        // Update the main queue order based on success rate
        const updatedQueue = [...s.questionQueue];
        if (!isCorrect) {
          // Move the question to a later position in the main queue
          const currentIndex = updatedQueue.findIndex(q => q.id === currentQuestion.id);
          if (currentIndex !== -1) {
            const question = updatedQueue.splice(currentIndex, 1)[0];
            const newPosition = Math.min(currentIndex + 3, updatedQueue.length);
            updatedQueue.splice(newPosition, 0, question);
          }
        }
        
        // For the session, just move to the next question in the fixed session order
        const currentSessionIndex = s.sessionQueue.findIndex(q => q.id === currentQuestion.id);
        const nextQuestion = currentSessionIndex < s.sessionQueue.length - 1 
          ? s.sessionQueue[currentSessionIndex + 1] 
          : null;
        
        return {
          ...s,
          questionQueue: updatedQueue,
          currentQuestion: nextQuestion,
          stats: updatedStats,
        };
      });
    },
    
    resetQuiz: () => {
      store.update(s => ({
        ...s,
        currentQuestion: null,
        questionQueue: [],
        sessionQueue: [],
      }));
    },

    clearStats: () => {
      if (browser) {
        localStorage.removeItem(STATS_STORAGE_KEY);
      }
      store.update(s => ({
        ...s,
        stats: {},
      }));
    },

    getQuizStats: (quizId) => {
      const state = get(store);
      const stats = state.stats;
      
      // Filter stats for questions belonging to this quiz
      const quizStats = Object.entries(stats)
        .filter(([id]) => id.startsWith(`${quizId}_`))
        .map(([_, stat]) => stat);
      
      if (quizStats.length === 0) return { attempts: 0, correct: 0, successRate: 0 };
      
      // Calculate aggregate stats
      const totalAttempts = quizStats.reduce((sum, stat) => sum + stat.attempts, 0);
      const totalCorrect = quizStats.reduce((sum, stat) => sum + stat.correct, 0);
      
      return {
        attempts: totalAttempts,
        correct: totalCorrect,
        successRate: totalCorrect / totalAttempts,
      };
    },
  };
}

function createQuestionQueue(questions, stats) {
  return questions
    .flatMap(q => {
      const successRate = stats[q.id]?.successRate || 0;
      const weight = Math.max(1, 5 - Math.floor(successRate * 5));
      return Array(weight).fill(q);
    })
    .sort(() => Math.random() - 0.5);
}

function updateStats(stats, questionId, isCorrect) {
  const entry = stats[questionId] || { attempts: 0, correct: 0 };
  entry.attempts++;
  if (isCorrect) entry.correct++;
  entry.successRate = entry.correct / entry.attempts;
  return { ...stats, [questionId]: entry };
}

export const quizStore = createQuizStore(); 