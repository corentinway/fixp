var Reader = require( './lib/Reader' );
var Dictionary = require( './lib/Dictionary' );
var Validator = require( './lib/Validator' );

var fix44 = require( './dictionaries/fix44' );

var options = {
   dictionary: new Dictionary( fix44 )
};

var validator = new Validator( options.dictionary );
validator.on( 'end', function ( errors ) {
    console.log( 'validator errors ?' );
    for (var i = 0; i < errors.length; i++) {
        console.error( errors[i].message );
    }
} );

var reader = new Reader( options );
reader.addListener( validator );

// TODO input as a stream
reader.read( __dirname + '/samples/message1.txt', function ( err ) {
    if ( err ) {
        console.error( err );
    }
} );


