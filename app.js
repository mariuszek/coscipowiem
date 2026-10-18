// Theme Management (Light / Dark)
const themeToggleBtn = document.getElementById('themeToggle');
const themeToggleMobile = document.getElementById('themeToggleMobile');
const themeIcon = document.getElementById('themeIcon');
const themeIconMobile = document.getElementById('themeIconMobile');
const themeText = document.getElementById('themeText');
const root = document.documentElement;

function getPreferredTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    return savedTheme;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme) {
  if (theme === 'dark') {
    root.setAttribute('data-theme', 'dark');
    if (themeText) themeText.textContent = siteContent.ui.themeToggle.dark;
    const moonSvg = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>`;
    if (themeIcon) themeIcon.innerHTML = moonSvg;
    if (themeIconMobile) themeIconMobile.innerHTML = moonSvg;
  } else {
    root.setAttribute('data-theme', 'light');
    if (themeText) themeText.textContent = siteContent.ui.themeToggle.light;
    const sunSvg = `<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>`;
    if (themeIcon) themeIcon.innerHTML = sunSvg;
    if (themeIconMobile) themeIconMobile.innerHTML = sunSvg;
  }
  localStorage.setItem('theme', theme);
}

function toggleTheme() {
  const current = root.getAttribute('data-theme') || getPreferredTheme();
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
}

if (themeToggleBtn) themeToggleBtn.addEventListener('click', toggleTheme);
if (themeToggleMobile) themeToggleMobile.addEventListener('click', toggleTheme);
applyTheme(getPreferredTheme());

// Mobile Navigation Drawer
const navToggle = document.getElementById('navToggle');
const navContainer = document.getElementById('navContainer');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const navLinks = document.querySelectorAll('.nav-link');

function toggleSidebar(open) {
  const shouldOpen = open !== undefined ? open : !navContainer.classList.contains('open');
  navContainer.classList.toggle('open', shouldOpen);
  navToggle.classList.toggle('active', shouldOpen);
  sidebarOverlay.classList.toggle('active', shouldOpen);
  document.body.style.overflow = shouldOpen && window.innerWidth <= 1024 ? 'hidden' : '';
}

if (navToggle) {
  navToggle.addEventListener('click', () => toggleSidebar());
}

if (sidebarOverlay) {
  sidebarOverlay.addEventListener('click', () => toggleSidebar(false));
}

navLinks.forEach(link => {
  link.addEventListener('click', () => {
    if (window.innerWidth <= 1024) {
      toggleSidebar(false);
    }
  });
});

// Close on Escape key
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && navContainer.classList.contains('open')) {
    toggleSidebar(false);
  }
});

// Scroll Progress & Active Section Highlighting
const progressBar = document.getElementById('progressBar');
const backToTopBtn = document.getElementById('backToTop');
const sections = document.querySelectorAll('section[id], header[id]');

function handleScroll() {
  const scrollY = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;

  if (progressBar) {
    progressBar.style.width = `${progress}%`;
  }

  // Back to top visibility
  if (backToTopBtn) {
    if (scrollY > 400) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  }

  // Highlight active section in sidebar
  let currentSectionId = '';
  sections.forEach(section => {
    const top = section.offsetTop - 160;
    const height = section.offsetHeight;
    if (scrollY >= top && scrollY < top + height) {
      currentSectionId = section.getAttribute('id');
    }
  });

  if (currentSectionId) {
    navLinks.forEach(link => {
      if (link.getAttribute('href') === `#${currentSectionId}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
}

window.addEventListener('scroll', handleScroll, { passive: true });
handleScroll();

if (backToTopBtn) {
  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// Instant Book Search / Filtering
const bookSearch = document.getElementById('bookSearch');
const bookCards = document.querySelectorAll('.book-card');

if (bookSearch) {
  bookSearch.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    bookCards.forEach(card => {
      const content = (card.getAttribute('data-title') || '') + ' ' + card.innerText.toLowerCase();
      if (!query || content.includes(query)) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  });
}
