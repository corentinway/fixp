var util = require( 'util' );
var events = require( 'events' );
var _ = require( 'underscore' );

/**
 * event name to emit
 */
var FIELD_EVENT = 'field-found';


/**
 * Emit an event (on itself) if a field is found.
 * 
 * It listens to 'read-field' event. If the field name or number received match
 * the expected ones (from the constructor argument), then it emits the event 
 * 'field-found' with the following parameter: key, field name, field number and
 * field value. The key parameter is eighter the field name or the field number
 * whether we expect to receive a field name or a field number.
 * 
 * @param fieldArray {Array} array of number or string that describe the field to
 * find (by its number or its name)
 */ 
function FieldEmitter( fieldsArray ) {

    /**
     * set of field number or field name to watch.
     */
    var fieldSet = createFieldsSet( fieldsArray );
    
    var self = this;

    /**
     * We define a callback for the event 'read-field'.
     * The callback emit an event if the field number or name match thoses
     * expected.
     * 
     * arguments of the event emitted are : key, field name, field number and field value. 
     * Key is the field name or value to find.
     */
    this.on( 'read-field', function ( field, value ) {
        if ( fieldSet.hasOwnProperty( field.name ) ) {
            self.emit( FIELD_EVENT,  field.name, field.name, field.number, value );
        }
        if ( fieldSet.hasOwnProperty( field.number ) ) {
            self.emit( FIELD_EVENT,  field.number, field.name, field.number, value );
        }
    } );
}

/* extend from EventEmitter */
util.inherits( FieldEmitter, events.EventEmitter );
/* expose the class */
module.exports = exports = FieldEmitter;                

/**
 * regular expression to filter type of element in the fieldsArray
 */ 
var typeRE = /number|string/i;
/**
 * create a Set that only containes number or string.
 */
var createFieldsSet = function ( fieldsArray ) {
    var fieldsSet = {};
    if ( fieldsArray ) {
        for( var i = 0; i < fieldsArray.length; i++ ) {
            var type = typeof fieldsArray[i];
            if ( typeRE.test( type ) ) {
                fieldsSet[ fieldsArray[i].toString() ] = true;
            } else {
                console.error( 'The type of the value is not among the ones expected: number or string. Actual value: ' + fieldsArray[i] + ' - Actual type ' + type );            }
        }
    }
    
    return fieldsSet;
};


