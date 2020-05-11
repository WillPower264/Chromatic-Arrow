import { Group, Vector3, MeshBasicMaterial, CylinderGeometry, Mesh, Spherical, Line3 } from 'three';
import _ from 'lodash';
import CONSTS from '../../../constants';

class Target extends Group {
    constructor(scene) {
        // Call parent Group() constructor
        super();

        // stores reference to scene
        this.scene = scene;

        this.name = 'target';
        const { colors, ringSize, thickness, radiusSegments } = CONSTS.target;
        for (let i = 0; i < colors.length; i++) {
            const radius = (i + 1) * ringSize;
            const height = thickness - 0.1 * i;
            const cylinder = new CylinderGeometry(radius, radius, height, radiusSegments);
            const mat = new MeshBasicMaterial({ color: colors[i] });
            const mesh = new Mesh(cylinder, mat);
            this.add(mesh);
        }
    }

    // Automatically rotates the target to face the camera
    faceCenter() {
        const defaultDir = CONSTS.directions.yAxis.clone();
        const desiredDir = CONSTS.camera.position.clone().sub(this.position);
        const angle = defaultDir.angleTo(desiredDir);
        const axis = defaultDir.cross(desiredDir).normalize();
        this.rotateOnAxis(axis, angle);
    }

    getRandomSphericalPosition() {
        const { innerRadius, outerRadius, minPhi, maxPhi } = CONSTS.target.spawn;
        const radius = _.random(innerRadius, outerRadius);
        const phi = _.random(minPhi, maxPhi);
        const theta = _.random(CONSTS.fullRotation);
        return new Spherical(radius, phi, theta);
    }

    checkPosition(pos) {
        const { targets, numTargetsInUse } = this.scene.state;
        const minDistSquared = Math.pow(CONSTS.target.minDistApart, 2);
        for (let i = 0; i < numTargetsInUse; i++) {
            const targetPos = targets[i].position;
            if (pos.distanceToSquared(targetPos) < minDistSquared) {
                return false;
            }
        }
        return true;
    }

    // Gives the target a random location away from other targets
    setRandomPosition() {
        let randSpherical, pos;
        do {
            randSpherical = this.getRandomSphericalPosition();
            pos = new Vector3().setFromSpherical(randSpherical);
        } while (!this.checkPosition(pos));
        this.position.copy(pos);
    }

    // 1 for outer ring, 5 for inner circle, < 1 if missed target
    getScore(pos) {
        const { colors, ringSize } = CONSTS.target;
        const line = new Line3(this.position, CONSTS.camera.position);
        const closest = new Vector3();
        line.closestPointToPoint(pos, true, closest);
        const dist = pos.distanceTo(closest);
        return colors.length - Math.floor(dist / ringSize);
    }

    remove() {
        const { targets } = this.scene.state;
        const ind = targets.indexOf(this);

        // This target isn't even in use
        if (ind >= this.scene.state.numTargetsInUse) { return; }

        // Remove this target from the scene
        this.scene.state.numTargetsInUse--;
        const { numTargetsInUse } = this.scene.state;
        targets[ind] = targets[numTargetsInUse];
        targets[numTargetsInUse] = new Target(this.scene);
        this.scene.remove(this);
    }

    destruct() {
        for (let i = 0; i < this.children.length; i++) {
            this.children[i].geometry.dispose();
            this.children[i].material.dispose();
        }
    }
}

export default Target;
