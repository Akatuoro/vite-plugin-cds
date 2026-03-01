
export function injectPagesList(pages) {
  // build URLs relative to your root ('./pages')
  const toc = pages
    .filter((p) => p !== "index.html")
    .map((file) => ({
      file,
      title: file.replace(/\.html$/, ""),
      href: `/${file}`, // with root: './pages', this will be served at /<file>
    }));

  return {
    name: "inject-pages-list",
    transformIndexHtml(html, ctx) {
      // Only inject into index.html (not every HTML entry)
      if (!ctx.path.endsWith("/index.html") && ctx.path !== "/index.html") return html;

      return {
        html,
        tags: [
          {
            tag: "script",
            injectTo: "head",
            children: `window.__PAGES__ = ${JSON.stringify(toc)};`,
          },
        ],
      };
    },
  };
}
