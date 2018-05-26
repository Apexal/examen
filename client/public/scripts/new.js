const new_examen_app = new Vue({
  name: 'new-examen',
  el: '#new-examen',
  data: {
    stream: null,
    title: '',
    backingTrack: null,
    introduction: '',
    closing: '',
    prompts: []
  },
  created: async function () {
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false
    });
  },
  methods: {
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

      prompt.recorder.addEventListener("dataavailable", event => {
        prompt.chunks.push(event.data);
      });

      prompt.recorder.onstop = () => {
        const audioBlob = new Blob(prompt.chunks, {
          type: 'audio/mp3'
        });
        const audioUrl = URL.createObjectURL(audioBlob);
        prompt.blob = audioBlob;
        prompt.src = audioUrl;
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
    },
    getFormData: function () {

      const fd = new FormData();
      fd.append('title', this.title);
      fd.append('introduction', this.introduction);
      fd.append('backingTrack', document.getElementById('backing-track').files[0]);
      fd.append('prompts', JSON.stringify(this.prompts.map(p => p.text)));
      fd.append('delays', JSON.stringify(this.prompts.map(p => parseInt(p.delay))));
      this.prompts.forEach(p => fd.append('recordings', p.blob));
      fd.append('closing', this.closing);
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
  let target = document.getElementById(editing);
  let quill = new Quill(editor, options);

  if (editing == 'introduction' || editing == 'closing') {
    quill.on('text-change', function (delta, oldDelta, source) {
      new_examen_app[editing] = editor.firstChild.innerHTML;
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
setupEditor(document.querySelector('.editor.closing-editor'));