/* global describe, it, before */
var chai = require( 'chai' );
var assert = chai.assert;
"use strict";

var lib = process.env.LIB_COV ? '../lib-cov/' : '../lib/';
var Dictionary = require( lib + 'Dictionary' );

var fix44 = require( '../dictionaries/fix44' );
/*{
    fix: {
        fields: {
            "1" : { 
				"number" : 1, 
				"name" : "Account", 
				"type" : "STRING", 
				"values" :  [ ]
			}
        },
        components: {},
        messages: {}
    }
};*/

describe( 'Dictionary', function () {
    
    var dictionary;
    
    before( function () { 
         dictionary = new Dictionary( fix44 );
    } );
    
    describe( 'Constructor' , function() {
        it( 'should fail to instantiate if dictionary parameter is not provided', function () {
            assert.throw( function () {
                new Dictionary( null );
            }  );
            assert.throw( function () {
                new Dictionary( undefined );
            } );
            assert.throw( function () {
                new Dictionary( );
            } );
        } );
        it( 'should provide and array for ALL fields', function () {
            assert.deepEqual( dictionary.fields, fix44.fix.fields );
        } );
        it( 'should provide and array for HEADER fields', function () {
            assert.deepEqual( dictionary.header, fix44.fix.header );
        } );
        it( 'should provide and array for TRAILER fields', function () {
            assert.deepEqual( dictionary.trailer, fix44.fix.trailer );
        } );
        it( 'should provide and object for all MESSAGE', function () {
            assert.deepEqual( dictionary.messages, fix44.fix.messages );
        } );
        it( 'should provide and object for all COMPONENTS', function () {
            assert.deepEqual( dictionary.components, fix44.fix.components );
        } );
        it( 'should count all required header field use', function () {
            assert.equal( dictionary.requiredHeaderField, 7, 'Invalid count of required header field' );
        } );
        it( 'should count all required header field use', function () {
            assert.equal( dictionary.requiredTrailerField, 1, 'Invalid count of required header field' );
        } );
        it( 'should map message by their type' );
    } );
    
    describe( '#findField( number ) ', function() {
        it( 'should find a field by its number it exists in the dictionary',  function() {
            // call
            var field = dictionary.findField( 1 );
            // assertions
            assert.isDefined( field );
            assert.equal( field.number, 1, 'Field number invalid' );
            assert.equal( field.name, 'Account', 'Field name invalid' );
            assert.equal( field.type, 'STRING', 'Field type invalid' );
        } );
        it( 'should NOT find a field by its number it does NOT exist in the dictionary and return undefined', function() {
            // call
            var field = dictionary.findField( 9999999 );
            // assertions
            assert.isUndefined( field );
        } );
        it( 'should return undefined if the it null or undefined is passed as a parameter', function () {
            // call
            var field = dictionary.findField( undefined );
            // assertions
            assert.isUndefined( field );
            // call
            field = dictionary.findField( null );
            // assertions
            assert.isUndefined( field );
        } );
    } );
    
  
        
    
} );


/**
 * assert 'something' is defined and is not null.
 */
function assertDefinedNotNull( something, msg) {
    assert.isDefined( something, msg + 'must be defined' );
    assert.isNotNull( something, msg + 'must not be null' );
}