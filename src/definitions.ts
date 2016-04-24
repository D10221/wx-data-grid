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
export interface TableOptions{
    /***
     * Show inbuilt Column, for Is row Selected
     */
    showRowSelector: boolean
}
export interface Table extends IHaveEvents, Rx.IDisposable {

    view:HTMLElement;
    options: TableOptions ;
}

export interface TableContext {

    dataSource : DataSource;
    /***
     * Gets Call when TableVm initialize from Parameters
     * there we can subscribe to events?/opbservables
     * rowSelectionChanged, ColumnChanged, etc..
     * TODO: TableVm should be an interface
     * @param receiver
     */
    hook?:(me: Table)=>void;
}

export interface ColumnMap {
    
    key:string,
    displayName?:string;
    inputType?:string;
    converter?: string,
    isUnbound?: boolean,
    canSort?: boolean,
    canFilter?: boolean,
    /***
     * Desired : not granted
     */
    columnIndex?: number
    /***
     * Set to false to hide 
     */
    browsable?:Boolean;

}

export interface DataSourceDescription {
    //required
    key:string ;

    urls : {
        //required
        getter: string
    }

    columnMaps?:ColumnMap[]; 
}

export interface DataSource extends DataSourceDescription {
    items?: {}[];
}