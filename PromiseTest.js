var first = Promise.reject(6);

first.then(
	function resolve(value) {
		console.log('Resolve first');
		console.log(value);
	},
	function reject(value) {
		console.log('Reject first');
		console.log(value);
	}
).then(
	function resolve(value) {
		console.log('Resolve second');
		console.log(value);
	},
	function reject(value) {
		console.log('Reject second');
		console.log(value);
	}
).then(
	function resolve(value) {
		console.log('Resolve third');
		console.log(value);
	},
	function reject(value) {
		console.log('Reject third');
		console.log(value);
	}	

);