import {
    Color3,
    Color4,
    PointsCloudSystem,
    CloudPoint,
} from "@babylonjs/core";

import { AdvancedDynamicTexture, StackPanel, Control, TextBlock, ColorPicker, Slider } from "@babylonjs/gui";

import { min, max } from "mathjs";

export interface ColorConfig {
    max_color: Color4;
    min_color: Color4;
    max_density: number;
    min_density: number;
    automatic_opacity: boolean;
}

export function calcColor(config: ColorConfig, density: number) {
    let tmp: number = 1.0 - density;
    let tmp_alpha = config.automatic_opacity ? tmp * density : tmp;
    let one_minus_d = new Color4(tmp, tmp, tmp, tmp_alpha);
    let d = new Color4(density, density, density, density);

    let color = config.min_color.multiply(one_minus_d).add(config.max_color.multiply(d));
    color.a = min(max(0, density - config.min_density) / (config.max_density - config.min_density), 1);
    return color;
}

export function buildGUI(gui_texture: AdvancedDynamicTexture , pcs: PointsCloudSystem, colorConfig: ColorConfig, density_array: Array<number>) {
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
        colorConfig.min_color.copyFrom(value.toColor4(1));
        pcs.setParticles()
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
        colorConfig.max_color.copyFrom(value.toColor4(1));
        pcs.setParticles()
    });
    pcs.updateParticle = function (particle: CloudPoint) {
        particle.color = calcColor(colorConfig, density_array[particle.idx]);
        return particle;
    };
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
        pcs.setParticles()
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
        pcs.setParticles()
    });
    panel.addControl(max_slider);
}

function roundNumber(number: number) {
    return (Math.round(number * 100) / 100).toFixed(2);
}
