import { Group, PlaneGeometry, Mesh, MeshBasicMaterial, Sprite } from 'three';

class Powerbar extends Group {
    constructor(width, height) {
        // Call parent Group() constructor
        super();

        this.name = 'powerbar';
        this.initWidth = width;
        this.initHeight = height;
        this.buffer = 25;
        const geometry = new PlaneGeometry(width, height);
        const material = new MeshBasicMaterial({color: 0x00ff00});
        this.add(new Mesh(geometry, material));
    }

    update(width, height, timestamp) {
      this.position.x = width - this.initWidth/2 - this.buffer;
      this.position.y = -height + this.initHeight/2 + this.buffer;
    }
}

export default Powerbar;
