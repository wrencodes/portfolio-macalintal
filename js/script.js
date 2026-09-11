const navToggle = document.getElementById('nav-toggle');
const mainNav = document.getElementById('main-nav');

navToggle.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

mainNav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    mainNav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

const copyBtn = document.getElementById('copy-email');
const copyStatus = document.getElementById('copy-status');

copyBtn.addEventListener('click', async () => {
  const email = copyBtn.dataset.email;
  try {
    await navigator.clipboard.writeText(email);
    copyStatus.textContent = 'Copied';
  } catch (err) {
    copyStatus.textContent = 'Copy failed — select manually';
  }
  copyStatus.classList.add('show');
  setTimeout(() => copyStatus.classList.remove('show'), 1800);
});

const typedEl = document.getElementById('typed-text');
const roles = ['Backend Developer', 'UI/UX Designer','IT Specialist'];
let roleIndex = 0;
let charIndex = 0;
let deleting = false;

function typeLoop() {
  const current = roles[roleIndex];

  if (!deleting) {
    charIndex++;
    if (charIndex > current.length) {
      deleting = true;
      setTimeout(typeLoop, 1200);
      return;
    }
  } else {
    charIndex--;
    if (charIndex === 0) {
      deleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
    }
  }

  typedEl.textContent = current.slice(0, charIndex);
  setTimeout(typeLoop, deleting ? 40 : 70);
}

if (typedEl) typeLoop();

const navLinks = document.querySelectorAll('.nav-link');
const sections = Array.from(navLinks)
  .map((link) => document.getElementById(link.dataset.section))
  .filter(Boolean);

const spyObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach((link) => {
          link.classList.toggle('active', link.dataset.section === id);
        });
      }
    });
  },
  { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
);

sections.forEach((section) => spyObserver.observe(section));

const aboutToggle = document.getElementById('about-toggle');
const aboutMore = document.getElementById('about-more');

if (aboutToggle) {
  aboutToggle.addEventListener('click', () => {
    const isHidden = aboutMore.hasAttribute('hidden');
    if (isHidden) {
      aboutMore.removeAttribute('hidden');
      aboutToggle.textContent = 'Show less';
    } else {
      aboutMore.setAttribute('hidden', '');
      aboutToggle.textContent = 'Keep reading';
    }
    aboutToggle.setAttribute('aria-expanded', String(isHidden));
  });
}

document.getElementById('year').textContent = new Date().getFullYear();


const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion) {
  initAnimations();
}

function initAnimations() {
  
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .section-heading-reveal, .tag, .about-photo, .timeline-item');

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  revealEls.forEach((el) => revealObserver.observe(el));

  
  const timeline = document.querySelector('.timeline');
  if (timeline) {
    const timelineObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            timeline.classList.add('drawn');
            timelineObserver.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );
    timelineObserver.observe(timeline);
  }

  
  const portraitFrame = document.querySelector('.portrait-frame');
  const heroPortrait = document.querySelector('.hero-portrait');

  if (portraitFrame && heroPortrait) {
    heroPortrait.addEventListener('mousemove', (e) => {
      const rect = heroPortrait.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      portraitFrame.style.transform = `rotateY(${x * 12}deg) rotateX(${y * -12}deg)`;
    });

    heroPortrait.addEventListener('mouseleave', () => {
      portraitFrame.style.transform = 'rotateY(0) rotateX(0)';
    });

    portraitFrame.style.transition = 'transform 0.15s ease-out, box-shadow 0.4s ease';
  }

  
  const magneticBtns = document.querySelectorAll('.btn, .icon-btn');

  magneticBtns.forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const strength = btn.classList.contains('icon-btn') ? 0.2 : 0.15;
      const x = (e.clientX - rect.left - rect.width / 2) * strength;
      const y = (e.clientY - rect.top - rect.height / 2) * strength;
      if (!btn.dataset.originalTransform) {
        btn.dataset.originalTransform = getComputedStyle(btn).transform;
      }
      btn.style.transform = `translate(${x}px, ${y}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = btn.dataset.originalTransform || '';
    });
  });

  
}
