.PHONY: demo

install:
	npm install
	cd demo && npm install

demo:
	if [ ! -d "demo/node_modules" ]; then \
	cd demo && npm install; \
	fi
	cd demo && npm run dev

clean:
	rm -rf node_modules demo/node_modules

demo/build:
	cd demo && npm run build


docs/watch: ## Build the docs and watch for changes.
	trap 'kill 0' SIGINT; \
	npm run docs:watch & \
	(sleep 4 && npm run docs:serve) & \
	wait
