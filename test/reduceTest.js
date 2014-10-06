var set = [1, 2, 3].reduce( function( prev, cur, index, arr) {
	prev[ cur ] = true;
	return prev;
}, {} );

console.log( set );