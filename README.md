# Quiz Study Assistant

A Svelte-based web application for efficient exam preparation through adaptive quiz repetition.

## Features
- 📁 JSON file management
  - Load multiple quiz files
  - Group quizzes by category
  - Persistent local storage
- 🧠 Adaptive learning algorithm
  - Focus on weak areas
  - Spaced repetition system
- 📊 Progress tracking
  - Real-time performance stats
  - Session persistence
  - Historical success rates
- 🎯 Quiz interface
  - Multiple choice questions
  - Instant feedback
  - Progress indicator

## Project Structure
/src
├── lib
│ ├── components
│ │ ├── FileUploader.svelte // Drag-and-drop JSON upload
│ │ ├── QuizSelector.svelte // Quiz category selection
│ │ └── QuestionInterface.svelte // Main quiz UI
│ ├── services
│ │ ├── storage.js // localStorage wrapper
│ │ └── algorithm.js // Question weighting logic
│ └── stores
│ └── quizStore.js // Svelte store for state management
└── routes
└── +page.svelte // Main entry point
```

## Key Implementation Details

### Adaptive Algorithm (`algorithm.js`)

```javascript
function createQuestionQueue(questions, stats) {
return questions.flatMap(q => {
const successRate = stats[q.id]?.successRate || 0;
const weight = Math.max(1, 5 - Math.floor(successRate 5));
return Array(weight).fill(q);
}).sort(() => Math.random() - 0.5);
}
function updateStats(stats, questionId, isCorrect) {
const entry = stats[questionId] || { attempts: 0, correct: 0 };
entry.attempts++;
if(isCorrect) entry.correct++;
entry.successRate = entry.correct / entry.attempts;
return { ...stats, [questionId]: entry };
}
```

### Data Persistence (`storage.js`)

```javascript
const QUIZ_STORAGE_KEY = 'quizData';
const STATS_STORAGE_KEY = 'quizStats';

export const storage = {
  saveQuizzes(quizzes) {
    localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(quizzes));
  },
  loadQuizzes() {
    return JSON.parse(localStorage.getItem(QUIZ_STORAGE_KEY) || '[]');
  },
  saveStats(stats) {
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
  },
  loadStats() {
    return JSON.parse(localStorage.getItem(STATS_STORAGE_KEY) || '{}');
  }
};
```

## JSON File Format
```json
[
  {
    "id": "unique-question-id",
    "question": "Question text",
    "options": [
      {
        "key": "a",
        "text": "Option text"
      }
    ],
    "correct_answer": "a"
  }
]
```

## Development Setup
```bash
npm install
npm run dev
```

## Future Enhancements
- Dark mode toggle
- Progress visualization charts
- Export/import statistics
- Question type variants (true/false, multi-select)