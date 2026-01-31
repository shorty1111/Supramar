/* =============================================
   SUPRAMAR Fitness Club - Vanilla JavaScript
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
  const ua = navigator.userAgent ?? '';
  const platform = navigator.platform ?? '';
  const maxTouchPoints = navigator.maxTouchPoints ?? 0;

  const isIPad = /iPad/.test(ua) || (platform === 'MacIntel' && maxTouchPoints > 1);
  const isIPhone = /iPhone|iPod/.test(ua);
  const isAndroidPhone = /Android/.test(ua) && /Mobile/.test(ua);
  const isPhone = isIPhone || isAndroidPhone;
  const disableHeavyEffects = prefersReducedMotion || isPhone;

  if (isPhone) document.documentElement.classList.add('device-phone');
  if (isIPad) document.documentElement.classList.add('device-ipad');

  // Stable viewport height for iOS Safari (address bar / toolbar resizing)
  const setVhVar = () => {
    document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
  };
  setVhVar();
  window.addEventListener('resize', setVhVar);
  window.addEventListener('orientationchange', setVhVar);

  // Prevent iOS rubber-band overscroll revealing fixed hero behind the page
  if (isIPhone || isIPad) {
    let lastTouchY = 0;

    window.addEventListener(
      'touchstart',
      (e) => {
        lastTouchY = e.touches?.[0]?.clientY ?? 0;
      },
      { passive: true }
    );

    window.addEventListener(
      'touchmove',
      (e) => {
        if (document.body.classList.contains('scroll-locked')) return;
        const currentTouchY = e.touches?.[0]?.clientY ?? lastTouchY;
        const deltaY = currentTouchY - lastTouchY;
        lastTouchY = currentTouchY;

        const scrollTop = window.scrollY || window.pageYOffset || 0;
        const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight || 0;
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
        const atTop = scrollTop <= 0;
        const atBottom = scrollTop + viewportHeight >= scrollHeight - 1;

        if ((atTop && deltaY > 0) || (atBottom && deltaY < 0)) {
          e.preventDefault();
        }
      },
      { passive: false }
    );
  }

  // =============================================
  // HEADER SCROLL EFFECT
  // =============================================
  const header = document.getElementById('header');
  
  const handleHeaderScroll = () => {
    if (!header) return;
    if (window.scrollY > 100) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  // =============================================
  // MOBILE MENU
  // =============================================
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
  let scrollLockY = 0;
  let touchMoveLocked = false;

  const preventDocumentTouchMove = (e) => {
    e.preventDefault();
  };

  const lockScroll = () => {
    scrollLockY = window.scrollY || window.pageYOffset || 0;
    document.documentElement.classList.add('scroll-locked');
    document.body.classList.add('scroll-locked');

    if (!touchMoveLocked) {
      document.addEventListener('touchmove', preventDocumentTouchMove, { passive: false });
      touchMoveLocked = true;
    }
  };

  const unlockScroll = () => {
    document.documentElement.classList.remove('scroll-locked');
    document.body.classList.remove('scroll-locked');

    if (touchMoveLocked) {
      document.removeEventListener('touchmove', preventDocumentTouchMove, { passive: false });
      touchMoveLocked = false;
    }

    const currentY = window.scrollY || window.pageYOffset || 0;
    if (Math.abs(currentY - scrollLockY) > 1) {
      const prevScrollBehavior = document.documentElement.style.scrollBehavior;
      document.documentElement.style.scrollBehavior = 'auto';
      window.scrollTo(0, scrollLockY);
      document.documentElement.style.scrollBehavior = prevScrollBehavior;
    }
  };

  const setMobileMenuOpen = (open) => {
    if (!mobileMenuBtn || !mobileMenu) return;

    mobileMenuBtn.classList.toggle('active', open);
    mobileMenu.classList.toggle('active', open);
    header?.classList.toggle('menu-open', open);

    mobileMenuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    mobileMenu.setAttribute('aria-hidden', open ? 'false' : 'true');

    if (open) {
      lockScroll();
    } else {
      unlockScroll();
    }
  };
  
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.contains('active');
      setMobileMenuOpen(!isOpen);
      mobileMenuBtn.blur();
    });
  }
  
  mobileNavLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;

      e.preventDefault();
      setMobileMenuOpen(false);

      const target = document.querySelector(href);
      if (!target) return;

      setTimeout(() => {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 250);
    });
  });

  window.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!mobileMenu) return;
    if (!mobileMenu.classList.contains('active')) return;
    setMobileMenuOpen(false);
  });

  window.addEventListener('resize', () => {
    if (!mobileMenu) return;
    if (!mobileMenu.classList.contains('active')) return;
    if (window.innerWidth > 960) setMobileMenuOpen(false);
  });

  // =============================================
  // HERO PARALLAX EFFECTS 
  // =============================================
  const heroBg = document.getElementById('heroBg');
  const heroOverlay = document.getElementById('heroOverlay');
  const heroContent = document.getElementById('heroContent');
  const scrollIndicator = document.getElementById('scrollIndicator');
  const heroImg = heroBg ? heroBg.querySelector('img') : null;
  const aboutSection = document.getElementById('about');
  
  const handleHeroParallax = () => {
    if (!heroOverlay || !heroContent) return;
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
    
    // Scale from 1 to 1.2 over 800px scroll
    const maxScaleIncrease = disableHeavyEffects ? 0 : 0.2;
    const scaleDistance = 800;
    const scale = 1 + (Math.min(scrollY / scaleDistance, 1) * maxScaleIncrease);
    if (maxScaleIncrease > 0) {
      if (heroImg) heroImg.style.transform = `translate3d(0, 0, 0) scale(${scale})`;
    } else {
      if (heroImg) heroImg.style.transform = '';
    }
    
    // Keep overlay readable, but fade hero content fully out by the time
    // the About section's top edge hits mid-screen.
    const overlayOpacity = disableHeavyEffects ? 1 : clamp(1 - (scrollY / 600) * 0.7, 0.3, 1);

    let contentOpacity = 1;
    if (aboutSection) {
      const aboutTop = aboutSection.getBoundingClientRect().top;
      const fadeStart = windowHeight; // About top at bottom edge
      const fadeEnd = windowHeight * 0.5; // About top at mid-screen
      const t = (aboutTop - fadeEnd) / (fadeStart - fadeEnd);
      contentOpacity = clamp(t, 0, 1);
    } else {
      contentOpacity = clamp(1 - scrollY / 600, 0, 1);
    }

    const combinedOpacity = Math.min(contentOpacity, overlayOpacity);

    heroOverlay.style.opacity = overlayOpacity;
    heroContent.style.opacity = combinedOpacity;
    heroContent.style.pointerEvents = combinedOpacity < 0.05 ? 'none' : '';
    if (scrollIndicator) scrollIndicator.style.opacity = combinedOpacity;
  };

  // =============================================
  // CONTACT BACKGROUND PARALLAX
  // =============================================
  const contactBg = document.getElementById('contactBg');
  
  const handleContactParallax = () => {
    if (disableHeavyEffects) return;
    if (!contactBg) return;
    const contactSection = document.getElementById('contact');
    const rect = contactSection.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    if (rect.top < windowHeight && rect.bottom > 0) {
      const progress = (windowHeight - rect.top) / (windowHeight + rect.height);
      const yOffset = progress * 30;
      contactBg.style.transform = `translateY(${yOffset}%)`;
    }
  };

  // =============================================
  // SCROLL RAF THROTTLE (mobile-friendly)
  // =============================================
  let scrollTicking = false;
  const handleScroll = () => {
    if (scrollTicking) return;
    scrollTicking = true;

    window.requestAnimationFrame(() => {
      scrollTicking = false;
      handleHeaderScroll();
      handleHeroParallax();
      handleContactParallax();
    });
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('resize', handleScroll);
  handleScroll();

  // =============================================
  // INTERSECTION OBSERVER FOR ANIMATIONS
  // =============================================
  const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);
  
  // About Section
  const aboutTitle = document.getElementById('aboutTitle');
  const aboutContent = document.getElementById('aboutContent');
  const stats = document.querySelectorAll('.stat');
  
  if (aboutTitle) observer.observe(aboutTitle);
  if (aboutContent) observer.observe(aboutContent);
  stats.forEach(stat => observer.observe(stat));
  
  // Founder Section
  const founderMedia = document.getElementById('founderMedia');
  const founderContent = document.getElementById('founderContent');
  if (founderMedia) observer.observe(founderMedia);
  if (founderContent) observer.observe(founderContent);

  // Vision Section
  const visionTitle = document.getElementById('visionTitle');
  const visionContent = document.getElementById('visionContent');
  if (visionTitle) observer.observe(visionTitle);
  if (visionContent) observer.observe(visionContent);
  
  // Contact Section
  const contactTitle = document.getElementById('contactTitle');
  const contactInfoItems = document.querySelectorAll('.contact-info-item');
  
  if (contactTitle) observer.observe(contactTitle);
  contactInfoItems.forEach((item, i) => {
    item.style.transitionDelay = `${i * 0.15}s`;
    observer.observe(item);
  });

  // =============================================
  // SMOOTH SCROLL FOR ANCHOR LINKS
  // =============================================
  const sectionIndicator = document.querySelector('.section-indicator');
  const sectionIndicatorLinks = document.querySelectorAll('.section-indicator-link');
  const heroSpacer = document.querySelector('.hero-spacer');
  const sectionIds = Array.from(sectionIndicatorLinks)
    .map((link) => link.getAttribute('data-section'))
    .filter(Boolean);
  const sections = sectionIds.map((id) => document.getElementById(id)).filter(Boolean);
  const nonHeroSections = sections.filter((section) => section.id !== 'hero');

  const setActiveSection = (id) => {
    sectionIndicatorLinks.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('data-section') === id);
    });
  };

  const updateActiveSectionFromScroll = () => {
    if (!sectionIndicator) return;
    if (sections.length === 0) return;

    const heroThreshold = (heroSpacer?.offsetHeight ?? window.innerHeight) * 0.5;
    if (window.scrollY < heroThreshold) {
      setActiveSection('hero');
      return;
    }

    const focusY = window.innerHeight * 0.4;
    let activeId = null;

    for (const section of nonHeroSections) {
      const rect = section.getBoundingClientRect();
      if (rect.top <= focusY && rect.bottom >= focusY) {
        activeId = section.id;
        break;
      }
    }

    if (!activeId) {
      let bestId = nonHeroSections[0]?.id ?? sections[0].id;
      let bestDist = Number.POSITIVE_INFINITY;
      for (const section of nonHeroSections) {
        const dist = Math.abs(section.getBoundingClientRect().top - focusY);
        if (dist < bestDist) {
          bestDist = dist;
          bestId = section.id;
        }
      }
      activeId = bestId;
    }

    setActiveSection(activeId);
  };

  if (sectionIndicator && sections.length > 0) {
    updateActiveSectionFromScroll();

    let indicatorTicking = false;
    const onIndicatorScroll = () => {
      if (indicatorTicking) return;
      indicatorTicking = true;
      window.requestAnimationFrame(() => {
        indicatorTicking = false;
        updateActiveSectionFromScroll();
      });
    };

    window.addEventListener('scroll', onIndicatorScroll, { passive: true });
    window.addEventListener('resize', onIndicatorScroll);
    window.addEventListener('hashchange', updateActiveSectionFromScroll);
  }

  const logoLink = document.querySelector('a.logo');
  if (logoLink) {
    logoLink.addEventListener('click', (e) => {
      if (e.defaultPrevented) return;
      e.preventDefault();
      setMobileMenuOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  
  anchorLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      if (e.defaultPrevented) return;
      const href = link.getAttribute('href');
      if (href === '#') return;
      
      e.preventDefault();
      if (href === '#hero') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const target = document.querySelector(href);
      
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // =============================================
  // REVEAL PHONE NUMBER (anti-scrape friendly UX)
  // =============================================
  const revealPhoneButtons = document.querySelectorAll('.js-reveal-phone');

  revealPhoneButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const wrapper = btn.closest('.contact-reveal');
      const phoneText = wrapper?.getAttribute('data-phone');
      const telValue = wrapper?.getAttribute('data-tel');
      const phoneLink = wrapper?.querySelector('.js-phone-link');

      if (!wrapper || !phoneText || !telValue || !phoneLink) return;

      phoneLink.textContent = phoneText;
      phoneLink.setAttribute('href', `tel:${telValue}`);
      phoneLink.hidden = false;

      btn.hidden = true;
      btn.setAttribute('aria-expanded', 'true');
    });
  });

  // =============================================
  // HOVER EFFECTS FOR BUTTONS
  // =============================================
  const buttons = document.querySelectorAll('.btn-primary');
  
  buttons.forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      btn.style.transform = 'scale(1.05)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'scale(1)';
    });
    btn.addEventListener('mousedown', () => {
      btn.style.transform = 'scale(0.95)';
    });
    btn.addEventListener('mouseup', () => {
      btn.style.transform = 'scale(1.05)';
    });
  });
});
