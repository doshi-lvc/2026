(function () {
  var header = document.querySelector('.site-header');
  var hero = document.querySelector('.hero, .a-hero');
  var floatCta = document.querySelector('.float-cta');

  // header style / floating CTA on scroll
  function onScroll() {
    var y = window.scrollY;
    var limit = hero ? hero.offsetHeight - 80 : 40;
    if (header) header.classList.toggle('is-solid', y > limit);
    if (floatCta) floatCta.classList.toggle('is-show', y > window.innerHeight * 0.8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // mobile nav
  var toggle = document.querySelector('.nav-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = document.body.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.querySelectorAll('.nav a').forEach(function (a) {
      a.addEventListener('click', function () {
        document.body.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // reveal on scroll
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  // count-up numbers
  var counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window && counters.length) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        var target = parseFloat(el.getAttribute('data-count'));
        var start = performance.now();
        var dur = 1400;
        (function tick(now) {
          var p = Math.min((now - start) / dur, 1);
          var v = Math.round(target * (1 - Math.pow(1 - p, 3)));
          el.textContent = v.toLocaleString('ja-JP');
          if (p < 1) requestAnimationFrame(tick);
        })(start);
        co.unobserve(el);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { co.observe(el); });
  }

  // village film: load the nature loop only when it comes near the screen (saves mobile data)
  var film = document.querySelector('.film-bg');
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // PC: high-quality 1080p (HEVC) or 720p (H.264); phones / data saver: the light version
  function pickFilmSrc(v) {
    var saveData = navigator.connection && navigator.connection.saveData;
    if (window.innerWidth >= 900 && !saveData) {
      if (v.canPlayType('video/mp4; codecs="hvc1"')) return v.getAttribute('data-src-hevc');
      return v.getAttribute('data-src-hd');
    }
    return v.getAttribute('data-src');
  }
  if (film && !reduceMotion && 'IntersectionObserver' in window) {
    var fo = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          if (!film.src) film.src = pickFilmSrc(film);
          var p = film.play();
          if (p && p.catch) p.catch(function () {});
        } else if (film.src) {
          film.pause();
        }
      });
    }, { rootMargin: '200px 0px' });
    fo.observe(film);
  }

  // full film in a dialog, with sound
  var modal = document.querySelector('.film-modal');
  var openBtn = document.querySelector('.film-play');
  if (modal && openBtn && modal.showModal) {
    var full = modal.querySelector('video');
    openBtn.addEventListener('click', function () {
      modal.showModal();
      var p = full.play();
      if (p && p.catch) p.catch(function () {});
    });
    modal.querySelector('.film-close').addEventListener('click', function () { modal.close(); });
    modal.addEventListener('click', function (e) { if (e.target === modal) modal.close(); });
    modal.addEventListener('close', function () { full.pause(); });
  } else if (openBtn) {
    openBtn.addEventListener('click', function () { window.location.href = 'assets/video/doshi-film.mp4'; });
  }
})();
