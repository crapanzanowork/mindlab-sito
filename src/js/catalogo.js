/* MindLab · filtri di catalogo e blog. */
(function () {
  'use strict';
  var bar = document.getElementById('filters'), items = [].slice.call(document.querySelectorAll('#catalog .cat-item'));
  if (!bar) return;
  function apply(k) {
    bar.querySelectorAll('.tab').forEach(function (t) { t.setAttribute('aria-selected', String(t.getAttribute('data-f') === k)); });
    items.forEach(function (i) { i.classList.toggle('hide', k !== 'tutti' && i.getAttribute('data-cat') !== k); });
    var n = items.filter(function (i) { return !i.classList.contains('hide'); }).length;
    if (window.ML && ML.reveal) ML.reveal(document.getElementById('catalog'));
    items.forEach(function (i) { var c = i.firstElementChild; if (c && !i.classList.contains('hide')) c.classList.add('in'); });
    bar.setAttribute('data-n', n);
  }
  bar.addEventListener('click', function (e) { var b = e.target.closest('.tab'); if (b) apply(b.getAttribute('data-f')); });
  var h = (location.hash || '').slice(1); if (h && bar.querySelector('[data-f="' + h + '"]')) apply(h);
})();
