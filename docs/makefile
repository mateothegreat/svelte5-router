.PHONY: llms.txt diagrams

watch: ## Build the docs and watch for changes.
	trap 'kill 0' SIGINT; \
	npm run docs:watch & \
	(sleep 4 && npm run docs:serve) & \
	wait

llms.txt:
	cat docs/*.md docs/llms.txt > llms.txt

diagrams:
	for file in diagrams/*.mmd; do \
		node_modules/.bin/mmdc -t dark -b transparent -i $$file -o $${file%.mmd}.png; \
	done
