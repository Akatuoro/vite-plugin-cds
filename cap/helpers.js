import path from "node:path";


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
    console.log('transformed', id)

    return transformed;
}
