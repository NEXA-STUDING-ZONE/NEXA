(function () {
    var frame = document.getElementById('calcFrame');
    if (!frame) return;
    function theme() {
        return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    }
    function push() {
        try {
            if (frame.contentWindow) frame.contentWindow.postMessage({ nexazTheme: theme() }, '*');
        } catch (e) {}
    }
    function load() {
        if (location.hash.indexOf('#/calculator') !== 0) return;
        if (!frame.getAttribute('src')) frame.setAttribute('src', frame.getAttribute('data-calc-src'));
    }
    frame.addEventListener('load', push);
    new MutationObserver(push).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    window.addEventListener('hashchange', load);
    load();
})();
