import path from "node:path";
import { fileURLToPath, pathToFileURL } from 'url';


export const insertFileDir = (code, id) => {
    // Ignore virtual modules and non-file ids
    if (id.startsWith("\0")) return code;
    const root = process.cwd();

    // Strip Vite/Query suffixes like ?import, ?v=hash, etc.
    const [filepath] = id.split("?", 1);

    // Only handle real absolute filesystem paths
    if (!path.isAbsolute(filepath)) return code;

    // Compute root-relative paths
    const relFile = path
        .relative(root, filepath)
        .split(path.sep)
        .join("/"); // normalize to POSIX style for consistency

    const relDir = path
        .dirname(relFile)
        .split(path.sep)
        .join("/");

    // Skip if nothing to replace
    if (!code.includes("__dirname") && !code.includes("__filename")) {
        return code;
    }

    let transformed = code;

    // Replace __filename and __dirname with string literals
    transformed = transformed.replace(
        /\b__filename\b/g,
        JSON.stringify(relFile)
    );

    transformed = transformed.replace(
        /\b__dirname\b/g,
        JSON.stringify(relDir === "." ? "" : relDir)
    );

    return transformed;
}

export const resolve = (path, parent) => { try {
  parent &&= pathToFileURL(parent)
  return fileURLToPath(import.meta.resolve(path, parent));
} catch (e) {
  if (e.code === 'MODULE_NOT_FOUND') return;
  else throw e;
}};


export const preloadModules = (code, id) => {
    const resolveDir = path.dirname(id);
    const imports = [];
    const preloadModules = [
        '@sap/cds/lib/srv/protocols/odata-v4',
        '@sap/cds/lib/srv/factory',
        '@sap/cds/srv/app-service.js',
        '@sap/cds/lib/env/defaults',
        '@cap-js/sqlite',
    ].map((m, i) => {
    const resolved = resolve(m, id);
    const t = path.relative(resolveDir, resolved);
    imports.push({ t });
    return [
        { s: t, t },
        { s: m, t },
    ];
    }).flat();
    const defM = preloadModules.find(({s}) => s === '@sap/cds/lib/env/defaults');
    if (defM) { preloadModules.push({...defM, s: './defaults'}); }

    code = code.replace('// <placeholder>', preloadModules.map(({s, t}) => `'${s}': () => require('${t}')`).join(',\n'));
    return { code, map: null };
}
