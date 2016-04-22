///<reference path="references.d.ts"/>
///<reference path="../typings/tsd.d.ts"/>

import {MainViewModel} from "./MainViewModel";
import {DataTable} from "./Components";
import {iHTMLTemplateElement} from "./Base";
import {CheckBoxViewModel, CheckBoxViewModelByKey, ChekBoxContext, ChekBoxKeyContext} from './CheckBoxViewModel'

class App {

    constructor() {
        // TODO:)
    }

    run(){
        wx.app.devModeEnable();

        wx.app.filter('string-to-date-converter', function (input:string) {
            return input;//? moment(input).toDate() : null;
        });
                 
        
        wx.app.filter('toggleCheckFilter', (input:boolean) => input == true ? 'check' : 'crop_square' ) ;
        
        var templates = (<iHTMLTemplateElement>document.getElementById('wx-data-table-templates')).import;

        var template = templates.getElementById('data-table-template-styled');

        wx.app.component('data-table', DataTable(template.innerHTML));
        
        wx.app.component('column-header', {
           template: templates.getElementById('column-header-template').innerHTML,
        });
        wx.app.component('column-header-checkbox', {
           template: templates.getElementById('column-header-checkbox-template').innerHTML,
        });
        
        wx.app.component('wx-checkbox', {
            template: templates.getElementById('wx-checkbox-template').innerHTML,
            // using the vm the templates dont need to know command key, can use 'command'
            viewModel: (params: ChekBoxContext)=> new CheckBoxViewModel(params)
        });

        wx.app.component('wx-checkbox-by-key', {
            template: templates.getElementById('wx-checkbox-template').innerHTML,
            // using the vm the templates dont need to know command key, can use 'command'
            viewModel: (params: ChekBoxKeyContext)=> new CheckBoxViewModelByKey(params)
        });

        wx.applyBindings(new MainViewModel(), document.getElementById('main-view'));
    }
}


var app = new App();
app.run();

