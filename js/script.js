// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
  NOTIFICATION_DURATION: 3000,
  SCROLL_THRESHOLD: 0.15,
};

// ============================================
// PRELOADER
// ============================================

class Preloader {
  constructor() {
    this.preloader = document.getElementById("preloader");
    this.init();
  }

  init() {
    window.addEventListener("load", () => {
      setTimeout(() => {
        this.preloader.classList.add("hide");
      }, 500);
    });
  }
}

// ============================================
// THEME MANAGER
// ============================================

class ThemeManager {
  constructor() {
    this.themeToggle = document.getElementById("themeToggle");
    this.init();
  }

  init() {
    const savedTheme = localStorage.getItem("theme") || "light";
    this.setTheme(savedTheme);
    this.themeToggle.addEventListener("click", () => this.toggle());
  }

  setTheme(theme) {
    if (theme === "dark") {
      document.body.classList.add("dark-mode");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark-mode");
      localStorage.setItem("theme", "light");
    }
  }

  toggle() {
    const isDark = document.body.classList.contains("dark-mode");
    this.setTheme(isDark ? "light" : "dark");
  }
}

// ============================================
// SMOOTH SCROLL NAVIGATION
// ============================================

class SmoothScroll {
  constructor() {
    this.navLinks = document.querySelectorAll(".nav-link");
    this.init();
  }

  init() {
    this.navLinks.forEach((link) => {
      link.addEventListener("click", (e) => this.handleClick(e));
    });
  }

  handleClick(e) {
    const href = e.currentTarget.getAttribute("href");
    if (href.startsWith("#")) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    }
  }
}

// ============================================
// NAVBAR ACTIVE STATE
// ============================================

class NavbarActive {
  constructor() {
    this.navLinks = document.querySelectorAll(".nav-link");
    this.window = window;
    this.init();
  }

  init() {
    window.addEventListener("scroll", () => this.updateActive());
  }

  updateActive() {
    const scrollPos = window.scrollY + 100;

    this.navLinks.forEach((link) => {
      const href = link.getAttribute("href");
      if (href.startsWith("#")) {
        const target = document.querySelector(href);
        if (target) {
          const targetPos = target.offsetTop;
          const targetHeight = target.offsetHeight;

          if (scrollPos >= targetPos && scrollPos < targetPos + targetHeight) {
            this.navLinks.forEach((l) => (l.style.color = ""));
            link.style.color = "var(--primary)";
          }
        }
      }
    });
  }
}

// ============================================
// INTERSECTION OBSERVER (AOS)
// ============================================

class AnimationOnScroll {
  constructor() {
    this.elements = document.querySelectorAll("[data-aos]");
    this.init();
  }

  init() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const delay = entry.target.dataset.aosDelay || 0;
            setTimeout(() => {
              entry.target.style.animationDelay = `${delay}ms`;
            }, parseInt(delay));
          }
        });
      },
      {
        threshold: CONFIG.SCROLL_THRESHOLD,
        rootMargin: "-100px 0px 0px 0px",
      },
    );

    this.elements.forEach((el) => observer.observe(el));
  }
}

// ============================================
// NOTIFICATION SYSTEM
// ============================================

class Notification {
  static show(message, type = "success") {
    const notification = document.createElement("div");
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 25px;
      background: ${type === "success" ? "var(--primary)" : "var(--error)"};
      color: ${type === "success" ? "var(--dark-bg)" : "white"};
      border-radius: var(--radius);
      z-index: 10000;
      font-weight: 600;
      box-shadow: var(--shadow-lg);
      animation: slideIn 0.4s ease;
      max-width: 350px;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = "slideOut 0.4s ease";
      setTimeout(() => notification.remove(), 400);
    }, CONFIG.NOTIFICATION_DURATION);
  }
}

// ============================================
// CONTACT FORM HANDLER
// ============================================

class ContactForm {
  constructor() {
    this.form = document.getElementById("contactForm");
    if (this.form) {
      this.form.addEventListener("submit", (e) => this.handleSubmit(e));
    }
  }

  handleSubmit(e) {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();

    if (!this.validate(name, email, message)) return;

    this.sendEmail(name, email, message);
  }

  validate(name, email, message) {
    if (!name || !email || !message) {
      Notification.show("Please fill in all fields", "error");
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Notification.show("Please enter a valid email", "error");
      return false;
    }

    return true;
  }

