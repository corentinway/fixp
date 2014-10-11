/* jslint node:true */
var through = require( 'through' );

var f = function ( d ) {
	if ( d.toString().indexOf( 'foo') >= 0 ) {
		this.emit( 'foo', 'FOO' );
	}
	
};

process.stdin.pipe( through( f ) ).on( 'foo', console.log );