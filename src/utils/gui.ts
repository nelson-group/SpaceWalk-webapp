import {
    Color3,
    Color4,
    PointsCloudSystem,
    CloudPoint
} from "@babylonjs/core";

import { AdvancedDynamicTexture, StackPanel, Control, TextBlock, ColorPicker } from "@babylonjs/gui";

export function calcColor(max_color: Color4, min_color: Color4, density: number) {
    let tmp: number = 1.0 - density;
    let tmp_alpha = tmp * density;
    let one_minus_d = new Color4(tmp, tmp, tmp, tmp_alpha);
    let d = new Color4(density, density, density, density);

    return min_color.multiply(one_minus_d).add(max_color.multiply(d));
}

export function buildGUI(gui_texture: AdvancedDynamicTexture , pcs: PointsCloudSystem, min_color: Color4, max_color: Color4, density_array: Array<number>) {
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
    min_color.toArray(min_arr);
    min_color_picker.value = Color3.FromArray(min_arr);
    min_color_picker.height = "150px";
    min_color_picker.width = "150px";
    min_color_picker.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    min_color_picker.onValueChangedObservable.add(function(value) { // value is a color3
        min_color.copyFrom(value.toColor4(1));
        pcs.setParticles()
    });
    pcs.updateParticle = function (particle: CloudPoint) {
        particle.color = calcColor(max_color, min_color, density_array[particle.idx]);
        return particle;
    };

    panel.addControl(min_color_picker);

    let max_color_text_block = new TextBlock();
    max_color_text_block.text = "Max color:";
    max_color_text_block.height = "30px";
    panel.addControl(max_color_text_block);

    let max_color_picker = new ColorPicker();
    let max_arr: Array<number> = [];
    max_color.toArray(max_arr);
    max_color_picker.value = Color3.FromArray(max_arr);
    max_color_picker.height = "150px";
    max_color_picker.width = "150px";
    max_color_picker.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    max_color_picker.onValueChangedObservable.add(function(value) { // value is a color3
        max_color.copyFrom(value.toColor4(1));
        pcs.setParticles()
    });
    pcs.updateParticle = function (particle: CloudPoint) {
        particle.color = calcColor(max_color, min_color, density_array[particle.idx]);
        return particle;
    };

    panel.addControl(max_color_picker);
}
