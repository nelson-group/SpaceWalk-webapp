import {
    Color3,
    ShaderMaterial
} from "@babylonjs/core";

import { Checkbox, AdvancedDynamicTexture, StackPanel, Control, TextBlock, ColorPicker, Slider } from "@babylonjs/gui";

import { min, max } from "mathjs";


export function calcColor(config: Record<string,any>, density: number) {
    let tmp: number = 1.0 - density;    
    let one_minus_d = new Color3(tmp, tmp, tmp);
    let d = new Color3(density, density, density);

    let color = config.min_color.multiply(one_minus_d).add(config.max_color.multiply(d));
    let color4 = color.toColor4(min(max(0, density - config.min_density) / (config.max_density - config.min_density), 1));
    return color4;
}

export function buildGUI(gui_texture: AdvancedDynamicTexture , currentMaterial:ShaderMaterial, colorConfig: Record<string,any>, timeConfig:Record<string,any>) {
    let panel = new StackPanel();
    panel.width = "400px";
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
        currentMaterial.setColor3("min_color", colorConfig.min_color);
    });

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
        currentMaterial.setColor3("max_color", colorConfig.max_color);
    });
    panel.addControl(max_color_picker);

    let min_opacity_text = new TextBlock();
    min_opacity_text.text = "Min Density: " + roundNumber(colorConfig.min_density);
    min_opacity_text.height = "30px";
    panel.addControl(min_opacity_text);

    let min_slider = new Slider("min_opacity_slider");
    min_slider.minimum = 0;
    min_slider.maximum = colorConfig.n_quantiles - 1;
    min_slider.step = 1;
    min_slider.value = 0;
    min_slider.height = "20px";
    min_slider.width = "200px";
    min_slider.onValueChangedObservable.add(function(value) {
        let density = colorConfig.quantiles[value]
        min_opacity_text.text = "Min Density: " + density.toFixed(12);        
        currentMaterial.setFloat("min_density", density); 
    });
    panel.addControl(min_slider);

    let max_opacity_text = new TextBlock();
    max_opacity_text.text = "Max Density: " + roundNumber(colorConfig.max_density);
    max_opacity_text.height = "30px";
    panel.addControl(max_opacity_text);

    let max_slider = new Slider("max_opacity_slider");
    max_slider.minimum = 0;
    max_slider.maximum = colorConfig.n_quantiles - 1;
    max_slider.step = 1;
    max_slider.value = colorConfig.n_quantiles - 1;
    max_slider.height = "20px";
    max_slider.width = "200px";
    max_slider.onValueChangedObservable.add(function(value) {
        let density = colorConfig.quantiles[value]
        max_opacity_text.text = "Max Density: " + density.toFixed(12);        
        currentMaterial.setFloat("max_density", density); 
    });
    panel.addControl(max_slider);

    let snapnum_text = new TextBlock("snapnumText");
    snapnum_text.text = "Snapnum: " + timeConfig.current_snapnum;
    snapnum_text.height = "30px";
    panel.addControl(snapnum_text);
    var snapnum_slider = new Slider();
    snapnum_slider.minimum = timeConfig.min_snapnum;
    snapnum_slider.maximum = timeConfig.max_snapnum;
    snapnum_slider.value = timeConfig.current_snapnum;
    snapnum_slider.height = "20px";
    snapnum_slider.width = "200px";
    snapnum_slider.step = 1;
    snapnum_slider.onValueChangedObservable.add(function(value) {        
        snapnum_text.text = "Snapnum: " + value;
        timeConfig.current_snapnum = value
        timeConfig.t = 0
    });
    panel.addControl(snapnum_slider);   
    let interpolation_text = new TextBlock("InterpolationText");
    interpolation_text.text = "Interpolation: " + timeConfig.t;
    interpolation_text.height = "30px";
    panel.addControl(interpolation_text);

    var interpolate_checkbox = new Checkbox();
    interpolate_checkbox.width = "20px";
    interpolate_checkbox.height = "20px";
    interpolate_checkbox.isChecked = timeConfig.is_active;
    interpolate_checkbox.color = "green";
    interpolate_checkbox.onIsCheckedChangedObservable.add(function(value) {
        interpolate_checkbox.color = interpolate_checkbox.isChecked ? "green" : "red";
        timeConfig.is_active = interpolate_checkbox.isChecked;           
    });
    panel.addControl(interpolate_checkbox); 

    timeConfig.text_object_interpolation = interpolation_text;
    timeConfig.text_object_snapnum = snapnum_text;
    timeConfig.slider_object_snapnum = snapnum_slider;
    
    return panel
}


export function roundNumber(number: number) {
    return (Math.round(number * 100) / 100).toFixed(2);
}
