
import {KeyVaue, InputTypes} from './Base';
import Column from './Column';
import {Row} from './Row';
import {Cell} from './Cell';
import {TableContext, Table} from "./definitions";
import ViewModelBase from "./ViewModelBase";

export class TableVm extends ViewModelBase implements Table  {

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

        var columnMaps = dataSource().columnMaps;

        items.listChanged.subscribe(()=> {

            this.columns.clear();

            var first = items.toArray()[0];
            { // extra column
                var column = new Column('isSelected','\u273D');
                column.canSort(false);
                column.canFilter = false;
                column.isUnbound = true;
                this.columns.push(column);
            }

            // GenerateColumns from 1st item
            // has to go ...
            // not reliable
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

                this.columns.push(column);
            }

            //Rows : is Cell[]
            var columns = this.columns.toArray();
            this.rows.addRange(items.map(x=> {

                var row = new Row();

                var selector = new Cell('isSelected', false);
                selector.isDirtyCheckEnable = false;
                selector.value.changed.subscribe((x)=> {
                    row.isSelected(x == 'true' || x == true);
                });

                row.cells.push(selector);
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

    events = wx.property<KeyVaue>();

    view: HTMLElement;

    /***
     * wx: searchs for properties:
     *  (e:HTMLElement)=> void
     * @param e
     */
    preBindingInit: any = (e:HTMLElement)=> {
        this.events( { key: 'preBindingInit', value: e});
        this.view = e;
    }

    /***
     * wx: searchs for properties:
     *  (e:HTMLElement)=> void
     * @param e
     */
    postBindingInit: any = (e:HTMLElement)=> {
        this.events( { key: 'postBindingInit', value: e});
        this.view = e;
    }

    
    /***
     * if action provided returns  Idisposable, if No Action provided returns Observable<KeyValue>
     * @param params
     * @returns {any}
     */
    when( key: string):  Rx.Observable<KeyVaue> ;
    when( key: string, action? : (kv: KeyVaue)=> void  ):  Rx.IDisposable ;
    when( key: string, action? : (kv: KeyVaue)=> void  ):  any {
        if(!action) {
            return this.events.changed.where(e=> e.key == key);
        }
        return this.events.changed.where(e=> e.key == key).subscribe(action);

    }


}
