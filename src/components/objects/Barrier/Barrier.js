import { Group, BoxGeometry, Mesh, MeshBasicMaterial, Spherical, Color } from 'three';
import CONSTS from '../../../constants';
import _ from 'lodash';

class Barrier extends Group {
    constructor(n) {
        // Call parent Group() constructor
        super();

        this.name = 'barrier';

        // Set instance variables
        const { baseTheta, basePhiPeriod, basePhiScale } = CONSTS.barrier.movement;
        this.state = {
            thetaDelta: _.random(baseTheta * 0.5, baseTheta * 1.5) * (_.random(0, 1) * 2 - 1),
            phiPeriod: _.random(basePhiPeriod * 0.5, basePhiPeriod * 1.5),
            phiScale: _.random(basePhiScale * 0.5, basePhiScale * 1.5) * (_.random(0, 1) * 2 - 1),
            numHits: 0,
        };

        // Create invisible barrier with random position
        const { width, height, depth } = CONSTS.barrier;
        this.geom = new BoxGeometry(width, height, depth);
        this.material = new MeshBasicMaterial();
        this.add(new Mesh(this.geom, this.material));
        this.children[0].visible = false;
        this.setRandomPosition(n);
    }

    setRandomPosition(n) {
        // Calculate unique radius (so no intersections)
        const { innerRadius, outerRadius, minPhi, maxPhi } = CONSTS.barrier.spawn;
        const { numBarriers } = CONSTS.scene;
        const bandWidth = (outerRadius - innerRadius) / numBarriers;
        const radius = innerRadius + bandWidth * (n + 0.5);

        // Randomize spherical coordinates and set position
        const phi = _.random(minPhi, maxPhi);
        const theta = _.random(CONSTS.fullRotation);
        this.position.setFromSphericalCoords(radius, phi, theta);

        // Rotate to face camera
        this.rotateOnAxis(CONSTS.directions.yAxis.clone(), theta);
    }

    hit() {
        if (this.state.numHits === 0) {
            const { score } = CONSTS.barrier;
            window.dispatchEvent(new CustomEvent('addScore', { detail: { score } }));
        }
        this.state.numHits++;
    }

    conceal() {
        this.children[0].visible = false;
    }

    reveal(color) {
        const { defaultColor } = CONSTS.barrier;
        // Give the mesh a color and reveal it
        this.children[0].material.color = new Color(color || defaultColor);
        this.children[0].visible = true;
    }

    // Barriers always exist
    isDone() {
        return false;
    }

    update(timestamp) {
        // Move in circle with sinusoidal vertical motion
        const spherical = new Spherical().setFromVector3(this.position);
        spherical.theta += this.state.thetaDelta;
        spherical.phi += Math.sin(timestamp * this.state.phiPeriod) * this.state.phiScale;

        // Validate coordinates
        const { minPhi, maxPhi } = CONSTS.barrier.spawn;
        spherical.theta %= CONSTS.fullRotation;
        spherical.phi = _.clamp(spherical.phi, minPhi, maxPhi);
        this.position.setFromSpherical(spherical);

        // Rotate to face camera
        this.rotateOnAxis(CONSTS.directions.yAxis.clone(), this.state.thetaDelta);
    }

    destruct() {
        this.geom.dispose();
        this.material.dispose();
        // Splatters
        for (let i = 1; i < this.children.length; i++) {
            this.children[i].geometry.dispose();
            this.children[i].material.dispose();
        }
    }
}

export default Barrier;
