function Dictionary( description ) {
    
    this.description = description;
    this.fields = description.fix.fields;
    this.header = description.fix.header;
    this.trailer = description.fix.trailer;
    this.messages = description.fix.messages;
    this.components = description.fix.components;
    
    /*
     * map fields by name
     */
    this.fieldsByName = {};
    for( var n in this.fields ) {
        if ( this.fields.hasOwnProperty( n ) ) {
            var field = this.fields[ n ];
            this.fieldsByName[ field.name ] = field;
        }
    }
    
    /*
     * message by type. type ==> message name
     */
    this.messageByType = {};
    for( var messageKey in this.messages ) {
        if ( this.messages.hasOwnProperty( messageKey ) ) {
            var m = this.messages[ messageKey ];
            this.messageByType[ m.type ] = m.name;
        }
    }
    
    /**
     * count the required field 
     */ 
    var countRequired = function ( uses ) {
        var required = 0;
        for( var k in uses ) {
            if ( uses.hasOwnProperty( k ) ) {
                var use = uses[k];
                if ( use.required ) {
                    required++;
                }
                if ( use.list ) {
                    required += countRequired( use.list );
                }
            }
        }
        return required;
    };
    this.requiredHeaderField = countRequired( this.header );
    this.requiredTrailerField = countRequired( this.trailer );
    
}

module.exports = exports = Dictionary;

/**
 * Find a field with its field number
 */
Dictionary.prototype.findField = function ( number ) {
    return this.fields[ number ];
};
/**
 * Find a field with its field name
 */
Dictionary.prototype.findFieldByName = function ( name ) {
    return this.fieldsByName[ name ];
};

/**
 * find the message according to the message type
 * @param type {String} message type
 */
Dictionary.prototype.findMessageByType = function ( type ) {
    var messageName = this.messageByType[ type ];
    return this.description.fix.messages[ messageName ];
};


Dictionary.prototype.isGroup = function ( field ) {
    return 'NUMINGROUP' === field.type;
};

Dictionary.prototype.findFieldInGroup = function ( group, fieldName ) {
    for( var k in group.list ) {
        if (group.list.hasOwnProperty( k ) && k === fieldName ) {
            return group.list[ k ];
        }
    }
    return null;
};

/**
 * search recursively
 */
var search = function ( fields, fieldName, components ) {
    var use;
    /*
     * find in the fields of the 1st level
     */
    if ( fields && fields.hasOwnProperty( fieldName ) ) {
        return fields[ fieldName ];
    } 
    /*
     * search in group or component
     */
     else {
         for( var k in fields ) {
             if ( fields.hasOwnProperty( k )  ) {
                 var inFields;
                 // group
                 if ( 'group' === fields[k].type ) {
                     inFields = fields[k].fields;
                 }
                 // component
                 else if ( 'component' === fields[k].type ) {
                     if ( components.hasOwnProperty( k ) ) {
                         inFields = components[k].fields;
                     }
                 } 
                 if ( inFields && ( use = search( inFields, fieldName, components ) ) ) {
                     return use;
                 }
                 
             }
         }
     }
     return null;
};
Dictionary.prototype.findFieldInGroup = function ( group, fieldName ) {
    return search( group.fields, fieldName, this.components );
};
Dictionary.prototype.findFieldInMessage = function ( messageDefinition, fieldName ) {
    return search( messageDefinition.fields, fieldName, this.components );
};