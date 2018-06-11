const backingTrack = document.getElementById('backing-track');
const recordings = document.querySelectorAll('audio.examen-audio');

const examen_app = new Vue({
  name: 'examen_app',
  el: '#examen',
  data: {
    status: 'introduction',
    playing: false,
    autocontinue: false,
    volumePercent: 1,
    currentDelay: 10,
    timer: 10,
    timerInterval: null,
    promptCount: 0
  },
  mounted() {
    this.promptCount = document.querySelectorAll('.prompt-content').length;
    if (window.location.href.includes("autoplay=1")) this.playFromStart();

    this.currentDelay = this.timer = this.currentAudio.dataset.delay;
  },
  methods: {
    playFromStart: function () {
      if (this.autocontinue) {
        backingTrack.load();
        this.autocontinue = false;
        this.timer = this.currentDelay;
        return this.stopPlaying();
      }

      this.stopPlaying();
      location.href = '#examen';

      backingTrack.load();
      backingTrack.play();

      this.autocontinue = true;
      this.setPrompt('introduction');
    },
    stopPlaying: function () {
      document.querySelectorAll('audio.prompt-recording').forEach(a => a.load());
      this.playing = false;
      clearInterval(this.timerInterval);
    },
    prevPrompt: function () {
      if (!this.hasPrevPrompt) return;
      this.setPrompt(this.getPrevPrompt);
    },
    nextPrompt: function () {
      if (!this.hasNextPrompt) return;
      this.setPrompt(this.getNextPrompt);
    },
    resetTimer: function () {
      this.timer = 0;
      clearInterval(this.timerInterval);
    },
    changeVolume: function () {
      if (this.playing) {
        backingTrack.volume = 0.2 * this.volumePercent;
        this.currentAudio.volume = 1 * this.volumePercent;
      } else {
        backingTrack.volume = 1 * this.volumePercent;
      }
    },
    hearPrompt: function (index) {
      this.stopPlaying();
      this.currentAudio.volume = 0;
      this.currentAudio.play();
      $(this.currentAudio).animate({
        volume: 1 * this.volumePercent
      }, 1000);

      $(backingTrack).animate({
        volume: 0.2 * this.volumePercent
      }, 1000);
      this.playing = true;

      this.currentAudio.onended = () => {
        if (this.autocontinue) {
          this.timerInterval = setInterval(() => {
            this.timer -= 1;
            if (this.timer <= 0) {
              this.resetTimer();
              this.nextPrompt();

              if (!this.hasNextPrompt) this.autocontinue = false;
            }
          }, 1000);
        }
        this.playing = false;

        $(backingTrack).animate({
          volume: 1 * this.volumePercent
        }, 1000);

        if (this.status === 'closing') {
          setTimeout(() => {
            $(backingTrack).animate({
              volume: 0
            }, 10000);
          }, this.currentDelay);
        }
      }
    },
    setPrompt: function (index) {
      this.status = index;

      this.stopPlaying();

      const delay = parseInt(this.currentAudio.dataset.delay);
      this.timer = delay;
      this.currentDelay = delay;

      if (this.autocontinue) this.hearPrompt(index);
    }
  },
  computed: {
    totalDuration: () => Array.from(document.querySelectorAll('audio.examen-audio')).reduce((acc, a) => acc + parseInt(a.duration), 0),
    currentAudio: function () {
      return isNaN(this.status) ? document.getElementById(this.status + '-audio') : document.getElementById('prompt-' + this.status + '-audio');
    },
    statusText: function () {
      switch (this.status) {
        case 'introduction':
          return 'Introduction';
          break;
        case 'closing':
          return 'Closing';
          break;
        default:
          return `Prompt ${this.status + 1} of ${this.promptCount}`;
          break;
      }
    },
    hasPrevPrompt: function () {
      return this.status !== 'introduction';
    },
    hasNextPrompt: function () {
      return this.status !== 'closing';
    },
    getPrevPrompt: function () {
      if (this.status === 'closing') return this.promptCount - 1;
      if (this.status === 0) return 'introduction';
      return this.status - 1;
    },
    getNextPrompt: function () {
      if (this.status === 'introduction') return 0;
      if ((this.status + 1) === this.promptCount) return 'closing';
      return this.status + 1;
    }
  }
});