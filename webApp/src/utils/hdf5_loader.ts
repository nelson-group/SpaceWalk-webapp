/// <reference path="tsfive.d.ts"/>
import * as hdf5 from "jsfive";

export async function getHDF5File(file_url: string, filename: string) {
    let buffer = await fetch(file_url)
    .then(function(response) { 
        return response.arrayBuffer() 
    });
    return new hdf5.File(buffer, filename);
}

export function getElement(file: hdf5.File, groupPath: string, index: number) {
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

export function getKeys(file: hdf5.File, groupPath: string) {
    return file.get(groupPath).keys;
}
