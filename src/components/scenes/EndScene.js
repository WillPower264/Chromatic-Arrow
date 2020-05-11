import { Scene, Mesh, MeshBasicMaterial, PlaneGeometry } from 'three';
import { Splatter } from 'objects';
import CONSTS from '../../constants';
import _ from 'lodash';

class EndScene extends Scene {
    constructor(score) {
        // Call parent Scene() constructor
        super();

        // Splatter
        this.color = CONSTS.randomColor();
        this.createSplatter();
        this.geom;
        this.material;

        // Text
        this.textBoxes = [];
        this.textBoxes.push(this.createText(`Final Score: ${score}`, '35%'));
        _.delay(() => {
            this.textBoxes.push(this.createText('Click Anywhere to Retry', '50%'));
        }, CONSTS.scene.msEndDelay);
    }

    createSplatter() {
        if (this.splatter) {
            this.disposeSplatter();
        }
        const { innerHeight, innerWidth } = window;
        const { splatterMaterialProperties: properties } = CONSTS.endScene;
        const s = Math.max(innerWidth, innerHeight);
        const geometry = new PlaneGeometry(s, s);
        const splat = new Splatter();
        const material = new MeshBasicMaterial(_.extend(properties, {
          map: splat.texture,
          color: this.color,
        }));
        const mesh = new Mesh(geometry, material);
        mesh.rotation.z = CONSTS.fullRotation / 6;
        mesh.position.x -= innerWidth / 16;
        this.add(mesh);
        this.splatter = splat;
        this.mesh = mesh;
    }

    createText(str, top) {
        const { style } = CONSTS.endScene;
        const text = document.createElement('div');
        document.body.appendChild(text);
        // Set content and style
        text.innerHTML = str;
        _.extend(text.style, style);
        text.style.left = (window.innerWidth - text.clientWidth)/2 + 'px';
        text.style.top = top;
        return text;
    }

    /* Event handlers */
    resizeHandler() {
        // reset splatter
        this.remove(this.mesh);
        this.createSplatter();

        // realign textboxes
        this.textBoxes.forEach((textBox) => {
            textBox.style.left = (window.innerWidth - textBox.clientWidth)/2 + 'px';
        });
    }

    /* Update */
    update() {
        // Nothing to update
    }

    /* Clean up */
    destruct() {
        // Destruct splatter
        this.splatter.destruct();
        this.splatter = null;
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
        this.mesh = null;

        // Remove textboxes
        this.textBoxes.forEach((textBox) => textBox.remove());
        this.textBoxes = null;

        // Dispose the scene
        this.dispose();
    }
}

export default EndScene;
