# Common tasks for the terminal-radio website. Run make help to list them.

.DEFAULT_GOAL := help
.PHONY: help install preview build test clean serve fonts themes deploy

help: ## Show every available target
	@grep -E '^[a-z-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-10s\033[0m %s\n", $$1, $$2}'

install: ## Install the dependencies from package.json
	npm install

preview: ## Serve the site with live reload, the way it looks while writing
	npx hexo server --port $(PORT) --open

build: ## Generate the static site into public/
	npx hexo clean && npx hexo generate

test: ## Build the site and verify every public page
	bash tests/site.sh

serve: build ## Serve exactly what was generated, with nothing rebuilt
	npx hexo server --static --port $(PORT)

cards: ## Redraw the social preview cards from the site's own fonts
	uv run --with pillow --with "fonttools[woff]" python tools/make_og.py

fonts: ## Refetch the pixel fonts and their licences
	@mkdir -p source/fonts vendor
	curl -sSLf -o source/fonts/Cubic_11.woff2 \
		https://raw.githubusercontent.com/ACh-K/Cubic-11/main/fonts/web/Cubic_11.woff2
	curl -sSLf -o vendor/Cubic-11-OFL.txt \
		https://raw.githubusercontent.com/ACh-K/Cubic-11/main/OFL.txt
	@echo "Departure Mono ships in a release archive; see vendor/README.md"

themes: ## Refetch the colour palettes from the radio itself
	curl -sSLf -o source/_data/themes.yml \
		https://raw.githubusercontent.com/yueswater/terminal-radio/main/terminal_radio/data/themes.yml

clean: ## Remove the generated site and the Hexo database
	npx hexo clean
	rm -rf public db.json

# Port the preview listens on. Override on the command line, for example
# make preview PORT=5000.
PORT ?= 4000
