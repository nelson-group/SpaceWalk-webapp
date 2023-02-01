// Import for functionality
var hd = require("jsfive");
// Import for type hints
import { hdf5 } from "./mod";
import { reshape} from "mathjs";

export class Hdf5File {
    private file: any;

    constructor() {}

    async open(fileUrl: string, filename: string) {
        this.file = await this.getHDF5File(fileUrl, filename);
    }
    
    private async getHDF5File(file_url: string, filename: string) {
        let buffer = await fetch(file_url)
        .then(function(response) { 
            return response.arrayBuffer() 
        });
        return new hd.File(buffer, filename);
    }

    getElements(partTypePath: string): Array<any> {
        var allElements = structuredClone(this.file.get(partTypePath).value);
        var allElementsShape = this.getElementsShape(partTypePath);
        return reshape(allElements, allElementsShape);
    }

    getElementsShape(partTypePath: string): Array<number> {
        return this.file.get(partTypePath).shape;
    }
    
    getElementWithoutReshape(file: hdf5.File, groupPath: string, index: number) {
        let shape = file.get(groupPath).shape;
        if(shape.length != 2) {
            alert("Shape is strange: " + shape + "\nShould be of type [x, y]");
            return null;
        }
        if(index < 0 || index > shape[0]) {
            alert("Index out of bounds: [0, " + shape[0]+ "]");
            return null;
        }
        let offset = shape[1];
        return file.get(groupPath).value.slice(index * offset, index * offset + offset);
    }
    
    getKeys(file: hdf5.File, groupPath: string) {
        return file.get(groupPath).keys;
    }
}