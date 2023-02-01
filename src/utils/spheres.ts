import { MeshBuilder, Scene, StandardMaterial } from "@babylonjs/core";

export function drawSpheres(
    scene: Scene,
    coordinatesShape: Array<number>,
    allCoordsGlobal: Array<Array<number>>,
    material: StandardMaterial
) {
    let sphereHeight = 10e-9;
    for(let i = 0; i < coordinatesShape[0]; i += 10000) {          
        var sphere = MeshBuilder.CreateSphere('sphere'+i, {segments: 1, diameter: sphereHeight}, scene);
        sphere.material = material;
        sphere.position.x = allCoordsGlobal[i][0];
        sphere.position.y = allCoordsGlobal[i][1];
        sphere.position.z = allCoordsGlobal[i][2];
        sphere.position.y += sphereHeight/2;
    }
}
