var util = require( 'util' );
var events = require( 'events' );

/**
 * Validate the field message
 */ 
function MessageBuilder( dictionary ) {
    
    var messageDefinition;
    
    var header = {};
    var body = {};
    var trailer = {};
    var self = this;

    this.on( 'final-parsing', function ( headerValid, bodyValid, trailerValid  ) {
		self.emit( 'end', {
            type: messageDefinition.type,
            category: messageDefinition.category,
            name: messageDefinition.name,
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
            header[ field.number ] = value;
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
            body[ field.number ] = value;
		}
    } );
    this.on( 'read-trailer', function ( field, value  ) {
        var use = dictionary.trailer[ field.name ];
		if ( use ) {
			trailer[ field.name ] = value;
            trailer[ field.number ] = value;
		}    
    } );
    this.on( 'message-type', function ( field, value, messageDef  ) { 
        if ( messageDef ) {
			messageDefinition = messageDef;
		}    
    } );
    
    
    
    this.on( 'group-start', function ( group, value, parent ) {

        var val = {
            enumerable: true,
            configurable: false,
            value: {
                value: value,
                elements: []
            },
            writable: false
        };
        
        var node = findParentNode( group, parent );
        
        if ( node && !node.hasOwnProperty( group.name ) ) {
            Object.defineProperty( node, group.name, val );
        }
        
        var groupFieldDef = dictionary.findFieldByName( group.name );
        if ( node && !node.hasOwnProperty( groupFieldDef.number ) ) {
            Object.defineProperty( node, groupFieldDef.number, val );
        }

       
    } );
    
    function findParentNode( group, parent ) {
         
        var p =  findRootParent( parent );
        
        if ( !p ) {
            /* FIXME parent hierachy */ 
            p = body[ parent.name ];
        } 
        
        return p;
         
    }
    
    function findRootParent( parent ) {
        if ( 'header' === parent ) {
            return header;
        } else if ( 'trailer' === parent ) {
            return trailer;
        } else if ( 'body' === parent ) {
            return body;
        } else {
            return undefined;
        }
    }
    
    this.on( 'group-field', function ( group, field, value, parent  ) {
    } );
    
    this.on( 'new-repeating-group-element', function ( group, repeatingGroupElement, parent ) {
        var node = findParentNode( group, parent );
        node[ group.name ].elements.push( repeatingGroupElement );
        
        var groupFieldDef = dictionary.findFieldByName( group.name );
        node[ groupFieldDef.number ].elements.push( repeatingGroupElement );
    } );
    
    this.on( 'group-end', function ( group, value, parent  ) { 
    } );    
    
    
    
}

util.inherits( MessageBuilder, events.EventEmitter );
module.exports = exports = MessageBuilder;                


