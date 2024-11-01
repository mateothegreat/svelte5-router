.PHONY: test

install:
	npm install
	cd test/app && npm install --legacy-peer-deps

test:
	if [ ! -d "test/app/node_modules" ]; then \
	cd test/app && npm install --legacy-peer-deps; \
	fi
	cd test/app && npm run dev

clean:
	rm -rf node_modules test/app/node_modules

test/build:
	cd test/app && npm run build
