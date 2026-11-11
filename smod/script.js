const menuBtn = document.querySelector('.menu-btn');
const menu = document.querySelector('#menu');
const lightbox = document.querySelector('#lightbox');
const lightboxImage = document.querySelector('#lightbox-image');
const lightboxClose = document.querySelector('.lightbox-close');
const heroBgImageA = document.querySelector('#hero-bg-image-a');
const heroBgImageB = document.querySelector('#hero-bg-image-b');
const IMAGE_FILE_PATTERN = /\.(avif|gif|jpe?g|png|webp|bmp|svg)$/i;

if (menuBtn && menu) {
  menuBtn.addEventListener('click', () => {
    const isOpen = menu.getAttribute('data-open') === 'true';
    menu.setAttribute('data-open', String(!isOpen));
    menuBtn.setAttribute('aria-expanded', String(!isOpen));
  });

  menu.querySelectorAll('a').forEach((item) => {
    item.addEventListener('click', () => {
      menu.setAttribute('data-open', 'false');
      menuBtn.setAttribute('aria-expanded', 'false');
    });
  });
}

function renderShows(shows) {
  const target = document.querySelector('#shows-list');
  if (!target) {
    return;
  }

  target.innerHTML = shows
    .map(
      (show) => `
      <article>
        <p class="date">${show.date || ''}</p>
        <h3>${show.venue || ''}</h3>
        <p>${show.city || ''}</p>
        <a href="${show.ctaLink || '#contact'}">${show.ctaText || 'Details'}</a>
      </article>
    `
    )
    .join('');
}

function renderMedia(mediaItems) {
  const target = document.querySelector('#media-list');
  if (!target) {
    return;
  }

  target.innerHTML = mediaItems
    .map((item) => {
      const mediaBody = item.embedHtml
        ? `<div class="media-embed">${item.embedHtml}</div>`
        : `<div class="media-placeholder">${item.placeholderLabel || 'MEDIA SLOT'}</div>`;

      return `
      <article class="media-card">
        ${mediaBody}
        <h3>${item.title || ''}</h3>
        <p>${item.description || ''}</p>
      </article>
    `;
    })
    .join('');
}

function getYouTubeEmbedUrl(value) {
  if (!value) {
    return '';
  }

  const trimmed = String(value).trim();

  if (trimmed.includes('youtube.com/embed/')) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed);
    const host = url.hostname.replace('www.', '').toLowerCase();

    if (host === 'youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0];
      return id ? `https://www.youtube.com/embed/${id}` : '';
    }

    if (host.endsWith('youtube.com')) {
      const id = url.searchParams.get('v');
      return id ? `https://www.youtube.com/embed/${id}` : '';
    }
  } catch (error) {
    return '';
  }

  return '';
}

function renderVideos(videoItems) {
  const target = document.querySelector('#videos-list');
  if (!target) {
    return;
  }

  target.innerHTML = videoItems
    .map((item) => {
      const embedFromUrl = getYouTubeEmbedUrl(item.youtubeUrl || item.embedUrl || '');
      const mediaBody = item.embedHtml
        ? `<div class="media-embed">${item.embedHtml}</div>`
        : embedFromUrl
          ? `<div class="media-embed"><iframe src="${embedFromUrl}" title="${item.title || 'YouTube video'}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>`
          : `<div class="media-placeholder">YOUTUBE LINK NEEDED</div>`;

      return `
      <article class="media-card">
        ${mediaBody}
        <h3>${item.title || ''}</h3>
        <p>${item.description || ''}</p>
      </article>
    `;
    })
    .join('');
}

function renderGallery(images) {
  const target = document.querySelector('#gallery-list');
  if (!target) {
    return;
  }

  target.innerHTML = images
    .map(
      (image) => `
      <figure>
        <img src="${image.src || ''}" alt="${image.alt || 'Band photo'}" data-expandable="true" />
      </figure>
    `
    )
    .join('');

  attachGalleryLightboxHandlers(target);
}

function openLightbox(imageSrc, imageAlt) {
  if (!lightbox || !lightboxImage) {
    return;
  }

  lightboxImage.src = imageSrc;
  lightboxImage.alt = imageAlt || 'Expanded gallery image';
  lightbox.setAttribute('data-open', 'true');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  if (!lightbox || !lightboxImage) {
    return;
  }

  lightbox.setAttribute('data-open', 'false');
  lightbox.setAttribute('aria-hidden', 'true');
  lightboxImage.src = '';
  document.body.style.overflow = '';
}

