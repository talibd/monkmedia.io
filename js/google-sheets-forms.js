/* Sends marked website forms to the Monk Media Google Sheets web app. */
(function () {
  "use strict";

  var ENDPOINT =
    "https://script.google.com/macros/s/AKfycbxBs14oqmG_armvZyisNy_2QnoyLu9-58FOw2moZNyESAIK2TaDS8p3nkJivLs7RkNG/exec";

  function init() {
    document.querySelectorAll("form[data-google-sheets-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        event.stopPropagation();

        if (!form.checkValidity()) {
          form.reportValidity();
          return;
        }

        var submit = form.querySelector('[type="submit"]');
        var originalLabel = submit ? submit.value : "";
        var wrapper = form.closest(".w-form");
        var success = wrapper ? wrapper.querySelector(".w-form-done") : null;
        var failure = wrapper ? wrapper.querySelector(".w-form-fail") : null;
        var payload = new URLSearchParams();

        new FormData(form).forEach(function (value, key) {
          payload.append(key, value);
        });
        payload.append("SubmissionType", "Consultation Form");
        payload.append("PageURL", window.location.href);
        payload.append("UserAgent", navigator.userAgent);

        if (submit) {
          submit.disabled = true;
          submit.value = "Sending...";
        }
        if (failure) failure.style.display = "none";

        fetch(ENDPOINT, {
          method: "POST",
          mode: "no-cors",
          body: payload,
        })
          .then(function () {
            form.reset();
            form.style.display = "none";
            if (success) {
              success.style.display = "block";
              success.focus();
            }
          })
          .catch(function () {
            if (failure) {
              failure.style.display = "block";
              failure.focus();
            }
          })
          .finally(function () {
            if (submit) {
              submit.disabled = false;
              submit.value = originalLabel;
            }
          });
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
