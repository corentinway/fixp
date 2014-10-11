/*jslint node: true, white: true, vars:true */
/*global describe, it, before */

var chai = require( 'chai' );
var assert = chai.assert;
var reader2 = require( '../lib/Reader2' );
var fs = require( 'fs' );
var through = require( 'through' );


var dictionary = __dirname + '/../dictionaries/fix44.json';
var options = {
	fieldSeparator: '|'	,
	//fieldList: [ '35' ]
};


describe( 'A complete example with Reader2', function () {
	var actualCounter;
	
	before(function () {
		actualCounter = 0;
	} );
	
	// source
	var filename = __dirname + '/../samples/message1.txt';
	// count of field in the message
	var expectedFieldCount = fs.readFileSync( filename ).toString().split( '|' ).reduce( function ( counter, item ) {
		if ( item !== null && item !== undefined && item.trim().length > 0 ) {
			counter++;	
		}
		return counter;
	}, 0 );
	// input
	var readable = fs.createReadStream( filename );
	/**
	 * count each field parsed
	 */
	var countField = function ( field ) {
		actualCounter++;
		console.log( actualCounter + '  ' + JSON.stringify( field ) );
	};
	var assertTotalFields = function ( done ) {
		return function () {
			assert.equal( actualCounter, expectedFieldCount, 'The expected field count is not equal to the actual field count' );
			done( );
		};
	};

	it( 'should parse all the field of the FIX message', function ( done ) {
		var actualCounter = 0;	
		
		reader2.createReadStream( readable, dictionary, options )
		/* ************************************************ */
		/*   put event listener before the 1st other pipe   */
		/*   otherwise you lost all custom event emitted    */
		/* ***********************************************  */
		.on( 'field', function ( f ) {
			console.log( "Field: " + JSON.stringify( f ) );
		} )
		.on( 'field-not-found', function ( tag ) {
			//console.error( 'Field not found: ' + tag );
		} )
		.on( 'message-type', function ( value, name, def ) {
			//console.log( 'Message Type: ' + value + ' ' + name );
			//console.log( 'Message definition: ' + JSON.stringify( def ) );
		} )
		.on( 'error', done )
		//.pipe( through( countField, assertTotalFields( done ) ) )
		.on( 'message', function ( message ) {
			showMessage( message );
		} )
		.on( 'error', done )
		;
	} );

} );


function showMessage( message ) {
	console.log( 'message:' );
	console.log( message );
	/*console.log( '--------------' );
	console.log( 'body groups' );
	for( var name in message.body ) {
		if ( message.body[ name].group ) {
			var g = message.body[ name ];
			// delete group definition
			delete g.group;
			console.log( name );
			console.log( g );
			console.log( '--------------' );
		}
	}
	console.log( '--------------' );
	console.log( 'NoPartyIDs - 453 ');
	console.log( message.body.NoPartyIDs );
	console.log( '--------------' );
	console.log( 'NoPartyIDs - 453');
	console.log( message.body['453'] );
	console.log( '--------------' );
	console.log( 'details:');
	message.body.NoPartyIDs.elements.forEach( function ( element, index, array ) {
		console.log( 'index: ' + index );
		console.log( element );
		if ( element.NoPartySubIDs ) {
			console.log( 'Party sub ids ');
			element.NoPartySubIDs.elements.forEach( function ( element, index, array ) {
				console.log();
				console.log( 'index: ' + index );
				console.log( element );
				console.log();
			} );
		}
		console.log( '--------------' );
	} );
	//*/
}


/****** mock to debug this file *********/

/**/
function before( cb ) {
	cb();
}
function it( text, cb ) {
	console.log( text );
	cb( function ( err ) {
		console.log( err ? 'error' : 'succes' );
	} );
}
function describe ( text, callback ) {
	console.log( text );
	callback();	
}
//*/

