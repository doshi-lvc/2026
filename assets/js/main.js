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
})();
