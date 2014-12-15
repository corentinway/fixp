/*jslint node: true, white: true, vars:true */
var through = require( 'through' );

/**
 * enrich field with data from the dictionary
 */
var fieldEnricher = function ( dictionary ) {
	
	"use strict";
	
	var msgTypeFound = false;
	var tmp = [];
	var messageDefinition;
	
	function enrichGroup( data, use ) {
		// var use = dictionary.findFieldInGroup( group, field.name );
		if ( data.isGroup ) {
			data.group = use;
			data.group.tag = data.tag;
		}
	}
	
	return through( function ( data ) {
		var use;
		var field = dictionary.findField( data.tag );
		
		if ( !field ) {
			data.isHeader = data.isBody = data.isTrailer = false;
			data.error = 'Field Not Found';
			this.emit( 'fieldNotFoundError', data.tag );
		} else {
			data.name = field.name;
			data.type = field.type;
			data.isGroup = dictionary.isGroup( field );

			use = dictionary.header[ field.name ];
			data.isHeader = use !== undefined && use !== null;

			if ( data.isHeader ) {
				data.isBody = data.isTrailer = false;
			} else {
				use = dictionary.trailer[ field.name ];	
				data.isTrailer = use !== undefined && use !== null;
				if ( data.isTrailer ) {
					data.isBody = data.isHeader = false;
				}
			}
		
		}
		/*
		 * untill we don't know the message type: 
		 * - we store all data fields into an array
		 */
		if ( !msgTypeFound ) {
			tmp.push( data );
		}
		/*
		 * When message type is found:
		 *  - we flush to the stream queue each data found
		 */
		if ( data.tag === '35' ) {
			msgTypeFound = true;
			
			messageDefinition = dictionary.findMessageByType( data.value );
			if ( !messageDefinition ) {
				this.emit( 'error', 'Message Definition not found' );
				this.queue( null );
			} else {
				this.emit( 'messageType', data.value, messageDefinition.name, messageDefinition );
				tmp[ tmp.length -1 ].messageDefinition = messageDefinition;
			}
			
			for ( var i = 0; i < tmp.length; i++ ) {
				enrichGroup( tmp[i], use );
				this.queue( tmp[i] );
				this.emit( 'field', tmp[i] );
			}
		} 
		/*
		 * when message type is found:
		 * - we queue each data.
		 */
		if ( msgTypeFound && data.tag !== '35') {
			use = dictionary.findFieldInMessage( messageDefinition, data.name );
			data.isBody = use !== undefined &&  use !== null;
			enrichGroup( data, use );
			this.queue( data );
			this.emit( 'field', data );
		}
			
	} );
};


module.exports = fieldEnricher;