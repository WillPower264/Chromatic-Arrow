import { Scene, BoxGeometry, Euler, Mesh, MeshBasicMaterial, Vector3 } from 'three';
import { BasicLights } from 'lights';
import { Splatter } from 'objects';
import CONSTS from '../../constants';
import '../../style.css';
import _ from 'lodash';

class StartScene extends Scene {
    constructor(startGameCallback, tutorialCallback) {
        // Call parent Scene() constructor
        super();

        this.state = {
            splatters: [],
        };

        // Timing
        this.stepCount = 0;
        this.splatterCount = 0;

        // Add lights
        this.add(new BasicLights());

        // Canvas
        const { canvas, texts } = CONSTS.start;
        const { size, thickness, color, position } = canvas;
        const geometry = new BoxGeometry(size, size, thickness);
        const material = new MeshBasicMaterial({ color });
        const mesh = new Mesh(geometry, material);
        mesh.position.copy(position);
        mesh.updateMatrix();
        this.screen = mesh;
        this.add(mesh);

        // Text and buttons
        const { title, tutorial, begin } = texts;
        this.divElements = [];
        this.divElements.push(this.createText(title.name, title.offset));
        this.divElements.push(this.createButton(tutorial.name, tutorial.offset, tutorialCallback));
        this.divElements.push(this.createButton(begin.name, begin.offset, startGameCallback));

        // Add event listeners
        this.addEventListeners();
    }

    createSplatter() {
        const { fixed, xMin, xMax, yMin, yMax, minSize, maxSize } = CONSTS.start.splatter;
        const [rx, ry, size] = this.splatterCount < fixed.xs.length
        ? [ fixed.xs[this.splatterCount],
            fixed.ys[this.splatterCount],
            maxSize]
        : [ _.random(xMin, xMax, true),
            _.random(yMin, yMax, true),
            _.random(minSize, maxSize, true)];
        const offset = new Vector3(rx, ry, 0);
        const pos = this.screen.position.clone().add(offset);
        const rot = new Euler();
        const splat = new Splatter(this.screen, pos, rot, size);
        this.add(splat.mesh);
        this.state.splatters.push(splat);
        this.splatterCount++;
    }

    createText(str, top) {
        const { style } = CONSTS.start.texts;
        const text = document.createElement('div');
        document.body.appendChild(text);
        // Set content and style
        text.innerHTML = str;
        _.extend(text.style, style);
        text.style.left = (window.innerWidth - text.clientWidth) / 2 + 'px';
        text.style.top = top;
        return text;
    }

    createButton(str, top, callback) {
        const button = document.createElement('button');
        document.body.appendChild(button);
        // Set content and style
        button.innerHTML = str;
        button.style.left = (window.innerWidth - button.clientWidth) / 2 + 'px';
        button.style.top = top;
        button.onclick = callback;
        return button;
    }

    clearText() {
        this.divElements.forEach((divElement) => divElement.remove());
        this.divElements = [];
    }

    resizeHandler() {
        // realign divElements
        this.divElements.forEach((divElement) => {
            divElement.style.left = (window.innerWidth - divElement.clientWidth)/2 + 'px';
        });
    }

    addEventListeners() {
        this.resizeHandler();
        window.addEventListener('resize', () => this.resizeHandler(), false);
    }

    update() {
        // Splatter
        const { maxSplatters, stepsPerSplatter } = CONSTS.start.splatter;
        if (this.splatterCount < maxSplatters && this.stepCount % stepsPerSplatter === 0) {
            this.createSplatter();
        }
        this.stepCount++;
    }

    destruct() {
        const { splatters } = this.state;
        for (let i = 0; i < splatters.length; i++) {
            splatters[i].destruct();
            splatters[i] = null;
        }
        this.state.splatters = null;
        this.dispose();
    }
}

export default StartScene;
