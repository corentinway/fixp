var fs = require( 'fs');

var fixp = require( '..' );

console.log( 'dirname: ' + __dirname );


var readable = fs.createReadStream( __dirname + '/../samples/message1.txt');
var dictionary = __dirname + '/../dictionaries/fix44.json';
var options = {
    validation: true,
    listeners: {
        fields: [ 10 ]
    }
};

fixp.readFix( readable, dictionary, options )
.on( 'validation-end', function ( valid , errors ) { 
    console.log( 'validator errors ? ' + valid );
} ) 
.on( 'errors', function ( err ) {
    console.error( 'Errors:' );
    console.error( err );
} )
.on( 'message', function ( message ) { 
    console.log( 'Message parsed:' );
    console.log( message );
} )
.on( 'field:10', function (name, number, value ) {
    console.log( '    CHECKSUM: ', name, number, value ) ;
} )
;