.PHONY: test

test:
	if [ ! -d "test/app/node_modules" ]; then \
	cd test/app && npm install --legacy-peer-deps; \
	fi
	cd test/app && npm run dev

clean:
	rm -rf test/app/node_modules
