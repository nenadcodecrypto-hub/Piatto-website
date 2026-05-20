const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const navBackdrop = document.querySelector("[data-nav-backdrop]");
const revealItems = document.querySelectorAll(".reveal");
const rotatingText = document.querySelector("[data-rotating-text]");
const galleryGrid = document.querySelector(".gallery-grid");
const lightbox = document.querySelector("[data-lightbox]");
const lightboxImage = document.querySelector("[data-lightbox-image]");
const lightboxCloseButtons = document.querySelectorAll("[data-lightbox-close]");
const lightboxPrev = document.querySelector("[data-lightbox-prev]");
const lightboxNext = document.querySelector("[data-lightbox-next]");
const galleryItems = galleryGrid ? [...galleryGrid.querySelectorAll(".gallery-item")] : [];
let activeGalleryIndex = 0;
let lastTouchOpen = 0;
let ignoreGalleryTapUntil = 0;
let galleryTouch = null;
let lightboxTouch = null;

const setHeaderState = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 24);
};

const closeNavigation = () => {
  nav.classList.remove("is-open");
  header.classList.remove("nav-is-open");
  document.body.classList.remove("nav-open");
  navToggle.setAttribute("aria-expanded", "false");
};

const closeLightbox = () => {
  if (!lightbox || lightbox.hidden) return;
  lightbox.hidden = true;
  document.body.classList.remove("lightbox-open");
  lightboxImage.removeAttribute("src");
  lightboxImage.alt = "";
  ignoreGalleryTapUntil = Date.now() + 450;
};

const setLightboxImage = (index) => {
  const link = galleryItems[index];
  if (!link || !lightboxImage) return;
  const image = link.querySelector("img");
  if (!image) return;

  lightboxImage.src = link.href;
  lightboxImage.alt = image.alt;
  activeGalleryIndex = index;
};

const openLightbox = (link) => {
  if (!lightbox || !lightboxImage) return;
  const index = galleryItems.indexOf(link);
  if (index === -1) return;

  setLightboxImage(index);
  lightbox.hidden = false;
  document.body.classList.add("lightbox-open");
  lightbox.querySelector(".lightbox__close").focus();
};

const showAdjacentImage = (direction) => {
  if (!lightbox || lightbox.hidden || galleryItems.length < 2) return;
  const nextIndex = (activeGalleryIndex + direction + galleryItems.length) % galleryItems.length;
  setLightboxImage(nextIndex);
};

const openGalleryImage = (event) => {
  const link = event.target.closest(".gallery-item");
  if (!link || !galleryGrid.contains(link)) return;

  event.preventDefault();
  openLightbox(link);
};

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

navToggle.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("is-open");
  header.classList.toggle("nav-is-open", isOpen);
  document.body.classList.toggle("nav-open", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

navBackdrop.addEventListener("click", closeNavigation);

nav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeNavigation);
});

galleryGrid.addEventListener("click", (event) => {
  if (Date.now() - lastTouchOpen < 500 || Date.now() < ignoreGalleryTapUntil) {
    event.preventDefault();
    return;
  }

  openGalleryImage(event);
});

galleryGrid.addEventListener(
  "touchstart",
  (event) => {
    const touch = event.changedTouches[0];
    galleryTouch = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
      moved: false
    };
  },
  { passive: true }
);

galleryGrid.addEventListener(
  "touchmove",
  (event) => {
    if (!galleryTouch) return;
    const touch = event.changedTouches[0];
    const deltaX = Math.abs(touch.clientX - galleryTouch.x);
    const deltaY = Math.abs(touch.clientY - galleryTouch.y);

    if (deltaX > 10 || deltaY > 10) {
      galleryTouch.moved = true;
    }
  },
  { passive: true }
);

galleryGrid.addEventListener(
  "touchend",
  (event) => {
    if (Date.now() < ignoreGalleryTapUntil) return;
    if (!galleryTouch || galleryTouch.moved || Date.now() - galleryTouch.time > 700) {
      ignoreGalleryTapUntil = Date.now() + 250;
      galleryTouch = null;
      return;
    }

    lastTouchOpen = Date.now();
    event.preventDefault();
    openGalleryImage(event);
    galleryTouch = null;
  },
  { passive: false }
);

lightboxCloseButtons.forEach((button) => {
  button.addEventListener("click", closeLightbox);
});

lightboxPrev.addEventListener("click", () => showAdjacentImage(-1));
lightboxNext.addEventListener("click", () => showAdjacentImage(1));

lightbox.addEventListener(
  "touchstart",
  (event) => {
    const touch = event.changedTouches[0];
    lightboxTouch = {
      x: touch.clientX,
      y: touch.clientY
    };
  },
  { passive: true }
);

lightbox.addEventListener(
  "touchend",
  (event) => {
    if (!lightboxTouch || lightbox.hidden) return;
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - lightboxTouch.x;
    const deltaY = touch.clientY - lightboxTouch.y;

    if (Math.abs(deltaX) > 48 && Math.abs(deltaY) < 80) {
      showAdjacentImage(deltaX > 0 ? -1 : 1);
    }

    lightboxTouch = null;
  },
  { passive: true }
);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeNavigation();
    closeLightbox();
  }

  if (!lightbox || lightbox.hidden) return;

  if (event.key === "ArrowLeft") {
    showAdjacentImage(-1);
  }

  if (event.key === "ArrowRight") {
    showAdjacentImage(1);
  }
});

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -60px 0px" }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

// Splits circular labels into rotated characters while keeping the source text readable in HTML.
if (rotatingText) {
  const text = rotatingText.textContent.trim();
  rotatingText.setAttribute("aria-label", text);
  rotatingText.innerHTML = "";

  [...text].forEach((character, index) => {
    const span = document.createElement("span");
    span.textContent = character;
    span.style.transform = `rotate(${index * (360 / text.length)}deg)`;
    rotatingText.appendChild(span);
  });
}
