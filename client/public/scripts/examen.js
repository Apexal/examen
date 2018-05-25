document.querySelectorAll('a.play-prompt').forEach(link => {
  const target = document.getElementById('prompt-' + link.dataset.prompt + '-audio');

  link.onclick = () => target.play();
});

const backingTrack = document.getElementById('backing-track');
const recordings = document.querySelectorAll('audio.examen-audio');

const examen_app = new Vue({
  name: 'examen_app',
  el: '#examen',
  data: {
    status: 'introduction',
    playing: false,
    autocontinue: false,
    timer: 10,
    timerInterval: null,
    promptCount: 0
  },
  created() {
    this.promptCount = document.querySelectorAll('.prompt-content').length;
  },
  methods: {
    playFromStart: function () {
      if (this.playing) return this.stopPlaying();

      this.status = 'introduction';

      backingTrack.load();
      backingTrack.play();

      this.playing = true;
      this.autocontinue = true;

      setTimeout(this.nextPrompt, 10 * 1000);
    },
    stopPlaying: function () {
      document.querySelectorAll('audio.prompt-recording').forEach(a => a.load());
      this.playing = false;
      clearInterval(this.timerInterval);
    },
    prevPrompt: function () {
      if (!this.hasPrevPrompt) return;
      this.playPrompt(this.status === 0 ? 'introduction' : this.status - 1);
    },
    nextPrompt: function () {
      if (!this.hasNextPrompt) return;
      this.playPrompt(this.status === 'introduction' ? 0 : this.status + 1);
    },
    resetTimer: function () {
      this.timer = 0;
      clearInterval(this.timerInterval);
    },
    playPrompt: function (index) {
      this.status = index;

      const audio = document.getElementById('prompt-' + index + '-audio');
      const duration = Math.round(audio.duration);

      this.stopPlaying();

      audio.play();
      backingTrack.volume = 0.2;
      this.playing = true;

      const delay = parseInt(audio.dataset.delay);
      this.timer = delay;
      if (this.autocontinue) {
        audio.onended = () => {
          this.timerInterval = setInterval(() => {
            this.timer -= 1;
            if (this.timer <= 0) {
              this.resetTimer();
              this.nextPrompt();

              if (!this.hasNextPrompt) this.autocontinue = false;
            }
          }, 1000);
          this.playing = false;
          backingTrack.volume = 1;
        }
      }
    }
  },
  computed: {
    totalDuration: () => Array.from(document.querySelectorAll('audio.examen-audio')).reduce((acc, a) => acc + parseInt(a.duration), 0),
    statusText: function () {
      if (this.status === 'introduction') return 'Introduction';
      return `Prompt ${this.status + 1}`;
    },
    hasPrevPrompt: function () {
      return this.status !== 'introduction';
    },
    hasNextPrompt: function () {
      return this.status === 'introduction' || this.status < this.promptCount - 1;
    }
  }
});