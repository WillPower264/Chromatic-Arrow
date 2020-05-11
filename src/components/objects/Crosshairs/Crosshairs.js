import { Group, PlaneGeometry, Mesh, MeshBasicMaterial } from 'three';
import CONSTS from '../../../constants';

class Crosshairs extends Group {
    constructor() {
        // Call parent Group() constructor
        super();

        this.name = 'crosshairs';
        const { thickness, size, color } = CONSTS.crosshairs;
        const vert = new PlaneGeometry(thickness, size);
        const hor = new PlaneGeometry(size, thickness);
        const material = new MeshBasicMaterial({color});
        this.add(new Mesh(vert, material));
        this.add(new Mesh(hor, material));
    }

    destruct() {
        for (let i = 0; i < this.children.length; i++) {
            this.children[i].geometry.dispose();
            this.children[i].material.dispose();
        }
    }
}

export default Crosshairs;
