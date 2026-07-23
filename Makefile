# Absolute path to this Makefile's directory, with a trailing slash.
here := $(dir $(realpath $(firstword $(MAKEFILE_LIST))))

.DELETE_ON_ERROR:
.DEFAULT_GOAL := help

.PHONY: help
help: ## Show this help
	@grep -hE '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN{FS=":.*?## "}{printf "\033[36m%-10s\033[0m %s\n",$$1,$$2}'

.PHONY: assets
assets: ## Regenerate the self-hosted <tsv-sheet> bundle + wasm into static/ (needs Node + the sibling ../tsvsheet.js)
	npm --prefix $(here) install
	npm --prefix $(here) run assets

.PHONY: serve
serve: ## Preview the public docs locally
	hugo server --source $(here)

.PHONY: build
build: ## Build the docs site into _site
	hugo --minify --source $(here)

.PHONY: clean
clean: ## Remove the built site
	rm -rf $(here)_site $(here)resources

# The demo engine: the Go engine compiled to WebAssembly, pinned by version and
# re-downloaded from the go-tsvsheet release — never a hand-built local copy.
# (The <tsv-sheet> bundle still comes from `make assets`; only the engine is
# version-pinned here.) Bump WASM_VERSION to adopt a new engine.
WASM_VERSION := v0.11.0
.PHONY: wasm
wasm: ## Re-download the pinned engine wasm into static/tsvsheet
	gh release download $(WASM_VERSION) --repo tsvsheet/go-tsvsheet --pattern 'tsvsheet.wasm' --output $(here)static/tsvsheet/tsvsheet.wasm --clobber
