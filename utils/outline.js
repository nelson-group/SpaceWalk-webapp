export function drawOutline(allCoords, scene, myMaterial, log=false)
{
    var minCoords = math.min(allCoords, 0);
    var maxCoords = math.max(allCoords, 0);    

    var boxSize = math.subtract(maxCoords, minCoords);

    var centerOfBox = math.subtract(maxCoords, math.divide(boxSize, 2));    

    var box = BABYLON.MeshBuilder.CreateBox("outline", {width: boxSize[0], height: boxSize[1] , depth:boxSize[2]}, scene);
    box.material = myMaterial;  
    box.position.x = centerOfBox[0];
    box.position.y = centerOfBox[1];
    box.position.z = centerOfBox[2];
    if (log)
    {
        console.log([ minCoords, maxCoords]);
        console.log([ boxSize]);
        console.log([ centerOfBox]);
    }
}