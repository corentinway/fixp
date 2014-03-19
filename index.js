var Reader = require( './lib/Reader' );
var Dictionary = require( './lib/Dictionary' );

var dictionaryPath = './dictionaries/fix44';
console.log( 'Loading dictionaries:' + dictionaryPath );
var fix44 = require( './dictionaries/fix44' );
console.log( 'Dictionary loaded');

var options = {
   dictionary: new Dictionary( fix44 )
};

var reader = new Reader( options );

reader.read( __dirname + '/samples/message1.txt' );
