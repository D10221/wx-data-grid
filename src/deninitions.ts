interface  iHTMLTemplateElement extends  HTMLTemplateElement {
    import: Document
}

interface TableVmParams {
    items:wx.IObservableList<{}>;
    columnMaps?:ColumnMap[];
}

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