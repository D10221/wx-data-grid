import {Row} from "./Row";
import {Cell} from "./Cell";
import {InputTypes, KeyVaue} from "./Base";
import Column from "./Column";


export interface CellFactory {
    (row:Row, column: Column, value: any ): Cell;
}

export class RowFactory {
    
    constructor(private columns: Column[],
                private beforeAdd: (x:Row)=> Row ,
                private cellFactories: Map<string, CellFactory > ){
        
    }
    
    getRows(items:{}[]) :Row[] {         
        return items
            .map(this.create)
            .map(row => {
                if(!this.beforeAdd) return row;
                return this.beforeAdd(row);
            });
    }
    
    defaultCellFty : (row:Row, column: Column, value: any ) => Cell = (row, column, value )=> {
        
        var cell = new Cell(column.key, value);

        // Override:  by settings , config ... etc
        if (InputTypes.any( column.inputType) ) {
            cell.inputType = column.inputType;
        }
        
        cell.columnIndex = column.index;
        
        return cell;
    } ;
    
    private create: (x:{})=> Row  = x => {
        
        var row = new Row();
        
        for (var column of this.columns ){
            
            if (!column || !column.browsable) {
                continue
            }
            
            var fty = this.cellFactories[ column.key];
            
            var value = column.isUnbound ? null :  x[column.key];

            var cell:Cell;

            try {
                cell = fty 
                    ? fty(row, column, value) 
                    : this.defaultCellFty(row, column, value);
            } catch (e) {
                console.log(`RowBuilder: CellFty : Error: ${e}`);
                //push empty cell ? 
                continue 
            }
            
            row.cells.push(cell); 
        }
        
        return row;

    }
} 