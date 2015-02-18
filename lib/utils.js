// Shallow extend function, takes an object and a
// splat of objects to extend with. Merges objects from
// the last to the first and returns result.
exports.extend = function(root){
	var extenders = Array.prototype.slice.call(arguments, 1);

	for(var i = 0; i < extenders.length; i++)
		if(extenders[i])
			for(var key in extenders[i])
				root[key] = extenders[i][key];

	return root;
}

// Quick Underscore-style templating
exports.template = function(str, obj){
	return str.replace(/\{([^\}]*)\}/g, function(match, param){
		return obj[param];
	});
}

// Single layer flatten flatten. Concats an array of arrays together.
exports.flatten = function(arr){
	return arr.reduce(function(res, el){
		res = res.concat(el);
		return res;
	}, []);
}