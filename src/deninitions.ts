interface  iHTMLTemplateElement extends  HTMLTemplateElement {
    import: Document
}

interface DataTableContext {

    dataSource : wx.IObservableProperty<DataSource>;
    /***
     * Gets Call when TableVm initialize from Parameters
     * there we can subscribe to events?/opbservables
     * rowSelectionChanged, ColumnChanged, etc..
     * TODO: TableVm should be an interface
     * @param receiver
     */
    hook(me: TableVm);
}

// interface TableVmParams {
//     // items:wx.IObservableList<{}>;
//     // columnMaps?:ColumnMap[];
//     context: DataContext ;
// }

interface ColumnMap {
    key:string,
    displayName?:string;
    inputType?:string;
    converter?: string
}

interface KeyVaue {
    key:string;
    value:any;
}

interface DataSource {
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