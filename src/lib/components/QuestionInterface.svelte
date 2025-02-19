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

<div class="space-y-6">
  <div class="flex flex-col space-y-4">
    <div class="stats shadow w-full">
      <div class="stat">
        <div class="stat-title">Progress</div>
        <div class="stat-value text-lg">
          {progress.completed} / {progress.total}
        </div>
        <div class="stat-desc">Unique questions completed</div>
      </div>
    </div>
    <div class="w-full bg-base-200 rounded-lg p-2">
      <progress 
        class="progress progress-primary w-full" 
        value={progress.completed} 
        max={progress.total}
      ></progress>
    </div>
  </div>

  {#if currentQuestion}
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title text-xl">{currentQuestion.question}</h2>
        <div class="space-y-4 mt-4">
          {#each currentQuestion.options as option}
            <label
              class="flex items-center p-4 rounded-lg cursor-pointer transition-colors"
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
                class="radio radio-primary mr-4"
              />
              <span class="flex-1">{option.text}</span>
            </label>
          {/each}
        </div>
        
        <div class="card-actions justify-end mt-6">
          <button
            class="btn btn-primary"
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
        class="alert"
        class:alert-success={isCorrect}
        class:alert-error={!isCorrect}
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {#if isCorrect}
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          {:else}
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          {/if}
        </svg>
        <span>{isCorrect ? 'Correct!' : 'Incorrect. Try again!'}</span>
      </div>
    {/if}
    
    {#if stats[currentQuestion.id]}
      <div class="stats shadow w-full">
        <div class="stat">
          <div class="stat-title">Success Rate</div>
          <div class="stat-value">
            {Math.round(stats[currentQuestion.id].successRate * 100)}%
          </div>
          <div class="stat-desc">
            {stats[currentQuestion.id].correct} / {stats[currentQuestion.id].attempts} attempts
          </div>
        </div>
      </div>
    {/if}
  {:else}
    <div class="alert alert-success">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>Quiz completed! Return to dashboard to try another quiz or restart this one.</span>
    </div>
  {/if}
</div> 