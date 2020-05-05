import { Scene, BoxGeometry, DoubleSide, Euler, Mesh, MeshBasicMaterial, MeshStandardMaterial, PlaneGeometry, Texture, Vector3 } from 'three';
import { BasicLights } from 'lights';
import { Splatter } from 'objects';

class StartScene extends Scene {
    constructor(creationTime) {
        // Call parent Scene() constructor
        super();
        // Timing
        this.splatterInterval = 0.1;
        this.lastSplatter = creationTime;
        this.maxSplatters = 50;
        this.splatterCount = 0;

        // Appearance
        this.xMin = -7;
        this.xMax = 7;
        this.yMin = -3;
        this.yMax = 5;
        this.minSize = 5;
        this.maxSize = 7;

        const lights = new BasicLights();
        this.add(lights);

        // Canvas
        // TODO: Fit to screen size
        const geometry = new BoxGeometry(100, 100, 1);
        const material = new MeshBasicMaterial({color: 0xffffff});
        const mesh = new Mesh(geometry, material);
        mesh.position.set(0, 0, 10);
        mesh.updateMatrix();
        this.screen = mesh;
        this.add(mesh);

        // Text
        this.textIds = [];
        this.createText("Chromatic Arrow", '30%');
        this.createText("Click Anywhere to Begin", '60%');
    }

    createText(str, top) {

        const text = document.createElement('div');
        text.id = str;
        text.style.position = 'absolute';
        text.innerHTML = str;
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
    }

    update(timeStamp) {
        if (this.splatterCount < this.maxSplatters &&
            timeStamp-this.lastSplatter > this.splatterInterval*1000) {
          console.log("Splat")
          const rx = this.xMin + Math.random()*(this.xMax-this.xMin);
          const ry = this.yMin + Math.random()*(this.yMax-this.yMin);
          const randOffset = new Vector3(rx, ry, 0);
          const pos = this.screen.position.clone().add(randOffset);
          const size = this.minSize + Math.random()*(this.maxSize-this.minSize);
          const rot = new Euler(0, 0, Math.random()*2*Math.PI);
          const splat = new Splatter(this.screen, pos, rot, size);
          this.add(splat.mesh);
          this.splatterCount++;
          this.lastSplatter = timeStamp;
        }
    }
}

export default StartScene;
