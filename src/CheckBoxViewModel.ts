
import ViewModelBase from "./ViewModelBase";
interface Toggleable {
    value: wx.IObservableProperty<boolean> ;
    toggleValue : wx.ICommand<any>;
}

class CheckBoxViewModel extends ViewModelBase{

    value= wx.property(false);

    command =  wx.command( () => {
        this.value(!this.value());
        this.context.value(this.value());
    });

    constructor(private context: Toggleable) {
        super();

        this.value(context.value());

        this.toBeDispose(
            context.value.changed.where(x=> context.value()!= this.value()).subscribe(()=>{

                console.log(`CheckBoxViewModel: context.value.changed ${context.value.changed}`);

                this.value(context.value());
            })
        );

        this.toBeDispose(
            (<ViewModelBase>(<any>context)).events.changed.subscribe( e=> {
                console.log(`ChekBoxViewModel: context-event: { key: ${e.key}, value: ${e.value} }`);
            })
        );

    }

}