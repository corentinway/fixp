var fs = require( 'fs' );
var Reader = require( './lib/Reader' );
var Dictionary = require( './lib/Dictionary' );
var Validator = require( './lib/Validator' );
var MessageBuilder = require( './lib/MessageBuilder' );

var fix44 = require( './dictionaries/fix44' );

var options = {
   dictionary: new Dictionary( fix44 )
};

var validator = new Validator( options.dictionary );
validator.on( 'end', function ( errors ) {
    console.log( 'validator errors ? ' + errors.length > 0 );
    /*for (var i = 0; i < errors.length; i++) {
        console.error( errors[i].message );
    }*/
} );

var messageBuilder = new MessageBuilder( options.dictionary  ) ;
messageBuilder.on( 'end', function ( msg ) {
    console.log( 'Message parsed: ');
    console.log( msg );
    console.log( ' -------------------- ');
    console.log( msg.body.NoPartyIDs );
} );

var reader = new Reader( options );
reader.addListener( validator );
reader.addListener( messageBuilder );

reader.read( fs.createReadStream( __dirname + '/samples/message1.txt'), function ( err ) {
    if ( err ) {
        console.error( err );
    }
} );


