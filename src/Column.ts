
import {KeyVaue,Guid} from "./Base";

export default class Column implements Rx.IDisposable {

    id = Guid.newGuid();

    constructor(public key:string, public header?:string) {
        this.header = header || key;
    }

    converter: wx.IExpressionFilter;

    inputType:string;
    isUnbound = false;
    /***
     * 'desc' || 'asc'
     * @type {IObservableProperty<string>}
     */
    order = wx.property('desc');

    toggleOrder = wx.command(()=> this.order(this.order() == 'desc' ? 'asc' : 'desc'));

    canSort = wx.property(true);
    
    isSortVisible = wx.property(false);
    
    toggleSearchVisible = wx.command(()=> this.isSortVisible(!this.isSortVisible()));
    
    browsable:boolean = true;

    get orderChanged():Rx.Observable<KeyVaue> {
        return this
            .order
            .changed
            .where(x=> this.canSort())
            .select(() => {
                return {key: this.key, value: this.order()}
            });
    }

    filterTxt = wx.property("");
    canFilter = true;

    get filterTxtChanged():Rx.Observable<KeyVaue> {
        return this
            .filterTxt
            .changed
            .select( () => {
                return {key: this.key, value: this.filterTxt()}
            });
    }

    dispose() {
        this.order.dispose();
    }
}
