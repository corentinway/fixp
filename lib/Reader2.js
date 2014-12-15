/*jslint node: true, white: true, vars:true */

var events = require( 'events' );
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
	
	"use strict";
	
	options = options || {};
	options.fieldSeparator = options.fieldSeparator || FIELD_SEPARATOR;
	options.fieldList = options.fieldList || [];
	
	if ( !dictionary ) {
		throw new Error( 'FIX dictionary not defined.' );
	}
	dictionary  = new Dictionary( require( dictionary ) );
	
	var fieldListener;
	if ( options.fieldList.length > 0 ) {
		fieldListener = fieldEmitter( options.fieldList );
		fieldListener.on( 'field', function ( data ) {
			readable.emit( 'field', data );
		} );
	}
	var fe =  fieldEnricher( dictionary );
//	fe.on( 'field', function ( data ) {
//		readable.emit( 'richField', data );
//	} )
//	.on( 'fieldNotFoundError', function ( tag ) {
//		readable.emit( 'fieldNotFoundError', tag );
//	} )
//	.on( 'error', function ( err ) {
//		readable.emit( 'error', err );
//	} )
//	.on( 'messageType', function ( value, name, messageDef ) {
//		readable.emit( 'messageType', value, name, messageDef );
//	} )
//	;
	var builder = messageBuilder( dictionary );
//	builder.on( 'fieldNotInMessageError', function ( field ) {
//		readable.emit( 'fieldNotInMessageError', field );
//	} );
	
	// build the transformation stream
	
	readable = readable.pipe( split( options.fieldSeparator ) ).pipe( fieldParser );
	if (fieldListener ) {
		readable = readable.pipe( fieldListener );
	}
	readable = readable.pipe( fe );
	readable = readable.pipe( builder );
	
	return readable;
}

module.exports.createReadStream = createReadStream;

