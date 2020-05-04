import { Group, PlaneGeometry, Mesh, MeshBasicMaterial, Sprite } from 'three';

class Powerbar extends Group {
    constructor(width, height) {
        // Call parent Group() constructor
        super();

        this.name = 'powerbar';
        const geometry = new PlaneGeometry(width, height);
        const material = new MeshBasicMaterial( {color: 0x00ff00} );
        this.add(new Mesh(geometry, material));
    }

    update(width, height, timestamp) {
      this.position.x = width-250/2-25;
      this.position.y = height+50/2+25;
    }
}

export default Powerbar;
