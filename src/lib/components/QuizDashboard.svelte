<script>
  import { quizStore } from '$lib/stores/quizStore';
  import FileUploader from './FileUploader.svelte';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  
  let quizFiles = [];
  const STORAGE_KEY = 'quiz_files';
  
  onMount(() => {
    if (browser) {
      // Load saved quizzes on component mount
      const savedQuizzes = localStorage.getItem(STORAGE_KEY);
      if (savedQuizzes) {
        quizFiles = JSON.parse(savedQuizzes);
      }
    }
  });
  
  function handleQuizSelect(questions, name) {
    quizStore.loadQuizzes(questions);
  }
  
  function removeQuiz(index) {
    quizFiles = quizFiles.filter((_, i) => i !== index);
    saveQuizzes();
  }
  
  function addQuiz(questions, file) {
    quizFiles = [...quizFiles, { name: file.name, questions }];
    saveQuizzes();
  }
  
  function saveQuizzes() {
    if (browser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(quizFiles));
    }
  }
</script>

<div class="space-y-8">
  {#if quizFiles.length > 0}
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <div class="flex justify-between items-center mb-4">
          <h2 class="card-title">Available Quizzes</h2>
          <button
            class="btn btn-ghost btn-sm"
            on:click={() => quizStore.clearStats()}
          >
            Reset All Progress
          </button>
        </div>
        <div class="grid gap-4 md:grid-cols-2">
          {#each quizFiles as { name, questions }, i}
            <div class="card bg-base-200">
              <div class="card-body">
                <h3 class="card-title text-lg">{name}</h3>
                <p class="text-sm opacity-70">{questions.length} questions</p>
                <div class="card-actions justify-end mt-4">
                  <button
                    class="btn btn-error btn-sm"
                    on:click={() => removeQuiz(i)}
                  >
                    Remove
                  </button>
                  <button
                    class="btn btn-primary btn-sm"
                    on:click={() => handleQuizSelect(questions, name)}
                  >
                    Start Quiz
                  </button>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  {/if}

  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <h2 class="card-title">Upload New Quiz</h2>
      <FileUploader onQuizLoad={addQuiz} />
    </div>
  </div>
</div> 