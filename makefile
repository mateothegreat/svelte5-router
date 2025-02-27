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
