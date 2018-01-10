<p align="center">
  <img src="https://i.imgur.com/Zcy6Hgb.png" width="300" height="300" alt="workerize-loader">
  <br>
  <a href="https://www.npmjs.org/package/workerize"><img src="https://img.shields.io/npm/v/workerize.svg?style=flat" alt="npm"></a> <a href="https://travis-ci.org/developit/workerize"><img src="https://travis-ci.org/developit/workerize.svg?branch=master" alt="travis"></a>
</p>

# Workerize

**NOTE:** If you're using Webpack, try [workerize-loader](https://github.com/developit/workerize-loader).

> Moves a module into a Web Worker, automatically reflecting exported functions as asynchronous proxies.

- Bundles a tiny, purpose-built RPC implementation into your app
- If exported module methods are already async, signature is unchanged
- Supports synchronous and asynchronous worker functions
- Works beautifully with async/await


## Install

```sh
npm install --save workerize
```


### Usage

**worker.js**:

```js
let worker = workerize(`
	export function add(a, b) {
		// block for half a second to demonstrate asynchronicity
		let start = Date.now();
		while (Date.now()-start < 250);
		return a + b;
	}
`);

(async () => {
	console.log('3 + 9 = ', await worker.add(3, 9));
	console.log('1 + 2 = ', await worker.add(1, 2));
})();
```

### License

[MIT License](LICENSE.md) © [Jason Miller](https://jasonformat.com)
