/* global describe, it*/
var chai = require( 'chai' );
var assert = chai.assert;
var fs = require( 'fs');

var fixp = require( '..' );



describe( 'A complete example', function () {
    
    // exampleStream
    var readable = fs.createReadStream( __dirname + '/../samples/message1.txt');
    // dictionary
    var dictionary = __dirname + '/../dictionaries/fix44.json';
    // options
    var options = {
        validation: true,
        listeners: {
            fields: [ 10 ]
        }
    };
    it( 'should handle a complete example', function ( done ) {
        
        var end = 0;
        function checkEnd() {
            end++;
            if ( end === 3 ) {
                done();
            }
        }
        
        fixp.readFix( readable, dictionary, options )
        .on( 'validation-end', function ( valid , errors ) { 
            assert.isFalse( valid, 'messages must have errors because the dictionary does not defined all its field' );
            checkEnd();
        } ) 
        .on( 'errors', function ( err ) {
            done( err );
        } )
        .on( 'message', function ( message ) { 
            checkEnd();
        } )
        .on( 'field:10', function (name, number, value ) {
            assert.equal( number, '10',  'Invalida field number');
            checkEnd();
        } )
        ;
        
    } );

} );






