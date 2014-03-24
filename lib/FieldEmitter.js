var util = require( 'util' );
var events = require( 'events' );
var _ = require( 'underscore' );

var FIELD_EVENT = 'field-found';

/**
 * Validate the field message
 */ 
function FieldEmitter( fieldsArray ) {
    
    var fieldSet = {};
    for( var i = 0; i < fieldsArray.length; i++ ) {
        fieldSet[ fieldsArray[i].toString() ] = true;
    }
    
    var self = this;

    this.on( 'read-field', function ( field, value ) {
        if ( fieldSet.hasOwnProperty( field.name ) ) {
            self.emit( FIELD_EVENT,  field.name, field.name, field.number, value );
        }
        if ( fieldSet.hasOwnProperty( field.number ) ) {
            self.emit( FIELD_EVENT,  field.number, field.name, field.number, value );
        }
    } );
}

util.inherits( FieldEmitter, events.EventEmitter );
module.exports = exports = FieldEmitter;                


