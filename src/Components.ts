
import {TableVm} from "./TableVm";
import {TableContext} from "./definitions";
import IComponentDescriptor = wx.IComponentDescriptor;
import IComponentTemplateDescriptor = wx.IComponentTemplateDescriptor;

/***
 * DataTable : Factory
 * @param template
 * @returns {{template: (string|Node[]|IComponentTemplateDescriptor|(function(any=): (string|Node[]|Rx.Observable<Node[]>))), viewModel: (function(DataTableContext): TableVm), preBindingInit: string, postBindingInit: string}}
 * @constructor
 */
export function  DataTable(template: string|Node[]|IComponentTemplateDescriptor|((params?: any)=> string|Node[]|Rx.Observable<Node[]>)): IComponentDescriptor {
    return {
        template: template,
        viewModel: (params:TableContext)=> new TableVm(params),
        preBindingInit : 'preBindingInit' ,
        postBindingInit : 'postBindingInit'
    }
}