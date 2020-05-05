import { Group, Vector3, MeshBasicMaterial, CylinderGeometry, Mesh, Spherical } from 'three';
import _ from 'lodash';

class Target extends Group {
    constructor() {
        // Call parent Group() constructor
        super();

        this.name = 'target';
        this.minDistApart = 10;
        const colorHex = [
            0xFFFF3D, // yellow
            0xED242C, // red
            0x62BDEC, // blue
            0x221E20, // black
            0xFFFFFF, // white
        ];
        for (let i = 0; i < colorHex.length; i++) {
            const radius = (i + 1) / 2;
            const height = 0.5 - 0.1 * i;
            const cylinder = new CylinderGeometry(radius, radius, height, 16);
            const mat = new MeshBasicMaterial({ color: colorHex[i] });
            const mesh = new Mesh(cylinder, mat);
            this.add(mesh);
        }
    }

    // Automatically rotates the target to face the camera
    faceCenter(center) {
        const defaultDir = new Vector3(0, 1, 0);
        const desiredDir = center.clone().sub(this.position);
        const angle = defaultDir.angleTo(desiredDir);
        const axis = defaultDir.cross(desiredDir).normalize();
        this.rotateOnAxis(axis, angle);
    }

    getRandomSphericalPosition() {
        const radius = _.random(30, 40);
        const phi = _.random(Math.PI / 4, 5 * Math.PI / 12);
        const theta = _.random(0, 2 * Math.PI);
        return new Spherical(radius, phi, theta);
    }

    checkPosition(pos, targets, numSet) {
        for (let i = 0; i < numSet; i++) {
            const targetPos = targets[i].position;
            if (pos.distanceTo(targetPos) < this.minDistApart) {
                return false;
            }
        }
        return true;
    }

    // Gives the target a random location away from other targets
    setRandomPosition(targets, numSet) {
        let randSpherical, pos;
        do {
            randSpherical = this.getRandomSphericalPosition();
            pos = new Vector3().setFromSpherical(randSpherical);
        } while (!this.checkPosition(pos, targets, numSet));
        this.position.copy(pos);
    }
}

export default Target;
