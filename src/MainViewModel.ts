///<reference path="app.definitions.d.ts"/>

import {DataSource, TableContext, Table, DataSourceDescription} from "./definitions";
import {renewSubscription } from "./Base";
import ViewModelBase from "./ViewModelBase";

export class MainViewModel extends ViewModelBase {

    brand = wx.property('tiny-x');

    dataSources = wx.list<DataSourceDescription>();

    dataSourceDescription = wx.property<DataSourceDescription>();

    dataSource = wx.property<DataSource> ();

    context = wx.property<TableContext>();

    /***
     * When TableVm gets its context calls hook(this)
     * @param sender
     */
    hook(sender:Table){

        renewSubscription(this.hookSubscriptions,
            //* rowSelectionChanged
            sender.when("rowSelectionChanged").subscribe( kv => {
                // On Current Row Changed, selected rows  
                console.log(kv.value);
            }),
            //*
            sender.when( /*key:*/ "preBindingInit", /*action:*/  kv=> {
                // Do Something before binding
                console.log('table preBindingInit');
                //console.log(kv.value);
            })
            ,
            //*
            sender.events.changed.where(e=> e.key == "postBindingInit").subscribe( kv=> {
                // Do Something after binding
                console.log('table postBindingInit');
                //console.log(kv.value);
                componentHandler.upgradeAllRegistered();
            })
        );

        //Bad Idea , but it might be needed 
        this.tableView = sender.view;
    };

    //Bad Idea , but it might be needed
    tableView:HTMLElement;

    hookSubscriptions = new Rx.CompositeDisposable();

    constructor() {
        
        super();
        
        this.updateContext = ()=>{
            this.context({
                dataSource: this.dataSource(),
                hook: this.hook
            });
        };
        
        fetch('../data/datasource.json')
            .then(r=>r.json())
            .then( (sources: DataSourceDescription[]) => this.dataSources.addRange(sources));

        this.dataSources.listChanged.where(x => x !=null ).take(1).subscribe ( () => {
            var source = this.dataSources.toArray()[0];
            if(source){
                this.dataSourceDescription(source);
            }
        });
        
        this.dataSource.changed.subscribe(()=> {
            this.updateContext();
        })
    }
    
    loadDataSource: ()=> void = () => {
        var description = this.dataSourceDescription();
        if(description){
            this.loadDataSourceDescription(description)
        }
    };
    
    loadDataSourceDescription: (description :DataSourceDescription)=> void = (description) => {
        this.toDataSource(description).then(dataSource=> this.dataSource(dataSource));
    };
    
    toDataSource: (description: DataSourceDescription) => Promise<DataSource> = (description)=> {
        return fetch(description.urls.getter).then(r=>r.json()).then(items => {
            return {
                key: description.key,
                urls: description.urls,
                columnMaps: description.columnMaps,
                items: items
            }
        });
    };
    
    loadCmd = wx.command(()=> this.loadDataSource());
    
    private updateContext : () => void ;
}

