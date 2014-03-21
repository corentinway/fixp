var fs = require( 'fs' );
var events = require( 'events' );

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
 */
exports.readFix = function ( readable, dictionary, options ) {
    
    var emitter = new events.EventEmitter();
    
    if ( typeof dictionary === 'string' ) {
        // TODO check dictionary path
        dictionary = require ( dictionary );
    }
    
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
     *      message validation
     */
    var messageBuilder = new MessageBuilder( options.dictionary  ) ;
    messageBuilder.on( 'end', function ( msg ) {
        emitter.emit( 'message', msg );
    } );
    reader.addListener( messageBuilder );
    
    reader.read( readable, function ( err ) {
        if ( err ) {
            emitter.emit( 'error', err);
        }
    } );
    
    return emitter;
    
};








