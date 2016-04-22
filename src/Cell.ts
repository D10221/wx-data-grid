///<reference path="references.d.ts"/>


import IObservableList = wx.IObservableList;

import {InputTypes, Guid} from "./Base";

export class Cell implements Rx.IDisposable {

    id =  Guid.newGuid();

    isDirty = wx.property(false) ;

    isDirtyCheckEnable = true;

    revertCmd = wx.command(()=> this.value(this._value));

    _disposables = new Rx.CompositeDisposable();

    constructor(public key:string, private _value:any) {

        this.value = wx.property(_value);

        this._disposables.add(
            this.value.changed
                .where(e => this.isDirtyCheckEnable)
                .subscribe(e=> this.isDirty(_value != e))
        );
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

    dispose(){
        this._disposables.dispose();
    }
}
