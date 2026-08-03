/* Let's talk — 3-step popup form.
   Injects a <dialog> (native modal: backdrop + ESC + focus trap) and hijacks
   every "Let's talk" button on the page. */
(function () {
  "use strict";

  var ENDPOINT =
    "https://script.google.com/macros/s/AKfycbxBs14oqmG_armvZyisNy_2QnoyLu9-58FOw2moZNyESAIK2TaDS8p3nkJivLs7RkNG/exec";
  var MAILTO = "Nikhil@monkmedia.io";

  var CSS = [
    "#lt-modal{border:none;padding:0;background:transparent;max-width:34rem;width:calc(100% - 2rem);color:#fff;overflow:visible}",
    "#lt-modal::backdrop{background:rgba(8,8,8,.5);backdrop-filter:blur(5px)}",
    "#lt-modal .lt-card{background:rgba(31,31,31,.62);-webkit-backdrop-filter:blur(24px) saturate(150%);backdrop-filter:blur(24px) saturate(150%);border:1px solid rgba(255,255,255,.14);border-radius:1.5rem;padding:2rem;max-height:88vh;max-height:88dvh;overflow-y:auto;overscroll-behavior:contain;box-shadow:0 2rem 4rem rgba(0,0,0,.55);font-family:Geist,sans-serif}",
    // Firefox-only (Chrome would drop the ::-webkit-scrollbar styling if scrollbar-color were set globally)
    "@supports(-moz-appearance:none){#lt-modal .lt-card{scrollbar-width:thin;scrollbar-color:rgba(254,190,80,.55) transparent}}",
    "#lt-modal .lt-card::-webkit-scrollbar{width:5px}",
    "#lt-modal .lt-card::-webkit-scrollbar-track{background:transparent;margin:1.5rem 0}",
    "#lt-modal .lt-card::-webkit-scrollbar-thumb{background:rgba(254,190,80,.55);border-radius:999px}",
    "#lt-modal .lt-top{display:flex;align-items:center;gap:1rem;margin-bottom:1.75rem}",
    "#lt-modal .lt-bars{display:flex;gap:.5rem;flex:1}",
    "#lt-modal .lt-bar{height:3px;flex:1;border-radius:999px;background:rgba(255,255,255,.14);transition:background .25s ease}",
    "#lt-modal .lt-bar.is-on{background:#febe50}",
    "#lt-modal .lt-close{background:none;border:none;color:#9a9a9a;cursor:pointer;line-height:0;padding:.25rem;transition:color .2s ease}",
    "#lt-modal .lt-close:hover{color:#febe50}",
    "#lt-modal .lt-eyebrow{font-family:'Funnel Display',sans-serif;font-weight:600;font-size:1.05rem;color:#fff;margin:0}",
    "#lt-modal .lt-title{font-family:'Covered By Your Grace',cursive;font-size:2.6rem;line-height:1.1;color:#febe50;margin:.15rem 0 1.5rem}",
    "#lt-modal .lt-step{display:none;flex-direction:column;gap:.85rem}",
    "#lt-modal .lt-step.is-on{display:flex}",
    "#lt-modal .lt-field{width:100%;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:.9rem;padding:1rem 1.15rem;color:#fff;font-family:Geist,sans-serif;font-size:1rem;transition:border-color .2s ease,background .2s ease}",
    "#lt-modal textarea.lt-field{min-height:6rem;resize:vertical}",
    "#lt-modal .lt-field::placeholder{color:#8b8b8b}",
    "#lt-modal .lt-field:focus{outline:none;border-color:#febe50;background:rgba(255,255,255,.12)}",
    "#lt-modal .lt-group{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:.9rem;padding:1rem 1.15rem}",
    "#lt-modal .lt-group-label{font-size:.85rem;color:#b5b5b5;margin-bottom:.75rem}",
    "#lt-modal .lt-opt{font-weight:500;display:flex;align-items:center;gap:.7rem;padding:.45rem .5rem;margin:0 -.5rem;border-radius:.6rem;cursor:pointer;font-size:.92rem;color:#e6e6e6;transition:background .2s ease,color .2s ease}",
    "#lt-modal .lt-opt:hover{background:rgba(254,190,80,.12);color:#fff}",
    "#lt-modal .lt-opt input{position:absolute;opacity:0;width:0;height:0}",
    "#lt-modal .lt-mark{width:1.05rem;height:1.05rem;flex:none;border:2px solid #6e6e6e;background:transparent;transition:border-color .2s ease,background .2s ease}",
    "#lt-modal .lt-opt.lt-radio .lt-mark{border-radius:50%}",
    "#lt-modal .lt-opt.lt-check .lt-mark{border-radius:.25rem}",
    "#lt-modal .lt-opt input:checked~.lt-mark{border-color:#febe50;background:#febe50;box-shadow:inset 0 0 0 3px #292929}",
    "#lt-modal .lt-opt input:checked~span{color:#febe50}",
    "#lt-modal .lt-opt input:focus-visible~.lt-mark{outline:2px solid #febe50;outline-offset:2px}",
    "#lt-modal .lt-err{color:#ff8a7a;font-size:.8rem;margin-top:.6rem;display:none}",
    "#lt-modal .lt-err.is-on{display:block}",
    "#lt-modal .lt-actions{display:flex;gap:.75rem;margin-top:.75rem}",
    "#lt-modal .lt-btn{flex:1;height:3.4rem;border:none;border-radius:400px;background:#febe50;color:#323232;font-family:'Funnel Display',sans-serif;font-weight:600;font-size:1rem;cursor:pointer;transition:transform .15s ease-out,background .15s ease-out}",
    "#lt-modal .lt-btn:hover{background:#ffcd74;transform:translateY(-2px)}",
    "#lt-modal .lt-btn[disabled]{opacity:.6;cursor:wait;transform:none}",
    "#lt-modal .lt-btn.lt-ghost{flex:0 0 6.5rem;background:transparent;border:1px solid rgba(255,255,255,.18);color:#e6e6e6}",
    "#lt-modal .lt-btn.lt-ghost:hover{background:rgba(255,255,255,.06)}",
    "#lt-modal .lt-done{text-align:center;padding:1.5rem 0 .5rem}",
    "#lt-modal .lt-done p{color:#b5b5b5;font-size:.95rem;margin:.5rem 0 0}",
    "@media(max-width:479px){#lt-modal .lt-card{padding:1.35rem;border-radius:1.15rem}#lt-modal .lt-title{font-size:2.1rem}}",
    // bigger touch targets on touch devices
    "@media(pointer:coarse){#lt-modal .lt-opt{padding:.65rem .5rem}}",
    // short screens (landscape phones): compact the header so fields get the space
    "@media(max-height:520px){#lt-modal .lt-card{padding:1.25rem 1.5rem}#lt-modal .lt-top{margin-bottom:.9rem}#lt-modal .lt-eyebrow{font-size:.9rem}#lt-modal .lt-title{font-size:1.7rem;margin:.1rem 0 .9rem}#lt-modal textarea.lt-field{min-height:4.5rem}}",
  ].join("");

  function opts(type, name, values) {
    return values
      .map(function (v) {
        return (
          '<label class="lt-opt lt-' +
          (type === "radio" ? "radio" : "check") +
          '"><input type="' +
          type +
          '" name="' +
          name +
          '" value="' +
          v +
          '"><span class="lt-mark"></span><span>' +
          v +
          "</span></label>"
        );
      })
      .join("");
  }

  var HTML =
    '<form class="lt-card" novalidate>' +
    '<div class="lt-top"><div class="lt-bars">' +
    '<i class="lt-bar is-on"></i><i class="lt-bar"></i><i class="lt-bar"></i>' +
    '</div><button type="button" class="lt-close" aria-label="Close">' +
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
    "</button></div>" +
    '<p class="lt-eyebrow">Want to partner with us?</p>' +
    '<p class="lt-title">Say hello!</p>' +
    // ── Step 1 ──
    '<div class="lt-step is-on" data-step="1">' +
    '<input class="lt-field" name="Name" type="text" placeholder="Name" required maxlength="120">' +
    '<input class="lt-field" name="Email" type="email" placeholder="Email" required maxlength="160">' +
    '<input class="lt-field" name="Phone" type="tel" placeholder="Phone Number" required pattern="[0-9+()\\-\\s]{7,20}">' +
    '<div class="lt-group" data-require="Account Type">' +
    '<div class="lt-group-label">Account Type</div>' +
    opts("radio", "AccountType", ["Personal Channel", "Brand Channel", "VC"]) +
    '<div class="lt-err">Please pick one.</div></div>' +
    '<div class="lt-actions"><button type="button" class="lt-btn" data-next>Next &#8594;</button></div>' +
    "</div>" +
    // ── Step 2 ──
    '<div class="lt-step" data-step="2">' +
    '<textarea class="lt-field" name="WhatYouDo" placeholder="What do you do?" required maxlength="1000"></textarea>' +
    '<input class="lt-field" name="ChannelLink" type="text" placeholder="Channel Link" required maxlength="300">' +
    '<div class="lt-group" data-require="What are you looking for?">' +
    '<div class="lt-group-label">What are you looking for?</div>' +
    opts("checkbox", "LookingFor", [
      "Production",
      "Post Production",
      "End to End (Strategy + Production + Management)",
    ]) +
    '<div class="lt-err">Please pick at least one.</div></div>' +
    '<textarea class="lt-field" name="Problem" placeholder="Elaborate problem statement" required maxlength="2000"></textarea>' +
    '<div class="lt-actions"><button type="button" class="lt-btn lt-ghost" data-back>Back</button>' +
    '<button type="button" class="lt-btn" data-next>Next &#8594;</button></div>' +
    "</div>" +
    // ── Step 3 ──
    '<div class="lt-step" data-step="3">' +
    '<div class="lt-group" data-require="Patience">' +
    '<div class="lt-group-label">Do you understand that Social Media requires atleast 3 months of patience?</div>' +
    opts("radio", "Patience", ["Yes", "No"]) +
    '<div class="lt-err">Please pick one.</div></div>' +
    '<div class="lt-group" data-require="Budget">' +
    '<div class="lt-group-label">Our retainers typically start at &#8377;80k/month. Is this aligned with your current marketing budget?</div>' +
    opts("radio", "Budget", ["Yes, aligned", "Not currently within budget"]) +
    '<div class="lt-err">Please pick one.</div></div>' +
    '<div class="lt-actions"><button type="button" class="lt-btn lt-ghost" data-back>Back</button>' +
    '<button type="submit" class="lt-btn">Submit</button></div>' +
    "</div>" +
    // ── Done ──
    '<div class="lt-step lt-done" data-step="4">' +
    '<p class="lt-eyebrow">Thanks  we&#39;ve got it.</p>' +
    "<p>Our team will reach out within 24 hours.</p>" +
    '<div class="lt-actions"><button type="button" class="lt-btn lt-close-btn">Close</button></div>' +
    "</div>" +
    "</form>";

  var dlg, form, steps, bars, current = 1, submitted = false;

  function build() {
    var style = document.createElement("style");
    style.textContent = CSS;
    document.head.appendChild(style);

    dlg = document.createElement("dialog");
    dlg.id = "lt-modal";
    // Lenis smooth-scroll swallows wheel events; this opts the dialog out.
    dlg.setAttribute("data-lenis-prevent", "");
    dlg.innerHTML = HTML;
    document.body.appendChild(dlg);

    form = dlg.querySelector("form");
    steps = dlg.querySelectorAll(".lt-step");
    bars = dlg.querySelectorAll(".lt-bar");

    dlg.addEventListener("click", function (e) {
      if (e.target === dlg) close(); // click on backdrop
      if (e.target.closest(".lt-close, .lt-close-btn")) close();
      if (e.target.closest("[data-next]") && valid(currentEl())) show(current + 1);
      if (e.target.closest("[data-back]")) show(current - 1);
    });
    dlg.addEventListener("close", unlock);
    form.addEventListener("submit", submit);
    // clear group errors as soon as something is picked
    form.addEventListener("change", function (e) {
      var g = e.target.closest(".lt-group");
      if (g) g.querySelector(".lt-err").classList.remove("is-on");
    });
  }

  function currentEl() {
    return dlg.querySelector('.lt-step[data-step="' + current + '"]');
  }

  function show(n) {
    current = Math.min(Math.max(n, 1), steps.length);
    steps.forEach(function (s) {
      s.classList.toggle("is-on", +s.dataset.step === current);
    });
    bars.forEach(function (b, i) {
      b.classList.toggle("is-on", i < Math.min(current, 3));
    });
    dlg.querySelector(".lt-card").scrollTop = 0;
  }

  // Visible fields use native validation; hidden radio/checkbox groups use inline errors.
  function valid(step) {
    var ok = true;
    var fields = step.querySelectorAll("input.lt-field, textarea.lt-field");
    for (var i = 0; i < fields.length; i++) {
      if (!fields[i].checkValidity()) {
        fields[i].reportValidity();
        return false;
      }
    }
    step.querySelectorAll(".lt-group[data-require]").forEach(function (g) {
      var picked = !!g.querySelector("input:checked");
      g.querySelector(".lt-err").classList.toggle("is-on", !picked);
      if (!picked && ok) {
        g.scrollIntoView({ block: "nearest", behavior: "smooth" });
        ok = false;
      }
    });
    return ok;
  }

  function collect() {
    var data = {};
    new FormData(form).forEach(function (v, k) {
      data[k] = data[k] ? data[k] + ", " + v : v;
    });
    return data;
  }

  function submit(e) {
    e.preventDefault();
    if (!valid(currentEl())) return;
    var btn = form.querySelector('[type="submit"]');
    btn.disabled = true;
    var data = collect();
    data.SubmissionType = "Let's Talk Popup";
    data.PageURL = window.location.href;
    data.UserAgent = navigator.userAgent;

    var done = function () {
      submitted = true;
      btn.disabled = false;
      show(4);
      form.reset();
    };

    if (!ENDPOINT) {
      var body = Object.keys(data)
        .map(function (k) {
          return k + ": " + data[k];
        })
        .join("\n");
      window.location.href =
        "mailto:" +
        MAILTO +
        "?subject=" +
        encodeURIComponent("Partnership enquiry — " + (data.Name || "")) +
        "&body=" +
        encodeURIComponent(body);
      done();
      return;
    }

    var payload = new URLSearchParams();
    Object.keys(data).forEach(function (key) {
      payload.append(key, data[key]);
    });

    fetch(ENDPOINT, {
      method: "POST",
      mode: "no-cors",
      body: payload,
    })
      .then(done)
      .catch(function () {
        btn.disabled = false;
        alert("Something went wrong. Please email " + MAILTO + ".");
      });
  }

  function openNow() {
    if (!dlg) build();
    show(1);
    dlg.showModal();
    document.documentElement.style.overflow = "hidden";
  }

  function open(e) {
    e.preventDefault();
    e.stopPropagation(); // keep the page-transition script from navigating
    openNow();
  }

  function close() {
    dlg.close();
  }

  function unlock() {
    document.documentElement.style.overflow = "";
  }

  // Delegate so it also catches buttons injected after load.
  // Capture phase so we beat the page-transition click handler.
  document.addEventListener(
    "click",
    function (e) {
      var a = e.target.closest("a");
      if (
        a &&
        (a.getAttribute("href") === "#lets-talk" ||
          /let'?s\s*talk/i.test(a.textContent))
      )
        open(e);
    },
    true
  );

  // Auto-open every 12s until the visitor submits.
  setInterval(function () {
    if (!submitted && !(dlg && dlg.open)) openNow();
  }, 12000);
})();
