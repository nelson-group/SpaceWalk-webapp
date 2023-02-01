import { getKeys, getElement, getHDF5File } from "./hdf5_loader";
import { reshape, max, divide } from "mathjs";
import { drawOutline } from "./outline";
import { drawSpheres } from "./spheres";
import { calcColor, buildGUI } from "./gui";

import { Scene, PointsCloudSystem, ArcRotateCamera, StandardMaterial, Vector3, Color4, Engine, CloudPoint } from "@babylonjs/core";
import { AdvancedDynamicTexture } from "@babylonjs/gui";

function setCamera(canvas: HTMLCanvasElement, scene: Scene, cameraPosition: Vector3, targetPosition: Vector3) {
    var camera = new ArcRotateCamera("Camera", -Math.PI / 2, Math.PI / 1.65, 1, cameraPosition, scene);
    camera.setTarget(targetPosition);
    camera.attachControl(canvas, true);
}

export async function createScene(file_url: string, filename: string, partType: string, canvas: HTMLCanvasElement, engine: Engine, usePointCloudSystem: boolean = true, displayOutline: boolean = true) {
    var scene = new Scene(engine);
    scene.createDefaultLight(true);
    const wireFrameMaterial = new StandardMaterial("wireFrameMaterial", scene);
    wireFrameMaterial.wireframe = true;

    var coordinatesPath = partType + "/Coordinates";
    var densityPath = partType + "/Density";
    var f = await getHDF5File(file_url, filename);

    var allCoords = structuredClone(f.get(coordinatesPath).value);
    var coordinatesShape = f.get(coordinatesPath).shape;
    var allCoordsGlobal = reshape(allCoords, coordinatesShape);
    var allDensitiesGlobal = structuredClone(f.get(densityPath).value);

    var maxDensity = max(allDensitiesGlobal);
    allDensitiesGlobal = divide(allDensitiesGlobal, maxDensity);

    if (!usePointCloudSystem) {
        drawSpheres(scene, coordinatesShape, allCoordsGlobal, wireFrameMaterial);
    }
    else {
        var min_color = new Color4(0, 0, 0, 0);
        var max_color = new Color4(1, 1, 1, 1);
        var positionAndColorParticles = function (particle: CloudPoint, i: number, _s: number) {
            particle.position = new Vector3(allCoordsGlobal[i][0], allCoordsGlobal[i][1], allCoordsGlobal[i][2]);
            particle.color = calcColor(max_color, min_color, allDensitiesGlobal[i]);
        }
        var pcs = new PointsCloudSystem("pcs", 2, scene);
        pcs.addPoints(coordinatesShape[0], positionAndColorParticles);
        pcs.buildMeshAsync().then((mesh) => {
            mesh.hasVertexAlpha = true;
        });

        var advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        buildGUI(advancedTexture, pcs, new Color4(0, 0, 0, 0), new Color4(1, 1, 1, 1), allDensitiesGlobal);
    }

    if (displayOutline) {
        drawOutline(allCoordsGlobal, scene, wireFrameMaterial);
    }

    setCamera(
        canvas,
        scene,
        new Vector3(allCoordsGlobal[1][0], allCoordsGlobal[1][1], allCoordsGlobal[1][2]),
        new Vector3(allCoordsGlobal[0][0], allCoordsGlobal[0][1], allCoordsGlobal[0][2])
    );

    return scene;
}
