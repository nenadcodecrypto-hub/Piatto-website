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
let lastTouchOpen = 0;

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
};

const openLightbox = (link) => {
  const image = link.querySelector("img");
  if (!image || !lightbox || !lightboxImage) return;
  lightboxImage.src = link.href;
  lightboxImage.alt = image.alt;
  lightbox.hidden = false;
  document.body.classList.add("lightbox-open");
  lightbox.querySelector(".lightbox__close").focus();
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
  if (Date.now() - lastTouchOpen < 500) {
    event.preventDefault();
    return;
  }

  openGalleryImage(event);
});

galleryGrid.addEventListener(
  "touchend",
  (event) => {
    lastTouchOpen = Date.now();
    openGalleryImage(event);
  },
  { passive: false }
);

lightboxCloseButtons.forEach((button) => {
  button.addEventListener("click", closeLightbox);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeNavigation();
    closeLightbox();
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
