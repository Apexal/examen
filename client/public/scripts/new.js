const new_examen_app = new Vue({
  name: 'new-examen',
  el: '#new-examen',
  data: {
    stream: null,
    title: '',
    backingTrack: null,
    introduction: '',
    prompts: []
  },
  created: async function () {
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false
    });
  },
  methods: {
    addPrompt: function (event) {
      const prompt = {
        text: '',
        recorder: new MediaRecorder(this.stream),
        recording: false,
        delay: 30,
        chunks: [],
        src: null
      };

      prompt.recorder.addEventListener("dataavailable", event => {
        prompt.chunks.push(event.data);
      });

      prompt.recorder.onstop = () => {
        const audioBlob = new Blob(prompt.chunks);
        const audioUrl = URL.createObjectURL(audioBlob);
        prompt.src = audioUrl;
        alert('done!');
      }

      this.prompts.push(prompt);
      setTimeout(() => setupEditor(document.getElementById('prompt-' + (this.prompts.length - 1) + '-editor')), 100);
    },
    toggleRecording: function (index) {
      if (this.prompts[index].recording) {
        this.stopRecording(index);
      } else {
        this.startRecording(index);
      }

      this.prompts[index].recording = !this.prompts[index].recording;
    },
    startRecording: function (index) {
      this.prompts[index].chunks = [];
      this.prompts[index].src = null;
      this.prompts[index].recorder.start();
    },
    stopRecording: function (index) {
      this.prompts[index].recorder.stop();
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