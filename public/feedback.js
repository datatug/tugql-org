// Feedback is independent of analytics and sends only the static landing screen.
(() => {
  const button = document.querySelector('[data-feedback-launcher]');
  const embed = document.getElementById('site-feedback-widget');
  const ownedWidget = () => {
    const widget = window.ImproveIt;
    return widget?.sourceScript === embed &&
      widget?.appID === 'c1815762a96f44bc1811c4ebf36e64c4' &&
      widget?.spaceID === 'ao58m' && typeof widget?.open === 'function'
      ? widget : null;
  };
  const ready = () => { if (button && ownedWidget()) button.hidden = false; };
  embed?.addEventListener('load', ready, {once: true});
  ready();
  button?.addEventListener('click', () => ownedWidget()?.open());
})();
