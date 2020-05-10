import { Scene, Mesh, MeshBasicMaterial, PlaneGeometry } from 'three';
import { Splatter } from 'objects';
import CONSTS from '../../constants';
import _ from 'lodash';

class EndScene extends Scene {
    constructor(score) {
        // Call parent Scene() constructor
        super();

        // Splatter
        this.splatter = this.createSplatter();

        // Text
        this.textBoxes = [];
        this.textBoxes.push(this.createText(`Final Score: ${score}`, '35%'));
        _.delay(() => {
            this.textBoxes.push(this.createText('Click Anywhere to Retry', '50%'));
        }, CONSTS.scene.msEndDelay);

        // Add event listeners
        this.addEventListeners();
    }

    createSplatter() {
        const { innerHeight, innerWidth } = window;
        const { splatterMaterialProperties: properties } = CONSTS.endScene;
        const s = Math.max(innerWidth, innerHeight);
        const geometry = new PlaneGeometry(s, s);
        const splat = new Splatter();
        const material = new MeshBasicMaterial(_.extend(properties, {
          map: splat.texture,
          color: CONSTS.randomColor(),
        }));
        const mesh = new Mesh(geometry, material);
        mesh.rotation.z = CONSTS.fullRotation / 6;
        mesh.position.x -= innerWidth / 16;
        this.add(mesh);
        return mesh;
    }

    createText(str, top) {
        const { style } = CONSTS.endScene;
        const text = document.createElement('div');
        document.body.appendChild(text);
        text.innerHTML = str;
        _.extend(text.style, style);
        text.style.left = (window.innerWidth - text.clientWidth)/2 + 'px';
        text.style.top = top;
        return text;
    }

    clearText() {
        this.textBoxes.forEach((textBox) => textBox.remove());
        this.textBoxes = [];
    }

    resizeHandler() {
        // reset splatter
        this.remove(this.splatter);
        this.splatter = this.createSplatter();

        // realign textboxes
        this.textBoxes.forEach((textBox) => {
            textBox.style.left = (window.innerWidth - textBox.clientWidth)/2 + 'px';
        });
    }

    addEventListeners() {
        this.resizeHandler();
        window.addEventListener('resize', () => this.resizeHandler(), false);
    }

    update() {
        // Nothing to update
    }
}

export default EndScene;
