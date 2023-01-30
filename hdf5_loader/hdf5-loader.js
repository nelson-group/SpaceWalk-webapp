const file_url = "../data/combined_Velocities_tng50-4-subbox2.hdf5"
const filename = "XYZ"
const partType = "PartType0"

fetch(file_url)
.then(function(response) { 
    return response.arrayBuffer() 
})
.then(function(buffer) {
    let f = new hdf5.File(buffer, filename);
    console.log(getElement(f, partType+"/"+getKeys(f, partType)[0], 1));
});

export function getElement(file, groupPath, index) {
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

export function getKeys(file, groupPath) {
    return file.get(groupPath).keys;
}
