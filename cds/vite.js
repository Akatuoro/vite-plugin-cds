import path from 'path';
import cds from '@sap/cds';

export function cdsVite() {
  const VIRTUAL_PREFIX = '\0cds:';      // vite "virtual module" prefix
  const files = new Set();
  let modelPromise = null;

  return {
    name: 'cap-cds',
    enforce: 'pre', // ensure we claim .cds before other loaders

    resolveId(source, importer) {
      if (!source.endsWith('.cds')) return null;

      // Resolve to an absolute path, then mark as virtual so our load() runs
      const abs = importer ? path.resolve(path.dirname(importer), source) : source;
      files.add(abs);
      return VIRTUAL_PREFIX + abs;
    },

    async load(id) {
      if (!id.startsWith(VIRTUAL_PREFIX)) return null;

      // Build one shared model for the session (fast). Reset on HMR changes.
      if (!modelPromise) modelPromise = cds.load([...files]);
      const model = await modelPromise;

      // Let Vite watch every .cds we touched so HMR triggers
      for (const f of files) this.addWatchFile(f);

      // Emit JS that exports the model object
      return `export default ${JSON.stringify(model)};`;
    },

    // HMR: if any .cds changes, invalidate the model so next import rebuilds
    handleHotUpdate(ctx) {
      if (ctx.file.endsWith('.cds')) {
        modelPromise = null; // force re-load on next request
        // Invalidate all virtual modules so importers refetch
        const mods = ctx.server.moduleGraph.getModulesByFile(ctx.file);
        if (mods) for (const m of mods) ctx.server.moduleGraph.invalidateModule(m);
        return []; // let Vite’s default reload run
      }
    },
  };
}
