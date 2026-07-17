/**
 * Self-host @uplang/tsvsheet into the docs site's static assets.
 *
 * The `<tsv-sheet>` custom element (from the sibling tsvsheet.js repo) plus the
 * wasm engine it embeds are bundled/copied into static/tsvsheet/ so the Hugo
 * ```sheet render hook can render a live-computing spreadsheet with no external
 * or CDN request. The engine's wasm loader (load.js) fetches `tsvsheet.wasm` and
 * `wasm_exec.js` relative to the bundle via `new URL(name, import.meta.url)`; the
 * two assets are copied beside the bundle so that relative resolution lands on
 * /tsvsheet/tsvsheet.wasm under the Pages baseURL. No CDN, no network beyond the
 * co-located assets.
 *
 * Run with `node scripts/build-assets.mjs` (or `npm run assets` / `make assets`).
 */

import { copyFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { build } from "esbuild";

const here = dirname(fileURLToPath(import.meta.url));
const src = resolve(here, "../../tsvsheet.js/src/tsvsheet");
const out = resolve(here, "../static/tsvsheet");

await mkdir(out, { recursive: true });

await build({
	entryPoints: [resolve(src, "tsv-sheet.js")],
	outfile: resolve(out, "tsv-sheet.bundle.js"),
	bundle: true,
	format: "esm",
	platform: "browser",
	target: "es2022",
	minify: true,
	sourcemap: false,
	legalComments: "none",
	// The Node-only disk reader is behind a runtime guard and only reached via a
	// dynamic import; keep node:fs/promises out of the browser bundle.
	external: ["node:fs/promises"],
	logLevel: "info",
});

for (const asset of ["tsvsheet.wasm", "wasm_exec.js"]) {
	await copyFile(resolve(src, asset), resolve(out, asset));
}
