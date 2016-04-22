export default class ViewModelBase implements Rx.IDisposable {

    private _disposables = new Rx.CompositeDisposable();

    protected toBeDispose:(d: Rx.IDisposable )=>void  = (d:Rx.IDisposable) => {
        this._disposables.add(d);
    };

    dispose: ()=> void = ()=> {
        this._disposables.dispose();
    };

}