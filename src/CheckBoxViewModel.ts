
import ViewModelBase from "./ViewModelBase";


export interface ChekBoxContext {
    value: wx.IObservableProperty<boolean> ;
}

export class CheckBoxViewModel extends ViewModelBase{

    value= wx.property(false);

    command =  wx.command( () => {
        this.value(!this.value());
        this.context.value(this.value());
    });

    constructor(private context: ChekBoxContext) {
        super();
        this.value = context.value;
    }

}

export interface ChekBoxKeyContext {

    context: {};
    
    /***
     * Where key: prop name for wx.IObservableProperty<boolean>
     */
    key: string;
}

export class CheckBoxViewModelByKey extends ViewModelBase{

    value= wx.property(false);

    command =  wx.command( () => {
        this.value(!this.value());
        //this.params.context[this.params.key] = this.value(); 
    });

    constructor(private params: ChekBoxKeyContext) {
        super();
        
        this.addTwoWaySubscribtion(
            this.value,
            <wx.IObservableProperty<boolean>>(params.context[params.key]), 
            this);
        
    }

}