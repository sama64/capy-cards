<script>
  import { quizStore } from '$lib/stores/quizStore';
  
  export let onQuizLoad = (questions, file) => {
    quizStore.loadQuizzes(questions);
  };
  
  let dragActive = false;
  
  function handleDragEnter(e) {
    e.preventDefault();
    dragActive = true;
  }
  
  function handleDragLeave(e) {
    e.preventDefault();
    dragActive = false;
  }
  
  function handleDrop(e) {
    e.preventDefault();
    dragActive = false;
    
    const files = Array.from(e.dataTransfer?.files || []);
    handleFiles(files);
  }
  
  function handleFileInput(e) {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  }
  
  async function handleFiles(files) {
    for (const file of files) {
      if (file.type === 'application/json') {
        try {
          const text = await file.text();
          const json = JSON.parse(text);
          onQuizLoad(json, file);
        } catch (error) {
          console.error('Error loading quiz file:', error);
          alert('Error loading quiz file. Please make sure it\'s valid JSON.');
        }
      }
    }
  }
</script>

<div
  class="border-4 border-dashed rounded-lg p-8 text-center transition-colors min-h-[200px] flex items-center justify-center"
  class:border-primary={dragActive}
  class:border-base-content={!dragActive}
  on:dragenter={handleDragEnter}
  on:dragleave={handleDragLeave}
  on:dragover|preventDefault
  on:drop={handleDrop}
>
  <div class="flex flex-col items-center gap-6">
    <div class="w-12 h-12 flex items-center justify-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="w-full h-full"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
        />
      </svg>
    </div>
    <div class="text-lg font-medium">
      Drag and drop your quiz file here<br />
      or
    </div>
    <label class="btn btn-primary">
      Choose file
      <input
        type="file"
        accept="application/json"
        on:change={handleFileInput}
        class="hidden"
      />
    </label>
  </div>
</div> 