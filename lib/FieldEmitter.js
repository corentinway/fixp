/*jslint node: true, white: true, vars:true */
var through = require( 'through' );

/**
 * emit a field found event, if the field is found
 */
var fieldEmitter = function ( fieldList ) {
	
	"use strict";
	
	/*
	 * create a set of unique field tag or name
	 */
	var fields = fieldList.reduce( function ( prev, curr ) {
		prev[ curr ] = true;
		return prev;
	}, {} );
	
	return through( function ( buff ) {
		if ( fields.hasOwnProperty( buff.tag ) ) {
			this.emit( 'field', buff.tag, buff.value );	
		}
	} );
};

module.exports = fieldEmitter; 