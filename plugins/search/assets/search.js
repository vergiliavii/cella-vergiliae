// Searches the site in the reader's browser, over the index the plugin's
// module writes when the site is built. Kite writes the index's address into
// window.KiteSearch before this runs.
(function () {
  "use strict";

  var config = window.KiteSearch;
  if (!config) return;
  var settings = config.settings || {};

  var zh = /^zh/i.test(config.lang || document.documentElement.lang || "");
  var words = zh
    ? {
        open: "搜索",
        placeholder: "搜索文章…",
        loading: "正在载入索引…",
        failed: "索引载入失败，请稍后再试。",
        empty: "没有找到相关内容。",
        hint: "↑ ↓ 选择 · 回车打开 · Esc 关闭",
      }
    : {
        open: "Search",
        placeholder: "Search the site…",
        loading: "Loading the index…",
        failed: "The index could not be loaded. Try again later.",
        empty: "Nothing matches.",
        hint: "↑ ↓ to choose · Enter to open · Esc to close",
      };

  var ICON =
    '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/>' +
    '<path d="m20 20-3.5-3.5"/></svg>';

  var dialog, input, status, list;
  var entries = null;
  var loading = false;
  var shown = [];
  var chosen = -1;

  function fold(s) {
    return (s || "").toLowerCase();
  }

  function build() {
    dialog = document.createElement("dialog");
    dialog.className = "kite-search";
    dialog.setAttribute("aria-label", words.open);
    dialog.innerHTML =
      '<form method="dialog" class="kite-search-box">' + ICON +
      '<input type="search" autocomplete="off" spellcheck="false" role="combobox" aria-expanded="true" ' +
      'aria-controls="kite-search-results"><kbd>Esc</kbd></form>' +
      '<p class="kite-search-status" role="status"></p>' +
      '<ol class="kite-search-results" id="kite-search-results" role="listbox"></ol>' +
      '<p class="kite-search-hint"></p>';
    input = dialog.querySelector("input");
    status = dialog.querySelector(".kite-search-status");
    list = dialog.querySelector(".kite-search-results");
    input.placeholder = words.placeholder;
    input.setAttribute("aria-label", words.open);
    dialog.querySelector(".kite-search-hint").textContent = words.hint;

    input.addEventListener("input", search);
    input.addEventListener("keydown", keys);
    dialog.addEventListener("click", function (e) {
      var box = dialog.getBoundingClientRect();
      var outside = e.clientX < box.left || e.clientX > box.right || e.clientY < box.top || e.clientY > box.bottom;
      if (outside && e.target === dialog) dialog.close();
    });
    document.body.appendChild(dialog);
  }

  function open() {
    if (!dialog) build();
    if (!dialog.open) dialog.showModal();
    input.focus();
    input.select();
    load();
  }

  function load() {
    if (entries || loading) return;
    loading = true;
    status.textContent = words.loading;
    fetch(config.index)
      .then(function (response) {
        if (!response.ok) throw new Error(response.status);
        return response.json();
      })
      .then(function (index) {
        entries = index.map(function (e) {
          // Math is written between \( \) or \[ \] until it is typeset, and
          // a snippet reads better without them.
          var text = (e.text || "").replace(/\\[()[\]]/g, "").replace(/\s+/g, " ").trim();
          return { e: e, text: text, title: fold(e.title), tags: fold((e.tags || []).join(" ")), folded: fold(text) };
        });
        status.textContent = "";
        search();
      })
      .catch(function () {
        status.textContent = words.failed;
      })
      .then(function () {
        loading = false;
      });
  }

  function search() {
    if (!entries) return;
    var terms = fold(input.value).split(/\s+/).filter(Boolean);
    list.textContent = "";
    shown = [];
    chosen = -1;
    input.removeAttribute("aria-activedescendant");
    if (!terms.length) {
      status.textContent = "";
      return;
    }
    var found = [];
    entries.forEach(function (x) {
      var score = 0;
      for (var i = 0; i < terms.length; i++) {
        var inTitle = x.title.indexOf(terms[i]) >= 0;
        var inTags = x.tags.indexOf(terms[i]) >= 0;
        var inText = x.folded.indexOf(terms[i]) >= 0;
        if (!inTitle && !inTags && !inText) return;
        score += (inTitle ? 10 : 0) + (inTags ? 5 : 0) + (inText ? 1 : 0);
      }
      found.push({ x: x, score: score });
    });
    // The index is newest first, and a stable sort keeps that among equals.
    found.sort(function (a, b) {
      return b.score - a.score;
    });
    shown = found.slice(0, 30);
    status.textContent = shown.length ? "" : words.empty;
    shown.forEach(function (hit, i) {
      list.appendChild(item(hit.x, terms, i));
    });
    if (shown.length) choose(0);
  }

  function item(x, terms, i) {
    var li = document.createElement("li");
    li.id = "kite-search-" + i;
    li.setAttribute("role", "option");
    var a = document.createElement("a");
    a.href = x.e.url;
    var title = document.createElement("span");
    title.className = "kite-search-title";
    mark(title, x.e.title || x.e.url, terms);
    a.appendChild(title);
    if (x.e.date) {
      var date = document.createElement("time");
      date.dateTime = x.e.date;
      date.textContent = new Date(x.e.date).toLocaleDateString(config.lang || undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      a.appendChild(date);
    }
    var around = snippet(x, terms);
    if (around) {
      var text = document.createElement("span");
      text.className = "kite-search-text";
      mark(text, around, terms);
      a.appendChild(text);
    }
    li.appendChild(a);
    li.addEventListener("mousemove", function () {
      if (chosen !== i) choose(i);
    });
    return li;
  }

  // snippet is the text around the first term found in it.
  function snippet(x, terms) {
    var text = x.folded.length === x.text.length ? x.text : x.folded;
    var at = -1;
    for (var i = 0; i < terms.length && at < 0; i++) at = x.folded.indexOf(terms[i]);
    if (at < 0) return text.slice(0, 120);
    var start = Math.max(0, at - 30);
    var end = Math.min(text.length, at + 90);
    return (start > 0 ? "…" : "") + text.slice(start, end) + (end < text.length ? "…" : "");
  }

  // mark writes text into el with every term found in it marked.
  function mark(el, text, terms) {
    var lower = fold(text);
    var ranges = [];
    terms.forEach(function (t) {
      for (var at = lower.indexOf(t); at >= 0; at = lower.indexOf(t, at + t.length)) ranges.push([at, at + t.length]);
    });
    ranges.sort(function (a, b) {
      return a[0] - b[0];
    });
    var pos = 0;
    ranges.forEach(function (r) {
      var from = Math.max(r[0], pos);
      if (from >= r[1]) return;
      el.appendChild(document.createTextNode(text.slice(pos, from)));
      var m = document.createElement("mark");
      m.textContent = text.slice(from, r[1]);
      el.appendChild(m);
      pos = r[1];
    });
    el.appendChild(document.createTextNode(text.slice(pos)));
  }

  function choose(i) {
    var was = list.children[chosen];
    if (was) was.removeAttribute("aria-selected");
    chosen = i;
    var li = list.children[i];
    if (!li) return;
    li.setAttribute("aria-selected", "true");
    input.setAttribute("aria-activedescendant", li.id);
    li.scrollIntoView({ block: "nearest" });
  }

  function keys(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      choose(Math.min(chosen + 1, shown.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      choose(Math.max(chosen - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      var li = list.children[chosen];
      if (li) location.href = li.querySelector("a").href;
    }
  }

  function start() {
    var triggers = document.querySelectorAll("[data-kite-search]");
    triggers.forEach(function (el) {
      el.addEventListener("click", function (e) {
        e.preventDefault();
        open();
      });
    });
    if (!triggers.length && settings.button !== false) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "kite-search-button";
      button.title = words.open + " (/)";
      button.setAttribute("aria-label", words.open);
      button.innerHTML = ICON;
      button.addEventListener("click", open);
      document.body.appendChild(button);
    }
    document.addEventListener("keydown", function (e) {
      var target = e.target;
      var typing = /^(input|textarea|select)$/i.test(target.tagName) || target.isContentEditable;
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        open();
      } else if (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        open();
      }
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
