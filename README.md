# NOT FOR PRODUCTION...

# FIX Protocol

A reader, writer, client and server around [FIX Protocol](http://www.fixtradingcommunity.org/).

## Dictionaries

Dictionaries describe how to define a message. They are mandatory to read a message.

Dictionaries are JSON formatted. You can have load the dictionaries as follow

```javascript
var dictionary = require( 'path_to_my_dictionaries_version44' );
```

To adapt the dictionay to your client need, copy and past one dictionaries and change it to adapt it to you clients need:

* add fields
* add components

## Reader

Almost done. I need to do MANY MORE TEST.

Here is an example;

```javascript
var fs = require( 'fs');

var fixp = require( 'fixp' );

console.log( 'dirname: ' + __dirname );

// get the readable stream
var readable = fs.createReadStream( __dirname + '/../samples/message1.txt');
// get your dictionary
var dictionary = __dirname + '/../dictionaries/fix44.json';
// perform validation of the message (use event emitter)
var options = {
    validation: true
};
// read the message
fixp.readFix( readable, dictionary, options )
// validation callback
.on( 'validation-end', function ( valid , errors ) { 
    console.log( 'validator errors ? ' + valid );
} ) 
// errors handlers while reading the stream
.on( 'errors', function ( err ) {
    console.error( 'Errors:' );
    console.error( err );
} )
// handler once the reader has finished to read ALL the message content
.on( 'message', function ( message ) { 
    console.log( 'Message parsed:' );
    console.log( message );
} )
;
```


