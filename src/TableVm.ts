///<reference path="references.d.ts"/>

import {KeyVaue} from './Base';
import Column from './Column';
import {Row} from './Row';
import {Cell} from './Cell';
import {TableContext, Table, TableOptions, ColumnMap} from "./definitions";
import ViewModelBase from "./ViewModelBase";
import {ColumnBuilder} from "./ColumnBuilder";
import {RowFactory, CellFactory} from "./RowBuilder";

export class TableVm extends ViewModelBase implements Table  {

    options: TableOptions = {
        showRowSelector : true
    };
    
    rows = wx.list<Row>();

    columns = wx.list<Column>();

    private rowSelectionChanged(){
        this.events({key: 'rowSelectionChanged', value: this.rows.filter(row=> row.isSelected())})
    }

    constructor(private context:TableContext) {
        
        super();
         
        if(!context) return;
        if(context.hook){
            context.hook(this);
        }

        if(!this.HasItems(context)) return ;

        // TODO: ColumnDefinitions  
        this.inBuiltComlumnMaps.push( {
            key: 'isSelected',
            displayName: '*',
            canSort: false,
            canFilter: false,
            isUnbound: true,
            columnIndex: -1 ,
            browsable: true
        });

        this.columnConfigurations['isSelected'] = (column)=> {

            this.addSubscription(
                column.value.changed,
                checked => this.selectAllRows(<boolean>checked),
                this);

            column.value(false);

            return column;
        };

        this.columnTemplates['isSelected'] = "column-header-checkbox";

        var columnMaps = _.map(context.dataSource.columnMaps, x=> _.clone(x));
        
        this.build(columnMaps, context.dataSource.items);

    }
    
    HasItems : (context: TableContext) => boolean = (context ) =>{
        return context && context.dataSource && this.Any(context.dataSource.items)
    };
    
    Any : (items:any[]) => boolean = (items)=>{
        return items  && items.length > 0  ; 
    };
    
    selectAllRows : (checked: boolean) => void = (checked) => {
        this.rows.forEach((value, index, array) => {
            value.isSelected(!value.isSelected());
        })
    };
    
    private filterBy: (kv:KeyVaue)=> void = (kv)=>{
        for (var row of this.rows.toArray()) {
            row.setVisble(kv);
        }
    };

    private sortBy(key:string, mode:string) {

        if (mode == "asc") {

            var find = function (row:Row):any {
                return row.findCellValueByKey(key);
            };

            var r = _.sortBy(this.rows.toArray(), find);

            this.rows.clear();

            this.rows.addRange(_.reverse(r));

            return;
        }

        if (mode == "desc") {

            var find = function (row:Row):any {
                return row.findCellValueByKey(key);
            };

            var r = _.sortBy(this.rows.toArray(), find);

            this.rows.clear();

            this.rows.addRange(r);

            return;
        }
        throw 'unkown sort method';
    }

    columnConfigurations  = new Map<string, (column: Column)=> Column >();
    columnTemplates = new Map<string,string> ();
    inBuiltComlumnMaps : ColumnMap[] = [] ;

    build:(columnMaps: ColumnMap[], items: {}[]) =>void= (columnMaps,items)=> {

        columnMaps = columnMaps || [] ;
        for ( var cMap of this.inBuiltComlumnMaps) {
            columnMaps.push(cMap);
        }   
        
        var first = items[0];
        
        var builder = new ColumnBuilder(first, columnMaps,this.columnConfigurations,this.columnTemplates);

        var columns = builder.columns ;
        if(!columns) {
            return; 
        }
         
        for (var column of columns){
            
            if(column.canSort){
                this.addSubscription(
                    column.orderChanged, x=> this.sortBy(x.key, x.value)
                );
            }
            if(column.canFilter){
                this.addSubscription(
                    column.filterTxtChanged, this.filterBy
                );
            }
            
        }
        
        // Before Add cell 
        var beforeAdd = (row) => {
            this.addSubscription(
                row.isSelected.changed,
                ()=> this.rowSelectionChanged(),
                this);
            return row;
        };
        
        var cellFactories = new Map<string, CellFactory>();
        
        cellFactories["isSelected"] = (row, column, value )=> {
            
            var cell = new Cell(column.kill, false);
            cell.isDirtyCheckEnable = false;
            this.addTwoWaySubscribtion(
                cell.value,
                row.isSelected,
                this
            );
            return cell;
        };
        
        var rowFactory = new RowFactory(columns , beforeAdd, cellFactories);

        this.columns.clear();
        for(var column of columns){
            this.columns.add(column);
        }
        this.rows.addRange(rowFactory.getRows(items));
    };
    
    view: HTMLElement;

    /***
     * wx: searchs for properties:
     *  (e:HTMLElement)=> void
     * @param e
     */
    preBindingInit: any = (e:HTMLElement)=> {
        this.view = e;
        this.events( { key: 'preBindingInit', value: e});
    };

    /***
     * wx: searchs for properties:
     *  (e:HTMLElement)=> void
     * @param e
     */
    postBindingInit: any = (e:HTMLElement)=> {
        this.view = e;
        this.events( { key: 'postBindingInit', value: e});
    };

}
