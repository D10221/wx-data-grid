import {KeyVaue} from "./Base";
import {IHaveEvents} from "./definitions";

export default class ViewModelBase implements Rx.IDisposable , IHaveEvents {
    
    private _disposables = new Rx.CompositeDisposable();

    protected toBeDispose:(...d: Rx.IDisposable[] )=>void  = (d:Rx.IDisposable) => {
        this._disposables.add(d);
    };

    dispose: ()=> void = ()=> {
        this._disposables.dispose();
    };

    events = wx.property<KeyVaue>();

    /***
     * if action provided returns  Idisposable, if No Action provided returns Observable<KeyValue>
     * @param params
     * @returns {any}
     */
    when( key: string):  Rx.Observable<KeyVaue> ;
    when( key: string, action? : (kv: KeyVaue)=> void  ):  Rx.IDisposable ;
    when( key: string, action? : (kv: KeyVaue)=> void  ):  any {
        if(!action) {
            return this.events.changed.where(e=> e.key == key);
        }
        return this.events.changed.where(e=> e.key == key).subscribe(action);

    }
    addTwoWaySubscribtion<T>(left: wx.IObservableProperty<T>, right: wx.IObservableProperty<T>, vm?: ViewModelBase): void {
        
        (vm|| this).toBeDispose(this.twoWaySubscribtion(left,right))
    }
    
    twoWaySubscribtion<T>(left: wx.IObservableProperty<T>, right: wx.IObservableProperty<T>): Rx.IDisposable {
        
        var disposables = new Rx.CompositeDisposable();
        
        disposables.add(
            left.changed.where(value=> value != right()).subscribe( value=> right(value))
        );
        
        disposables.add(
            right.changed.where( value=> value!= left()).subscribe(value=> left(value))
        );
        return disposables;
    }

}