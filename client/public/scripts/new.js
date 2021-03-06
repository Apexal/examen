const default_introduction = `<p>Let us continue together the practice of the Examen. Please sit comfortably. Put everything out of your hands. Try to be silent and still. Close your eyes if you wish. If you are in a hallway find a place to pause and relax.</p>
<p>There will be moments of silence, stay with it.</p>
In the name of the Father, and of the Son, and of the Holy Spirit.
<h4>Amen</h4>`;

const default_closing = `<p>Please join in closing with the <b>Glory Be</b>.</p>
<p>Glory be to the Father, and to the Son, and to the Holy Spirit,
As it was in the beginning, is now, and ever shall be,
World without end, Amen.</p>
<p>Saint Ignatius and Saint John Francis Regis,
Pray for us.</p>
<p>In the name of the Father, and of the Son, and of the Holy Spirit.
<h4>Amen</h4></p>`;


const mROptions = {
  mimeType: 'audio/webm;codecs=opus'
};

const recordingTimes = {

};

const new_examen_app = new Vue({
  name: 'new-examen',
  el: '#new-examen',
  data: {
    stream: null,
    title: '',
    backingTrack: 'I Am The Bread Of Life.ogg',
    visibility: 'public',
    introduction: {
      text: default_introduction,
      recorder: null,
      recording: false,
      delay: 5,
      chunks: [],
      src: null,
      blob: null,
      duration: 0
    },
    closing: {
      text: default_closing,
      recorder: null,
      recording: false,
      delay: 5,
      chunks: [],
      src: null,
      blob: null,
      duration: 0
    },
    prompts: []
  },
  created: async function () {
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false
    });

    this.introduction.recorder = new MediaRecorder(this.stream, mROptions);
    this.setupEvents(this.introduction);
    this.closing.recorder = new MediaRecorder(this.stream, mROptions);
    this.setupEvents(this.closing);
  },
  methods: {
    setupEvents: target => {
      target.recorder.addEventListener("dataavailable", event => {
        target.chunks.push(event.data);
      });

      target.recorder.onstop = () => {
        const audioBlob = new Blob(target.chunks, {
          type: 'audio/ogg;codecs=opus'
        });
        const audioUrl = URL.createObjectURL(audioBlob);
        target.blob = audioBlob;
        target.src = audioUrl;
      }
    },
    handleSubmit: function (event) {
      if (this.prompts.length === 0) return alert('You must add at least one prompt!');

      // Check valid
      let invalid = false;

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

      request.onload = data => window.location.href = "/examen/archive";
    },
    addPrompt: function (event) {
      const prompt = {
        text: '',
        recorder: new MediaRecorder(this.stream, mROptions),
        recording: false,
        delay: 30,
        chunks: [],
        src: null,
        blob: null,
        duration: 0
      };

      this.setupEvents(prompt);

      this.prompts.push(prompt);
      setTimeout(() => setupEditor(document.getElementById('prompt-' + (this.prompts.length - 1) + '-editor')), 50);
    },
    removePrompt: function () {
      this.prompts.splice(this.prompts.length - 1);
    },
    toggleRecording: function (index) {
      const target = typeof index === 'number' ? this.prompts[index] : this[index];

      if (target.recorder.state !== 'inactive') {
        this.stopRecording(index);
      } else {
        this.startRecording(index);
      }
    },
    checkComplete: thing => thing.text.length > 0 && thing.chunks.length > 0 && !isNaN(thing.delay),
    stopAllRecordings: function () {
      if (this.introduction.recorder.state !== 'inactive')
        this.stopRecording('introduction');

      if (this.closing.recorder.state !== 'inactive')
        this.stopRecording('closing');

      this.prompts.forEach((p, index) => {
        if (p.recorder.state !== 'inactive') this.stopRecording(index);
      });
    },
    startRecording: function (index) {
      this.stopAllRecordings();
      recordingTimes[index] = new Date();
      const target = typeof index === 'number' ? this.prompts[index] : this[index];
      target.recording = true;
      target.chunks = [];
      target.src = null;
      target.recorder.start();
    },
    stopRecording: function (index) {
      const target = typeof index === 'number' ? this.prompts[index] : this[index];
      target.recording = false;
      target.recorder.stop();
      target.duration = Math.round((new Date() - recordingTimes[index]) / 1000);
      delete recordingTimes[index];
    },
    getFormData: function () {

      const fd = new FormData();
      fd.append('title', this.title);

      fd.append('introduction', this.introduction.text);
      fd.append('introductionRecording', this.introduction.blob);
      fd.append('introductionDelay', this.introduction.delay);
      fd.append('introductionDuration', this.introduction.duration);

      fd.append('visibility', this.visibility);
      fd.append('backingTrack', this.backingTrack);
      fd.append('prompts', JSON.stringify(this.prompts.map(p => p.text)));
      fd.append('delays', JSON.stringify(this.prompts.map(p => p.delay)));
      fd.append('durations', JSON.stringify(this.prompts.map(p => p.duration)));
      this.prompts.forEach(p => fd.append('recordings', p.blob));

      fd.append('closing', this.closing.text);
      fd.append('closingRecording', this.closing.blob);
      fd.append('closingDelay', this.closing.delay);
      fd.append('closingDuration', this.closing.duration);

      // TODO: this does not work...
      fd.append('totalDuration', Array.from(document.querySelectorAll('audio')).reduce((acc, a) => {
        a.load();
        return acc + a.duration;
      }, 0));
      return fd;
    }
  }
});

const toolbar = [
  ['bold', 'italic', 'underline'],
  ['blockquote'],

  [{
    'list': 'ordered'
  }, {
    'list': 'bullet'
  }],
  [{
    'header': [1, 2, 3, 4, false]
  }],

  [{
    'color': []
  }, {
    'background': []
  }],
  [{
    'align': []
  }],
  ['image'],
  ['clean']
];


const options = {
  debug: 'info',
  placeholder: 'Compose an epic...',
  theme: 'snow',
  modules: {
    toolbar
  }
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