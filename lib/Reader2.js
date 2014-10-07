/*jslint node: true, white: true, vars:true */

var split = require( 'split' );

var Dictionary = require( './Dictionary' );

var fieldParser = require( './fieldParser' );
var fieldEmitter = require( './fieldEmitter' );
var fieldEnricher = require( './fieldEnricher' );
var messageBuilder = require( './messageBuilder' );

var FIELD_SEPARATOR = String.fromCharCode( 1 ); // '\u0001';

/**
 * Create a Readable / Writable Stream to for FIX message: read a bulk stream message 
 * and write a JSON formatted message.
 */
function createReadStream( readable, dictionary, options ) {
	options = options || {};
	options.fieldSeparator = options.fieldSeparator || FIELD_SEPARATOR;
	options.fieldList = options.fieldList || [];
	
	if ( !dictionary ) {
		throw new Error( 'FIX dictionary not defined.' );
	}
	dictionary  = new Dictionary( require( dictionary ) );
	
	readable = readable.pipe( split( options.fieldSeparator ) ).pipe( fieldParser );
	/*
	 * add a field listener
	 */
	if ( options.fieldList.length > 0 ) {
		readable = readable.pipe( fieldEmitter( options.fieldList ) );
	}
	/*
	 * add a field enricher
	 */
	readable = readable.pipe( fieldEnricher( dictionary ) );
	readable = readable.pipe( messageBuilder( ) );
	
	return readable;
}

module.exports.createReadStream = createReadStream;

