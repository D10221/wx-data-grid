///<reference path="deninitions.ts"/>
///<reference path="references.d.ts"/>
///<reference path="../typings/tsd.d.ts"/>

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

class MainViewModel {

    brand = wx.property('tiny-x');

    //items = wx.list();

    dataSource = wx.property<DataSource>();

    dataSources = wx.list<DataSource>();

    constructor() {

        fetch('../data/datasource.json').then(r=>r.json()).then( (sources: DataSource[]) =>{
            for(var source of sources){
                // initialize the prop, is not there
                // datasource will provide url's for get/update/insert || get/post ? ?
                source.items = wx.list();
            }
            this.dataSources.addRange(sources);
        });

        var load = ()=> {
            fetch(this.dataSource().urls.getter)
                .then(r => r.json())
                .then(items => {

                    if(this.dataSource().items){
                        this.dataSource().items.clear();
                        this.dataSource().items.addRange(items);
                        return;
                    }
                    this.dataSource().items = wx.list(items);
                })
                .catch(e=> {
                    console.log(`Error: ${e}`);
                });
        };

        //load();

        this.dataSource.changed.subscribe(()=> {
            load();
        });

    }
}

wx.app.devModeEnable();

wx.app.filter('string-to-date-converter', function (input:string) {
    return input;//? moment(input).toDate() : null;
});


var templates = (<iHTMLTemplateElement>document.getElementById('wx-data-table-templates')).import;

var template = templates.getElementById('data-table-template');

wx.app.component('data-table', {
    template: template.innerHTML,
    viewModel: (params:TableVmParams)=> new TableVm(params)
});

wx.applyBindings(new MainViewModel(), document.getElementById('main-view'));
