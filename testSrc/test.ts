///<reference path="./test.d.ts"/>

import { assert } from 'chai';
import {ColumnBuilder} from '../src/ColumnBuilder'
import Column from "../src/Column";
import {ColumnMap} from '../src/definitions'


describe('mocha testing setup', ()=>{
   it("itWorks", ()=>{
       assert.isOk(true);
   }) ;
});

class BaseClass {
    xName: string;
}
class Derived extends  BaseClass{

}
class Other extends  BaseClass {
    
}

describe('type cheking', ()=>{
    
    it('works', () => {
        var derived = new Derived();
        derived.xName = 'x';
        assert.ok(derived  instanceof Object);
        assert.ok(derived  instanceof BaseClass);
        assert.ok(derived  instanceof Derived);
        assert.isFalse(derived instanceof Other)
    });
});


describe("ColumnBuilder", ()=>{
    it("doesn't complain for missing things ", ()=>{
        
        var target= {};
        
        var columnMaps: ColumnMap[] = [];
        
        var configurations = new Map<string, (column: Column)=> Column > ();
        
        var templates = new Map<string,string> ();

        var builder = new ColumnBuilder(target,columnMaps, configurations, templates);

        assert.equal(0, builder.columns.length);
    });

    it("finds a prop", ()=>{

        var target= { x: 1 };

        var columnMaps: ColumnMap[] = [];

        var configurations = new Map<string, (column: Column)=> Column > ();

        var templates = new Map<string,string> ();

        var builder = new ColumnBuilder(target,columnMaps, configurations, templates);

        assert.equal(1, builder.columns.length);
        assert.equal(1, builder.columns[0].value());
    });
});