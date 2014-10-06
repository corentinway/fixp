/*jslint node: true, white: true, vars:true */


var through = require( 'through' );
var split = require( 'split' );
var fs = require( 'fs' );

var filename = 'samples/message1.txt';

var FIELD_SEPARATOR = String.fromCharCode( 1 ); // '\u0001';


/**
 * Parse a field: extract the field tag number and its value;
 */
var fieldParser = through( function ( buff ) {
    if ( buff.length > 0 ) {
        var parts = buff.split( '=' );
		var data = { tag: parts[0], value: parts[1] };
		console.log( data );
        this.queue( data );
    } else {
        this.queue( null );
    }
} );

/**
 * emit a field found event, if the field is found
 */
var fieldEmitter = function ( fieldList ) {
	var fields = fieldList.reduce( function ( prev, curr ) {
		prev[ curr ] = true;
		return prev;
	}, {} );
	return through( function ( buff ) {
		if ( fields.hasOwnProperty( buff.tag ) ) {
			this.emit( 'field-found', buff.tag, buff.value );	
		}
	} );
};

var fieldEnricher = function ( dictionary ) {
	var msgTypeFound = false;
	var tmp = [];
	return through( function ( data ) {
		var field = dictionary.findField( data.tag );
		
		if ( !field ) {
			this.emit( 'field-not-found', data.tag );
			return;
		}
		
		data.name = field.name;
		
		var use = dictionary.header[ field.name ];
		data.isHeader = use !== undefined && use !== null;
		
		if ( data.isHeader ) {
			data.isBody = false;
			data.isTrailer = false;
		} else {
			use = dictionary.trailer[ field.name ];	
			data.isTrailer = use !== undefined && use !== null;
		}
		
		
		tmp.push( data );
		
		// messagge type
		if ( data.tag === '35' ) {
			msgTypeFound = true;
			for ( var i = 0; i < tmp.length; i++ ) {
				this.queue( tmp[i] );
			}
		} 
		
		this.queue( data );
			
		
		
	} );
};

/**
 * Create a Readable / Writable Stream to for FIX message: read a bulk stream message 
 * and write a JSON formatted message.
 */
function createReadStream( readable, dictionary, options ) {
	options = options || {};
	options.fieldSeparator = options.fieldSeparator || FIELD_SEPARATOR;
	options.fieldList = options.fieldList || [];
	
	if ( !dictionary ) {
		throw new Error( 'FIX dictionary not defined.' );
	}
	
	readable = readable.pipe( split( options.fieldSeparator ) ).pipe( fieldParser );
	/*
	 * add a field listener
	 */
	if ( options.fieldList.length > 0 ) {
		readable = readable.pipe( fieldEmitter( options.fieldList ) );
	}
	/*
	 * add a field enricher
	 */
	readable = readable.pipe( fieldEnricher( dictionary ) );
	
	return readable;
}

module.exports.createReadStream = createReadStream;

/*

var filename = 'samples/message1.txt';

var Dictionary = require( './Dictionary' );
var d = new Dictionary( require( '../dictionaries/fix44.json' ) );
createReadStream( fs.createReadStream( filename ), d ,{ fieldSeparator: '|' } )
.pipe( through( function ( buff ) {
	console.log( buff );
} ) )
.on( 'field-not-found', function ( tag ) {
	console.error( 'Field not found: ' + tag );
} )
;*/

