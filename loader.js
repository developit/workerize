try {
	module.exports = require('workerize-loader');
}
catch (e) {
	console.warn("Warning: workerize-loader is not installed.");
	module.exports = function() {
		throw "To use workerize as a loader, you must install workerize-loader.";
	}
}