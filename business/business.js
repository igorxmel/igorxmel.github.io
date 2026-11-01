(() => {
  const words = [...document.querySelectorAll('.rot .rw')];
  if (words.length < 2 || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let i = 0;
  setInterval(() => {
    const prev = words[i];
    i = (i + 1) % words.length;
    prev.classList.replace('on', 'out');
    words[i].classList.add('on');
    setTimeout(() => prev.classList.remove('out'), 450);
  }, 2600);
})();
