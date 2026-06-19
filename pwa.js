(function () {
  const currentScript = document.currentScript;
  const baseUrl = currentScript ? new URL("./", currentScript.src) : new URL("./", window.location.href);
  const statusEvent = new Event("pwa-ready");

  if (!("serviceWorker" in navigator)) {
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register(new URL("sw.js", baseUrl), { scope: baseUrl.pathname })
      .then((registration) => {
        if (registration.active) {
          window.dispatchEvent(statusEvent);
        }
      })
      .catch((error) => {
        console.warn("PWA registration failed", error);
      });

    navigator.serviceWorker.ready.then(() => {
      window.dispatchEvent(statusEvent);
    });
  });
})();
