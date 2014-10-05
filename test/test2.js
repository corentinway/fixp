/* global describe, it*/
var chai = require( 'chai' );
var assert = chai.assert;
var fs = require( 'fs');
var _ = require( 'underscore' );

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
            
            // todo assert defined errors
            /*errors.forEach( function ( err ) {
                console.error( err );
                console.error( '' );
            } );
            */
            
            checkEnd();
        } ) 
        .on( 'errors', function ( err ) {
            done( err );
        } )
        .on( 'message', function ( message ) { 
            
            console.log( message );
            
            var headerKeys = Object.keys( message.header );
            var bodyKeys = Object.keys( message.body );
            var trailerKeys = Object.keys( message.trailer );
            var isNum = function ( num ) {
                return (/[0-9]+/).test( num );
            };
            var isAlpha = function ( num ) {
                return (/[a-zA-Z]+/).test( num );    
            } ;
            
            // header: 7 field with name, and 7 field with number
            
            assert.equal( _.filter( headerKeys, isNum ).length , 7, 'HEADER We expect only to have 7 entry that start with a number' );
            assert.equal( _.filter( headerKeys, isAlpha ).length , 7, 'HEADER - We expect only to have 7 entry that start with a name' );
            
            assert.equal(  _.filter( bodyKeys, isAlpha ).length ,  _.filter( bodyKeys, isNum ).length , 'BODY - same alpha and same numeric keys count');
            
            assert.equal( _.filter( trailerKeys, isNum ).length , 1, 'TRAILER We expect only to have 7 entry that start with a number' );
            assert.equal( _.filter( trailerKeys, isAlpha ).length , 1, 'TRAILER - We expect only to have 7 entry that start with a name' );
            
            checkEnd();
        } )
        .on( 'field:10', function (name, number, value ) {
            assert.equal( number, '10',  'Invalid field number');
            checkEnd();
        } )
        ;
        
    } );

} );






