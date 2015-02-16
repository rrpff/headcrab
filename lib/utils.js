// Make a shallow clones of an object
// exports.clone = function(obj){
// 	return Object.keys(obj).reduce(function(clone, key){
// 		clone[key] = obj[key];
// 		return clone;
// 	}, {});
// }

// Shallow extend function, takes an object and a
// splat of objects to extend with. Merges objects from
// the last to the first and returns result.
exports.extend = function(root){
	var extenders = Array.prototype.slice.call(arguments, 1);

	for(var i = 0; i < extenders.length; i++)
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