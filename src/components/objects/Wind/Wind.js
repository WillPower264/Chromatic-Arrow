import { Group, BufferGeometry, BufferAttribute, CatmullRomCurve3, DoubleSide, Mesh, MeshBasicMaterial, Vector3 } from 'three';
import CONSTS from '../../../constants';
import _ from 'lodash';

class Wind extends Group {
    constructor(speed, direction) {
        // Call parent Group() constructor
        super();

        this.name = 'wind';
        this.currStart = 0;
        this.speed = speed;

        // Create entire curve
        const curve = this.createCurve(direction);

        // Create planar geometry from curve
        this.geom = this.createGeometry(curve);

        // Choose which part of plane to display
        this.setVisibility();
        const material = new MeshBasicMaterial({
          color: 0xffffff,
          side: DoubleSide,
          opacity: CONSTS.wind.opacity,
          transparent: true
        });
        const mesh = new Mesh(this.geom, material);
        this.add(mesh);
    }

    createCurve(direction) {
        direction.normalize();
        let currPos = new Vector3(
          2*(Math.random()-0.5), 0.75*(Math.random()-0.2), 2*(Math.random()-0.5)
        );
        currPos.add(CONSTS.camera.position.clone());
        // Bias slightly away from direction of motion
        currPos.sub(direction.clone().multiplyScalar(0.2));
        const ps = [];
        // Straight
        for (let i = 0; i < 3; i++) {
            ps.push(currPos.clone());
            currPos.add(direction.clone().multiplyScalar(CONSTS.wind.pathStep*this.speed));
            const sign = (i % 2 == 0) ? 1 : -1;
        }
        // Add loop
        currPos.add(direction.clone().multiplyScalar(CONSTS.wind.loopRad));
        currPos.y += CONSTS.wind.loopRad;
        ps.push(currPos.clone());
        currPos.sub(direction.clone().multiplyScalar(CONSTS.wind.loopRad));
        currPos.y += CONSTS.wind.loopRad;
        ps.push(currPos.clone());
        currPos.sub(direction.clone().multiplyScalar(CONSTS.wind.loopRad));
        currPos.y -= CONSTS.wind.loopRad;
        ps.push(currPos.clone());
        currPos.add(direction.clone().multiplyScalar(CONSTS.wind.loopRad));
        currPos.y -= CONSTS.wind.loopRad;
        ps.push(currPos.clone());
        // Add tail at end
        for (let i = 0; i < 1; i++) {
            currPos.add(direction.clone().multiplyScalar(CONSTS.wind.pathStep/2));
            currPos.y += CONSTS.wind.loopRad/2;
            ps.push(currPos.clone());
        }
        return new CatmullRomCurve3(ps);
    }

    createGeometry(curve) {
        const geom = new BufferGeometry();
        // 2 faces per points, 3 vertices per face, and 3 dims
        geom.vertices = new Float32Array(CONSTS.wind.nPoints * 6 * 3);
        geom.setAttribute(
          'position', new BufferAttribute(geom.vertices, 3)
        );
        // Fit to curve
        const points = curve.getPoints(CONSTS.wind.nPoints);
        var normal = new Vector3(0, 0, 0);
        var binormal = new Vector3(0, 1, 0);
        let stepIdx = 0;
        for (let j = 0; j <= CONSTS.wind.nPoints; j++) {
          const tangent = curve.getTangent(j / CONSTS.wind.nPoints);
          normal.crossVectors(tangent, binormal);
          binormal.crossVectors(normal, tangent);
          normal.normalize().multiplyScalar(CONSTS.wind.thickness);

          const x1 = points[j].x + (-1/2) * normal.x;
          const y1 = points[j].y;
          const z1 = points[j].z + (-1/2) * normal.z;

          const x2 = points[j].x + (1/2) * normal.x;
          const y2 = points[j].y;
          const z2 = points[j].z + (1/2) * normal.z;

          if (j > 0) {
            // Complete face from last iter
            geom.vertices[stepIdx]  = x1;
            geom.vertices[stepIdx + 1]  = y1;
            geom.vertices[stepIdx + 2]  = z1;
            // Add second face -- need point from last iter
            geom.vertices[stepIdx + 3]  = geom.vertices[stepIdx-3];
            geom.vertices[stepIdx + 4]  = geom.vertices[stepIdx-2];
            geom.vertices[stepIdx + 5]  = geom.vertices[stepIdx-1];
            geom.vertices[stepIdx + 6]  = x1;
            geom.vertices[stepIdx + 7]  = y1;
            geom.vertices[stepIdx + 8]  = z1;
            geom.vertices[stepIdx + 9]  = x2;
            geom.vertices[stepIdx + 10]  = y2;
            geom.vertices[stepIdx + 11]  = z2;
            stepIdx += 12;
          }
          // Add new points again for next iter
          if (j < CONSTS.wind.nPoints) {
            geom.vertices[stepIdx]  = x1;
            geom.vertices[stepIdx + 1]  = y1;
            geom.vertices[stepIdx + 2]  = z1;
            geom.vertices[stepIdx + 3]  = x2;
            geom.vertices[stepIdx + 4]  = y2;
            geom.vertices[stepIdx + 5]  = z2;
            stepIdx += 6;
          }
        }
        geom.attributes.position.needsUpdate = true;
        return geom;
    }

    setVisibility() {
        const len = this.isDoneTracing() ? 0 : CONSTS.wind.shownLength*6;
        this.geom.setDrawRange(this.currStart, len);
    }

    isDoneTracing() {
        return this.currStart + CONSTS.wind.shownLength*6 >=
                 this.geom.attributes.position.count;
    }

    update() {
        this.currStart += this.speed*6;
        this.setVisibility();
    }
}

export default Wind;
