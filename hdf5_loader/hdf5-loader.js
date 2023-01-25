//import * as hdf5 from 'jsfive';
import h5wasm from "https://cdn.jsdelivr.net/npm/h5wasm@0.4.9/dist/esm/hdf5_hl.js";

const file_url = "data/combined_Velocities_tng50-4-subbox2.hdf5"
const filename = "XYZ"
const partType = "PartType0"

/*const Module = await h5wasm.ready;
const { FS } = Module;
let response = await fetch(file_url);
let ab = await response.arrayBuffer();
FS.writeFile(filename, new Uint8Array(ab));
let f = new h5wasm.File(filename, "r");*/



fetch(file_url)
.then(function(response) { 
    return response.arrayBuffer() 
})
.then(function(buffer) {
    let f = new hdf5.File(buffer, filename);
    console.log(getElement(f, partType+"/"+getKeys(f, partType)[0], 1));
    // do something with f;
    // let g = f.get('group');
    // let d = f.get('group/dataset');
    // let v = d.value;
    // let a = d.attrs;
});

function getElement(file, groupPath, index) {
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

function getKeys(file, groupPath) {
    return file.get(groupPath).keys;
}