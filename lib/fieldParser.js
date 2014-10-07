/*jslint node: true, white: true, vars:true */


var through = require( 'through' );
var SEPARATOR = '=';


/**
 * Parse a field: extract the field tag number and its value;
 */
var fieldParser = through( function ( buff ) {
	
	"use strict";
	
    if ( buff.length > 0 ) {
        var parts = buff.split( SEPARATOR );
		var data = { tag: parts[0], value: parts[1] };
        this.queue( data );
    } else {
        this.queue( null );
    }
} );

module.exports = fieldParser;