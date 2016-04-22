
import {KeyVaue,Guid} from "./Base";
import ViewModelBase from "./ViewModelBase";

export default class Column extends ViewModelBase {

    constructor(public key:string, public header?:any) {
        
        super();
        
        this.header = header || key;
        
        this.toBeDispose(this.order);
    }

    index = 1 ;

    id = Guid.newGuid();

    /***
     * wx.Component.name to bind this column Too 
     */
    template: string ;
    
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

    /***
     * Hold arbitrary value
     */
    value:wx.IObservableProperty<any> = wx.property(false);

    /***
     * easy booelan toggle without binding to checked in input checkbox 
     * @type {ICommand<any>}
     */
    toggleValue = wx.command(()=> this.value(!this.value()));
    
   
}
