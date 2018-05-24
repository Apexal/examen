document.querySelectorAll('#examen-breadcrumb li a').forEach(link => {
  const target = document.getElementById(link.dataset.target);

  link.onclick = function (event) {
    document.querySelectorAll('.prompts .is-active, #examen-breadcrumb li.is-active').forEach(link => link.classList.remove('is-active'));
    target.classList.add('is-active');
    link.parentElement.classList.add('is-active');
  }
});