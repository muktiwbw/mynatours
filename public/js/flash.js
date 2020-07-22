const removeFlash = () => {
  const el = document.querySelector('.alert');
  if (el) el.parentElement.removeChild(el);
}

const flash = (type, msg, timer = 5000) => {
  const markup = `<div class="alert alert--${type}">${msg}</div>`;

  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);

  if (timer) setTimeout(() => {
    removeFlash();
  }, timer);
}