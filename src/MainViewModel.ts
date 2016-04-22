///<reference path="app.definitions.d.ts"/>

import {DataSource, TableContext, Table} from "./definitions";
import {renewSubscription } from "./Base";

export class MainViewModel {

    brand = wx.property('tiny-x');

    dataSources = wx.list<DataSource>();

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

        this.context(this);

        fetch('../data/datasource.json').then(r=>r.json()).then( (sources: DataSource[]) =>{
            for(var source of sources){
                // initialize the prop, is not there
                // datasource will provide url's for get/update/insert || get/post ? ?
                source.items = wx.list();
            }
            this.dataSources.addRange(sources);
            this.dataSource(this.dataSources.toArray()[0]);
            this.updateContext(this);
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
            this.updateContext(this);

        });

    }
    private updateContext(context:TableContext) {
        // Change Instance so wx gets notified of the change
        // doing context(this) , does not trigger change
        this.context({
            dataSource: context.dataSource,
            hook: context.hook
        });
    }
}

