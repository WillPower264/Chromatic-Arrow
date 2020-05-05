import { BufferGeometry,  RingGeometry, Group, Mesh, MeshBasicMaterial, PlaneGeometry, Vector3 } from 'three';

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
        points.push(new Vector3(0, 40, 0));

        const linGeometry = new PlaneGeometry(0.1*rad, rad);
        const linMaterial = new MeshBasicMaterial({ color: 0x000000 });
        const linMesh = new Mesh(linGeometry, linMaterial);
        linMesh.position.y += rad/2;
        this.line = linMesh;
        this.add(linMesh);

        // this.setText(text, this);
        // console.log(this)
    }

    update(width, height, timestamp) {
      const angle = (timestamp*2*Math.PI) / (this.maxTime * 1000);
      this.rotation.z = -angle;
      this.position.x = width - this.initRad - this.buffer;
      this.position.y = height - this.initRad - this.buffer;
    }

    // setText(text, group) {
    //   const loader = new FontLoader();
    //
    //   loader.load(FONT, function (font) {
    //     const geometry = new TextGeometry(text, {
    //       font: font,
    //       size: 80,
    //       height: 5,
    //     });
    //     const material = new MeshBasicMaterial({color: 0x00ff00});
    //     const mesh = new Mesh(geometry, material);
    //     group.add(mesh);
    //   });
    // }
}

export default Timer;
