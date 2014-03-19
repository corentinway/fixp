function Dictionary( description ) {
    
    this.description = description;
    this.fields = description.fix.fields;
    this.header = description.fix.header;
    this.trailer = description.fix.trailer;
    this.messages = description.fix.messages;
    
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
 * Find a field
 */
Dictionary.prototype.findField = function ( number ) {
    return this.description.fix.fields[ number.toString() ];
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
