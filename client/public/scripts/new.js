const new_examen_app = new Vue({
  name: 'new-examen',
  el: '#new-examen',
  data: {
    stream: null,
    title: '',
    backingTrack: null,
    introduction: {
      text: '',
      recorder: null,
      recording: false,
      delay: 30,
      chunks: [],
      src: null,
      blob: null
    },
    closing: {
      text: '',
      recorder: null,
      recording: false,
      delay: 30,
      chunks: [],
      src: null,
      blob: null
    },
    prompts: []
  },
  created: async function () {
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false
    });

    this.introduction.recorder = new MediaRecorder(this.stream);
    this.setupEvents(this.introduction);
    this.closing.recorder = new MediaRecorder(this.stream);
    this.setupEvents(this.closing);
  },
  methods: {
    setupEvents: target => {
      target.recorder.addEventListener("dataavailable", event => {
        target.chunks.push(event.data);
      });

      target.recorder.onstop = () => {
        const audioBlob = new Blob(target.chunks, {
          type: 'audio/mp3'
        });
        const audioUrl = URL.createObjectURL(audioBlob);
        target.blob = audioBlob;
        target.src = audioUrl;
        target.load();
      }
    },
    handleSubmit: function (event) {
      if (!confirm('Are you sure you want to post this new examen?')) return false;
      if (this.prompts.length === 0) return alert('You must add at least one prompt!');

      const request = new XMLHttpRequest();
      request.open('POST', '/examen/new');
      request.send(this.getFormData());

      request.onload = () => window.location.href = "/examen/archive";
    },
    addPrompt: function (event) {
      const prompt = {
        text: '',
        recorder: new MediaRecorder(this.stream),
        recording: false,
        delay: 30,
        chunks: [],
        src: null,
        blob: null
      };

      this.setupEvents(prompt);

      this.prompts.push(prompt);
      setTimeout(() => setupEditor(document.getElementById('prompt-' + (this.prompts.length - 1) + '-editor')), 100);
    },
    toggleRecording: function (index) {
      const target = typeof index === 'number' ? this.prompts[index] : this[index];
      console.log(target);
      if (target.recording) {
        this.stopRecording(index);
      } else {
        this.startRecording(index);
      }

      target.recording = !target.recording;
    },
    startRecording: function (index) {
      const target = typeof index === 'number' ? this.prompts[index] : this[index];
      target.chunks = [];
      target.src = null;
      target.recorder.start();
    },
    stopRecording: function (index) {
      const target = typeof index === 'number' ? this.prompts[index] : this[index];
      target.recorder.stop();
    },
    getFormData: function () {

      const fd = new FormData();
      fd.append('title', this.title);

      fd.append('introduction', this.introduction.text);
      fd.append('introductionRecording', this.introduction.blob);

      fd.append('backingTrack', document.getElementById('backing-track').files[0]);
      fd.append('prompts', JSON.stringify(this.prompts.map(p => p.text)));
      fd.append('delays', JSON.stringify(this.prompts.map(p => p.delay)));
      this.prompts.forEach(p => fd.append('recordings', p.blob));

      fd.append('closing', this.closing.text);
      fd.append('closingRecording', this.closing.blob);
      return fd;
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
  let quill = new Quill(editor, options);

  let prompt = parseInt(editor.dataset.prompt);
  let thing = isNaN(prompt) ? new_examen_app[editing] : new_examen_app.prompts[parseInt(prompt)];

  quill.on('text-change', function (delta, oldDelta, source) {
    thing.text = editor.firstChild.innerHTML;
    //Vue.set(new_examen_app.prompts, prompt, 'text', editor.firstChild.innerHTML);
  });
}

document.querySelectorAll('.editor.prompt-editor').forEach(setupEditor);
setupEditor(document.querySelector('.editor.introduction-editor'));
setupEditor(document.querySelector('.editor.closing-editor'));