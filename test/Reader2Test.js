/*jslint node: true, white: true, vars:true */

var reader2 = require( '../lib/Reader2' );
var Dictionary = require( '../lib/Dictionary' );
var fs = require( 'fs' );
var through = require( 'through' );


var dictionary = new Dictionary( require( __dirname + '/../dictionaries/fix44.json' ) );

var options = {
	fieldSeparator: '|'	
};



var filename = __dirname + '/../samples/message1.txt';
var readable = fs.createReadStream( filename );


reader2.createReadStream( readable, dictionary, options ).pipe( through( console.log ) );