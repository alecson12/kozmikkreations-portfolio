// The browser-tab icon follows the browser's light / dark setting.
// index.html already says which icon belongs to which (the `media` on each link), and most
// browsers read that. For the ones that do not, and simply take the last icon listed, this
// keeps the matching icons last in the list, also when the setting changes while the site
// is open. Nothing is ever removed, so the tab is never left without an icon.
export function startFavicon() {
  let dark
  try {
    dark = window.matchMedia('(prefers-color-scheme: dark)')
  } catch {
    return
  }
  const icons = [...document.querySelectorAll('link[rel="icon"][data-scheme]')]
  const apply = () => {
    const want = dark.matches ? 'dark' : 'light'
    for (const link of icons) if (link.dataset.scheme === want) document.head.appendChild(link)
  }
  apply()
  dark.addEventListener?.('change', apply)
}
