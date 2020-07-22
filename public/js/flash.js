const removeFlash = () => {
  const el = document.querySelector('.alert');
  if (el) el.parentElement.removeChild(el);
}

const flash = (type, msg) => {
  const markup = `<div class="alert alert--${type}">${msg}</div>`;

  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);

  setTimeout(() => {
    removeFlash();
  }, 5000);
}