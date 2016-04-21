import {KeyVaue} from "./Base";

export interface IHaveEvents {
    /***
     * if action provided returns  Idisposable, if No Action provided returns Observable<KeyValue>
     * @param params
     * @returns {any}
     */
    when( key: string):  Rx.Observable<KeyVaue> ;
    when( key: string, action? : (kv: KeyVaue)=> void  ):  Rx.IDisposable ;
    events : wx.IObservableProperty<KeyVaue>;
}

export interface Table extends IHaveEvents, Rx.IDisposable {
    view:HTMLElement;
}

export interface DataTableContext {

    dataSource : wx.IObservableProperty<DataSource>;
    /***
     * Gets Call when TableVm initialize from Parameters
     * there we can subscribe to events?/opbservables
     * rowSelectionChanged, ColumnChanged, etc..
     * TODO: TableVm should be an interface
     * @param receiver
     */
    hook(me: Table);
}

export interface ColumnMap {
    key:string,
    displayName?:string;
    inputType?:string;
    converter?: string
}


export interface DataSource {
    //required
    key:string ;

    urls : {
        //required
        getter: string
    }

    columnMaps?:ColumnMap[];
    /***
     * Has to be populated here,
     */
    items?:wx.IObservableList<{}>;
}