import { Group, Vector3, MeshBasicMaterial, CylinderGeometry, Mesh } from 'three';

class Target extends Group {
    constructor() {
        // Call parent Group() constructor
        super();

        this.name = 'target';
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
}

export default Target;