function attachGalleryLightboxHandlers(container) {
  container.querySelectorAll('img[data-expandable="true"]').forEach((image) => {
    image.addEventListener('click', () => {
      openLightbox(image.currentSrc || image.src, image.alt);
    });
  });
}

if (lightbox && lightboxClose) {
  lightboxClose.addEventListener('click', closeLightbox);

  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && lightbox.getAttribute('data-open') === 'true') {
      closeLightbox();
    }
  });
}

function cleanDirectoryPath(path) {
  if (!path) {
    return 'pictures/';
  }

  return path.endsWith('/') ? path : `${path}/`;
}

async function loadGalleryFromPicturesDirectory(content) {
  const directoryPath = cleanDirectoryPath(content.galleryDirectoryPath || 'pictures/');

  return loadImagesFromDirectory(directoryPath, content.galleryAutoAlt || 'Band photo');
}

async function loadImagesFromDirectory(rawDirectoryPath, defaultAlt) {
  const directoryPath = cleanDirectoryPath(rawDirectoryPath);

  try {
    // Static hosts serve files, but do not necessarily expose directory listings.
    const response = await fetch(`${directoryPath}images.json`, { cache: 'no-store' });
    if (!response.ok) {
      return [];
    }

    const imageNames = await response.json();
    if (!Array.isArray(imageNames)) {
      return [];
    }

    return imageNames
      .filter((name) => typeof name === 'string' && IMAGE_FILE_PATTERN.test(name))
      .map((name) => ({
        src: `${directoryPath}${encodeURIComponent(name)}`,
        alt: defaultAlt || 'Band photo'
      }));
  } catch (error) {
    return [];
  }
}

async function resolveGalleryImages(content) {
  if (content.galleryAutoFromPictures !== false) {
    const autoImages = await loadGalleryFromPicturesDirectory(content);
    if (autoImages.length > 0) {
      return autoImages;
    }
  }

  return content.gallery || [];
}

async function resolveHeroImages(content) {
  if (content.heroAutoFromPictures !== false) {
    const autoImages = await loadImagesFromDirectory(
      content.heroDirectoryPath || 'pictures-hero/',
      content.heroAutoAlt || 'Band hero photo'
    );
    if (autoImages.length > 0) {
      return autoImages;
    }
  }

  return content.heroImages || [];
}

function setHeroImage(element, image, makeVisible) {
  if (!element || !image || !image.src) {
    return;
  }

  element.src = image.src;
  element.alt = image.alt || 'Band hero photo';
  element.classList.remove('is-popping');

  if (makeVisible) {
    element.classList.add('is-visible');
    // Trigger the pop animation each time a new image is shown.
    void element.offsetWidth;
    element.classList.add('is-popping');
    setTimeout(() => {
      element.classList.remove('is-popping');
    }, 4900);
  }
}

function startHeroBackgroundRotation(images, cycleMs) {
  if (!heroBgImageA || !heroBgImageB || images.length === 0) {
    return;
  }

  let imageIndex = 0;
  let showA = true;

  setHeroImage(heroBgImageA, images[imageIndex], true);
  heroBgImageB.classList.remove('is-visible', 'is-popping');

  if (images.length < 2) {
    return;
  }

  const intervalMs = Number.isFinite(cycleMs) && cycleMs >= 2500 ? cycleMs : 5200;

  window.setInterval(() => {
    imageIndex = (imageIndex + 1) % images.length;
    const incoming = showA ? heroBgImageB : heroBgImageA;
    const outgoing = showA ? heroBgImageA : heroBgImageB;

    setHeroImage(incoming, images[imageIndex], true);
    outgoing.classList.remove('is-visible', 'is-popping');
    showA = !showA;
  }, intervalMs);
}

function renderMerch(merchItems) {
  const target = document.querySelector('#merch-list');
  if (!target) {
    return;
  }

  target.innerHTML = merchItems
    .map(
      (item) => `
      <article>
        <h3>${item.name || ''}</h3>
        <p>${item.description || ''}</p>
        <a class="merch-link" href="${item.ctaLink || '#contact'}">${item.ctaText || 'Details'}</a>
      </article>
    `
    )
    .join('');
}

async function renderSiteContent() {
  const content = window.siteContent || {};
  renderShows(content.shows || []);
  renderMedia(content.media || []);
  renderVideos(content.videos || []);
  const galleryImages = await resolveGalleryImages(content);
  const heroImages = await resolveHeroImages(content);
  startHeroBackgroundRotation(heroImages, content.heroCycleMs);
  renderGallery(galleryImages);
  renderMerch(content.merch || []);
}

renderSiteContent();
