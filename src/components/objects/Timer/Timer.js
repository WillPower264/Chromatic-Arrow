import { RingGeometry, Group, Mesh, MeshBasicMaterial, PlaneGeometry, Vector3 } from 'three';

class Timer extends Group {
    constructor(maxSec) {
        // Call parent Group() constructor
        super();

        this.name = 'timer';
        this.maxTime = maxSec;
        this.buffer = 25;
        const rad = 40;
        this.initRad = rad;

        // Circle
        const cirGeometry = new RingGeometry(0.9*rad, rad, 32);
        const cirMaterial = new MeshBasicMaterial({ color: 0x000000 });
        const cirMesh = new Mesh(cirGeometry, cirMaterial);
        this.add(cirMesh);

        // Line
        const points = [];
        points.push(new Vector3(0, 0, 0));
        points.push(new Vector3(0, rad, 0));

        const linGeometry = new PlaneGeometry(0.1*rad, rad);
        const linMaterial = new MeshBasicMaterial({ color: 0x000000 });
        const linMesh = new Mesh(linGeometry, linMaterial);
        linMesh.position.y += rad/2;
        this.line = linMesh;
        this.add(linMesh);

        this.addEventListeners();
    }

    update(timestamp) {
      const angle = (timestamp*2*Math.PI) / (this.maxTime * 1000);
      this.rotation.z = -angle;
    }

    windowResizeHandler() {
      this.position.x = window.innerWidth / 2 - this.initRad - this.buffer;
      this.position.y = window.innerHeight / 2 - this.initRad - this.buffer;
    }

    addEventListeners() {
      this.windowResizeHandler();
      window.addEventListener('resize', () => this.windowResizeHandler(), false);
    }
}

export default Timer;
