/**
 * drizzle-kit emits `<out>/<timestamp>_<name>/migration.sql`, but
 * `wrangler d1 migrations apply` only reads flat, numerically-ordered `.sql`
 * files from a single directory. This flattens the former into the latter,
 * preserving drizzle's chronological ordering as `0001_`, `0002_`, ... prefixes.
 *
 * Applied migrations are tracked by wrangler in a `d1_migrations` table keyed by
 * filename, so existing files keep their names — only new ones are written.
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const MIGRATIONS_DIR = "src/lib/db/migrations";
const DRIZZLE_TIMESTAMP_PREFIX = /^\d+_/u;
const FLAT_MIGRATION_PREFIX = /^(?<sequence>\d+)_/u;

const entries = await readdir(MIGRATIONS_DIR, { withFileTypes: true });

const folders = entries
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

// `folders` is a new array, so sorting it in place cannot mutate shared input.
// oxlint-disable-next-line unicorn/no-array-sort
folders.sort();

const existing = new Set(
  entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".sql"))
    .map((entry) => entry.name)
);

const highestExistingSequence = Math.max(
  0,
  ...Array.from(existing, (filename) => {
    const match = FLAT_MIGRATION_PREFIX.exec(filename);
    return match?.groups?.sequence
      ? Number.parseInt(match.groups.sequence, 10)
      : 0;
  })
);

const existingSourceIds = Array.from(existing, (filename) =>
  filename.replace(FLAT_MIGRATION_PREFIX, "").replace(/\.sql$/u, "")
);
const flattenedFolders = new Set<string>();

for (const sourceId of existingSourceIds) {
  if (folders.includes(sourceId)) {
    flattenedFolders.add(sourceId);
    continue;
  }

  // Older flattened filenames omitted the Drizzle timestamp. Match each
  // legacy filename to at most one folder so repeated migration names survive.
  const legacyFolder = folders.find(
    (folder) =>
      !flattenedFolders.has(folder) &&
      folder.replace(DRIZZLE_TIMESTAMP_PREFIX, "") === sourceId
  );
  if (legacyFolder) {
    flattenedFolders.add(legacyFolder);
  }
}

const pending = folders
  .filter((folder) => !flattenedFolders.has(folder))
  .map((folder, index) => ({
    folder,
    target: `${String(highestExistingSequence + index + 1).padStart(4, "0")}_${folder}.sql`,
  }));

await Promise.all(
  pending.map(async ({ folder, target }) => {
    const sql = await readFile(
      path.join(MIGRATIONS_DIR, folder, "migration.sql"),
      "utf-8"
    );
    await writeFile(path.join(MIGRATIONS_DIR, target), sql);
    console.log(`flattened ${folder} -> ${target}`);
  })
);

console.log(
  pending.length === 0
    ? "no new migrations to flatten"
    : `flattened ${pending.length} migration(s)`
);
