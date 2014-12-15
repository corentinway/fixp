/*jslint node:true */

var dictionary = require( '../dictionaries/fix44.json' );

var fields = dictionary.fix.fields;
var types = {};


for ( var tag in fields ) {
	var field = fields[ tag ];
	if ( !types.hasOwnProperty( field.type ) ) {
		types[ field.type ] = true;
	}
}

console.log( Object.keys( types) );