# NOT FOR PRODUCTION...

[![Build Status](https://travis-ci.org/corentinway/fixp.png?branch=master)](https://travis-ci.org/corentinway/fixp)

# FIX Protocol

A reader, writer, client and server around [FIX Protocol](http://www.fixtradingcommunity.org/).

## Dictionaries

Dictionaries describe how to define a message. They are mandatory to read a message.

Dictionaries are JSON formatted. You can have load the dictionaries as follow

```javascript
var dictionary = require( 'path_to_my_dictionaries_version44' );
```

To adapt the dictionay to your client need, copy and paste one dictionary and change it to adapt it to your clients needs:

* add fields
* add components
* change 'require' flag on a field

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


# TODO

Here a list of todos

* Test
* * add test to stream multiple FIX messages in the same readable stream
* * add test (Node.js and test with QuickFixJ)
* change the reader to inherit from the Node.js Stream interface
* create the writer
* create a client and a server
* add condition on fileds in the message: a field is required if another field has the value 'foo'.

# References

* http://www.fixtradingcommunity.org/pg/structure/tech-specs/encodings-for-fix