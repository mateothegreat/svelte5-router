.PHONY: llms.txt diagrams

setup:
	@if [ ! -d "node_modules" ]; then \
		echo "Installing dependencies..."; \
		npm install --legacy-peer-deps; \
	fi

watch: setup ## Build the docs and watch for changes.
	trap 'kill 0' SIGINT; \
	npm run docs:watch & \
	(sleep 4 && cd ../tmp/build && npx httpserver -p 20000) & \
	wait

llms.txt: setup
	cat docs/*.md docs/llms.txt > ../llms.txt

diagrams: setup
	@for file in diagrams/*.mmd; do \
		echo "Generating diagram $$file"; \
		node_modules/.bin/mmdc -t dark -b transparent -i $$file -o $${file%.mmd}.png --puppeteerConfigFile puppeteer.config.cjs; \
	done
