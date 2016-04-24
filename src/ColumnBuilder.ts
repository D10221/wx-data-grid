///<reference path="definitions.ts"/>

import Column from "./Column";

import {ColumnMap} from "./definitions";

var _ = require("lodash") as _.LoDashStatic;

interface ColumnSetup {
    key: string;
    map: ColumnMap;
    configure: (column:Column)=> Column;
    template: string
}

export class ColumnBuilder {
    
    private _columns: Column[]= [];

    get columns() :Column[] {
        return this._columns;
    }

    constructor( target= {}, 
                 private columnMaps: ColumnMap[],
                 private configurations : Map<string, (column: Column)=> Column >,
                 private templates: Map<string,string> ){
        
        if(!target) return ; 

        this.configurations = this.configurations || new Map<string, (column: Column)=> Column >();
        
        this.templates = this.templates || new Map<string,string> ();
        
        var keys: string[] = [];
        for(var propertyName in target){
            if(target.hasOwnProperty(propertyName)){
                keys.push(propertyName);
            }
        }
        for(var col of columnMaps){
            if( col.isUnbound){
                keys.push(col.key);
            }
        }
        
        var setups = keys.map((key: string) : ColumnSetup => {
            return {
                key: key,
                map:  _.find(columnMaps, map=> map.key == key),
                configure: configurations[key],
                template: templates[key],
            }
        });
        
        var i = 0;
        for (var info of setups){

            var map = info.map;
            var template = info.template;
            var configure = info.configure;
            
            var converter = map && map.converter ? wx.app.filter(map.converter) : null;
            
            var column = new Column(info.key);
            
            column.index = map && map.columnIndex? map.columnIndex : i ;
            
            column.header =  map && map.displayName ? map.displayName : info.key ;
            
            column.canSort( ! (map && map.canSort == false));
            
            //Explicitly disabled or true 
            column.canFilter = !(map && map.canFilter == false);
            
            column.isUnbound = map && map.isUnbound == true;
            column.template = template;
            column.converter = converter ;
            column.inputType = map ? map.inputType : null ;
            
            /***
             * browsable default : true, explicitly disabled
              * @type {boolean}
             */
            column.browsable = ! (map && map.browsable == false);

            column = configure ?  configure(column) : column;
            
            if(column.isUnbound || column.browsable)
            {
                this._columns.push(column);
                i++;
            }
            
        }
        this._columns = _.orderBy(this.columns, c=>c.index, "asc");
    }


}