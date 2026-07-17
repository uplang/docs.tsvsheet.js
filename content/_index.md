---
title: tsvsheet.js
---

**A `.tsvt` is a spreadsheet for plain text** — a single TAB-separated grid whose cells are literal values or `=formulas` in A1 notation (`B2`, `D2:D5`), computed in place. `@tsvsheet/tsvsheet` brings that engine to JavaScript and the browser.

It is **not** a re-implementation: it embeds the exact [go-tsvsheet](https://tsvsheet.github.io/docs.go-tsvsheet/) engine compiled to WebAssembly, so every computed value, error (`#REF!`, `#DIV/0!`, `#CIRC!`, …), and function matches the Go, CLI, and TUI implementations byte for byte — one engine everywhere. Use it in the browser or in Node.

## Live

This grid is **computing right now**, in your browser, on the very engine described above — no server. Every `=formula` is evaluated by the embedded WebAssembly. Click a cell, change a number, and press **Tab** or click away: the totals recompute instantly.

```sheet
Item	Qty	Price	Total
Widget	3	4.50	=B2*C2
Gadget	5	2.00	=B3*C3
	Sum	=SUM(D2:D3)
```

Nothing on this page is a screenshot: the table above is a `<tsv-sheet>` custom element that Hugo emitted from a fenced `sheet` code block, upgraded in place by the self-hosted engine bundle.

## Install

```console
$ npm install @tsvsheet/tsvsheet
```

## Use

The engine loads asynchronously (the WebAssembly is instantiated once), then every call is synchronous. The API is **stateless** — you hold the `.tsvt` source string and pass it in:

```js
import { load } from "@tsvsheet/tsvsheet";

const engine = await load();

const view = engine.compute("1\t2\n=A1+B1\t=A1*B1\n");
view.computed;    // [["1","2"],["3","2"]] — the value grid
view.diagnostics; // static findings (unknown functions, bad references)
view.volatile;    // true if any cell uses TODAY()/NOW()/ISNOW()

// Edit a cell — returns the new, recomputed view (immutably):
const edited = engine.setCell(source, 0, 0, "5");

// Inspect:
engine.explain(source, 1, 0);      // how cell A2 was produced
engine.references(source, 1, 0);   // its precedents and dependents
```

Structural edits (`insertRow`, `deleteRow`, `insertCol`, `deleteCol`) and the full A1 formula language — Excel-faithful operators (`^`, `&`, postfix `%`), a broad function library, and error values that propagate as data — all come from the embedded engine. Cross-file references (`SHEET(…)`, imports) resolve only where the host provides them; in the browser they are inert (`#REF!`/`#IMPORT!`).

## The `<tsv-sheet>` web component

Drop a live spreadsheet into any page — no framework:

```html
<script type="module">
  import "@tsvsheet/tsvsheet/tsv-sheet";
</script>

<tsv-sheet src="budget.tsvt"></tsv-sheet>
```

The element loads the engine, renders the computed grid, and recomputes live as you edit a cell. Volatile sheets (`TODAY`/`NOW`/`ISNOW`) tick against the viewer's own clock.

## Typed

The package ships TypeScript declarations: `Engine`, `View`, `Grid`, `Diagnostic`, `Trace`, `References`, and `load(): Promise<Engine>` — the whole surface is typed.

## Related

- **[go-tsvsheet](https://tsvsheet.github.io/docs.go-tsvsheet/)** — the engine, as an importable Go library (and the source of the embedded `tsvsheet.wasm`).
- **[tsvsheet.go](https://github.com/tsvsheet/tsvsheet.go)** — the CLI, browser editor, and TUI.
- **[tsvsheet](https://github.com/tsvsheet/tsvsheet)** — the language and grammar specification.
