import { Group, Vector3, CylinderGeometry, MeshBasicMaterial, Mesh} from 'three';
import CONSTS from '../../../constants';

class Arrow extends Group {
    constructor() {
        // Call parent Group() constructor
        super();

        this.name = 'arrow';
        this.mass = 10.0;
        this.netForce = new Vector3(0, 0, 0);
        this.hasCollided = false;

        this.fired = false; // behavior is different after arrow is fired

        // 0,4,0 is completely on the camera.
        this.position.set(0, 4, 0);
        this.previous = this.position.clone();

        // direction the arrow points
        this.direction = CONSTS.directions.yAxis.clone();

        // create arrow body
        const { radius, height, radiusSegments } = CONSTS.arrow;
        this.halfLen = height / 2.0;
        const cylinder = new CylinderGeometry(radius, radius, height, radiusSegments);
        const mat = new MeshBasicMaterial({ color: 0xEAC18B }); // tan
        const mesh = new Mesh(cylinder, mat);
        this.add(mesh);
    }

    addForce(force) {
        this.fired = true;
        this.netForce.add(force);
    }

    // wrapper to be called for all collisions
    handleCollisions() {
        this.handleFloorCollision();
    }

    handleFloorCollision() {
        // can do something more sophisticated, maybe
        if (this.position.y < CONSTS.scene.groundPos + CONSTS.EPS) {
            this.hasCollided = true;
            this.position.y = CONSTS.scene.groundPos + CONSTS.EPS;
        }
    }

    // rotate arrow to point in the direction of v
    pointToward(v) {
        const currDir = this.direction;
        const newDir = v.clone().normalize();
        const angle = currDir.angleTo(newDir);
        const axis = currDir.clone().cross(newDir).normalize();
        this.rotateOnAxis(axis, angle);
        this.direction = newDir;
    }

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
            const gravForce = new Vector3(0, -100, 0);
            this.addForce(gravForce.multiplyScalar(this.mass));

            this.integrate(deltaT);

            this.pointToward(this.position.clone().sub(this.previous));
        }
        else {
            // const direction = new Vector3(0);
            // //camera.getWorldDirection(direction); how to get camera dir??
            // this.pointToward(direction);
        }

        this.handleCollisions() // call this in the simulation file?
    }
}

export default Arrow;
