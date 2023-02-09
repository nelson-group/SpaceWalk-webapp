import { createScene } from "./utils/scenery";

const file_url = "data/tng/subhalos/70/442304/cutout_70_442304_70.hdf5";
const filename = "XYZ";
const partType = "PartType0";

import { Engine } from "@babylonjs/core";
import { useOwnShader } from "./utils/gui";

async function main() {
    const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
    const divFPS = document.getElementById("fps")!;

    var engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
    var scene = await createScene(file_url, filename, partType, canvas, engine, true, true);

    engine.runRenderLoop(function () {
        divFPS.innerHTML = engine.getFps().toFixed() + " fps";
        scene.render();
    });

    window.addEventListener('resize', function () {
        engine.resize();
    });
}

await main();
