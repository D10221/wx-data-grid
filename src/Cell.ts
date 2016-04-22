///<reference path="references.d.ts"/>

import IObservableList = wx.IObservableList;

import {InputTypes, Guid} from "./Base";

import ViewModelBase from "./ViewModelBase";

export class Cell extends ViewModelBase {

    id =  Guid.newGuid();

    isDirty = wx.property(false) ;

    isDirtyCheckEnable = true;

    revertCmd = wx.command(()=> this.value(this._value));
    
    constructor(public key:string, private _value:any) {
        
        super();
        
        this.value = wx.property(_value);
        
        this.toBeDispose(
            this.value.changed
                .where(e => this.isDirtyCheckEnable)
                .subscribe(e=> this.isDirty(_value != e))
        );
        this.toBeDispose( 
            this.value.changed
                .subscribe(()=>
                    this.events( {key: key, value: this.value() })
        ));
    }

    value:wx.IObservableProperty<any>;
    
    /***
     * easy booelan toggle 
     * @type {ICommand<any>}
     */
    toggleValue = wx.command(()=> this.value(!this.value()));

    selected = wx.property(false);

    toggleSelected = wx.command(()=> this.selected(!this.selected()));

    inputType: string;

    /***
     *  HTMLInputElement type
     * @returns {string}
     */
    getInputType():string {

        // Override ?
        if (InputTypes.any(this.inputType)) {
            return this.inputType;
        }

        var value = this.value();

        if ( _.isDate(value)) return "date";
        if (_.isNumber(value)) return "number";
        if (_.isBoolean(value)) return "checkbox";
        return "text";
    }
    
    isInputTypeOf(type:string):boolean {
        return this.getInputType() == type;
    }

   
}
