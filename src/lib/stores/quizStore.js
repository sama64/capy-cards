import { writable } from 'svelte/store';
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
  const { subscribe, set, update } = writable({
    questions: [],
    stats: loadStats(),
    questionQueue: [],
    currentQuestion: null,
  });

  return {
    subscribe,
    loadQuizzes: (questions) => {
      update(state => {
        const questionQueue = createQuestionQueue(questions, state.stats);
        return {
          ...state,
          questions,
          questionQueue,
          currentQuestion: questionQueue[0] || null,
        };
      });
    },
    answerQuestion: (answer) => {
      update(state => {
        if (!state.currentQuestion) return state;

        const isCorrect = answer === state.currentQuestion.correct_answer;
        const newStats = updateStats(state.stats, state.currentQuestion.id, isCorrect);
        const newQueue = state.questionQueue.slice(1);

        // If queue is empty, recreate it with updated stats
        const finalQueue = newQueue.length === 0 
          ? createQuestionQueue(state.questions, newStats) 
          : newQueue;

        // Save stats to localStorage
        saveStats(newStats);

        return {
          ...state,
          stats: newStats,
          questionQueue: finalQueue,
          currentQuestion: finalQueue[0] || null,
        };
      });
    },
    resetQuiz: () => {
      set({
        questions: [],
        stats: loadStats(), // Keep the stats when resetting the quiz
        questionQueue: [],
        currentQuestion: null,
      });
    },
    clearStats: () => {
      update(state => {
        if (browser) {
          localStorage.removeItem(STATS_STORAGE_KEY);
        }
        return {
          ...state,
          stats: {},
          questionQueue: createQuestionQueue(state.questions, {}),
        };
      });
    }
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