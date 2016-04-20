///<reference path="deninitions.ts"/>
///<reference path="references.d.ts"/>
///<reference path="../typings/lodash/lodash.d.ts"/>


import IObservableList = wx.IObservableList;
wx.app.devModeEnable();


interface TableVmParams {
    items: wx.IObservableList<{}>;
}

class Cell {
    
    value: wx.IObservableProperty<any>;
    
    selected = wx.property(false);
    
    toggleSelected = wx.command(()=> this.selected(!this.selected()));

    constructor(public key: string , private _value: any){
        this.value = wx.property(_value);
    }

    getInputType () :string  {
        if(_.isDate(this.value())) return "date";
        if(_.isNumber(this.value())) return "number";
        if(_.isBoolean(this.value())) return "checkbox";
        return "text";
    }
}

class Row{
    constructor( values: wx.IList<Cell>){

        this.values.push( new Cell('select',false));

        this.values.addRange(values.toArray());
    }
    
    selected = wx.property(false);

    toggleSelected = wx.command(()=> this.selected(!this.selected()));
    
    values= wx.list<Cell>();
    
    visible =  wx.property(true);
    
    findCellByKey: (key:string)=> Cell = (key) => {
        return _.find(this.values.toArray(), cell => cell.key == key );
    };

    findCellValueByKey: (key:string)=> any = (key) => {
        var cell = _.find(this.values.toArray(), cell => cell.key == key );
        return cell ? cell.value() : null ;
    };

    /***
     * Set this.visible == true cell with key value;s to string matches regex
     * @param kv
     */
    setVisble(kv:KeyVaue){
        var txt = this.findCellValueByKey(kv.key)
            .toString();
        var ok = new RegExp(kv.value).test(txt);
        this.visible(ok);
    }
}

class Column implements Rx.IDisposable{
    id = Guid.newGuid();
    constructor(public key: string, public header? :string) {
        this.header = header || key;
    }

    /***
     * 'desc' || 'asc'
     * @type {IObservableProperty<string>}
     */
    order = wx.property('desc');
    
    toggleOrder = wx.command( ()=> this.order( this.order() == 'desc' ? 'asc' : 'desc' ));

    canSort= wx.property(true);

    browsable: boolean  = true;

    get orderChanged(): Rx.Observable<KeyVaue> {
        return this
            .order
            .changed
            .where(x=> this.canSort())
            .select( () => {  return  { key: this.key, value: this.order() } } );
    }

    filterTxt  = wx.property(".");

    get filterTxtChanged() : Rx.Observable<KeyVaue> {
        return this
            .filterTxt
            .changed
            .select(x=> { return {key: this.key, value: this.filterTxt()} });
    }

    dispose(){
        this.order.dispose();

    }
}
class TableVm {

    rows = wx.list<Row>();

    columns = wx.list<Column>();

    constructor(private params:TableVmParams ) {

        params.items.listChanged.subscribe(()=> {

            this.columns.clear();

            var first = this.params.items.toArray()[0];

            { // extra column
                var column = new Column('select');
                column.canSort(false);

                column.order.changed.subscribe(x=> this.sortBy(column.header, column.order()));

                this.columns.push(column);
            }

            for( var key in first){
                var column = new Column(key);
                column
                    .orderChanged
                    .subscribe(x=> this.sortBy(x.key, x.value));
                column
                    .filterTxtChanged
                    .subscribe(x=> this.filterBy(x));

                this.columns.push( column);
            }

            //Rows : is Cell[]
            var columns = this.columns.toArray();
            this.rows.addRange(this.params.items.map(x=> {
                var values = wx.list<Cell>();
                for (var key in x){

                    var c = _.find(columns, c=> c.key == key);
                    if (!c || !c.browsable) { continue }

                    var cell = new Cell(key, x[key]);
                    values.push(cell);
                }
                return new Row(values);
            }));
        })

    }

    private filterBy(kv:KeyVaue){
        for(var row of this.rows.toArray()){
            row.setVisble(kv);
        }
    }

    private sortBy(key:string, mode: string) {

        if(mode == "asc"){

            var find = function(row:Row) : any {
                return row.findCellValueByKey(key);
            };

            var r = _.sortBy(this.rows.toArray(),find);

            this.rows.clear();

            this.rows.addRange(_.reverse(r));

            return ;
        }

        if( mode == "desc"){

            var find = function(row:Row) : any {
                return row.findCellValueByKey(key);
            };

            var r = _.sortBy(this.rows.toArray(),find);

            this.rows.clear();

            this.rows.addRange(r);

            return ;
        }
        throw "unkown sort method";
    }
}
interface KeyVaue{
    key:string;
    value:any;
}
class MainViewModel {

    brand = wx.property('tiny-x');

    items = wx.list();

    constructor() {

        fetch('../data/items.json')
            .then( r => r.json())
            .then(items =>  {
                this.items.addRange(items);
            })
            .catch(e=>{
                console.log(`Error: ${e}`);
            });
    }
}
;

wx.app.component('data-table',{
   template: { select : 'data-table-template' },
   viewModel: (params: TableVmParams)=> new TableVm(params)
});

wx.applyBindings(new MainViewModel(), document.getElementById('main-view'));
