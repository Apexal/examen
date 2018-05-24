const new_examen_app = new Vue({
  el: '#new-examen',
  data: {
    introduction: '',
    prompts: [{
      text: '',
      recording: false,
      delay: 30,
      chunks: []
    }]
  },
  methods: {
    addPrompt: function (event) {
      this.prompts.push({
        text: '',
        recording: false,
        delay: 30,
        chunks: []
      });
      setTimeout(() => setupEditor(document.getElementById('prompt-' + (this.prompts.length - 1) + '-editor')), 100);
    }
  }
});

const options = {
  debug: 'info',
  placeholder: 'Compose an epic...',
  theme: 'snow'
};

function setupEditor(editor) {
  let editing = editor.dataset.editing;
  let target = document.getElementById(editing);
  let quill = new Quill(editor, options);

  if (editing == 'introduction') {
    quill.on('text-change', function (delta, oldDelta, source) {
      new_examen_app.introduction = editor.firstChild.innerHTML;
    });

    return;
  }

  let prompt = target.dataset.prompt;

  quill.on('text-change', function (delta, oldDelta, source) {
    new_examen_app.prompts[prompt].text = editor.firstChild.innerHTML;
    //Vue.set(new_examen_app.prompts, prompt, 'text', editor.firstChild.innerHTML);
  });
}

document.querySelectorAll('.editor.prompt-editor').forEach(setupEditor);
setupEditor(document.querySelector('.editor.introduction-editor'));


// -------------------------------------------------------------------------

document.querySelectorAll('.audio input.recorder').forEach(function(recorder) {
  const player = document.getElementById(recorder.dataset.target);
  const chunks = [];

  const handleSuccess = function(stream) {
    const mediaRecorder = new MediaRecorder(stream);

  };

  navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      .then(handleSuccess);


  recorder.addEventListener('change', function(e) {
    let file = e.target.files[0];
    // Do something with the audio file.
    player.src =  URL.createObjectURL(file);
  });

});