var util = require( 'util' );
var events = require( 'events' );
var _ = require( 'underscore' );

/**
 * Validate the field message
 */ 
function Validator( dictionary ) {
    
    var position = 0;
    var errors = [];
    var messageDefinition;
    
    var groupCounters = {};
    var self = this;

    this.on( 'final-parsing', function ( headerValid, bodyValid, trailerValid  ) {
        if ( !headerValid ) {
			errors.push( new Error( "header not valid" ) );
		} else if ( !bodyValid ) {
			errors.push( new Error( "body not valid" ) );
		} else if ( !trailerValid ) {
			errors.push( new Error( "trailer not valid" ) );
		}

		// re initialization
		position = 0;
		groupCounters = {};    
		
		self.emit( 'end', errors );
    } );
    
    /**
     * check body length and field value enumeration
     */
    this.on( 'read-field', function ( field, value  ) { 
        position++;
        // check the 2nd field is always 'BodyLength' (=9)
		if ( field.number === 9 ) {
			if ( position != 2 ) {
				errors.push( new Error( "The bodyLength (9) field is not the the 2nd position. It was found at " + position ) );
			}
		}
		// validate field value
		var predicate = _.matches( { enum: value } );
		if ( _.filter( field.values, predicate).length > 0 ) {
			errors.push( new Error( "This field has not the expected value " + JSON.stringify( field ) + " " + value  ) );
		}
    } );
    
    /**
     *  check that the field is in the header
     */
    this.on( 'read-header', function ( field, value  ) { 
        var use = dictionary.header[ field.name ];
        if ( !use ) {
            errors.push( new Error( "This field is not defined in the header " + JSON.stringify( field ) + " " + value  ) );
        }
        use = dictionary.trailer[ field.name ];
        if ( use ) {
			errors.push( new Error( "This field is not defined in the header BUT in the trailer " + JSON.stringify( field ) + " " + value  ) );
		}
    } );
    /**
     * check that field is defined in the body
     */
    this.on( 'read-body', function ( field, value  ) { 
        var use = dictionary.header[ field.name ];
		if ( use ) {
			errors.push( new Error( "This field is found in the body BUT defined in the header "  + JSON.stringify( field ) + " " + value  ) );
		}
		use = dictionary.findFieldInMessage( messageDefinition, field.name );
		if ( !use ) {
			use = dictionary.trailer[ field.name ];
			if ( !use ) {
				errors.push( new Error(  "This field is not expected to be in this message "  + JSON.stringify( field ) + " " + value  ) );
			}
		}
    } );
    this.on( 'read-trailer', function ( field, value  ) {
        var use = dictionary.trailer[ field.name ];
		if ( !use ) {
			errors.push( new Error( "This field is not defined in the trailer " + JSON.stringify( field ) + " " + value  ) );
		}    
    } );
    this.on( 'message-type', function ( field, value, messageDef  ) { 
        if ( !messageDef ) {
			errors.push( new Error("Message definition not found "  + JSON.stringify( field ) + " " + value  ) );
		} else {
			messageDefinition = messageDef;
		}    
    } );
    /**
     * count field repetition
     */ 
    this.on( 'group-field', function ( group, field, value  ) {
        var counters = getGroupCounter( group.name );
        var use = dictionary.findFieldInGroup( group, field.name );
        if ( use && use.required ) {
            if ( counters.hasOwnProperty(field.number) ) {
                counters[ field.number ] = counters[ field.number ] + 1;
            } else {
                counters[ field.number ] = 1;
            }
        }
    } );
    this.on( 'group-end', function ( group, value  ) { 
        var counters = getGroupCounter( group.name );  
        /*
		 * we must find, at least 'expectedRepetition' repetition of a same
		 * field
		 */
		var expectedRepetition = value;
		var repeatingFound = false;
		for ( var fixNumber in counters ) {
            if ( counters.hasOwnProperty( fixNumber ) ) {
                var count = counters[ fixNumber ];
                if ( count === expectedRepetition ) {
                    repeatingFound = true;
                    break;
                }
            }
        }
        if ( !repeatingFound ) {
            errors.push( new Error( "This group is not repeated as expected "  + JSON.stringify( group ) + " " + value  ) );
        }
    } );    
    
    this.on( 'fieldNotFoundError', errors.push );
    
    /**
     * get the counter bind to a group name
     */
    function getGroupCounter( groupName ) {
        var counters; // map int -> int
        if ( !groupCounters.hasOwnProperty( groupName ) ) {
            counters = {};
            groupCounters[ groupName ] = counters;
        } else {
            counters = groupCounters[ groupName ];
        }
        
        return counters;
    }
}

util.inherits( Validator, events.EventEmitter );
module.exports = exports = Validator;                


