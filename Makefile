prebuild:
	rm -rf build
	mkdir -p build

deps:
	yarn global add node-gyp
	yarn

lint:
	`yarn bin`/tslint --project ./tsconfig.json --fix

build: prebuild
	`yarn bin`/tsc
	mkdir -p bin
	cp build/postmark.js bin/postmark
	chmod +x bin/postmark

sync:
	bin/postmark sync

init:
	bin/postmark init

test: build
	yarn test

# assumes build
integration-test:
	bin/id integration-test

