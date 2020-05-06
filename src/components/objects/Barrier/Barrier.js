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
        };

        // Create invisible barrier with random position
        const { width, height, depth } = CONSTS.barrier;
        const geometry = new BoxGeometry(width, height, depth);
        const material = new MeshBasicMaterial();
        this.add(new Mesh(geometry, material));
        this.visible = false;
        this.setRandomPosition(n);
    }

    setRandomPosition(n) {
        // Calculate unique radius (so no intersections)
        const { innerRadius, outerRadius, minPhi, maxPhi, fullRotation } = CONSTS.barrier.spawn;
        const { numBarriers } = CONSTS.scene;
        const bandWidth = (outerRadius - innerRadius) / numBarriers;
        const radius = innerRadius + bandWidth * (n + 0.5);

        // Randomize spherical coordinates and set position
        const phi = _.random(minPhi, maxPhi);
        const theta = _.random(0, fullRotation);
        this.position.setFromSphericalCoords(radius, phi, theta);

        // Rotate to face camera
        this.rotateOnAxis(CONSTS.directions.yAxis.clone(), theta);
    }

    reveal(color) {
        // Give the mesh a color and reveal it
        this.children[0].material.color = new Color(color || 'white');
        this.visible = true;
    }

    update(timestamp) {
        // Move in circle with sinusoidal vertical motion
        const spherical = new Spherical().setFromVector3(this.position);
        spherical.theta += this.state.thetaDelta;
        spherical.phi += Math.sin(timestamp * this.state.phiPeriod) * this.state.phiScale;

        // Validate coordinates
        const { minPhi, maxPhi, fullRotation } = CONSTS.barrier.spawn;
        spherical.theta %= fullRotation;
        spherical.phi = _.clamp(spherical.phi, minPhi, maxPhi);
        this.position.setFromSpherical(spherical);

        // Rotate to face camera
        this.rotateOnAxis(CONSTS.directions.yAxis.clone(), this.state.thetaDelta);
    }
}

export default Barrier;
