(function () {
  'use strict';

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  // ---- Marquee content ("SLOW DOWN" / "LOOK CLOSER" repeated, duplicated for the seamless loop) ----
  var marqueeTrack = document.getElementById('marquee-track');
  if (marqueeTrack) {
    var words = [];
    for (var i = 0; i < 8; i++) { words.push('SLOW DOWN'); words.push('LOOK CLOSER'); }
    var items = words.concat(words);
    var frag = document.createDocumentFragment();
    items.forEach(function (text) {
      var span = document.createElement('span');
      span.className = 'word';
      span.textContent = text;
      frag.appendChild(span);
    });
    marqueeTrack.appendChild(frag);
  }

  // ---- Nav background on scroll ----
  var nav = document.getElementById('nav');

  // ---- Hero parallax tiles ----
  var heroTiles = Array.prototype.slice.call(
    document.querySelectorAll('#hero-field .photo-tile[data-depth]')
  );

  // ---- Slow-section progress-driven tiles ----
  var slowSection = document.getElementById('slow-section');
  var slowTiles = Array.prototype.slice.call(
    document.querySelectorAll('#slow-field .photo-tile[data-start]')
  );
  var slowBaseRotate = slowTiles.map(function (el) {
    var m = /rotate\(([-\d.]+)deg\)/.exec(el.style.transform || '');
    return m ? parseFloat(m[1]) : 0;
  });

  function updateOnScroll() {
    var y = window.scrollY || window.pageYOffset || 0;

    if (nav) { nav.classList.toggle('nav-scrolled', y > 40); }

    heroTiles.forEach(function (el) {
      var depth = parseFloat(el.dataset.depth) || 0;
      var ty = -(y * depth);
      var rot = /rotate\(([-\d.]+)deg\)/.exec(el.style.transform || '');
      var deg = rot ? rot[1] : '0';
      el.style.transform = 'translate3d(0,' + ty.toFixed(1) + 'px,0) rotate(' + deg + 'deg)';
    });

    if (slowSection) {
      var rect = slowSection.getBoundingClientRect();
      var vh = window.innerHeight || 800;
      var total = rect.height - vh;
      var p = total > 0 ? clamp(-rect.top / total, 0, 1) : 0;

      slowTiles.forEach(function (el, idx) {
        var start = parseFloat(el.dataset.start) || 0;
        var end = parseFloat(el.dataset.end) || 1;
        var toY = parseFloat(el.dataset.toY) || 0;
        var local = clamp((p - start) / (end - start), 0, 1);
        var scale = lerp(0.55, 1.08, local);
        var yStart = 26;
        var yPos = lerp(yStart, toY, local);
        var opacity = lerp(0.0, 0.95, clamp(local * 1.6, 0, 1));
        var fadeLocal = clamp((p - 0.82) / 0.18, 0, 1);
        opacity = opacity * (1 - fadeLocal * 0.8);
        var deg = slowBaseRotate[idx];
        var blur = Math.round(30 * local);
        var blur2 = Math.round(60 * local);

        el.style.transform = 'translate3d(0,' + yPos.toFixed(1) + '%,0) scale(' + scale.toFixed(3) + ') rotate(' + deg + 'deg)';
        el.style.opacity = opacity.toFixed(3);
        el.style.boxShadow = '0 ' + blur + 'px ' + blur2 + 'px rgba(0,0,0,0.5)';

        var cap = el.querySelector('.cap');
        if (cap) { cap.style.display = local > 0.5 ? '' : 'none'; }
      });
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

  // ---- Screens slider ----
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
