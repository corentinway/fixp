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
    this.read = function (readable, cb) {
        
        // http://nodejs.org/api/stream.html#stream_class_stream_readable
        var buffer = new Buffer( 0 );
        
        readable.on( 'data', function ( chunk ) { 
            buffer = Buffer.concat( [ buffer, chunk ] );
        } );
        
        // TODO CB Message
        readable.on( 'end', function () {
            var iterator = new FixMessageIterator( buffer );
            readMessage( iterator );
            emit( 'final-parsing', headerParsed, bodyParsed, trailerParsed );
        } );
        
        readable.on( 'error', cb );
    };
    
    var readMessage = function ( iterator ) {
        while ( iterator.hasNext( ) ) {
			var messageField = iterator.next( );
			do {
                messageField = readField( iterator, messageField.number, messageField.value);
            } while ( messageField );
			
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
                return readHeader( iterator, field, value );
            } else if ( !bodyParsed ) {
                return readBody( iterator, field, value );
            } else if ( !trailerParsed ) {
                return readTrailer( iterator, field, value );
            }
        }
    };
    
      
    var requiredHeaderFieldFound = 0;
    /**
     * when header is parsed
     */
    var readHeader = function ( iterator, field, value ) {
        emit( 'read-header', field, value );
        var use = dictionary.header[ field.name ];
        
        if ( !use ) {
            
            // check in the message body
            if ( messageDefinition ) {
                var nextUse = dictionary.findFieldInMessage( messageDefinition, field.name );   
                if ( nextUse ) {
                    return readBody( iterator, field, value );
                }
            }
            
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
            var fixMessageField = readGroup( iterator, use, value, 'header' );
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
    var readGroup = function ( iterator, group, value, parent ) {
        var fixMessageField = null;
        
        emit( 'group-start', group, value, parent );
        
        var repeatingGroupElement = {};
        
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
                    if ( !dictionary.isGroup( field ) ) {
                        if ( repeatingGroupElement.hasOwnProperty( field.name) ) {
                            // new repeating group
                            emit( 'new-repeating-group-element', group, repeatingGroupElement, parent );
                            repeatingGroupElement = {};
                        } else {
                            // populate the repeating group
                            repeatingGroupElement[ field.name ] = fixMessageField.value;
                        }
                    }
                    emit( 'group-field', group, field, fixMessageField.value, parent );
                   if ( dictionary.isGroup( field ) ) {
                       fixMessageField = readGroup( iterator, use, fixMessageField.value, /*parent + '.' + group.name*/ group  );
                   }
                }
            }
        }
        
        // emit the last repeating group:
        if ( Object.keys( repeatingGroupElement ).length > 0 ) {
            emit( 'new-repeating-group-element', group, repeatingGroupElement, parent );
        }
        
        emit( 'group-end', group, value, parent );
        
        return fixMessageField;
    };
    /**
     * read the body of the FIX message.
     * The messageDefinition must be loaded from the header
     */
    var readBody = function ( iterator, field, value ) {
        emit( 'read-body', field, value );
        if ( messageDefinition ) {
            var use = dictionary.findFieldInMessage( messageDefinition, field.name );
            if ( !use ) {
                use = dictionary.trailer[ field.name ];
                if ( use ) {
                    bodyParsed = true;
                     // end of body parsing
                    return readTrailer( iterator, field, value );
                }
            } else if ( dictionary.isGroup( field ) ) {
                return readGroup( iterator, use, value, 'body' );
            }
        }
        
        return null;
    };
    var requiredTrailerFieldFound = 0;
    var readTrailer = function ( iterator, field, value ) {
        emit( 'read-trailer', field, value );
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

