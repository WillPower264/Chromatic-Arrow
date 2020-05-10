import { Scene, Mesh, MeshBasicMaterial, PlaneGeometry } from 'three';
import { BasicLights } from 'lights';
import { Splatter } from 'objects';
import CONSTS from '../../constants';

class EndScene extends Scene {
    constructor(score) {
        // Call parent Scene() constructor
        super();

        const { innerHeight, innerWidth } = window;
        this.width = innerWidth;
        this.height = innerHeight;

        // Splatter
        this.color = CONSTS.randomColor(); 
        this.createSplatter(innerWidth, innerHeight);

        // Text
        this.textIds = [];
        this.currWidth = window.innerWidth;
        this.createText(`Final Score: ${score}`, '35%');
        _.delay(() => {
          this.createText("Click Anywhere to Retry", '50%');
        }, CONSTS.msEndDelay);
    }

    createSplatter(width, height) {
        const s = Math.max(width, height)
        const geometry = new PlaneGeometry(s, s);
        const splat = new Splatter();
        const material1 = new MeshBasicMaterial({
          map: splat.texture,
          color: this.color,
          transparent: true,
          depthTest: true,
          depthWrite: false,
          polygonOffset: true,
          polygonOffsetFactor: -4
        });
        const mesh = new Mesh(geometry, material1);
        mesh.rotation.z = 2*Math.PI/6;
        mesh.position.x -= width/16;
        this.add(mesh);
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

    update() {
        // Re-center
        const { innerHeight, innerWidth } = window;
        if (innerWidth !== this.width || innerHeight !== this.height) {
          // Splatter
          this.remove(this.children[0]);
          this.createSplatter(innerWidth, innerHeight);
          // Text
          for (let i = 0; i < this.textIds.length; i++) {
            const elt = document.getElementById(this.textIds[i]);
            elt.style.left = (window.innerWidth - elt.clientWidth)/2 + 'px';
          }
          this.width = innerWidth;
          this.height = innerHeight;
        }
    }
}

export default EndScene;
