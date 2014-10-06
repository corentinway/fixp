/*jslint node: true, white: true, vars:true */

var through = require( 'through' );
var split = require( 'split' );
var fs = require( 'fs' );

var filename = 'samples/message1.txt';

var FIELD_SEPARATOR = String.fromCharCode( 1 ); // '\u0001';

// read the INPUT file and create a read stream
fs.createReadStream( filename )
// extract  each field
.pipe( split( '|' ) )
// extract field and values
.pipe( through( function ( buff ) {
    if ( buff.length > 0 ) {
        var parts = buff.split( '=' );
        this.queue( { tag: parts[0], value: parts[1] } );
    } else {
        this.queue( null );
    }
} ) )
// log field and values
.pipe( through( function ( buff ) {
    if ( buff.tag === '35' ) {
        this.emit( 'fixp-message-type', buff.value );
    }
    console.log( buff );
} ) )
.on( 'fixp-message-type', function ( value ) {
    console.log( 'MESSAGE TYPE: ' + value );
}  );
