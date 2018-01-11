<h2 align="center">
  💖 Using Webpack? You want <a href="https://github.com/developit/workerize-loader">workerize-loader ➡️</a>
</h2>

<img src="https://i.imgur.com/MBlHoDp.jpg" width="1358" alt="workerize">

# Workerize [![npm](https://img.shields.io/npm/v/workerize.svg?style=flat)](https://www.npmjs.org/package/workerize) [![travis](https://travis-ci.org/developit/workerize.svg?branch=master)](https://travis-ci.org/developit/workerize)

[![Greenkeeper badge](https://badges.greenkeeper.io/developit/workerize.svg)](https://greenkeeper.io/)

> Moves a module into a Web Worker, automatically reflecting exported functions as asynchronous proxies.

- Bundles a tiny, purpose-built RPC implementation into your app
- If exported module methods are already async, signature is unchanged
- Supports synchronous and asynchronous worker functions
- Works beautifully with async/await
- Just **900 bytes** of gzipped ES3


## Install

```sh
npm install --save workerize
```


### Usage

Pass either a function or a string containing code.

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
