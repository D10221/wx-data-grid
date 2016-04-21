///<reference path="deninitions.ts"/>
///<reference path="references.d.ts"/>
///<reference path="../typings/tsd.d.ts"/>

class MainViewModel {

    brand = wx.property('tiny-x');

    items = wx.list();

    columnMaps: ColumnMap[] = [{
        key: 'created',
        displayName: 'Created',
        inputType: 'date',
        converter: 'string-to-date-converter'
    },{
        key: 'modified',
        displayName: 'Modified',
        inputType: 'date',
        converter: 'string-to-date-converter'
    }];

    constructor() {

        fetch('../data/materials.json')
            .then(r => r.json())
            .then(items => {
                this.items.addRange(items);
            })
            .catch(e=> {
                console.log(`Error: ${e}`);
            });
    }
}

wx.app.devModeEnable();

wx.app.filter('string-to-date-converter', function(input: string) {
    return input ;//? moment(input).toDate() : null;
});


var templates = (<iHTMLTemplateElement>document.getElementById('wx-data-table-templates')).import;

var template = templates.getElementById('data-table-template');

wx.app.component('data-table', {
    template: template.innerHTML,
    viewModel: (params:TableVmParams)=> new TableVm(params)
});

wx.applyBindings(new MainViewModel(), document.getElementById('main-view'));
