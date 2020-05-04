import { Group, PlaneGeometry, Mesh, MeshBasicMaterial } from 'three';

class Crosshairs extends Group {
    constructor() {
        // Call parent Group() constructor
        super();

        this.name = 'crosshairs';
        const vert = new PlaneGeometry(1, 25);
        const hor = new PlaneGeometry(25, 1);
        const material = new MeshBasicMaterial( {color: 0x999999} );
        this.add(new Mesh(vert, material));
        this.add(new Mesh(hor, material));
    }
}

export default Crosshairs;
