import {KeyVaue} from "./Base";

export default class ViewModelBase implements Rx.IDisposable {

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

}