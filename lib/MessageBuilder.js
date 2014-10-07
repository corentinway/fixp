/*jslint node: true, white: true, vars:true */

var through = require( 'through' );

var messageBuilder = function () {
	
	"use strict";
	
	var message = {};
	message.header = {};
	message.body = {};
	message.trailer = {};
	function getMessageSection( data, emit ) {
		if ( data.isHeader ) {
			return message.header;
		} else if ( data.isBody ) {
			return message.body;
		} else if ( data.isTrailer ) {
			return message.trailer;
		} else {
			emit( 'fieldNotInMessageError', data );
			return;
		}
	}
	var builder = function ( field ) {
		var section = getMessageSection( field, this.emit );
		if ( section ) {
			section[ field.tag ] = section[ field.name ] = field.value;
		}
	};
	var publisher = function () {
		this.emit( 'message', message );
		this.queue( null );
	};
	return through( builder, publisher );
};

module.exports = messageBuilder;