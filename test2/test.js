import { getKeys, getElement } from "../hdf5_loader/hdf5-loader.js";
import { drawOutline} from "../utils/outline.js";

const file_url = "../data/tng/subhalos/70/442304/cutout_70_442304_70.hdf5";
const filename = "XYZ"
const partType = "PartType0"

// Get the canvas DOM element
var canvas = document.getElementById('renderCanvas');
// Load the 3D engine
var engine = new BABYLON.Engine(canvas, true, {preserveDrawingBuffer: true, stencil: true});

var allCoordsGlobal;
var allDensitiesGlobal;

var pointFunc = function(particle, i, s) {        
      particle.position = new BABYLON.Vector3(allCoordsGlobal[i][0],allCoordsGlobal[i][1],allCoordsGlobal[i][2]);
    // particle.position = new BABYLON.Vector3(particle.groupId * 0.5 + 0.25 * Math.random(), i / 5000, 0.25 * Math.random()); 
    particle.color = new BABYLON.Color4(allDensitiesGlobal[i], allDensitiesGlobal[i], allDensitiesGlobal[i], allDensitiesGlobal[i]);
  }

// CreateScene function that creates and return the scene
var createScene = async function(){
    //params:
    var usePCS = true;

    // Create a basic BJS Scene object
    var scene = new BABYLON.Scene(engine);


    // Create a FreeCamera, and set its position to {x: 0, y: 5, z: -10}

    // Create a basic light, aiming 0, 1, 0 - meaning, to the sky
    //var light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 1, 0), scene);
    scene.createDefaultLight(true);
    scene.createDefaultEnvironment();
    
    // Create a built-in "sphere" shape using the SphereBuilder
    var sphereHeight = 1 * (10 ^ -9);
    const myMaterial = new BABYLON.StandardMaterial("myMaterial", scene);
    myMaterial.wireframe = true;
    var allCoords;

    let buffer = await fetch(file_url)
    .then(function(response) { 
        return response.arrayBuffer() 
    });
    
    var coordinatesPath = partType+"/Coordinates";    
    let f = new hdf5.File(buffer, filename);

    allCoords = structuredClone(f.get(coordinatesPath).value)
    let shape = f.get(coordinatesPath).shape;
    console.log(shape[0]);
    allCoordsGlobal = math.reshape(allCoords, shape);
    console.log(allCoordsGlobal);

    var densityPath = partType+"/Density";
    allDensitiesGlobal = structuredClone(f.get(densityPath).value)
    console.log(allDensitiesGlobal);
    var maxDensity = math.max(allDensitiesGlobal);
    console.log(maxDensity);
    allDensitiesGlobal = math.divide(allDensitiesGlobal, maxDensity);
    console.log(allDensitiesGlobal[0]);
    if(!usePCS)
    {
        for(let i = 0; i < shape[0]; i += 10000) {
            let coords = getElement(f, partType+"/"+getKeys(f, partType)[0], i);            
            var sphere = BABYLON.MeshBuilder.CreateSphere('sphere'+i, {segments: 1, diameter: sphereHeight}, scene);
            sphere.material = myMaterial;
            sphere.position.x = coords[0];
            sphere.position.y = coords[1];
            sphere.position.z = coords[2];
            // Move the sphere upward 1/2 of its height
            sphere.position.y += sphereHeight;
            // console.log(coords);
        }
    }
    else{
        console.log("use pcs")
        var pcs= new BABYLON.PointsCloudSystem("pcs", 2, scene) 
        pcs.addPoints(shape[0], pointFunc);
        pcs.buildMeshAsync();
    }

    drawOutline(allCoordsGlobal, scene, myMaterial);

    // var camera = new BABYLON.UniversalCamera('camera1', new BABYLON.Vector3(math.mean(allCoords, 0)), scene);    

    var cameraPosition = new BABYLON.Vector3(allCoordsGlobal[1][0], allCoordsGlobal[1][1], allCoordsGlobal[1][2]);
    var camera = new BABYLON.ArcRotateCamera("Camera",  -Math.PI / 2, Math.PI / 1.65, 1, cameraPosition , scene);

    // var camera = new BABYLON.ArcRotateCamera("Camera", -Math.PI / 2, Math.PI / 3, 8, new BABYLON.Vector3(0, 0, 0), scene);
    
    // Target the camera to scene origin    
    camera.setTarget(new BABYLON.Vector3(allCoordsGlobal[0][0], allCoordsGlobal[0][1], allCoordsGlobal[0][2]));
    // Attach the camera to the canvas
    camera.attachControl(canvas, true);


    // Return the created scene
    return scene;
}

// call the createScene function
var scene = await createScene();
// run the render loop
engine.runRenderLoop(function(){
    scene.render();
});
// the canvas/window resize event handler
window.addEventListener('resize', function(){
    engine.resize();
});