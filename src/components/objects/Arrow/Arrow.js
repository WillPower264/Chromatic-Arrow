import { Group, Vector3, CylinderGeometry, ConeGeometry, MeshBasicMaterial, Mesh, Plane, Shape, ShapeGeometry, DoubleSide } from 'three';
import CONSTS from '../../../constants';
import _ from 'lodash';
import TrailRenderer from './TrailRenderer.js';

function hexToRGB(hex) {
    const rgb = {};
    rgb.r = ((hex >> 16) & 255) / 255.0;
    rgb.g = ((hex >> 8) & 255) / 255.0;
    rgb.b = (hex & 255) / 255.0;
    return rgb;
}

class Arrow extends Group {
    constructor(scene) {
        // Call parent Group() constructor
        super();

        this.scene = scene;

        this.name = 'arrow';
        this.netForce = new Vector3(0, 0, 0);
        this.hasCollided = false;
        this.color = Math.random() * 0xffffff;

        this.fired = false; // behavior is different after arrow is fired

        // Set position and direction
        const { position } = CONSTS.arrow;
        this.position.copy(position);
        this.previous = this.position.clone();
        this.direction = CONSTS.directions.yAxis.clone();

        // create arrow body
        const { radius, height, radiusSegments, tipColor } = CONSTS.arrow;
        this.halfLen = height / 2.0;
        const cylinder = new CylinderGeometry(radius, radius, height, radiusSegments);
        const mat = new MeshBasicMaterial({ color: this.color });
        const mesh = new Mesh(cylinder, mat);
        this.add(mesh);

        // create arrow tip - now invisible from bottom
        const tipLen = height / 10.0;
        const cone = new ConeGeometry(radius * 2, tipLen, radiusSegments, 1, true);
        const tipMat = new MeshBasicMaterial({ color: tipColor });
        // tipMat.side = DoubleSide;
        const coneMesh = new Mesh(cone, tipMat);
        coneMesh.position.set(0, this.halfLen, 0);
        this.arrowTipPos = this.position.clone().addScaledVector(this.direction, this.halfLen);
        this.add(coneMesh);

        // create arrow tail
        const { featherColor, numFeathers } = CONSTS.arrow;
        const featherShape = new Shape();
        // draw starting from (0, 0)
        featherShape.lineTo(0, tipLen*2);
        featherShape.lineTo(tipLen, tipLen);
        featherShape.lineTo(tipLen, -tipLen);
        featherShape.lineTo(0, 0);
        const feather = new ShapeGeometry(featherShape);
        const featherMat = new MeshBasicMaterial({ color: featherColor });
        featherMat.side = DoubleSide;

        let featherMesh; // need to attach trail to feather later
        _.times(numFeathers, (n) => {
            featherMesh = new Mesh(feather, featherMat);
            featherMesh.position.set(0, -this.halfLen, 0);
            featherMesh.rotateOnAxis(this.direction, n * CONSTS.fullRotation / numFeathers);
            this.add(featherMesh);
        });

        // create arrow trail
        // specify points to create planar trail-head geometry
        var trailHeadGeometry = [];
        trailHeadGeometry.push(
            new Vector3( 2.0*radius, 0.0, 0.0 ),
            new Vector3( 0.0, 0.0, 0.0 ),
            new Vector3( 0.0, 0.0, 2.0*radius )
        );
        // create the trail renderer object
        this.trail = new TrailRenderer( this, false );
        // create material for the trail renderer
        const trailMaterial = TrailRenderer.createBaseMaterial();
        const rgb = hexToRGB(this.color);
        trailMaterial.uniforms.headColor.value.set( rgb.r, rgb.g, rgb.b, 0.8 );
        trailMaterial.uniforms.tailColor.value.set( rgb.r, rgb.g, rgb.b, 0.35 );
        // specify length of trail
        const trailLength = height * 15.0;
        // initialize and activate the trail
        this.trail.initialize( trailMaterial, trailLength, false, 0, trailHeadGeometry, featherMesh );
        this.trail.activate();
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
            this.scene.addSplatterGround(this.position, this.color);
            return true;
        }
        return false;
    }

    handleTargetCollision() {
        // Check if arrow is in target area
        const camPos = CONSTS.camera.position;
        const arrowDist = this.arrowTipPos.distanceTo(camPos);
        const { thickness, spawn } = CONSTS.target;
        const { innerRadius, outerRadius } = spawn;
        if (arrowDist < innerRadius - thickness) { return false; }
        if (arrowDist > outerRadius) { return false; }

        // Check each target for collision
        const { targets, numTargetsInUse } = this.scene.state;
        for (let i = 0; i < numTargetsInUse; i++) {
            const target = targets[i];
            const targetDist = target.position.distanceTo(camPos) - thickness / 2;

            // check arrow has reached target's distance
            if (arrowDist < targetDist) { continue; }

            // check arrow close enough to target
            const score = target.getScore(this.arrowTipPos);
            if (score > 0) {
                window.dispatchEvent(new CustomEvent('addScore', { detail: { score } }));
                target.remove();
                this.hasCollided = true;
                return true;
            }
        }
        return false;
    }

    handleBarrierCollision() {
        // Check if arrow is in barrier area
        const arrowTipPos = this.arrowTipPos;
        const camPos = CONSTS.camera.position;
        const arrowDist = arrowTipPos.distanceTo(camPos);
        const { depth, spawn } = CONSTS.barrier;
        const { innerRadius, outerRadius } = spawn;
        if (arrowDist < innerRadius - depth) { return false; }
        if (arrowDist > outerRadius) { return false; }

        // Check each barrier for collision
        const { barriers } = this.scene.state;
        for (let i = 0; i < barriers.length; i++) {
            const barrierPos = barriers[i].position;

            // intersect barrier's bounding sphere
            const halfW = CONSTS.barrier.width / 2;
            const halfH = CONSTS.barrier.height / 2;
            const halfDiagLen = halfW ** 2 + halfH ** 2;
            if (barrierPos.distanceToSquared(arrowTipPos) > halfDiagLen) {
                continue;
            }

            // travels at least far enough to hit target
            const dist = Math.sqrt(barrierPos.x ** 2 + barrierPos.z ** 2);
            const normal = new Vector3(
                -barrierPos.x, 0, -barrierPos.z
            ).normalize();
            const barrierPlane = new Plane(normal, dist);
            const eps = CONSTS.target.thickness + CONSTS.EPS;
            if (barrierPlane.distanceToPoint(arrowTipPos) <= eps) {
                // Check y
                if (arrowTipPos.y > barrierPos.y + halfH + eps ||
                    arrowTipPos.y < barrierPos.y - halfH - eps) {
                    continue;
                }
                // Check x/z
                const vec = new Vector3(
                    barrierPos.z, 0, -barrierPos.x
                ).normalize().multiplyScalar(halfW); // Perp to normal vec
                const right = barrierPos.clone().add(vec);
                const left = barrierPos.clone().add(vec.multiplyScalar(-1));
                const minX = right.x < left.x ? right.x : left.x;
                const maxX = right.x < left.x ? left.x : right.x;
                const minZ = right.z < left.z ? right.z : left.z;
                const maxZ = right.z < left.z ? left.z : right.z;
                if (arrowTipPos.x > maxX + halfH + eps ||
                    arrowTipPos.x < minX - halfH - eps ||
                    arrowTipPos.z > maxZ + halfH + eps ||
                    arrowTipPos.z < minZ - halfH - eps) {
                    continue;
                }
                this.scene.addSplatterBarrier(
                    arrowTipPos.clone(), barriers[i], barrierPlane, this.color
                );
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
    integrate() {
        const { damping, deltaT, mass } = CONSTS.arrow.movement;
        const currPos = this.position.clone();
        const nextPos = currPos.clone();
        nextPos.addScaledVector(currPos.clone().sub(this.previous), 1 - damping);
        nextPos.addScaledVector(this.netForce, deltaT * deltaT / mass);
        this.position.copy(nextPos);
        this.previous.copy(currPos);

        this.netForce.set(0, 0, 0);
    }

    isDone() {
        return this.hasCollided;
    }

    //
    update(timeStamp, windForce) {
        const { gravity, mass, forceFactor } = CONSTS.arrow.movement;
        // apply physics after arrow fired
        if (this.fired) {
            const gravForce = gravity.clone();
            this.addForce(gravForce.multiplyScalar(mass*forceFactor));
            this.addForce(windForce.multiplyScalar(mass*forceFactor));
            this.integrate();

            this.pointToward(this.position.clone().sub(this.previous));
        }
        this.arrowTipPos = this.position.clone().addScaledVector(this.direction, this.halfLen);

        this.trail.advance();

        this.handleCollisions(); // call this in the simulation file?
    }
}

export default Arrow;
