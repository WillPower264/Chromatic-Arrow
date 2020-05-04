import { Group, Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import MODEL from './arrow.gltf';

class Arrow extends Group {
    constructor() {
        // Call parent Group() constructor
        super();

        const loader = new GLTFLoader();

        this.name = 'arrow';
        this.velocity = new Vector3(0, 0, 0);

        loader.load(MODEL, (gltf) => {
            this.add(gltf.scene);
        });
    }

    setVelocity(v) {
      this.velocity = v;
    }
}

export default Arrow;
