/** @fileoverview
 * A small subset of better-sqlite3 API, implemented on top of sqlite3-wasm's oo1 API.
 * Requires sqlite3-wasm oo1 DB/Stmt. See https://sqlite.org/wasm/doc/trunk/api-oo1.md
 */

function normalizeBindArgs(args) {
  if (!args || args.length === 0) return undefined;
  if (args.length === 1) return args[0]; // array | object | scalar
  return args; // varargs => array
}

function isPragmaWrite(sqlish) {
  // Heuristic: PRAGMA foo = bar / PRAGMA foo(bar) / PRAGMA foo = 'x'
  return /[=()]|^\s*(?:journal_mode|synchronous|locking_mode|temp_store|cache_size)\b/i.test(sqlish);
}

export function createBetterSqlite3Like(sqlite3, {
  filename = ":memory:",
  flags = "c",
  vfs,
  useOpfsIfAvailable = true,
} = {}) {
  const capi = sqlite3.capi;

  class Statement {
    constructor(db, ooStmt, sql) {
      this._db = db;
      this._stmt = ooStmt;
      this._sql = sql;
      this._raw = false; // better-sqlite3: stmt.raw(true) => arrays instead of objects
    }

    raw(flag = true) {
      this._raw = !!flag;
      return this;
    }

    // better-sqlite3 compatibility surface
    run(...bindArgs) {
      const bind = normalizeBindArgs(bindArgs);
      const stmt = this._stmt;
      try {
        if (bind !== undefined) stmt.bind(bind);
        // For INSERT/UPDATE/DELETE, stepping executes it.
        while (stmt.step()) { /* ignore rows */ }
      } finally {
        // Reset retains bindings by default; pass true to clear binds.
        stmt.reset(true);
      }

      return {
        changes: this._db.changes(),
        lastInsertRowid: Number(capi.sqlite3_last_insert_rowid(this._db._db.pointer)),
      };
    }

    get(...bindArgs) {
      const bind = normalizeBindArgs(bindArgs);
      const stmt = this._stmt;
      try {
        if (bind !== undefined) stmt.bind(bind);
        const hasRow = stmt.step();
        if (!hasRow) return undefined;
        return this._raw ? stmt.get([]) : stmt.get({});
      } finally {
        stmt.reset(true);
      }
    }

    all(...bindArgs) {
      const bind = normalizeBindArgs(bindArgs);
      const stmt = this._stmt;
      const rows = [];
      try {
        if (bind !== undefined) stmt.bind(bind);
        while (stmt.step()) {
          rows.push(this._raw ? stmt.get([]) : stmt.get({}));
        }
      } finally {
        stmt.reset(true);
      }
      return rows;
    }

    *iterate(...bindArgs) {
      const bind = normalizeBindArgs(bindArgs);
      const stmt = this._stmt;
      try {
        if (bind !== undefined) stmt.bind(bind);
        while (stmt.step()) {
          yield this._raw ? stmt.get([]) : stmt.get({});
        }
      } finally {
        stmt.reset(true);
      }
    }

    // better-sqlite3 has finalize handled by GC; we expose it explicitly
    finalize() {
      this._stmt.finalize();
    }
  }

  class Database {
    constructor(file = filename, options = {}) {
      const f = options.filename ?? file;
      const fl = options.flags ?? flags;
      const vv = options.vfs ?? vfs;

      // Prefer OPFS persistence if available (browser) and requested.
      // Otherwise regular DB (e.g., ":memory:" or VFS-provided).
      if (useOpfsIfAvailable && sqlite3.oo1?.OpfsDb && sqlite3.opfs) {
        this._db = new sqlite3.oo1.OpfsDb({ filename: f, flags: fl });
      } else {
        this._db = new sqlite3.oo1.DB({ filename: f, flags: fl, vfs: vv });
      }
    }

    // --- better-sqlite3-ish API ---
    prepare(sql) {
      const stmt = this._db.prepare(sql);
      return new Statement(this, stmt, sql);
    }

    exec(sql) {
      this._db.exec(sql);
      return this;
    }

    pragma(pragma, simplify = true) {
      const sql = /^\s*pragma\b/i.test(pragma) ? pragma : `PRAGMA ${pragma}`;
      if (isPragmaWrite(pragma) || /;\s*$/.test(sql)) {
        this._db.exec(sql);
        return simplify ? undefined : [];
      }
      // Reads: PRAGMA foo; often returns 1 row / 1 col
      return simplify
        ? this._db.selectValue(sql)
        : this._db.selectArrays(sql);
    }

    transaction(fn) {
      // better-sqlite3 returns a wrapped function and supports .deferred/.immediate/.exclusive
      const wrap = (beginQualifier) => (...args) =>
        this._db.transaction(beginQualifier, () => fn(...args));

      const trx = (...args) => this._db.transaction(() => fn(...args));
      trx.deferred = wrap("DEFERRED");
      trx.immediate = wrap("IMMEDIATE");
      trx.exclusive = wrap("EXCLUSIVE");
      return trx;
    }

    function(name, fn, options) {
      // better-sqlite3: db.function(name, fn, opts?)
      // oo1: db.createFunction(name, fn, opts?) :contentReference[oaicite:2]{index=2}
      this._db.createFunction(name, fn, options);
      return this;
    }

    close() {
      this._db.close();
    }

    changes() {
      return this._db.changes();
    }

    SQLite3Error(...args) {
        return new Error(...args); // TODO
    }
  }

  return { Database };
}