/* global describe, it */
var chai = require( 'chai' );
var assert = chai.assert;
"use strict";

var lib = process.env.LIB_COV ? '../lib-cov/' : '../lib/';
var FieldEmitter = require( lib + 'FieldEmitter' );

describe( 'FieldEmitter', function () {
    
    describe( 'Constructor', function () {
        it( 'should be instantiated correctly with NO argument', function () {
            // call
            var emitter = new FieldEmitter();
            // assertions
            assertDefinedNotNull( emitter, 'Emitter ');
        } );
        it( 'should be instantiated correctly with EMPTY aray argument', function () {
            // input
            var fields = [];
            // call
            var emitter = new FieldEmitter( fields );
            // assertions
            assertDefinedNotNull( emitter, 'Emitter ');
        } );
        it( 'should be instantiated correctly with OBJECT argument', function () {
            // input
            var fields = {};
            // call
            var emitter = new FieldEmitter( fields );
            // assertions
            assertDefinedNotNull( emitter, 'Emitter ');
        } );
        it( 'should be instantiated correctly with NON EMPTY Array', function () {
            // input
            var fields = [ 1, 2, 3, 'zdj' ];
            // call
            var emitter = new FieldEmitter( fields );
            // assertions
            assertDefinedNotNull( emitter, 'Emitter ');
        } );
        it( 'should be instantiated correctly with array of element other than number or string', function () {
            // input
            var fields = [ 1, 2, 3, 'zdj', true, {}, [] ];
            // call
            var emitter = new FieldEmitter( fields );
            // assertions
            assertDefinedNotNull( emitter, 'Emitter ');
        } );
    } );
    
    describe( 'on "read-field"', function () {
        it( 'should emit an event if the field is found (number wanted)', function ( done ) {
            // input
            var field = { number: 4, name: 'foo' };
            var val = '254';
            // prepare-call
            var fields = [ 4 ];
            var emitter = new FieldEmitter( fields );
            // assertions
            emitter.on( 'field-found', function ( key, name,  number, value) {
                assert.equal( key, 4, 'event key');
                assert.equal( name, field.name, 'field name' );
                assert.equal( number, field.number, 'field number' );
                assert.equal( value, val, 'field value' );
                done();
            } );
            // call
            emitter.emit( 'read-field', field, val );
        } );
        it( 'should emit an event if the field is found (name wanted)', function ( done ) {
            // input
            var field = { number: 4, name: 'foo' };
            var val = '254';
            // prepare-call
            var fields = [ 'foo' ];
            var emitter = new FieldEmitter( fields );
            // assertions
            emitter.on( 'field-found', function ( key, name,  number, value) {
                assert.equal( key, 'foo', 'event key');
                assert.equal( name, field.name, 'field name' );
                assert.equal( number, field.number, 'field number' );
                assert.equal( value, val, 'field value' );
                done();
            } );
            // call
            emitter.emit( 'read-field', field, val );
        } );
        it( 'should NOT emit an event if the field is NOT found (name wanted)', function ( done ) {
            // input
            var field = { number: 4, name: 'foo' };
            var val = '254';
            // prepare-call
            // field to find: wont be emitted
            var fields = [ 'azerty' ];
            var emitter = new FieldEmitter( fields );
            // assertions
            var emitted = false;
            emitter.on( 'field-found', function ( key, name,  number, value) {
                emitted = true;
            } );
            // call
            emitter.emit( 'read-field', field, val );
            // after 1.3 seconds, we check no event was received : 'emiited' still equals to false
            setTimeout( function () {
                assert.isFalse( emitted );
                done();
            } , 1300 );
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