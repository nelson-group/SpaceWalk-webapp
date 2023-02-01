import {min, max, divide, subtract} from "mathjs";

import { Scene, StandardMaterial, MeshBuilder } from "@babylonjs/core";

export function drawOutline(allCoords: Array<Array<number>>, scene: Scene, myMaterial: StandardMaterial, log: boolean = false) {
    var minCoords = min(allCoords, 0);
    var maxCoords = max(allCoords, 0);

    var boxSize = subtract(maxCoords, minCoords);

    var centerOfBox = subtract(maxCoords, divide(boxSize, 2));

    var box = MeshBuilder.CreateBox(
        "outline",
        { width: boxSize[0], height: boxSize[1], depth: boxSize[2] },
        scene
    );
    box.material = myMaterial;
    box.position.x = centerOfBox[0];
    box.position.y = centerOfBox[1];
    box.position.z = centerOfBox[2];
    if (log) {
        console.log([minCoords, maxCoords]);
        console.log([boxSize]);
        console.log([centerOfBox]);
    }
}
