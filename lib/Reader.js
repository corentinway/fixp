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
    
    
    
    
    var me = this;
    
    
    
    /**
     * read the message from a file
     */
    this.read = function (filename) {
        fs.readFile( filename, function ( err, data ) {
            if ( err ) {
                console.error( err );
            } else {
                var iterator = new FixMessageIterator( data );
                readMessage( iterator );
            }
            
        } );
    };
    
    var readMessage = function ( iterator ) {
        while ( iterator.hasNext( ) ) {
			var messageField = iterator.next( );
			while ( !( messageField = readField( iterator, messageField.number, messageField.value) )  ) {
			}
		}
		
		console.log( 'header valid: ' + headerParsed );
    };
    
    var readField = function ( iterator, number, value ) {
        var field = dictionary.findField( number );
        if ( !field ) {
            console.error( 'Field not found: ' + number );
            return null;
        } else {
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
    /*
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
            me.messageDefinition = me.dictionary.findMessageByType( value );
        }
        
        if ( dictionary.isGroup( field ) ) {
            var fixMessageField = readGroup( iterator, use, value );
            if ( headerParsed ) {
                return fixMessageField;
            } else {
                var nextField = dictionary.findField( fixMessageField.number );
                return readHeader( iterator, nextField, fixMessageField.value );
            }
        }
        
    };
    
    /**
     * read a group
     */
    var readGroup = function ( iterator, group, value ) {
        var fixMessageField = null;
        
        while( iterator.hasNext() ) {
            fixMessageField = iterator.next();
            var field = dictionary.findField( fixMessageField.number );
            var use = dictionary.findFieldInGroup( group, field.name );
            if ( !use ) {
                /* we exit the group */
                break;
            } else {
               if ( dictionary.isGroup( field ) ) {
                   fixMessageField = readGroup( iterator, use, value );
               }
            }
        }
        
        return fixMessageField;
    };
    
    var readBody = function ( iterator, field, value ) {
    };
    var readTrailer = function ( iterator, field, value ) {
    };
    
}

util.inherits( Reader, events.EventEmitter );
module.exports = exports = Reader;

