import { Group, Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import MODEL from './arrow.gltf';
import CONSTS from '../../../constants';

class Arrow extends Group {
    constructor() {
        // Call parent Group() constructor
        super();

        const loader = new GLTFLoader();

        this.name = 'arrow';
        this.mass = 10.0; 
        this.netForce = new Vector3(0, 0, 0);

        this.fired = false; // behavior is different after arrow is fired

        // note this position is local coordinates, not world. tho they may be the same
        // this is for testing; should actually be around (0,3.7,0)?
        // y=4 is completely on the camera. 
        this.position.set(0, 4, 5); 
        this.previous = this.position.clone();

        // this.lookAt(new Vector3(0, 0, 0));

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

    fireArrow() {
        this.fired = true;
    }

    // wrapper to be called for all collisions
    handleCollisions() {
        this.handleFloorCollision();
    }

    handleFloorCollision() {
        // can do something more sophisticated, maybe
        if (this.position.y < CONSTS.scene.groundPos + CONSTS.EPS) // GROUND + EPS, define in constant
            this.position.y = CONSTS.scene.groundPos + CONSTS.EPS;
    }

    // function to rotate arrow to point in correct direction. default points +x
    // if velocity = 0, arrow points in camera.getWorldDirection() ? 
    // else arrow points in normalized velocity direction

    // Perform Verlet integration
    integrate(deltaT) {
        const currPos = this.position.clone();
        let nextPos = currPos.clone();
        nextPos.addScaledVector(currPos.clone().sub(this.previous), 1-CONSTS.arrow.damping);
        nextPos.addScaledVector(this.netForce.clone().multiplyScalar(1/this.mass), deltaT*deltaT);
        this.position.set(nextPos.x, nextPos.y, nextPos.z);
        this.previous = currPos;

        this.netForce.set(0,0,0);
    }

    //
    update(timeStamp) {
        const deltaT = 18/1000; // define this in constants

        // apply physics after arrow fired
        if (this.fired) {
            // gravity; should be in a different file?
            const gravForce = new Vector3(0, -10, 0)
            this.addForce(gravForce.multiplyScalar(this.mass))

            this.integrate(deltaT);
        }

        this.handleCollisions() // call this in the simulation file?
    }
}

export default Arrow;
