import { Scene, BoxGeometry, DoubleSide, Euler, Mesh, MeshBasicMaterial, MeshStandardMaterial, PlaneGeometry, Texture, Vector3 } from 'three';
import { BasicLights } from 'lights';
import { Splatter } from 'objects';
import CONSTS from '../../constants';

class StartScene extends Scene {
    constructor() {
        // Call parent Scene() constructor
        super();
        // Timing
        this.stepCount = 0;
        this.splatterCount = 0;

        // Fixed points to make sure text is revealed
        this.xs = [-2, -1.5, 0, 1, 2];
        this.ys = [1, 3, 2, 3, 1];

        const lights = new BasicLights();
        this.add(lights);

        // Canvas
        const geometry = new BoxGeometry(100, 100, 1);
        const material = new MeshBasicMaterial({color: 0xffffff});
        const mesh = new Mesh(geometry, material);
        mesh.position.set(0, 0, 10);
        mesh.updateMatrix();
        this.screen = mesh;
        this.add(mesh);

        // Text
        this.textIds = [];
        this.currWidth = window.innerWidth;
        this.createText("Chromatic Arrow", '30%');
        this.createText("Click Anywhere to Begin", '60%');
    }

    createText(str, top) {
        const text = document.createElement('div');
        text.id = str;
        text.innerHTML = str;
        text.style.position = 'absolute';
        text.style.fontSize = '55px';
        text.style.color = 'white';
        document.body.appendChild(text);
        // Center text
        const { innerHeight, innerWidth } = window;
        text.style.left = (innerWidth - text.clientWidth)/2 + 'px';
        text.style.top = top;
        this.textIds.push(str);
    }

    clearText() {
        for (let i = 0; i < this.textIds.length; i++) {
          document.getElementById(this.textIds[i]).remove();
        }
        this.textIds.length = [];
    }

    update(timeStamp) {
        // Re-center text
        if (window.innerWidth !== this.currentWidth) {
          for (let i = 0; i < this.textIds.length; i++) {
            const elt = document.getElementById(this.textIds[i]);
            elt.style.left = (window.innerWidth - elt.clientWidth)/2 + 'px';
          }
          this.currentWidth = window.innerWidth;
        }
        // Splatter
        const {
          stepsPerSplatter, maxSplatters, xMin, xMax, yMin, yMax, minSize, maxSize
        } = CONSTS.start;
        if (this.splatterCount < maxSplatters &&
            this.stepCount % stepsPerSplatter == 0) {
          let rx;
          let ry;
          let size;
          if (this.splatterCount < this.xs.length) {
            rx = this.xs[this.splatterCount];
            ry = this.ys[this.splatterCount];
            size = maxSize;
          } else {
            rx = xMin + Math.random()*(xMax-xMin);
            ry = yMin + Math.random()*(yMax-yMin);
            size = minSize + Math.random()*(maxSize-minSize);
          }
          const randOffset = new Vector3(rx, ry, 0);
          const pos = this.screen.position.clone().add(randOffset);
          const rot = new Euler();
          const splat = new Splatter(this.screen, pos, rot, size);
          this.add(splat.mesh);
          this.splatterCount++;
          this.lastSplatter = timeStamp;
        }
        this.stepCount++;
    }
}

export default StartScene;
