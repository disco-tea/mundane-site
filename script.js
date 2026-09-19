(function () {
  'use strict';

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  // ---- Background photo grid (default view; scrolls away to reveal the copy below) ----
  var PHOTOS = ['photo-tree.jpg', 'photo-hose.jpg', 'photo-mirror.jpg', 'photo-perrier.jpg'];
  var POSITIONS = ['50% 25%', '50% 75%', '25% 50%', '75% 50%', '50% 50%'];
  var COLORS = ['terracotta', 'sage', 'slate', 'ochre'];
  var GRID_CELL_COUNT = 32;

  function randomFlicker(el, minDur, maxDur) {
    var dur = minDur + Math.random() * (maxDur - minDur);
    el.style.animationDuration = dur.toFixed(2) + 's';
    el.style.animationDelay = '-' + (Math.random() * dur).toFixed(2) + 's';
  }

  var photoGrid = document.getElementById('photo-grid');
  if (photoGrid) {
    var gridFrag = document.createDocumentFragment();
    var photoCount = 0;
    var colorCount = 0;
    for (var i = 0; i < GRID_CELL_COUNT; i++) {
      var cell = document.createElement('div');
      cell.className = 'grid-cell';
      var inner = document.createElement('div');
      inner.className = 'cell-inner';
      if (i % 4 === 3) {
        inner.classList.add('grid-cell--' + COLORS[colorCount % COLORS.length]);
        colorCount++;
      } else {
        var img = document.createElement('img');
        img.src = 'assets/img/' + PHOTOS[photoCount % PHOTOS.length];
        img.alt = '';
        img.loading = i < 12 ? 'eager' : 'lazy';
        img.style.objectPosition = POSITIONS[photoCount % POSITIONS.length];
        photoCount++;
        inner.appendChild(img);
      }
      randomFlicker(inner, 4, 11);
      cell.appendChild(inner);
      gridFrag.appendChild(cell);
    }
    photoGrid.appendChild(gridFrag);
  }

  // ---- Floating prompt phrases (walkthrough section) — ambient, kept to the margins so
  // they never sit on top of the heading or cards; fade fully in and out, never tied to scroll ----
  var FLOATING_PROMPTS = [
    'The mug you always reach for.',
    'A window you never look out of.',
    'The sound of your street at night.',
    'A shadow you like.',
    'The chair no one sits in.',
    'Where the light lands at noon.',
    'Your hands, doing something ordinary.',
    'A corner you’ve never photographed.'
  ];
  var FLOATING_POSITIONS = [
    { top: '3%', left: '5%' }, { top: '2%', left: '58%' },
    { top: '6%', left: '32%' }, { top: '5%', left: '82%' },
    { top: '95%', left: '8%' }, { top: '93%', left: '60%' },
    { top: '96%', left: '35%' }, { top: '92%', left: '84%' }
  ];
  var promptField = document.getElementById('prompt-field');
  if (promptField) {
    var pfFrag = document.createDocumentFragment();
    FLOATING_PROMPTS.forEach(function (text, idx) {
      var span = document.createElement('span');
      span.className = 'floating-prompt';
      span.textContent = text;
      var pos = FLOATING_POSITIONS[idx % FLOATING_POSITIONS.length];
      span.style.top = pos.top;
      span.style.left = pos.left;
      randomFlicker(span, 6, 13);
      pfFrag.appendChild(span);
    });
    promptField.appendChild(pfFrag);
  }

  // ---- Infinite marquee strip ("SLOW DOWN" / "LOOK CLOSER") — pure CSS loop, not tied to scroll ----
  var marqueeTrack = document.getElementById('marquee-track');
  if (marqueeTrack) {
    var marqueeWords = [];
    for (var m = 0; m < 8; m++) { marqueeWords.push('SLOW DOWN'); marqueeWords.push('LOOK CLOSER'); }
    var marqueeItems = marqueeWords.concat(marqueeWords);
    var marqueeFrag = document.createDocumentFragment();
    marqueeItems.forEach(function (text) {
      var span = document.createElement('span');
      span.className = 'word';
      span.textContent = text;
      marqueeFrag.appendChild(span);
    });
    marqueeTrack.appendChild(marqueeFrag);
  }

  // ---- Nav background on scroll ----
  var nav = document.getElementById('nav');

  // ---- Intro: grid + copy scroll away together as you leave the pinned section ----
  var introSection = document.getElementById('intro');
  var gridCells = photoGrid ? Array.prototype.slice.call(photoGrid.children) : [];
  var heroCopy = document.getElementById('hero-copy');
  var scrollCue = document.getElementById('scrollcue');

  function updateOnScroll() {
    var y = window.scrollY || window.pageYOffset || 0;

    if (nav) { nav.classList.toggle('nav-scrolled', y > 40); }

    if (introSection) {
      var rect = introSection.getBoundingClientRect();
      var vh = window.innerHeight || 800;
      var total = rect.height - vh;
      var p = total > 0 ? clamp(-rect.top / total, 0, 1) : 0;

      gridCells.forEach(function (cell, idx) {
        var stagger = (idx % 8) / 8 * 0.25;
        var start = stagger;
        var end = start + 0.6;
        var local = clamp((p - start) / (end - start), 0, 1);
        var scale = lerp(1, 0.86, local);
        var ty = lerp(0, -6, local);
        var opacity = lerp(1, 0, local);
        cell.style.transform = 'translate3d(0,' + ty.toFixed(2) + '%,0) scale(' + scale.toFixed(3) + ')';
        cell.style.opacity = opacity.toFixed(3);
      });

      if (heroCopy) {
        var copyLocal = clamp(p * 1.8, 0, 1);
        heroCopy.style.opacity = (1 - copyLocal).toFixed(3);
        heroCopy.style.transform = 'translateY(' + lerp(0, -24, copyLocal).toFixed(1) + 'px)';
      }
      if (scrollCue) {
        scrollCue.style.opacity = (1 - clamp(p * 4, 0, 1)).toFixed(3);
      }
    }
  }

  window.addEventListener('scroll', updateOnScroll, { passive: true });
  window.addEventListener('resize', updateOnScroll, { passive: true });
  updateOnScroll();

  // ---- Reveal-on-scroll for the body copy + waitlist block ----
  var revealBlock = document.getElementById('reveal-block');
  if (revealBlock && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { revealBlock.classList.add('in'); }
      });
    }, { threshold: 0.3 });
    io.observe(revealBlock);
  } else if (revealBlock) {
    revealBlock.classList.add('in');
  }

  // ---- Prompt cards slider ----
  var track = document.getElementById('slider-track');
  var dotsWrap = document.getElementById('dots');
  var prevBtn = document.getElementById('slider-prev');
  var nextBtn = document.getElementById('slider-next');

  if (track && dotsWrap) {
    var slideCount = track.querySelectorAll('.slide').length;
    for (var d = 0; d < slideCount; d++) {
      var dot = document.createElement('span');
      dot.className = 'd' + (d === 0 ? ' active' : '');
      dotsWrap.appendChild(dot);
    }

    var sliderIndex = 0;
    function setActiveDot(idx) {
      sliderIndex = idx;
      var dots = dotsWrap.children;
      for (var j = 0; j < dots.length; j++) {
        dots[j].classList.toggle('active', j === idx);
      }
    }

    function goToSlide(i) {
      var slides = track.querySelectorAll('.slide');
      var slide = slides[clamp(i, 0, slides.length - 1)];
      if (slide) { track.scrollTo({ left: slide.offsetLeft - 24, behavior: 'smooth' }); }
    }

    track.addEventListener('scroll', function () {
      var slide = track.querySelector('.slide');
      var slideWidth = slide ? (slide.offsetWidth + 24) : 300;
      var idx = clamp(Math.round(track.scrollLeft / slideWidth), 0, slideCount - 1);
      if (idx !== sliderIndex) { setActiveDot(idx); }
    }, { passive: true });

    if (prevBtn) { prevBtn.addEventListener('click', function () { goToSlide(sliderIndex - 1); }); }
    if (nextBtn) { nextBtn.addEventListener('click', function () { goToSlide(sliderIndex + 1); }); }
  }

  // ---- Waitlist form ----
  var form = document.getElementById('waitlist-form');
  var thanks = document.getElementById('thanks');
  if (form && thanks) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = document.getElementById('wf-email').value || '';
      if (email.indexOf('@') > 0) {
        form.hidden = true;
        thanks.hidden = false;
      }
    });
  }
})();