  sendEmail(name, email, message) {
    const subject = `New Message from ${name}`;
    const body = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;
    const mailtoLink = `mailto:rawanabusittah@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.location.href = mailtoLink;
    Notification.show("Thank you for your message!", "success");
    this.form.reset();
  }
}

// ============================================
// ARTICLE MODAL
// ============================================

class ArticleModal {
  constructor() {
    this.modal = document.getElementById("articleModal");

    // If the page doesn't include the article modal, skip initialization
    // (prevents errors on pages like presentations.html which have no modal)
    if (!this.modal) {
      this.overlay = null;
      this.closeBtn = null;
      this.modalBody = null;
      this.modalTitle = null;
      this.modalCategory = null;
      this.modalSubtitle = null;
      this.cache = {};
      return;
    }

    this.overlay = document.getElementById("modalOverlay");
    this.closeBtn = document.getElementById("modalClose");
    this.modalBody = document.getElementById("modalBody");
    this.modalTitle = document.getElementById("articleModalTitle");
    this.modalCategory = this.modal.querySelector(
      ".modal-article .article-category",
    );
    this.modalSubtitle = document.getElementById("modalSubtitle");
    this.cache = {};
    this.init();
  }

  init() {
    if (!this.modal) return;

    // Only attach modal behavior to article cards that have a data-article
    // attribute. This prevents presentation links from being intercepted.
    document.querySelectorAll(".article-card[data-article]").forEach((card) => {
      card.addEventListener("click", (e) => {
        e.preventDefault();
        this.open(card);
      });
    });

    this.closeBtn.addEventListener("click", () => this.close());
    this.overlay.addEventListener("click", () => this.close());
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") this.close();
    });
  }

  async open(card) {
    const id = card.dataset.article;
    const title = card.querySelector(".article-title");
    const category = card.querySelector(".article-category");
    const subtitle = card.querySelector(".article-title-en");
    if (title) this.modalTitle.textContent = title.textContent;
    if (category) this.modalCategory.textContent = category.textContent;
    if (subtitle) this.modalSubtitle.textContent = subtitle.textContent;

    this.modalBody.textContent = "Loading article…";
    this.modal.classList.add("open");
    document.body.classList.add("modal-open");

    if (!this.cache[id]) {
      this.cache[id] = await this.loadContent(id);
    }

    if (!this.modal.classList.contains("open")) return;
    this.modalBody.innerHTML = this.cache[id];
    this.modal.querySelector(".modal-content").scrollTop = 0;
  }

  async loadContent(id) {
    try {
      const res = await fetch(`articles/${id}.txt?v=${Date.now()}`);
      if (!res.ok) throw new Error("not found");
      return this.toParagraphs(await res.text());
    } catch {
      return "<p>The article text could not be loaded.</p>";
    }
  }

  toParagraphs(text) {
    if (!text) {
      return "<p>The article text could not be loaded.</p>";
    }
    return text
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => `<p>${p}</p>`)
      .join("");
  }

  close() {
    this.modal.classList.remove("open");
    document.body.classList.remove("modal-open");
  }
}

// ============================================
// MOBILE MENU
// ============================================

class MobileMenu {
  constructor() {
    this.menuToggle = document.getElementById("menuToggle");
    this.navMenu = document.getElementById("navMenu");
    this.navLinks = document.querySelectorAll(".nav-link");
    this.init();
  }

  init() {
    this.menuToggle.addEventListener("click", () => this.toggle());
    this.navLinks.forEach((link) => {
      link.addEventListener("click", () => this.close());
    });
  }

  toggle() {
    this.navMenu.classList.toggle("active");
  }

  close() {
    this.navMenu.classList.remove("active");
  }
}

// ============================================
// APP INITIALIZATION
// ============================================

document.addEventListener("DOMContentLoaded", () => {
  new Preloader();
  new ThemeManager();
  new SmoothScroll();
  new NavbarActive();
  new AnimationOnScroll();
  new ContactForm();
  new MobileMenu();
  new ArticleModal();

  // Debug badge removed for production

  // Add global animation styles
  const style = document.createElement("style");
  style.textContent = `
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(100px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @keyframes slideOut {
      from {
        opacity: 1;
        transform: translateX(0);
      }
      to {
        opacity: 0;
        transform: translateX(100px);
      }
    }

    .nav-menu.active {
      display: flex;
    }
  `;
  document.head.appendChild(style);
});
