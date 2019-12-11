import {opd} from './opd.js';
//document.addEventListener('DOMContentLoaded', opd);
opd();


if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('https://webostap.github.io/opd/service-worker.js')
        .then((reg) => {
          console.log('Service worker registered.', reg);
        });
  });
}

let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 76 and later from showing the mini-infobar
  //e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
  showInstallPromotion();
});

window.addEventListener('click', (e) => {
  // hide our user interface that shows our A2HS button
//  window.style.display = 'none';
  // Show the prompt
  deferredPrompt.prompt();
  // Wait for the user to respond to the prompt
  deferredPrompt.userChoice
    .then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the A2HS prompt');
      } else {
        console.log('User dismissed the A2HS prompt');
      }
      deferredPrompt = null;
    });
});
window.addEventListener('appinstalled', (evt) => {
  console.log('a2hs installed');
});

