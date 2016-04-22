
import {KeyVaue} from "./Base";
import {Cell} from './Cell'


export class Row {

    cells = wx.list<Cell>();

    constructor(_values:Cell[] = null) {
        if (_values) {
            this.cells.addRange(_values);
        }
    }

    isSelected = wx.property(false);

    toggleSelected = wx.command(()=> this.isSelected(!this.isSelected()));

    visible = wx.property(true);

    findCellByKey:(key:string)=> Cell = (key) => {
        return _.find(this.cells.toArray(), cell => cell.key == key);
    };

    findCellValueByKey:(key:string)=> any = (key) => {
        var cell = _.find(this.cells.toArray(), cell => cell.key == key);
        return cell ? cell.value() : null;
    };

    /***
     * Set this.visible == true cell with key value;s to string matches regex
     * @param kv
     */
    setVisble(kv:KeyVaue) {
        var txt = this.findCellValueByKey(kv.key)
            .toString();
        var ok = new RegExp(kv.value).test(txt);
        this.visible(ok);
    }
}


