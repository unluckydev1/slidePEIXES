(function () {
  "use strict";
  var one = function (selector, root) { return (root || document).querySelector(selector); };
  var all = function (selector, root) { return Array.prototype.slice.call((root || document).querySelectorAll(selector)); };
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var sections = all("main section.present"), navLinks = all("#nav a"), dots = one("#dots"), bar = one("#bar");
  var scrollToSection = function (section) { if (section) section.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" }); };

  document.body.classList.add("js");
  sections.forEach(function (section) {
    all(".scene-content", section).forEach(function (container) {
      all(":scope > *", container).forEach(function (element) { if (!element.classList.contains("stage-item")) element.classList.add("rv"); });
    });
    all(".cover-copy > *, .mascot-copy > *, .ending-copy > *", section).forEach(function (element) { element.classList.add("rv"); });
  });

  sections.forEach(function (section, index) {
    var dot = document.createElement("li");
    dot.title = section.id;
    dot.setAttribute("aria-label", "Ir para a cena " + (index + 1));
    dot.setAttribute("role", "button");
    dot.tabIndex = 0;
    dot.addEventListener("click", function () { scrollToSection(section); });
    dot.addEventListener("keydown", function (event) { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); scrollToSection(section); } });
    dots.appendChild(dot);
  });
  var dotItems = all("li", dots);
  var activeObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var section = entry.target, index = sections.indexOf(section);
      sections.forEach(function (item) { item.classList.toggle("active", item === section); });
      dotItems.forEach(function (item, i) { item.classList.toggle("on", i === index); });
      navLinks.forEach(function (link) { link.classList.toggle("on", link.getAttribute("href") === "#" + section.id); });
      document.body.dataset.theme = section.dataset.theme || "night";
    });
  }, { rootMargin: "-42% 0px -48% 0px" });
  sections.forEach(function (section) { activeObserver.observe(section); });

  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      all(".rv", entry.target).forEach(function (element, index) { element.style.setProperty("--d", Math.min(index * .1, .6) + "s"); element.classList.add("in"); });
      all(".stage-item", entry.target).forEach(function(item,index){ window.setTimeout(function(){ item.hidden=false; }, index*360); });
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: .12 });
  sections.forEach(function (section) { revealObserver.observe(section); });

  var anatomy = all(".anatomy-point"), title = one("#anatomy-title"), copy = one("#anatomy-copy");
  anatomy.forEach(function (button, index) {
    button.addEventListener("click", function () {
      anatomy.forEach(function (item) { item.classList.remove("selected"); });
      button.classList.add("selected");
      if (title) title.textContent = button.dataset.title;
      if (copy) copy.textContent = button.dataset.copy;
      var step = one(".anatomy-detail span");
      if (step) step.textContent = "PISTA " + String(index + 1).padStart(2, "0") + " / 04";
    });
  });
  function fitPresentation() { sections.forEach(function(section){ var inner=one(".scene-inner",section); if(inner) inner.style.zoom="1"; }); }
  var fitFrame = 0;
  function scheduleFit() { cancelAnimationFrame(fitFrame); fitFrame = requestAnimationFrame(fitPresentation); }
  window.addEventListener("load", scheduleFit);
  window.addEventListener("resize", scheduleFit, { passive: true });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(scheduleFit);
  all(".scene-backdrop img, .split-visual img, .class-branch img, .adapt-card img, .anatomy-figure img, .web-node img, .status-photo img, .compare-frames img").forEach(function (image) { if (!image.complete) image.addEventListener("load", scheduleFit, { once: true }); });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "ArrowDown" || event.altKey || event.ctrlKey || event.metaKey) return;
    var target = event.target;
    if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return;
    var current = sections.findIndex(function (section) { var r = section.getBoundingClientRect(); return r.top <= innerHeight * .5 && r.bottom > innerHeight * .5; });
    if (current < 0) current = 0;
    if (current < sections.length - 1) { event.preventDefault(); scrollToSection(sections[current + 1]); }
  });

  var scrollFrame = 0;
  function updateScroll() {
    var y = window.scrollY, max = document.documentElement.scrollHeight - innerHeight;
    if (bar) bar.style.transform = "scaleX(" + (max > 0 ? y / max : 0) + ")";
    var top = one(".top");
    if (top) top.classList.toggle("solid", y > 30);
    scrollFrame = 0;
  }
  window.addEventListener("scroll", function () { if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll); }, { passive: true });
  updateScroll();
  scheduleFit();
})();
