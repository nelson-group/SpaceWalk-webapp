import {min, max, divide, subtract} from "mathjs";

import { Scene, StandardMaterial, MeshBuilder, Color3 } from "@babylonjs/core";

export function drawOutline(allCoords: Array<Array<number>>, scene: Scene, log: boolean = false) {
    var minCoords = min(allCoords, 0);
    var maxCoords = max(allCoords, 0);

    var boxSize = subtract(maxCoords, minCoords);

    var centerOfBox = subtract(maxCoords, divide(boxSize, 2));

    // @ts-ignore
    var width:number = boxSize[0];
    // @ts-ignore
    var height:number = boxSize[1];
    // @ts-ignore
    var depth:number = boxSize[2];

    var box = MeshBuilder.CreateBox(
        "outline",
        { width: width, height: height, depth: depth },
        scene
    );

    var boxMaterial = new StandardMaterial("", scene);
    boxMaterial.wireframe = true;
    boxMaterial.disableLighting = true;
    boxMaterial.emissiveColor = Color3.Black().scale(0.5);
    box.material = boxMaterial;

    // @ts-ignore
    box.position.x = centerOfBox[0];
    // @ts-ignore
    box.position.y = centerOfBox[1];
    // @ts-ignore
    box.position.z = centerOfBox[2];

    if (log) {
        console.log([minCoords, maxCoords]);
        console.log([boxSize]);
        console.log([centerOfBox]);
    }
}
