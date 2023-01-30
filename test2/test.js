import { getKeys, getElement } from "../hdf5_loader/hdf5-loader.js";
import { drawOutline} from "../utils/outline.js";

const file_url = "../data/tng/subhalos/70/442304/cutout_70_442304_70.hdf5";
const filename = "XYZ"
const partType = "PartType0"

// Get the canvas DOM element
var canvas = document.getElementById('renderCanvas');
// Load the 3D engine
var engine = new BABYLON.Engine(canvas, true, {preserveDrawingBuffer: true, stencil: true});
// CreateScene function that creates and return the scene
var createScene = async function(){
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
    
    var groupPath = partType+"/Coordinates";
    let f = new hdf5.File(buffer, filename);
    allCoords = structuredClone(f.get(groupPath).value)
    let shape = f.get(groupPath).shape;
    console.log(shape[0]);
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


    allCoords = math.reshape(allCoords, shape);

    // var minCoords = math.min(allCoords, 0);
    // var maxCoords = math.max(allCoords, 0);

    // console.log([ minCoords, maxCoords]);

    // var boxSize = math.subtract(maxCoords, minCoords);
    // console.log([ boxSize]);

    // var centerOfBox = math.subtract(maxCoords, math.divide(boxSize, 2));
    // console.log([ centerOfBox]);

    // var box = BABYLON.MeshBuilder.CreateBox("box", {width: boxSize[0], height: boxSize[1] , depth:boxSize[2]}, scene);
    // box.material = myMaterial;  
    // box.position.x = centerOfBox[0];
    // box.position.y = centerOfBox[1];
    // box.position.z = centerOfBox[2];

    drawOutline(allCoords, scene, myMaterial);

    // var camera = new BABYLON.UniversalCamera('camera1', new BABYLON.Vector3(math.mean(allCoords, 0)), scene);
    // var camera = new BABYLON.UniversalCamera('camera1', new BABYLON.Vector3(allCoords[1]), scene);
    var test = new BABYLON.Vector3(allCoords[1][0], allCoords[1][1], allCoords[1][2]);
    var camera = new BABYLON.ArcRotateCamera("Camera",  -Math.PI / 2, Math.PI / 1.65, 1, test , scene);
    // Target the camera to scene origin
    // camera.setTarget(new BABYLON.Vector3(allCoords[0][0], allCoords[0][1], allCoords[0][2]));
    camera.setTarget(new BABYLON.Vector3(allCoords[0][0], allCoords[0][1], allCoords[0][2]));
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