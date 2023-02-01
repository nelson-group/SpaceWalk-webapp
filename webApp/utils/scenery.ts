import { getKeys, getElement, getHDF5File } from "./hdf5-loader.js";
import { reshape, max, divide } from "mathjs";
import { drawOutline } from "./outline.js";
import { drawSpheres } from "./spheres.js";
import "babylonjs";

function setCamera(canvas, scene, cameraPosition, targetPosition) {
    var camera = new BABYLON.ArcRotateCamera("Camera", -Math.PI / 2, Math.PI / 1.65, 1, cameraPosition, scene);
    camera.setTarget(targetPosition);
    camera.attachControl(canvas, true);
}

export async function createScene(file_url, filename, partType, canvas, engine, usePointCloudSystem = true, displayOutline = true) {
    var scene = new BABYLON.Scene(engine);
    scene.createDefaultLight(true);
    const wireFrameMaterial = new BABYLON.StandardMaterial("wireFrameMaterial", scene);
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
        var positionAndColorParticles = function (particle, i, s) {
            particle.position = new BABYLON.Vector3(allCoordsGlobal[i][0], allCoordsGlobal[i][1], allCoordsGlobal[i][2]);
            particle.color = new BABYLON.Color4(allDensitiesGlobal[i], allDensitiesGlobal[i], allDensitiesGlobal[i], allDensitiesGlobal[i]);
        }
        var pcs = new BABYLON.PointsCloudSystem("pcs", 2, scene);
        pcs.addPoints(coordinatesShape[0], positionAndColorParticles);
        pcs.buildMeshAsync().then((mesh) => {
            mesh.hasVertexAlpha = true;
        });
    }

    if (displayOutline) {
        drawOutline(allCoordsGlobal, scene, wireFrameMaterial);
    }

    setCamera(
        canvas,
        scene,
        new BABYLON.Vector3(allCoordsGlobal[1][0], allCoordsGlobal[1][1], allCoordsGlobal[1][2]),
        new BABYLON.Vector3(allCoordsGlobal[0][0], allCoordsGlobal[0][1], allCoordsGlobal[0][2])
    );

    return scene;
}