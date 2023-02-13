import {
    Color3,
    Color4,
    PointsCloudSystem,
    CloudPoint,
    Material,
    Mesh,
    StandardMaterial,
    Nullable,
    ShaderMaterial
} from "@babylonjs/core";

import { Checkbox, AdvancedDynamicTexture, StackPanel, Control, TextBlock, ColorPicker, Slider } from "@babylonjs/gui";

import { min, max } from "mathjs";
 import {useOwnShaderInit} from "../config/appconfig";

export var useOwnShader = useOwnShaderInit;
var exchangeMaterialGlobal: Nullable<Material>;

export interface ColorConfig {
    max_color: Color3;
    min_color: Color3;
    max_density: number;
    min_density: number;
    automatic_opacity: boolean;
}

export function calcColor(config: ColorConfig, density: number) {
    let tmp: number = 1.0 - density;    
    let one_minus_d = new Color3(tmp, tmp, tmp);
    let d = new Color3(density, density, density);

    let color = config.min_color.multiply(one_minus_d).add(config.max_color.multiply(d));
    let color4 = color.toColor4(min(max(0, density - config.min_density) / (config.max_density - config.min_density), 1));
    return color4;
}

export function buildGUI(gui_texture: AdvancedDynamicTexture , pcs: PointsCloudSystem, exchangeMaterial:Nullable<Material>, currentMesh:Mesh, colorConfig: ColorConfig, density_array: Array<number>) {
    exchangeMaterialGlobal = exchangeMaterial;
    let panel = new StackPanel();
    panel.width = "200px";
    panel.isVertical = true;
    panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    gui_texture.addControl(panel);

    let min_color_text_block = new TextBlock();
    min_color_text_block.text = "Min color:";
    min_color_text_block.height = "30px";
    panel.addControl(min_color_text_block);     

    let min_color_picker = new ColorPicker();
    let min_arr: Array<number> = [];
    colorConfig.min_color.toArray(min_arr);
    min_color_picker.value = Color3.FromArray(min_arr);
    min_color_picker.height = "150px";
    min_color_picker.width = "150px";
    min_color_picker.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    min_color_picker.onValueChangedObservable.add(function(value) { // value is a color3
        colorConfig.min_color.copyFrom(value);
        if(!useOwnShader)    
            pcs.setParticles();
        else        
            (currentMesh.material as ShaderMaterial).setColor3("min_color", colorConfig.min_color);
    });
    pcs.updateParticle = function (particle: CloudPoint) {
        particle.color = calcColor(colorConfig, density_array[particle.idx]);
        return particle;
    };

    panel.addControl(min_color_picker);

    let max_color_text_block = new TextBlock();
    max_color_text_block.text = "Max color:";
    max_color_text_block.height = "30px";
    panel.addControl(max_color_text_block);

    let max_color_picker = new ColorPicker();
    let max_arr: Array<number> = [];
    colorConfig.max_color.toArray(max_arr);
    max_color_picker.value = Color3.FromArray(max_arr);
    max_color_picker.height = "150px";
    max_color_picker.width = "150px";
    max_color_picker.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    max_color_picker.onValueChangedObservable.add(function(value) { // value is a color3
        colorConfig.max_color.copyFrom(value);
        if(!useOwnShader)
            pcs.setParticles()
            else        
            (currentMesh.material as ShaderMaterial).setColor3("max_color", colorConfig.max_color);
    });
    panel.addControl(max_color_picker);

    let min_opacity_text = new TextBlock();
    min_opacity_text.text = "Min Density: " + roundNumber(colorConfig.min_density);
    min_opacity_text.height = "30px";
    panel.addControl(min_opacity_text);

    let min_slider = new Slider();
    min_slider.minimum = colorConfig.min_density;
    min_slider.maximum = colorConfig.max_density;
    min_slider.value = colorConfig.min_density;
    min_slider.height = "20px";
    min_slider.width = "200px";
    min_slider.onValueChangedObservable.add(function(value) {
        min_opacity_text.text = "Min Density: " + roundNumber(value);
        colorConfig.min_density = value;
        // colorConfig.min_color.a = colorConfig.min_density;
        if(!useOwnShader)
            pcs.setParticles()
        else        
            (currentMesh.material as ShaderMaterial).setFloat("min_density", colorConfig.min_density);
    });
    panel.addControl(min_slider);

    let max_opacity_text = new TextBlock();
    max_opacity_text.text = "Max Density: " + roundNumber(colorConfig.max_density);
    max_opacity_text.height = "30px";
    panel.addControl(max_opacity_text);

    let max_slider = new Slider();
    max_slider.minimum = colorConfig.min_density;
    max_slider.maximum = colorConfig.max_density;
    max_slider.value = colorConfig.max_density;
    max_slider.height = "20px";
    max_slider.width = "200px";
    max_slider.onValueChangedObservable.add(function(value) {
        max_opacity_text.text = "Max Density: " + roundNumber(value);
        colorConfig.max_density = value;
        //colorConfig.max_color.a = colorConfig.max_density;
        if(!useOwnShader)
            pcs.setParticles()
        else        
            (currentMesh.material as ShaderMaterial).setFloat("max_density", colorConfig.max_density);
    });
    panel.addControl(max_slider);

    var useOwnShadercheckbox = new Checkbox();
    useOwnShadercheckbox.width = "20px";
    useOwnShadercheckbox.height = "20px";
    useOwnShadercheckbox.isChecked = useOwnShader;
    useOwnShadercheckbox.color = "green";
    useOwnShadercheckbox.onIsCheckedChangedObservable.add(function(value) {
        useOwnShadercheckbox.color = useOwnShadercheckbox.isChecked ? "green" : "red";
        useOwnShader = useOwnShadercheckbox.isChecked;        
        var tmp = currentMesh.material;
        currentMesh.material = exchangeMaterialGlobal;
        exchangeMaterialGlobal = tmp;        
    });
    panel.addControl(useOwnShadercheckbox);   

    var ownShaderText = new TextBlock();
    ownShaderText.text = "use own shader";
    ownShaderText.width = "180px";
    ownShaderText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    ownShaderText.color = "white";
    panel.addControl(ownShaderText); 
    

}

function roundNumber(number: number) {
    return (Math.round(number * 100) / 100).toFixed(2);
}
