<script>
  import QuizDashboard from '$lib/components/QuizDashboard.svelte';
  import QuestionInterface from '$lib/components/QuestionInterface.svelte';
  import { quizStore } from '$lib/stores/quizStore';
  
  $: hasActiveQuiz = $quizStore.currentQuestion !== null;
</script>

<div class="max-w-4xl mx-auto">
  {#if !hasActiveQuiz}
    <header class="text-center py-8">
      <h1 class="text-4xl font-bold mb-2">Quiz Study Assistant</h1>
      <p class="text-lg opacity-80">Improve your knowledge through adaptive learning</p>
    </header>
  {/if}

  <div class="space-y-8">
    {#if hasActiveQuiz}
      <div class="flex justify-between items-center pt-4">
        <h2 class="text-2xl font-semibold">Quiz Progress</h2>
        <button
          class="btn btn-ghost"
          on:click={() => quizStore.resetQuiz()}
        >
          Back to Dashboard
        </button>
      </div>
      <QuestionInterface />
    {:else}
      <QuizDashboard />
    {/if}
  </div>
</div>

