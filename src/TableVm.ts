
import {KeyVaue, InputTypes} from './Base';
import Column from './Column';
import {Row} from './Row';
import {Cell} from './Cell';
import {TableContext, Table, TableOptions} from "./definitions";
import ViewModelBase from "./ViewModelBase";

export class TableVm extends ViewModelBase implements Table  {

    options: TableOptions = {
        showRowSelector : true
    }
    
    rows = wx.list<Row>();

    columns = wx.list<Column>();

    private rowSelectionChanged(){
        this.events({key: 'rowSelectionChanged', value: this.rows.filter(row=> row.isSelected())})
    }

    constructor(private context:TableContext) {
        
        super();
        
        if(!context) return;
        context.hook(this);

        var dataSource = context.dataSource;
        if(!dataSource) return;

        var items = dataSource().items;
        if(!items ) return;


        items.listChanged.subscribe(()=> {

            var columnMaps = _.filter(dataSource().columnMaps, m=> !m.isUnbound);
            var unBoundColumnMaps = _.filter(dataSource().columnMaps, m=> m.isUnbound);

            var columns:Column[] = [];

            for (var ucolumn of unBoundColumnMaps){
                var column = new Column(ucolumn.key,ucolumn.displayName);
                column.index = ucolumn.columnIndex || 0 ;
                column.canSort(ucolumn.canSort == true);
                column.canFilter = ucolumn.canFilter == true;
                column.isUnbound = true;
                columns.push(column);
            }
            
            if( this.options.showRowSelector) { // inbuilt column
                var column = new Column('isSelected','\u273D');
                column.canSort(false);
                column.canFilter = false;
                column.isUnbound = true;
                column.index = 0 ;
                column.template = 'column-header-checkbox';
                column.value(false);
                this.toBeDispose(
                    column.value.changed.subscribe(checked=> 
                        this.selectAllRows(checked))
                );
                columns.push(column);
            }

            // GenerateColumns from 1st item
            // has to go ...
            // not reliable
            var first = items.toArray()[0];
            if(!first) return; 
            for (var key in first) {
                var column = new Column(key);
                if(columnMaps ){
                    var map = _.find(columnMaps, m=> m.key == key);
                    if(map){
                        column.header = map.displayName;
                        column.inputType = map.inputType;
                        if(map.converter){
                            column.converter = wx.app.filter(map.converter);
                        }
                    }
                }
                column
                    .orderChanged
                    .subscribe(x=> this.sortBy(x.key, x.value));
                column
                    .filterTxtChanged
                    .subscribe(x=> this.filterBy(x));

                columns.push(column);
            }

            columns = _.orderBy(columns, x => x.index);

            this.columns.clear();
            this.columns.addRange(columns);
            //Rows : is Cell[]

            this.rows.addRange(items.map(x=> {

                var row = new Row();

                //TODO:
                // for(var ucolumn of unBoundColumnMaps){
                //     row.cells.push( new UnboundCell );
                // }
                
                if( this.options.showRowSelector) { // inbuilt cells 
                    var selector = new Cell('isSelected', false);
                    selector.isDirtyCheckEnable = false;

                    this.addTwoWaySubscribtion(
                        selector.value,
                        row.isSelected,
                        this
                    );
                    row.cells.push(selector);
                }
                
                
                for (var key in x) {
                    // ** filter out c ell by column
                    var c = _.find(columns, c=> c.key == key);
                    if (!c || !c.browsable) {
                        continue
                    }
                    //** new cell
                    var value = c.converter ? c.converter(x[key]) : x[key] ;
                    var cell = new Cell(key, value);

                    // Override:  by settings , config ... etc
                    if (InputTypes.any(c.inputType)) {
                        cell.inputType = c.inputType;
                    }
                    // if(c.isUnbound){
                    //     cell.isDirtyCheckEnable = false;
                    // }

                    row.cells.push(cell);
                }

                this.toBeDispose(
                    row.isSelected.changed.subscribe(()=> this.rowSelectionChanged())
                );

                return row;
            }));
        })

    }

    selectAllRows : (checked: boolean) => void = (checked) => {
        this.rows.forEach((value, index, array) => {
            value.isSelected(!value.isSelected());
        })
    };
    
    private filterBy(kv:KeyVaue) {
        for (var row of this.rows.toArray()) {
            row.setVisble(kv);
        }
    }

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
    
    view: HTMLElement;

    /***
     * wx: searchs for properties:
     *  (e:HTMLElement)=> void
     * @param e
     */
    preBindingInit: any = (e:HTMLElement)=> {
        this.view = e;
        this.events( { key: 'preBindingInit', value: e});
    }

    /***
     * wx: searchs for properties:
     *  (e:HTMLElement)=> void
     * @param e
     */
    postBindingInit: any = (e:HTMLElement)=> {
        this.view = e;
        this.events( { key: 'postBindingInit', value: e});
    }

}
