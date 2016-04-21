///<reference path="../built/guid.d.ts"/>
///<reference path="references.d.ts"/>
///<reference path="../typings/tsd.d.ts"/>

import IObservableList = wx.IObservableList;

class Cell implements Rx.IDisposable {

    isDirty = wx.property(false) ;

    isDirtyCheckEnable = true;

    revertCmd = wx.command(()=> this.value(this._value));

    _disposables = new Rx.CompositeDisposable();

    constructor(public key:string, private _value:any) {

        this.value = wx.property(_value);

        this._disposables.add(
            this.value.changed
                .where(e => this.isDirtyCheckEnable)
                .subscribe(e=> this.isDirty(_value != e))
        );
    }

    value:wx.IObservableProperty<any>;

    selected = wx.property(false);

    toggleSelected = wx.command(()=> this.selected(!this.selected()));

    inputType: string;

    /***
     *  HTMLInputElement type
     * @returns {string}
     */
    getInputType():string {

        // Override ?
        if (InputTypes.any(this.inputType)) {
            return this.inputType;
        }

        var value = this.value();

        if ( _.isDate(value)) return "date";
        if (_.isNumber(value)) return "number";
        if (_.isBoolean(value)) return "checkbox";
        return "text";
    }


    isInputTypeOf(type:string):boolean {
        return this.getInputType() == type;
    }

    dispose(){
        this._disposables.dispose();
    }
}

class Row {

    cells = wx.list<Cell>();

    constructor(_values:Cell[] = null) {
        if (_values) {
            this.cells.addRange(_values);
        }
    }

    isSelected = wx.property(false);

    toggleSelected = wx.command(()=> this.isSelected(!this.isSelected()));

    visible = wx.property(true);

    findCellByKey:(key:string)=> Cell = (key) => {
        return _.find(this.cells.toArray(), cell => cell.key == key);
    };

    findCellValueByKey:(key:string)=> any = (key) => {
        var cell = _.find(this.cells.toArray(), cell => cell.key == key);
        return cell ? cell.value() : null;
    };

    /***
     * Set this.visible == true cell with key value;s to string matches regex
     * @param kv
     */
    setVisble(kv:KeyVaue) {
        var txt = this.findCellValueByKey(kv.key)
            .toString();
        var ok = new RegExp(kv.value).test(txt);
        this.visible(ok);
    }
}

class InputTypes  {

    static values: string [] = ['date', 'number', 'text', 'checkbox'];

    static any(inputType: string) : boolean  {
        return inputType && _.find(InputTypes.values, x=> x == inputType) ? true : false;
    }
}


class Column implements Rx.IDisposable {

    id = Guid.newGuid();

    constructor(public key:string, public header?:string) {
        this.header = header || key;
    }

    converter: wx.IExpressionFilter;

    inputType:string;
    isUnbound = false;
    /***
     * 'desc' || 'asc'
     * @type {IObservableProperty<string>}
     */
    order = wx.property('desc');

    toggleOrder = wx.command(()=> this.order(this.order() == 'desc' ? 'asc' : 'desc'));

    canSort = wx.property(true);

    browsable:boolean = true;

    get orderChanged():Rx.Observable<KeyVaue> {
        return this
            .order
            .changed
            .where(x=> this.canSort())
            .select(() => {
                return {key: this.key, value: this.order()}
            });
    }

    filterTxt = wx.property("");
    canFilter = true;

    get filterTxtChanged():Rx.Observable<KeyVaue> {
        return this
            .filterTxt
            .changed
            .select( () => {
                return {key: this.key, value: this.filterTxt()}
            });
    }

    dispose() {
        this.order.dispose();
    }
}

class TableVm implements  Rx.IDisposable {

    rows = wx.list<Row>();

    columns = wx.list<Column>();

    private rowSelectionChanged(){
        this.events({key: "rowSelectionChanged", value: this.rows.filter(row=> row.isSelected())})
    }

    constructor(private context:DataTableContext) {

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

                this._disposables.add(
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
        throw "unkown sort method";
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

    private _disposables = new Rx.CompositeDisposable();

    dispose(){
        this._disposables.dispose();
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
