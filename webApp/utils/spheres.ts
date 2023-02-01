export function drawSpheres(scene, coordinatesShape, allCoordsGlobal, material) {
    let sphereHeight = 10e-9;
    for(let i = 0; i < coordinatesShape[0]; i += 10000) {          
        var sphere = BABYLON.MeshBuilder.CreateSphere('sphere'+i, {segments: 1, diameter: sphereHeight}, scene);
        sphere.material = material;
        sphere.position.x = allCoordsGlobal[i][0];
        sphere.position.y = allCoordsGlobal[i][1];
        sphere.position.z = allCoordsGlobal[i][2];
        sphere.position.y += sphereHeight/2;
    }
}