"use strict";
var fs = require( 'fs' );
var util = require( 'util' );
var events = require( 'events' );
var FixMessageIterator = require( './FixMessageIterator' );

function Reader( options ) {
    
    
    options = options || {};
    
    var headerParsed = false;
    var bodyParsed = false;
    var trailerParsed = false;
    
    var dictionary = options.dictionary;
    
    //var listener = new events.EventEmitter();
    var listeners = [];
    var emit = function (evt, a, b, c, d, e, f, g) {
        for (var i = 0; i < listeners.length; i++) {
            listeners[i].emit( evt, a, b, c, d, e, f, g );
        }
    };
    
    this.addListener = function ( listener ) {
        listeners.push( listener );
    };
    

    var messageDefinition;
    
    
    
    
    /**
     * read the message from a file
     */
    this.read = function (filename, cb) {
        fs.readFile( filename, function ( err, data ) {
            if ( !err ) {
                var iterator = new FixMessageIterator( data );
                readMessage( iterator );
                emit( 'final-parsing', headerParsed, bodyParsed, trailerParsed );
            }
            cb ( err );
        } );
    };
    
    var readMessage = function ( iterator ) {
        while ( iterator.hasNext( ) ) {
			var messageField = iterator.next( );
			while ( readField( iterator, messageField.number, messageField.value) !== null  ) {
			    
			}
			
		}
		
    };
    
    function FieldNotFoundError (number ) {
        return new Error( 'Field not found: ' + number );
    }
    util.inherits( FieldNotFoundError, Error );
    
    var readField = function ( iterator, number, value ) {
        //console.log( 'read field ' + number + '\t' + value );
        var field = dictionary.findField( number );
        if ( !field ) {
            emit( 'fieldNotFoundError', new FieldNotFoundError( number ) );
            return null;
        } else {
            emit( 'read-field', field, value );
             if ( !headerParsed ) {
                emit( 'read-header', field, value );
                return readHeader( iterator, field, value );
            } else if ( !bodyParsed ) {
                emit( 'read-body', field, value );
                return readBody( iterator, field, value );
            } else if ( !trailerParsed ) {
                emit( 'read-trailer', field, value );
                return readTrailer( iterator, field, value );
            }
        }
    };
    
      
    var requiredHeaderFieldFound = 0;
    /**
     * when header is parsed
     */
    var readHeader = function ( iterator, field, value ) {
        var use = dictionary.header[ field.name ];
        
        if ( !use ) {
            return null;
        } else if ( use.required ) {
            requiredHeaderFieldFound++;
        }
        headerParsed = requiredHeaderFieldFound === dictionary.requiredHeaderField;
        
        /*
         * check message definition
         */
        if ( '35' === field.number  ) {
            messageDefinition = dictionary.findMessageByType( value );
            emit( 'message-type', field, value, messageDefinition );
        }
        
        if ( dictionary.isGroup( field ) ) {
            var fixMessageField = readGroup( iterator, use, value );
            if ( headerParsed ) {
                return fixMessageField;
            } else {
                
                // TODO remove else here ??
                
                var nextField = dictionary.findField( fixMessageField.number );
                if ( !nextField ) {
                    emit( 'fieldNotFoundError', new FieldNotFoundError( fixMessageField.number ) );
                } else {
                    return readHeader( iterator, nextField, fixMessageField.value );
                }
            }
        }
        
        return null;
        
    };
    
    /**
     * read a group
     */
    var readGroup = function ( iterator, group, value ) {
        var fixMessageField = null;
        
        while( iterator.hasNext() ) {
            fixMessageField = iterator.next();
            var field = dictionary.findField( fixMessageField.number );
            if ( !field ) {
                emit( 'fieldNotFoundError', new FieldNotFoundError( fixMessageField.number ) );
            } else {
                var use = dictionary.findFieldInGroup( group, field.name );
                if ( !use ) {
                    /* we exit the group */
                    break;
                } else {
                    emit( 'group-field', group, field, fixMessageField.value );
                   if ( dictionary.isGroup( field ) ) {
                       fixMessageField = readGroup( iterator, use, value );
                   }
                }
            }
        }
        
        emit( 'group-end', group, value );
        
        return fixMessageField;
    };
    /**
     * read the body of the FIX message.
     * The messageDefinition must be loaded from the header
     */
    var readBody = function ( iterator, field, value ) {
        if ( messageDefinition ) {
            var use = dictionary.findFieldInMessage( messageDefinition, field.name );
            if ( !use ) {
                use = dictionary.trailer[ field.name ];
                if ( use ) {
                    bodyParsed = true;
                    // end of body parsing
                    return null;
                }
            } else if ( dictionary.isGroup( field ) ) {
                return readGroup( iterator, use, value );
            }
        }
        
        return null;
    };
    var requiredTrailerFieldFound = 0;
    var readTrailer = function ( iterator, field, value ) {
        var use = dictionary.trailer[ field.name ];
        if ( use && use.required ) {
            requiredTrailerFieldFound++;
        }
        trailerParsed = requiredTrailerFieldFound === dictionary.requiredTrailerField;
        
        return null;
    };
    
}

util.inherits( Reader, events.EventEmitter );
module.exports = exports = Reader;

