const default_introduction = `<p>Let us continue together the practice of the Examen. Please sit comfortably. Put everything out of your hands. Try to be silent and still. Close your eyes if you wish. If you are in hallway find place to pause and relax.</p>
<p>There will be moments of silence, stay with it.</p>
In the name of the Father, and of the Son, and of the Holy Spirit.
<h4>Amen</h4>`;

const default_closing = `<p>Please join in closing with the <b>Glory Be</b>.</p>
<p>Glory be to the Father, and to the Son, and to the Holy Spirit,
As it was in the begininning, is now, and ever shall be,
World without end, Amen.</p>
<p>Saint Ignatius and Saint John Francis Regis,
Pray for us.</p>
<p>In the name of the Father, and of the Son, and of the Holy Spirit.
<h4>Amen</h4></p>`;

const new_examen_app = new Vue({
  name: 'new-examen',
  el: '#new-examen',
  data: {
    stream: null,
    title: '',
    introduction: {
      text: default_introduction,
      recorder: null,
      recording: false,
      delay: 5,
      chunks: [],
      src: null,
      blob: null
    },
    closing: {
      text: default_closing,
      recorder: null,
      recording: false,
      delay: 5,
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
      if (this.prompts.length === 0) return alert('You must add at least one prompt!');

      // Check valid
      let invalid = false;
      if (document.getElementById('backing-track').files.length === 0) return alert('Please select a backing track.');

      ['introduction', 'closing'].forEach(thing => {
        if (!this.checkComplete(this[thing])) {
          invalid = false;
          alert('Make sure the ' + thing + ' has text, audio, and a delay.');
        }
      });

      this.prompts.forEach((p, index) => {
        if (!this.checkComplete(p)) {
          invalid = true;
          alert(`Make sure prompt ${index + 1} has text, audio, and a delay.`);
        }
      });

      if (invalid) return false;

      if (!confirm('Are you sure you want to post this new examen?')) return false;

      const request = new XMLHttpRequest();
      request.open('POST', '/examen/new');
      request.send(this.getFormData());

      //request.onload = () => window.location.href = "/examen/archive";
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
      setTimeout(() => setupEditor(document.getElementById('prompt-' + (this.prompts.length - 1) + '-editor')), 50);
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
    checkComplete: thing => thing.text.length > 0 && thing.chunks.length > 0 && !isNaN(thing.delay),
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
      fd.append('introductionDelay', this.introduction.delay);

      fd.append('backingTrack', document.getElementById('backing-track').files[0]);
      fd.append('prompts', JSON.stringify(this.prompts.map(p => p.text)));
      fd.append('delays', JSON.stringify(this.prompts.map(p => p.delay)));
      this.prompts.forEach(p => fd.append('recordings', p.blob));

      fd.append('closing', this.closing.text);
      fd.append('closingRecording', this.closing.blob);
      fd.append('closingDelay', this.closing.delay);
      console.log(fd);
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
  if (editing === 'introduction') editor.firstChild.innerHTML = default_introduction;
  if (editing === 'closing') editor.firstChild.innerHTML = default_closing;

  quill.on('text-change', function (delta, oldDelta, source) {
    thing.text = editor.firstChild.innerHTML;
    //Vue.set(new_examen_app.prompts, prompt, 'text', editor.firstChild.innerHTML);
  });
}

document.querySelectorAll('.editor.prompt-editor').forEach(setupEditor);
setupEditor(document.querySelector('.editor.introduction-editor'));
setupEditor(document.querySelector('.editor.closing-editor'));