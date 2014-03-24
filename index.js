var events = require( 'events' );
var _ = require( 'underscore' );

var Reader = require( './lib/Reader' );
var Dictionary = require( './lib/Dictionary' );
var Validator = require( './lib/Validator' );
var MessageBuilder = require( './lib/MessageBuilder' );


/**
 * Read a fix message.
 * 
 * The dictionary is a JSON object loaded be the require function
 * 
 * @param readable {stream.Readable} readable stream
 * @param dictionary {String|Object} path to the dictionary to load or the dictionary loaded. 
 * @param options {Object} options to read
 * @param options.validate {Boolean} true to validate the message, false otherwise. Default value is true.
 * @param options.listeners {Object} to tells what kind of event the invoker expect to receive
 * @param options.listeners.fields {Array} array of field numbers or field names. The Emitter will emit an event named: field:NUMBER or field:NAME.
 * It ignore the level of repeting group all fields are.
 */
exports.readFix = function ( readable, dictionary, options ) {
    
    var emitter = new events.EventEmitter();
    
    if ( typeof dictionary === 'string' ) {
        // TODO check dictionary path
        dictionary = require ( dictionary );
    }
    
    /*
     *      default
     */
    options = options || {};
    options.validate = options.validate || true;
    options.dictionary = new Dictionary( dictionary );
    
    var reader = new Reader( options );
    
    /*
     *      validation
     */
    if ( options.validate ) {
        var validator = new Validator( options.dictionary );
        validator.on( 'end', function ( errors ) { 
            emitter.emit( 'validation-end', errors && errors.length === 0 ,   errors );
        } );
        reader.addListener( validator );
    }
    
    /*
     *      message builder
     */
    var messageBuilder = new MessageBuilder( options.dictionary  ) ;
    messageBuilder.on( 'end', function ( msg ) {
        emitter.emit( 'message', msg );
    } );
    reader.addListener( messageBuilder );
    
    /*
     *      field listener
     */
     var listeners = options.listeners;
     if ( listeners && listeners.fields && _.isArray( listeners.fields ) && listeners.fields.length > 0 ) {
         var FieldEmitter = require ( './lib/FieldEmitter' );
         var fieldEmitter = new FieldEmitter( listeners.fields );
         fieldEmitter.on( 'field-found', function ( key, name, number, value ) {
             emitter.emit( 'field:' + key, name, number, value );
         } );
         reader.addListener( fieldEmitter );
     }
    
    reader.read( readable, function ( err ) {
        if ( err ) {
            emitter.emit( 'error', err);
        }
    } );
    
    return emitter;
    
};








