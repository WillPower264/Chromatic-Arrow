import { Group, Vector3, Vector2 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import MODEL from './target.gltf';

class Target extends Group {
    constructor() {
        // Call parent Group() constructor
        super();

        const loader = new GLTFLoader();

        this.name = 'target';

        loader.load(MODEL, (gltf) => {
            this.add(gltf.scene);
        });
    }

    // Automatically rotates the target to face the camera
    faceCenter() {
        const yAxis = new Vector3(0, 1, 0);
        const defaultDir = new Vector2(1, 1);
        const { x, z } = this.position;
        const pos = new Vector2(x, z);
        const angle = defaultDir.angle() - pos.angle();
        this.rotateOnAxis(yAxis, angle);
    }
}

export default Target;
