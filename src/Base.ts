
export interface KeyVaue {
    key:string;
    value:any;
}

export interface  iHTMLTemplateElement extends  HTMLTemplateElement {
    import: Document
}


export class InputTypes  {

    static values: string [] = ['date', 'number', 'text', 'checkbox'];

    static any(inputType: string) : boolean  {
        return inputType && _.find(InputTypes.values, x=> x == inputType) ? true : false;
    }
}

export function renewSubscription(target: Rx.CompositeDisposable, ... disposables: Rx.IDisposable[] ){
    if(target){ target.dispose() ; }
    target = new Rx.CompositeDisposable();
    for( var disposable of disposables){
        target.add(disposable);
    }
}

/***
 * https://github.com/danylaporte/Rebuild-Framework/blob/master/Rebuild.TypeScript/guid.ts
 */
export class Guid {
    private id: string;
    private static emptyGuid = new Guid("00000000-0000-0000-0000-000000000000");
    constructor(id: string) {
        this.id = id.toLowerCase();
    }
    static empty() {
        return Guid.emptyGuid;
    }
    static newGuid() {
        return new Guid(
            Guid.s4() + Guid.s4() + '-' + Guid.s4() + '-' + Guid.s4() + '-' +
            Guid.s4() + '-' + Guid.s4() + Guid.s4() + Guid.s4()
        );
    }
    static regex(format?: string) {
        switch (format) {
            case 'x':
            case 'X':
                return (/\{[a-z0-9]{8}(?:-[a-z0-9]{4}){3}-[a-z0-9]{12}\}/i);

            default:
                return (/[a-z0-9]{8}(?:-[a-z0-9]{4}){3}-[a-z0-9]{12}/i);
        }
    }
    private static s4() {
        return Math
            .floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    toString(format: string) {
        switch (format) {
            case "x":
            case "X":
                return "{" + this.id + "}";

            default:
                return this.id;
        }
    }
    valueOf() {
        return this.id;
    }
}