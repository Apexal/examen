const new_examen_app = new Vue({
  el: '#new-examen',
  data: {
    introduction: '',
    prompts: ['']
  },
  methods: {
    addPrompt: function (event) {
      this.prompts.push('');
      setTimeout(() => setupEditor(document.getElementById('prompt-' + (this.prompts.length - 1) + '-editor')), 100);
    },
    onSubmit: function (event) {

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
    Vue.set(new_examen_app.prompts, prompt, editor.firstChild.innerHTML);
  });
}

document.querySelectorAll('.editor.prompt-editor').forEach(setupEditor);
setupEditor(document.querySelector('.editor.introduction-editor'));