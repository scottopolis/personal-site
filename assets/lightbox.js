const images = document.querySelectorAll('.article img');

if (images.length) {
  const dialog = document.createElement('dialog');
  dialog.className = 'lightbox';
  dialog.setAttribute('aria-label', 'Image preview');
  dialog.innerHTML = '<div class="lightbox-tools"><button type="button" class="lightbox-close" aria-label="Close image preview" autofocus><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6" /></svg></button></div><img alt="">';
  document.body.append(dialog);
  const preview = dialog.querySelector('img');
  let opener;

  for (const image of images) {
    if (image.closest('a')) continue;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'image-preview';
    button.setAttribute('aria-label', `Enlarge image: ${image.alt || 'Article image'}`);
    image.before(button);
    button.append(image);
    button.addEventListener('click', () => {
      opener = button;
      preview.src = image.currentSrc || image.src;
      preview.alt = image.alt;
      dialog.showModal();
      document.documentElement.classList.add('lightbox-open');
    });
  }

  dialog.querySelector('.lightbox-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('lightbox-open');
    opener.focus({ preventScroll: true });
  });
}
