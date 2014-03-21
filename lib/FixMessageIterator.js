var FIELD_DELIMITER = '|';
var VALUE_DELIMITER = '=';
    
function FixMessageIterator( message ) {
    
    message = message.toString().trim();
        
    var parts = message.split( FIELD_DELIMITER );
    var max;
    if ( FIELD_DELIMITER === message.charAt( message.length - 1 ) ) {
        max = parts.length - 1;
    } else {
        max = parts.length;
    }
    
    /**
     * index of the current field read
     */
    var index = 0;
    /**
     * tells whether the iterator has data
     */
    this.hasNext = function () {
        return index < max;  
    };
    
    /**
     * return the next data
     */ 
    this.next = function () {
        var part = parts[ index ];
        index++;
        
        if ( !part || part.trim().length === 0 ) {
            return this.next();
        }
        
        var fieldParts = part.split( VALUE_DELIMITER );
        
        if ( !fieldParts || fieldParts.length != 2 || !fieldParts[0] || !fieldParts[1]) {
            return {
                err: new Error( 'data field part not well formatted. Split with "=" length != 2 :' + part )
            };
        } else {
            return {
                number: fieldParts[0],
                value: fieldParts[1]
            };
        }
        
    };
}

module.exports = exports = FixMessageIterator;