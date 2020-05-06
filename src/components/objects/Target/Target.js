import { Group, Vector3, MeshBasicMaterial, CylinderGeometry, Mesh, Spherical } from 'three';
import _ from 'lodash';
import CONSTS from '../../../constants';

class Target extends Group {
    constructor(parent) {
        // Call parent Group() constructor
        super();

        // stores reference to scene
        this.parent = parent;

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
        const { innerRadius, outerRadius, minPhi, maxPhi, fullRotation } = CONSTS.target.spawn;
        const radius = _.random(innerRadius, outerRadius);
        const phi = _.random(minPhi, maxPhi);
        const theta = _.random(0, fullRotation);
        return new Spherical(radius, phi, theta);
    }

    checkPosition(pos) {
        const { targets, numTargetsInUse } = this.parent.state;
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

    remove() {
        const ind = this.parent.state.targets.indexOf(this);

        // This target isn't even in use
        if (ind >= this.parent.state.numTargetsInUse) { return; }

        // Remove this target from the scene
        this.parent.state.numTargetsInUse--;
        this.parent.state.targets[ind] = this.parent.state.targets[this.parent.state.numTargetsInUse];
        this.parent.state.targets[this.parent.state.numTargetsInUse] = new Target(this.parent);
        this.parent.remove(this);

        // Increase score?
    }
}

export default Target;
