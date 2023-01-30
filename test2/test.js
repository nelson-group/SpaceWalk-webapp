import { getKeys, getElement } from "../hdf5_loader/hdf5-loader.js";

const file_url = "../data/combined_Velocities_tng50-4-subbox2.hdf5";
const filename = "XYZ"
const partType = "PartType0"

// Get the canvas DOM element
var canvas = document.getElementById('renderCanvas');
// Load the 3D engine
var engine = new BABYLON.Engine(canvas, true, {preserveDrawingBuffer: true, stencil: true});
// CreateScene function that creates and return the scene
var createScene = function(){
    // Create a basic BJS Scene object
    var scene = new BABYLON.Scene(engine);
    // Create a FreeCamera, and set its position to {x: 0, y: 5, z: -10}
    var camera = new BABYLON.UniversalCamera('camera1', new BABYLON.Vector3(0, 5, -10), scene);
    // Target the camera to scene origin
    camera.setTarget(BABYLON.Vector3.Zero());
    // Attach the camera to the canvas
    camera.attachControl(canvas, true);
    // Create a basic light, aiming 0, 1, 0 - meaning, to the sky
    //var light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 1, 0), scene);
    scene.createDefaultLight(true);
    scene.createDefaultEnvironment();
    
    // Create a built-in "sphere" shape using the SphereBuilder
    var sphereHeight = 1;
    const myMaterial = new BABYLON.StandardMaterial("myMaterial", scene);
    myMaterial.wireframe = true;


    fetch(file_url)
    .then(function(response) { 
        return response.arrayBuffer() 
    })
    .then(function(buffer) {
        let f = new hdf5.File(buffer, filename);
        for(let i = 0; i < 10; i++) {
            let coords = getElement(f, partType+"/"+getKeys(f, partType)[0], 1);

            var sphere = BABYLON.MeshBuilder.CreateSphere('sphere'+i, {segments: 1, diameter: sphereHeight}, scene);
            sphere.material = myMaterial;
            sphere.position.x = coords[0];
            sphere.position.y = coords[1];
            sphere.position.z = coords[2];
            // Move the sphere upward 1/2 of its height
            sphere.position.y += sphereHeight;
            
        }
    });


    // Return the created scene
    return scene;
}
// call the createScene function
var scene = createScene();
// run the render loop
engine.runRenderLoop(function(){
    scene.render();
});
// the canvas/window resize event handler
window.addEventListener('resize', function(){
    engine.resize();
});