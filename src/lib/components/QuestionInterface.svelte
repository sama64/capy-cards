<script>
  import { quizStore } from '$lib/stores/quizStore';
  
  let selectedAnswer = '';
  let showFeedback = false;
  let isCorrect = false;
  
  $: currentQuestion = $quizStore.currentQuestion;
  $: stats = $quizStore.stats;
  $: questions = $quizStore.questions;
  $: questionQueue = $quizStore.questionQueue;
  $: uniqueQuestionsAnswered = new Set(
    questions.filter(q => stats[q.id]?.attempts > 0).map(q => q.id)
  ).size;
  $: progress = {
    total: questions.length,
    completed: uniqueQuestionsAnswered,
    remaining: questions.length - uniqueQuestionsAnswered
  };
  
  function handleAnswer() {
    if (!currentQuestion || !selectedAnswer) return;
    
    isCorrect = selectedAnswer === currentQuestion.correct_answer;
    showFeedback = true;
    
    setTimeout(() => {
      quizStore.answerQuestion(selectedAnswer);
      selectedAnswer = '';
      showFeedback = false;
    }, 1500);
  }
</script>

<div class="space-y-4">
  <div class="flex items-center gap-4">
    <button
      class="btn btn-ghost btn-circle"
      on:click={() => quizStore.resetQuiz()}
      aria-label="Back to Dashboard"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
    </button>
    
    <div class="flex-1">
      <div class="stats shadow w-full">
        <div class="stat py-2">
          <div class="stat-title text-sm">Progress</div>
          <div class="stat-value text-lg">
            {progress.completed} / {progress.total}
          </div>
          <div class="stat-desc text-xs">Unique questions completed</div>
        </div>
      </div>
    </div>
  </div>

  {#if currentQuestion}
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body p-4 sm:p-6">
        <h2 class="card-title text-lg sm:text-xl">{currentQuestion.question}</h2>
        <div class="space-y-2 mt-3">
          {#each currentQuestion.options as option}
            <label
              class="flex items-center p-3 rounded-lg cursor-pointer transition-colors"
              class:bg-base-200={selectedAnswer !== option.key}
              class:bg-primary={selectedAnswer === option.key}
              class:bg-success={showFeedback && option.key === currentQuestion.correct_answer}
              class:bg-error={showFeedback && selectedAnswer === option.key && !isCorrect}
            >
              <input
                type="radio"
                name="answer"
                value={option.key}
                bind:group={selectedAnswer}
                disabled={showFeedback}
                class="radio radio-primary radio-sm mr-3"
              />
              <span class="flex-1 text-sm sm:text-base">{option.text}</span>
            </label>
          {/each}
        </div>
        
        <div class="card-actions justify-end mt-4">
          <button
            class="btn btn-primary btn-sm sm:btn-md"
            disabled={!selectedAnswer || showFeedback}
            on:click={handleAnswer}
          >
            Submit Answer
          </button>
        </div>
      </div>
    </div>
    
    {#if showFeedback}
      <div
        class="alert p-2"
        class:alert-success={isCorrect}
        class:alert-error={!isCorrect}
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {#if isCorrect}
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          {:else}
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          {/if}
        </svg>
        <span class="text-sm">{isCorrect ? 'Correct!' : 'Incorrect. Try again!'}</span>
      </div>
    {/if}
  {:else}
    <div class="alert alert-success p-3">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span class="text-sm">Quiz completed! Return to dashboard to try another quiz or restart this one.</span>
    </div>
  {/if}
</div> 