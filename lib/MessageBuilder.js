var util = require( 'util' );
var events = require( 'events' );
var _ = require( 'underscore' );

/**
 * Validate the field message
 */ 
function Validator( dictionary ) {
    
    var messageDefinition;
    
    var header = {};
    var body = {};
    var trailer = {};
    var self = this;
    
    var stack = [];

    this.on( 'final-parsing', function ( headerValid, bodyValid, trailerValid  ) {
		self.emit( 'end', {
            header: header,
            body: body,
            trailer: trailer,
		} );
    } );
    
    /**
     * check body length and field value enumeration
     */
    this.on( 'read-field', function ( field, value  ) { 
        
    } );
    
    /**
     *  check that the field is in the header
     */
    this.on( 'read-header', function ( field, value  ) { 
        var use = dictionary.header[ field.name ];
        if ( use ) {
            header[ field.name ] = value;
        }
    } );
    /**
     * check that field is defined in the body
     */
    this.on( 'read-body', function ( field, value  ) { 
        if ( dictionary.isGroup( field ) ) {
            return;    
        }
		var use = dictionary.findFieldInMessage( messageDefinition, field.name );
		if ( use ) {
			body[ field.name ] = value;
		}
    } );
    this.on( 'read-trailer', function ( field, value  ) {
        var use = dictionary.trailer[ field.name ];
		if ( use ) {
			trailer[ field.name ] = value;
		}    
    } );
    this.on( 'message-type', function ( field, value, messageDef  ) { 
        if ( messageDef ) {
			messageDefinition = messageDef;
		}    
    } );
    
    
    
    this.on( 'group-start', function ( group, value, parent ) {
       var groupObj = {
            value: value,
            elements: []
        };
        
        var node = findParentNode( group, parent );
        //node[ group.name ] = groupObj;
        
        if ( !node.hasOwnProperty( group.name ) ) {
            Object.defineProperty( node, group.name, {
                enumerable: true,
                configurable: false,
                value: groupObj,
                writable: false
            } );
        }

       
    } );
    
     function findParentNode( group, parent ) {
        if ( parent === 'body' ) {
            return body;
        } else if ( typeof parent === 'object' ) {
            // FIXME parent hierachy
            return body[ parent.name ];
            
        } else {
            return undefined;   
        }
    }
    
    this.on( 'group-field', function ( group, field, value, parent  ) {
    } );
    
    this.on( 'new-repeating-group-element', function ( group, repeatingGroupElement, parent ) {
        var node = findParentNode( group, parent );
        node[ group.name ].elements.push( repeatingGroupElement );
    } );
    
    this.on( 'group-end', function ( group, value, parent  ) { 
    } );    
    
    //this.on( 'fieldNotFoundError', errors.push );
    
    
}

util.inherits( Validator, events.EventEmitter );
module.exports = exports = Validator;                


