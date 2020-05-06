import { Group, Vector3, CylinderGeometry, ConeGeometry, MeshBasicMaterial, Mesh, Plane } from 'three';
import CONSTS from '../../../constants';

class Arrow extends Group {
    constructor(parent) {
        // Call parent Group() constructor
        super();

        this.parent = parent;

        this.name = 'arrow';
        this.mass = 10.0;
        this.netForce = new Vector3(0, 0, 0);
        this.hasCollided = false;
        this.color = Math.random() * 0xffffff;

        this.fired = false; // behavior is different after arrow is fired

        // 0,4,0 is completely on the camera.
        this.position.set(0, 4, 0);
        // this.position.set(0, 3, 5); // testing to build arrow
        this.previous = this.position.clone();

        // direction the arrow points
        this.direction = CONSTS.directions.yAxis.clone();

        // create arrow body
        const { radius, height, radiusSegments } = CONSTS.arrow;
        this.halfLen = height / 2.0;
        const cylinder = new CylinderGeometry(radius, radius, height, radiusSegments);
        const mat = new MeshBasicMaterial({ color: this.color }); // tan 0xEAC18B
        const mesh = new Mesh(cylinder, mat);
        this.add(mesh);

        // create arrow tip
        const cone = new ConeGeometry(radius*2, height/10.0, radiusSegments);
        const coneMat = new MeshBasicMaterial({ color: 0xFFFFFF});
        const coneMesh = new Mesh(cone, coneMat);
        coneMesh.position.set(0, this.halfLen, 0);
        this.add(coneMesh);
    }

    addForce(force) {
        this.fired = true;
        this.netForce.add(force);
    }

    // wrapper to be called for all collisions
    handleCollisions() {
        this.hasCollided || this.handleFloorCollision() ||
          this.handleTargetCollision() || this.handleBarrierCollision();
    }

    handleFloorCollision() {
        // can do something more sophisticated, maybe
        if (this.position.y < CONSTS.scene.groundPos + CONSTS.EPS) {
            this.hasCollided = true;
            this.position.y = CONSTS.scene.groundPos + CONSTS.EPS;
            this.parent.addSplatterGround(this.position, this.color);
            return true;
        }
        return false;
    }

    handleTargetCollision() {
        const arrowTipPos = this.position.clone().addScaledVector(this.direction, this.halfLen);
        const targets = this.parent.state.targets;
        for (let i = 0; i < this.parent.state.numTargetsInUse; i++) {
            const targetPos = targets[i].position;

            // intersect target's bounding sphere
            if (targetPos.distanceTo(arrowTipPos) > CONSTS.target.radius) { continue; }

            // travels at least far enough to hit target
            const cameraPos = CONSTS.camera.position.clone();
            const dist = -cameraPos.distanceTo(targetPos);
            const normal = cameraPos.sub(targetPos).normalize();
            const targetPlane = new Plane(normal, dist);
            if (targetPlane.distanceToPoint(arrowTipPos) <= CONSTS.target.thickness + CONSTS.EPS) {
                targets[i].remove();
                this.hasCollided = true;
                return true;
            }
        }
        return false;
    }

    handleBarrierCollision() {
        const arrowTipPos = this.position.clone().addScaledVector(this.direction, this.halfLen);
        const barriers = this.parent.state.barriers;
        for (let i = 0; i < barriers.length; i++) {
            const barrierPos = barriers[i].position;

            // intersect barrier's bounding sphere
            const halfW = CONSTS.barrier.width/2;
            const halfH = CONSTS.barrier.height/2;
            const halfDiagLen = Math.sqrt(halfW**2 + halfH**2);
            if (barrierPos.distanceTo(arrowTipPos) > halfDiagLen) { continue; }

            // travels at least far enough to hit target
            const cameraPos = CONSTS.camera.position.clone();
            const dist = -cameraPos.distanceTo(barrierPos);
            const normal = cameraPos.sub(barrierPos).normalize();
            const targetPlane = new Plane(normal, dist);
            const eps = CONSTS.target.thickness + CONSTS.EPS;
            if (targetPlane.distanceToPoint(arrowTipPos) <= eps) {
                // Check y
                if (arrowTipPos.y > barrierPos.y+halfH+eps ||
                    arrowTipPos.y < barrierPos.y-halfH-eps) {
                      continue;
                }
                // Check x/z
                const vec = new Vector3(
                  barrierPos.z, 0, -barrierPos.x
                ).normalize().multiplyScalar(halfW); // Perp to normal vec
                const right = barrierPos.clone().add(vec);
                const left = barrierPos.clone().add(vec.multiplyScalar(-1));
                if (arrowTipPos.x > right.x+halfH+eps ||
                    arrowTipPos.x < left.x-halfH-eps ||
                    arrowTipPos.z > right.z+halfH+eps ||
                    arrowTipPos.z < left.z-halfH-eps) {
                      continue;
                }
                console.log("barrier collision")
                barriers[i].reveal(this.color);
                this.hasCollided = true;
                return true;
            }
        }
        return false;
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
