import { Group, BoxGeometry, Mesh, MeshBasicMaterial, Spherical } from 'three';
import CONSTS from '../../../constants';
import _ from 'lodash';

class Barrier extends Group {
    constructor() {
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

        const { width, height } = CONSTS.barrier;
        const geometry = new BoxGeometry(width, height, 0.5);
        const material = new MeshBasicMaterial({color: 0xffff00});
        const sphere = new Mesh(geometry, material);
        this.add(sphere);
        this.setRandomPosition();
    }

    setRandomPosition() {
        const { innerRadius, outerRadius, minPhi, maxPhi, fullRotation } = CONSTS.barrier.spawn;
        const radius = _.random(innerRadius, outerRadius);
        const phi = _.random(minPhi, maxPhi);
        const theta = _.random(0, fullRotation);
        this.position.setFromSphericalCoords(radius, phi, theta);
        this.rotateOnAxis(CONSTS.directions.yAxis.clone(), theta);
    }

    update(timestamp) {
        const { minPhi, maxPhi } = CONSTS.barrier.spawn;
        const spherical = new Spherical().setFromVector3(this.position);
        spherical.theta += this.state.thetaDelta;
        spherical.theta %= 2 * Math.PI;
        spherical.phi += Math.sin(timestamp * this.state.phiPeriod) * this.state.phiScale;
        if (spherical.phi < minPhi) { spherical.phi = minPhi; }
        if (spherical.phi > maxPhi) { spherical.phi = maxPhi; }
        this.position.setFromSpherical(spherical);
        this.rotateOnAxis(CONSTS.directions.yAxis.clone(), this.state.thetaDelta);
    }
}

export default Barrier;
