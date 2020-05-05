import { Group, Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import MODEL from './arrow.gltf';

class Arrow extends Group {
    constructor() {
        // Call parent Group() constructor
        super();

        const loader = new GLTFLoader();

        this.name = 'arrow';
        this.mass = 10.0; 
        // this.velocity = new Vector3(0, 0, 0);
        this.netForce = new Vector3(0, 0, 0);

        this.fired = false; // behavior is different after arrow is fired

        // note this position is local coordinates, not world. tho they may be the same
        // this is for testing; should actually be around (0,3.78,0)
        // y=4 is completely on the camera. 
        this.position.set(0, 8, 5); 
        this.previous = this.position.clone();

        loader.load(MODEL, (gltf) => {
            this.add(gltf.scene);
        });
    }

    setVelocity(v) {
        this.previous = this.position.clone().sub(v.multiplyScalar(1/1000));
    }

    addForce(force) {
        this.netForce.add(force);
    }

    handleCollisions() {
        this.handleFloorCollision();
    }

    handleFloorCollision() {
        if (this.position.y < 0.0001) // GROUND + EPS) 
            this.position.y = 0.0001;
    }

    // function to rotate arrow to point in correct direction. default points +x
    // if velocity = 0, arrow points in camera.getWorldDirection() ? 
    // else arrow points in normalized velocity direction

    // Perform Verlet integration
    integrate(deltaT) {
        const DAMPING = 0.03;   // define this elsewhere

        const currPos = this.position.clone();
        let nextPos = currPos.clone();
        nextPos.addScaledVector(currPos.clone().sub(this.previous), 1-DAMPING)
        nextPos.addScaledVector(this.netForce.clone().multiplyScalar(1/this.mass), deltaT*deltaT);
        this.position.set(nextPos.x, nextPos.y, nextPos.z);
        this.previous = currPos;

        this.netForce.set(0,0,0);
    }

    //
    update(timeStamp) {
        const deltaT = 18/1000; // where should I get this value?

        // gravity; should be in a different file
        const gravForce = new Vector3(0, -10, 0)
        this.addForce(gravForce.multiplyScalar(this.mass))

        this.integrate(deltaT);

        this.handleCollisions() // different file?
    }
}

export default Arrow;
