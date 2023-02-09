import { Hdf5File } from "./hdf5_loader";
import { reshape, min, max, divide, MathType, subtract } from "mathjs";
import { drawOutline } from "./outline";
import { drawSpheres } from "./spheres";
import { calcColor, buildGUI, ColorConfig } from "./gui";
import { VectorFieldVisualizer } from "./arrow";

import { MeshBuilder, StorageBuffer, Scene, PointsCloudSystem, ArcRotateCamera, StandardMaterial, Vector3, Color3, Color4, Engine, CloudPoint, Texture, Vector2, Material, ShaderMaterial } from "@babylonjs/core";
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

    var hdf5File = new Hdf5File();
    await hdf5File.open(file_url, filename);

    var allCoordsGlobal = hdf5File.getElements(coordinatesPath);
    var coordinatesShape = hdf5File.getElementsShape(coordinatesPath);
    var allDensitiesGlobal = hdf5File.getElements(densityPath) as Array<number>;

    var maxDensity = max(allDensitiesGlobal) as number;
    allDensitiesGlobal = divide(allDensitiesGlobal, maxDensity) as Array<number>;

    if (!usePointCloudSystem) {
        drawSpheres(scene, coordinatesShape, allCoordsGlobal, wireFrameMaterial);
    }
    else {
        var colorConfig = {
            "min_color": new Color4(0, 0, 0, 0),
            "max_color": new Color4(1, 1, 1, 1),
            "min_density": min(allDensitiesGlobal),
            "max_density": max(allDensitiesGlobal),
            "automatic_opacity": false,
        };
        var positionAndColorParticles = function (particle: CloudPoint, i: number, _s: number) {
            particle.position = new Vector3(allCoordsGlobal[i][0], allCoordsGlobal[i][1], allCoordsGlobal[i][2]);
            // particle.color = calcColor(colorConfig, allDensitiesGlobal[i]);
            // particle.uv = new Vector2(64,64);            
        }                

        var pcs = new PointsCloudSystem("pcs", 0.002, scene); //size has no effect when using own shader. Maybe overwritten by shader? Ja, ist so.
        pcs.addPoints(coordinatesShape[0], positionAndColorParticles);                
        var pcsMesh = await pcs.buildMeshAsync();
        pcsMesh.hasVertexAlpha = true;                                        
        var useOwnShader = true;
        if (useOwnShader) {
            pcsMesh.visibility = 1;
            // pcsMesh.setVerticesData("densities", allDensitiesGlobal, false, 1);        
            var shaderMaterial = new ShaderMaterial("shader", scene, "./scatteredDataWithSize",{                                    
            attributes: ["position", "uv"],
            uniforms: ["worldViewProjection"]                
            });                    
            shaderMaterial.backFaceCulling = false;            
            shaderMaterial.pointsCloud = true;
            pcsMesh.material = shaderMaterial;
            pcsMesh.showBoundingBox = true;            
        }
        var advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        buildGUI(advancedTexture, pcs, colorConfig, allDensitiesGlobal);
    }

    const arrow = new VectorFieldVisualizer(scene);
    arrow.createArrow();

    // if (displayOutline) {
    //     // drawOutline(allCoordsGlobal, scene);
    // }

    setCamera(
        canvas,
        scene,
        new Vector3(allCoordsGlobal[1][0], allCoordsGlobal[1][1], allCoordsGlobal[1][2]),
        new Vector3(allCoordsGlobal[0][0], allCoordsGlobal[0][1], allCoordsGlobal[0][2])
    );

    return scene;
}

////////////// working shader example ////////////////////////////////
// var shaderMaterial = new ShaderMaterial("shader", scene, "./scatteredDataWithSize",{                                    
//     attributes: ["position", "uv","densities"],
//     uniforms: ["worldViewProjection"]                
// });                    
// shaderMaterial.backFaceCulling = false;
// var mainTexture = new Texture("data/textures/Dot.png", scene);

// shaderMaterial.setTexture("textureSampler", mainTexture);

// var minCoords = min(allCoordsGlobal, 0);
// var maxCoords = max(allCoordsGlobal, 0);

// var boxSize = subtract(maxCoords, minCoords);

// var centerOfBox = subtract(maxCoords, divide(boxSize, 2));

// var box = MeshBuilder.CreateBox(
// "shader",
// { width: boxSize[0], height: boxSize[1], depth: boxSize[2] },
// scene
// );            
// box.material = shaderMaterial;    
// box.position.x = centerOfBox[0];
// box.position.y = centerOfBox[1];
// box.position.z = centerOfBox[2];