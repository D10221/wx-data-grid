///<reference path="references.d.ts"/>
///<reference path="../typings/tsd.d.ts"/>

import {MainViewModel} from "./MainViewModel";
import {DataTable} from "./Components";
import {iHTMLTemplateElement} from "./Base";

class App {

    constructor() {
        // TODO:)
    }

    run(){
        wx.app.devModeEnable();

        wx.app.filter('string-to-date-converter', function (input:string) {
            return input;//? moment(input).toDate() : null;
        });


        var templates = (<iHTMLTemplateElement>document.getElementById('wx-data-table-templates')).import;

        var template = templates.getElementById('data-table-template-styled');

        wx.app.component('data-table', DataTable(template.innerHTML));

        wx.app.component('wx-checkbox', {
            template: templates.getElementById('wx-data-table-checkbox-template').innerHTML,
            // viewModel: (params)=> {
            //     return params;
            // }
        });

        wx.applyBindings(new MainViewModel(), document.getElementById('main-view'));
    }
}

var app = new App();
app.run();

