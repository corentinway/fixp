/*jslint node: true, white: true, vars:true */

var through = require( 'through' );

var messageBuilder = function ( dictionary ) {
	
	"use strict";
	var messageDefinition;
	
	var message = {};
	message.header = {};
	message.body = {};
	message.trailer = {};
	
	var currentSection = [];
	
	function getRoot( data ) {
		var s;
		if ( data.isHeader ) {
			s = message.header;
		} else if ( data.isBody ) {
			s = message.body;
		} else if ( data.isTrailer ) {
			s = message.trailer;
		}
		if ( s ) {
			currentSection.push( { section: s, isHeader: data.isHeader, isBody: data.isBody, isTrailer: data.isTrailer } );
		}
		return currentSection[ currentSection.length - 1 ];
	}
	
	function getMessageSection( data ) {
		var s;
		// when no section in the stack, then we get the root one according to the data
		if ( currentSection.length === 0 ) {
			 s = getRoot( data );
		} else {
			var last = currentSection[ currentSection.length - 1 ];
			if ( ( data.isHeader && last.isHeader ) || ( data.isBody && last.isBody ) || ( data.isTrailer && last.isTrailer ) ) {
				s = last;
			} else {
				currentSection.pop();
				s = getRoot( data );
			}
			
		}
		
		return s;
	}
	
	function createGroup( field ) {
		return {
			value: field.value,
			tag: field.tag,
			type: field.type,
			elements: [],
			group:  field.group
		};
	}
	
	function addSectionGroup( section, field ) {
		currentSection.push( {
			section: section,
			isHeader: field.isHeader, isBody: field.isBody, isTrailer: field.isTrailer,
			isGroup: true,
			group: field.group
		} );
	}
	
	function setFieldValue( section, field ) {
		section[ field.name ] = section[ field.tag ] = {
			value: field.value, 
			type: field.type
		};
	}
	
	var builder = function ( field ) {
		
		if ( field.messageDefinition ) {
			messageDefinition = field.messageDefinition;
		}
		
		var messageSection = getMessageSection( field );
		if ( messageSection ) {
			var section = messageSection.section;
			
			if ( field.isGroup && !messageSection.group ) {
				section[ field.tag ] = section[ field.name ] = createGroup( field );
				addSectionGroup( section, field );
				
			} else if ( messageSection.group ) {
				var use = dictionary.findFieldInGroup( messageSection.group, field.name );
				if ( use ) {
					var elements;
					var groupName = messageSection.group.name;
					var groupSection = section[ groupName ];
					if ( !groupSection  ) {
						groupSection = messageSection.section.elements[ messageSection.section.elements.length - 1 ][ groupName ];
					}
					
					elements = groupSection.elements;
					
					if ( elements.length === 0 ) {
						elements.push( { } );
					}
					var last = elements[ elements.length - 1 ];
					var fieldAlreadyAdded = last.hasOwnProperty( field.name );
					if ( fieldAlreadyAdded ) {
						elements.push( { } );
						last = elements[ elements.length - 1 ];
					}
					if ( !field.isGroup ) {
						//last[ field.name ] = last[ field.tag ] = field.value;
						setFieldValue( last, field );
					} else {
						last[ field.name ] = last[ field.tag ] = createGroup( field );
						addSectionGroup( groupSection, field );
					}
					
				} else {
					// this field is not in the group
					
					currentSection.pop();
					
					builder( field );
				}
			} else {
				// add standard field
				//section[ field.tag ] = section[ field.name ] = field.value;
				setFieldValue( section, field );
			}
		} else {
			if ( !message.others ) {
				message.others = {};
			}
			message.others[ field.tag ] = {
				value: field.value,
				type: field.type
			};
			if ( field.error ) {
				message.others[ field.tag ].error = field.error;
			}
			if ( field.name ) {
				message.others[ field.name ] = message.others[ field.tag] ;
				if ( field.error ) {
					message.others[ field.name ].error = field.error;
				}
			}
			this.emit( 'fieldNotInMessageError', field );
		}
	};
	var publisher = function () {
		this.emit( 'message', message );
		this.queue( null );
	};
	return through( builder, publisher );
};

module.exports = messageBuilder;