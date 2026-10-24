(() => {
  const root = document.documentElement;
  const menuButton = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('.site-nav');
  const backToTop = document.querySelector('.back-to-top');
  const projectDialog = document.querySelector('.project-dialog');
  const dialogContent = document.querySelector('#dialog-content');
  let projectOpener = null;
  const navLinks = [...document.querySelectorAll('.site-nav a')];
  const sections = [...document.querySelectorAll('main section[id]')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  root.classList.add('js');

  const closeMenu = () => {
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation');
    navigation.classList.remove('open');
  };

  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    navigation.classList.toggle('open', open);
  });

  navLinks.forEach((link) => link.addEventListener('click', closeMenu));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });

  // Open each project in its own accessible, scrollable detail dialog.
  document.querySelectorAll('[data-project-open]').forEach((button) => {
    button.addEventListener('click', () => {
      const template = document.querySelector(`#${button.dataset.projectOpen}-details`);
      if (!template || !projectDialog || typeof projectDialog.showModal !== 'function') return;
      projectOpener = button;
      dialogContent.replaceChildren(template.content.cloneNode(true));
      projectDialog.classList.toggle('firetrace-open', button.dataset.projectOpen === 'firetrace');
      projectDialog.classList.toggle('calapan-open', button.dataset.projectOpen === 'calapan');
      projectDialog.classList.toggle('buhuan-open', button.dataset.projectOpen === 'buhuan');
      document.body.classList.add('project-modal-open');
      projectDialog.showModal();
    });
  });

  projectDialog.querySelector('.dialog-close').addEventListener('click', () => projectDialog.close());
  projectDialog.addEventListener('close', () => {
    projectDialog.classList.remove('firetrace-open');
    projectDialog.classList.remove('calapan-open');
    projectDialog.classList.remove('buhuan-open');
    document.body.classList.remove('project-modal-open');
    projectOpener?.focus();
  });
  projectDialog.addEventListener('click', (event) => {
    if (event.target === projectDialog) projectDialog.close();
  });

  // FireTrace galleries keep independent active indices and thumbnail states.
  const showFireTraceScreenshot = (gallery, index) => {
    if (!projectDialog.open || !projectDialog.classList.contains('firetrace-open')) return;
    const thumbnails = [...gallery.querySelectorAll('[data-gallery-thumb]')];
    if (!thumbnails.length) return;
    const activeIndex = (index + thumbnails.length) % thumbnails.length;
    gallery.dataset.activeIndex = String(activeIndex);
    const activeThumbnail = thumbnails[activeIndex];
    const counter = gallery.querySelector('.firetrace-gallery-counter');
    counter.querySelector('strong').textContent = String(activeIndex + 1).padStart(2, '0');
    counter.querySelector('span').textContent = '/ ' + String(thumbnails.length).padStart(2, '0');
    const previews = [...gallery.querySelectorAll('.firetrace-gallery-preview')];
    previews.forEach((preview, previewIndex) => {
      const active = previewIndex === activeIndex;
      preview.classList.toggle('is-current', active);
      preview.setAttribute('aria-current', String(active));
    });
    const title = gallery.querySelector('.firetrace-gallery-current-title');
    if (title) title.textContent = activeThumbnail.dataset.caption;
    const track = gallery.querySelector('.firetrace-gallery-track');
    const activePreview = previews[activeIndex];
    if (track && activePreview && track.scrollWidth > track.clientWidth) {
      const trackRect = track.getBoundingClientRect();
      const previewRect = activePreview.getBoundingClientRect();
      const scrollLeft = track.scrollLeft + previewRect.left - trackRect.left - (track.clientWidth - previewRect.width) / 2;
      track.scrollTo({ left: Math.max(0, scrollLeft), behavior: 'smooth' });
    }
    thumbnails.forEach((thumbnail, thumbnailIndex) => {
      const active = thumbnailIndex === activeIndex;
      thumbnail.classList.toggle('is-active', active);
      thumbnail.setAttribute('aria-pressed', String(active));
    });
  };

  projectDialog.addEventListener('click', (event) => {
    if (!projectDialog.classList.contains('firetrace-open')) return;
    const gallery = event.target.closest('.firetrace-gallery');
    if (!gallery) return;
    const thumbnail = event.target.closest('[data-gallery-thumb]');
    if (thumbnail) {
      const thumbnails = [...gallery.querySelectorAll('[data-gallery-thumb]')];
      showFireTraceScreenshot(gallery, thumbnails.indexOf(thumbnail));
      return;
    }
    const previous = event.target.closest('[data-gallery-prev]');
    const next = event.target.closest('[data-gallery-next]');
    if (!previous && !next) return;
    const currentIndex = Number(gallery.dataset.activeIndex || 0);
    showFireTraceScreenshot(gallery, currentIndex + (next ? 1 : -1));
  });

  document.addEventListener('keydown', (event) => {
    if (!projectDialog.open || !projectDialog.classList.contains('firetrace-open')) return;
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    const gallery = event.target.closest?.('.firetrace-gallery');
    if (!gallery) return;
    event.preventDefault();
    const currentIndex = Number(gallery.dataset.activeIndex || 0);
    showFireTraceScreenshot(gallery, currentIndex + (event.key === 'ArrowRight' ? 1 : -1));
  });
  const showCalapanScreenshot = (index) => {
    if (!projectDialog.open || (!projectDialog.classList.contains('calapan-open') && !projectDialog.classList.contains('buhuan-open'))) return;
    const thumbnails = [...projectDialog.querySelectorAll('.calapan-thumbnail')];
    if (!thumbnails.length) return;
    const activeIndex = (index + thumbnails.length) % thumbnails.length;
    const activeThumbnail = thumbnails[activeIndex];
    const mainImage = projectDialog.querySelector('.calapan-main-image');
    const caption = projectDialog.querySelector('.calapan-image-caption');
    mainImage.src = activeThumbnail.dataset.image;
    mainImage.alt = activeThumbnail.dataset.alt;
    caption.innerHTML = `${activeThumbnail.dataset.caption} <span>${String(activeIndex + 1).padStart(2, '0')} / ${String(thumbnails.length).padStart(2, '0')}</span>`;
    thumbnails.forEach((thumbnail, thumbnailIndex) => {
      const active = thumbnailIndex === activeIndex;
      thumbnail.classList.toggle('is-active', active);
      thumbnail.setAttribute('aria-pressed', String(active));
    });
  };

  projectDialog.addEventListener('click', (event) => {
    if (!projectDialog.classList.contains('calapan-open') && !projectDialog.classList.contains('buhuan-open')) return;
    const thumbnail = event.target.closest('.calapan-thumbnail');
    if (thumbnail) {
      const thumbnails = [...projectDialog.querySelectorAll('.calapan-thumbnail')];
      showCalapanScreenshot(thumbnails.indexOf(thumbnail));
      return;
    }
    if (event.target.closest('.calapan-previous')) {
      const activeIndex = [...projectDialog.querySelectorAll('.calapan-thumbnail')].findIndex((item) => item.classList.contains('is-active'));
      showCalapanScreenshot(activeIndex - 1);
    } else if (event.target.closest('.calapan-next')) {
      const activeIndex = [...projectDialog.querySelectorAll('.calapan-thumbnail')].findIndex((item) => item.classList.contains('is-active'));
      showCalapanScreenshot(activeIndex + 1);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (!projectDialog.open || (!projectDialog.classList.contains('calapan-open') && !projectDialog.classList.contains('buhuan-open'))) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      const activeIndex = [...projectDialog.querySelectorAll('.calapan-thumbnail')].findIndex((item) => item.classList.contains('is-active'));
      showCalapanScreenshot(activeIndex + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });

  // Keep the current section highlighted in the navigation.
  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          const active = link.hash === `#${entry.target.id}`;
          link.classList.toggle('active', active);
          if (active) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-24% 0px -66% 0px' });
    sections.forEach((section) => sectionObserver.observe(section));

    // Reveal sections as they enter view; content stays visible without observer support.
    if (!reducedMotion) {
      const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.12 });
      document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));
    } else {
      document.querySelectorAll('.reveal').forEach((element) => element.classList.add('is-visible'));
    }
  } else {
    document.querySelectorAll('.reveal').forEach((element) => element.classList.add('is-visible'));
  }

  const updateBackToTop = () => {
    backToTop.classList.toggle('visible', window.scrollY > 520);
  };
  window.addEventListener('scroll', updateBackToTop, { passive: true });
  updateBackToTop();

  document.querySelector('#year').textContent = new Date().getFullYear();
})();
