
/** TODO:
 *	- pooling (+ load balancing by tracking # of open calls)
 *  - queueing (worth it? sortof free via postMessage already)
 *
 *	@example
 *	let worker = workerize(`
 *		export function add(a, b) {
 *			// block for a quarter of a second to demonstrate asynchronicity
 *			let start = Date.now();
 *			while (Date.now()-start < 250);
 *			return a + b;
 *		}
 *	`);
 *	(async () => {
 *		console.log('3 + 9 = ', await worker.add(3, 9));
 *		console.log('1 + 2 = ', await worker.add(1, 2));
 *	})();
 */
export default function workerize(code, options) {
	let exports = {};
	let exportsObjName = `__xpo${Math.random().toString().substring(2)}__`;
	if (typeof code==='function') code = `(${Function.prototype.toString.call(code)})(${exportsObjName})`;
	code = toCjs(code, exportsObjName, exports) + `\n(${Function.prototype.toString.call(setup)})(self,${exportsObjName},{})`;
	let url = URL.createObjectURL(new Blob([code])),
		worker = new Worker(url, options),
		term = worker.terminate,
		callbacks = {},
		counter = 0,
		i;
	worker.kill = signal => {
		worker.postMessage({ type: 'KILL', signal });
		setTimeout(worker.terminate);
	};
	worker.terminate = () => {
		URL.revokeObjectURL(url);
		term.call(this);
	};
	worker.call = (method, params) => new Promise( (resolve, reject) => {
		let id = `rpc${++counter}`;
		callbacks[id] = [resolve, reject];
		worker.postMessage({ type: 'RPC', id, method, params });
	});
	worker.rpcMethods = {};
	setup(worker, worker.rpcMethods, callbacks);
	worker.expose = methodName => {
		worker[i] = function() {
			return worker.call(methodName, arguments);
		};
	};
	for (i in exports) if (!(i in worker)) worker.expose(i);
	return worker;
}

function setup(ctx, rpcMethods, callbacks) {
	ctx.addEventListener('message', ({ data }) => {
		let id = data.id;
		if (data.type!=='RPC' || id==null) return;
		if (data.method) {
			let method = rpcMethods[data.method];
			if (method==null) {
				ctx.postMessage({ type: 'RPC', id, error: 'NO_SUCH_METHOD' });
			}
			else {
				Promise.resolve()
					.then( () => method.apply(null, data.params) )
					.then( result => { ctx.postMessage({ type: 'RPC', id, result }); })
					.catch( error => { ctx.postMessage({ type: 'RPC', id, error }); });
			}
		}
		else {
			let callback = callbacks[id];
			if (callback==null) throw Error(`Unknown callback ${id}`);
			delete callbacks[id];
			if (data.error) callback[1](Error(data.error));
			else callback[0](data.result);
		}
	});
}

function toCjs(code, exportsObjName, exports) {
	code = code.replace(/^(\s*)export\s+default\s+/m, (s, before) => {
		exports.default = true;
		return `${before}${exportsObjName}.default=`;
	});
	code = code.replace(/^(\s*)export\s+(function|const|let|var)(\s+)([a-zA-Z$_][a-zA-Z0-9$_]*)/m, (s, before, type, ws, name) => {
		exports[name] = true;
		return `${before}${exportsObjName}.${name}=${type}${ws}${name}`;
	});
	return `var ${exportsObjName}={};\n${code}\n${exportsObjName};`;
}
