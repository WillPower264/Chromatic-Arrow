import { Scene, BoxGeometry, Color, Euler, MeshStandardMaterial, Mesh, Vector3, SphereGeometry, ShaderMaterial, BackSide} from 'three';
import { Arrow, Target, Barrier, Splatter, Wind } from 'objects';
import { BasicLights } from 'lights';
import _ from 'lodash';
import CONSTS from '../../constants';

class GameScene extends Scene {
    constructor(isTutorial) {
        // Call parent Scene() constructor
        super();

        // Get constants
        const { backgroundColor } = CONSTS.scene;

        // Init state
        this.state = {
            updateList: [],
            numTargetsInUse: 0,
            targets: [],
            barriers: [],
            arrows: [],
            splatters: [],
            winds: [],
        };

        // Collision helper
        this.helper = new Mesh(
            new BoxGeometry(1, 1, 10), new MeshStandardMaterial({color: 0xffffff})
        );
        this.helper.visible = false;

        // Firing arrow
        this.disableControls = false;
        this.isFiring = false;
        this.direction = new Vector3();
        this.beginFireStep = 0;
        this.currentStep = 0;
        this.barriersHit = 0;

        // Set background, ground, and lights
        this.background = new Color(backgroundColor);
        this.ground = this.initializeGround();
        this.dome = this.initializeDome();
        const lights = new BasicLights();
        this.add(lights);

        // Set arrow and add, add to update list
        this.currentArrow = new Arrow(this);
        this.add(this.currentArrow);
        this.addToUpdateList(this.currentArrow);
        this.state.arrows.push(this.currentArrow);

        // Set up for targets and wind
        this.initializeTargets();
        this.windVec = new Vector3(0, 0, 0);
        this.windSpeed = 0;

        // Create barriers, targets, and wind
        if (!isTutorial) {
            this.createBarriers();
            this.createTargetLoop();
            this.changeWind();
            this.createWind();
        }
    }

    addToUpdateList(object) {
        this.state.updateList.push(object);
    }

    end() {
        // Reveal barriers
        const { barriers } = this.state;
        for (let i = 0; i < barriers.length; i++) {
            barriers[i].reveal();
        }
        // Disable user input
        this.disableControls = true;
    }

    spawnTarget(position) {
        // Check how many targets are in use
        if (this.state.numTargetsInUse < CONSTS.scene.maxTargets &&
            this.state.targets !== null) {
            // Create new target
            const { disappearing, msDuration } = CONSTS.target;
            const target = this.state.targets[this.state.numTargetsInUse];
            if (position === undefined) {
                target.setRandomPosition();
            } else {
                target.position.copy(position);
            }
            target.faceCenter();
            this.state.numTargetsInUse++;
            this.add(target);

            // Set timer to disappear
            if (disappearing) {
                _.delay(() => {
                    if (target.parent !== null) {
                        target.remove();
                    }
                }, msDuration);
            }
        }
    }

    createTargetLoop() {
        this.spawnTarget();
        // Call function again, but later
        _.delay(() => this.createTargetLoop(), CONSTS.scene.msBetweenTargets);
    }

    changeWind() {
        if (this.state.winds === null) {
            return;
        }
        const direction = 2*Math.PI*Math.random();
        const { minSpeed, maxSpeed } = CONSTS.scene.wind;
        const speed = _.random(minSpeed, maxSpeed, true);
        this.windVec = new Vector3(
          speed*Math.cos(direction), 0, speed*Math.sin(direction)
        ).normalize();
        this.windSpeed = Math.round(speed);
        _.delay(() => this.changeWind(), CONSTS.scene.wind.msBetweenChange);
    }

    createWind() {
        if (this.state.winds === null) {
            return;
        }
        const wind = new Wind(this.windSpeed, this.windVec);
        this.add(wind);
        this.state.updateList.push(wind);
        this.state.winds.push(wind);
        _.delay(() => this.createWind(), CONSTS.scene.wind.msBetweenSpawn);
    }

    initializeTargets() {
        _.times(CONSTS.scene.maxTargets, () => {
            this.state.targets.push(new Target(this));
        });
    }

    removeObj(obj) {
        // Remove from updateList
        const ind = this.state.updateList.indexOf(obj);
        this.state.updateList[ind] = this.state.updateList.pop();

        // Remove from scene
        this.remove(obj);
    }

    addSplatterGround(position, color) {
        const splat = new Splatter(
          this.ground,
          position,
          new Euler(-Math.PI/2, 0, 0),
          CONSTS.splatter.splatSize,
          color
        );
        this.add(splat.mesh);
        this.state.splatters.push(splat);
    }

    addSplatterBarrier(position, barrier, plane, color) {
        const projPos = new Vector3(0, 0, 0);
        plane.projectPoint(position, projPos);
        const rot = barrier.rotation.clone();
        const splat = new Splatter(
          barrier.children[0], projPos, rot, CONSTS.splatter.splatSize, color
        );
        splat.mesh.renderOrder = barrier.children.length;
        barrier.attach(splat.mesh);
        this.state.splatters.push(splat);
    }

    addSplatterDome(position, color) {
        const domeHit = position.clone().normalize().multiplyScalar(CONSTS.dome.radius);
        const norm = position.clone().negate().normalize();
        this.helper.lookAt(norm);
        const splat = new Splatter(
            this.dome, domeHit, this.helper.rotation, CONSTS.splatter.splatSize, color, true
        );
        this.add(splat.mesh);
        this.state.splatters.push(splat);
    }

    createBarriers() {
        _.times(CONSTS.scene.numBarriers, (n) => {
            const barrier = new Barrier(n);
            this.add(barrier);
            this.addToUpdateList(barrier);
            this.state.barriers.push(barrier);
        });
    }

    initializeGround() {
        const { size, thickness, color, yPos } = CONSTS.ground;
        const geometry = new BoxGeometry(size, thickness, size);
        const material = new MeshStandardMaterial({ color });
        const mesh = new Mesh(geometry, material);
        mesh.receiveShadow = true;
        mesh.position.setY(yPos);
        this.add(mesh);
        return mesh;
    }

    initializeDome() {
        // Create dome geometry
        const { radius, numSegments } = CONSTS.dome;
        const geometry = new SphereGeometry(radius, numSegments, numSegments);
        geometry.computeFlatVertexNormals();

        // Create dome material
        const uniforms = {};
        const vertexShader = `
        varying vec3 vNormal;
        void main() {
            vNormal = normal;
            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }`;
        const fragmentShader = `
        precision highp float;
        varying vec3 vNormal;
        void main() {
            // feed into our frag colour
            vec3 colors = normalize(vNormal)/3.5 + 0.1;
            gl_FragColor = vec4(colors, 1.0);
        }`;
        const shadeMat =  new ShaderMaterial({
            uniforms,
            fragmentShader,
            vertexShader,
            side: BackSide,
        });

        // Create dome mesh
        const mesh = new Mesh(geometry, shadeMat);
        this.add(mesh);
        return mesh;
    }

    /* Event handlers */
    mousedownHandler() {
        this.isFiring = true;
        window.dispatchEvent(new CustomEvent('newArrowColor', {detail: { color: this.currentArrow.color}}));
    }

    mouseupHandler() {
        if (this.disableControls) { return; }
        const { chargeRate, baseForce, maxForce} = CONSTS.arrow.movement;
        const totalTime = this.currentStep - this.beginFireStep;
        const factor = Math.min(totalTime * chargeRate, 1);
        this.currentArrow.addForce(
            this.direction.normalize().clone().multiplyScalar(
            baseForce + factor * maxForce
            )
        );
        // Create new arrow
        const { arrows } = this.state;
        this.currentArrow = new Arrow(this);
        this.add(this.currentArrow);
        this.addToUpdateList(this.currentArrow);
        arrows.push(this.currentArrow);
        this.isFiring = false;
    }

    /* Update */
    update(timeStamp) {
        const { updateList } = this.state;

        // Firing arrow
        this.currentStep++;
        if (!this.isFiring) {
            this.beginFireStep = this.currentStep;
        }

        // Call update for each object in the updateList
        const len = updateList.length;
        for (let i = len-1; i >= 0; i--) {
            const obj = updateList[i];
            if (obj.isDone()) {
                this.removeObj(obj);
            } else {
                const windForce = this.windVec.clone().multiplyScalar(
                  this.windSpeed
                );
                obj.update(timeStamp, windForce);
            }
        }
    }

    /* Clean up */
    destruct() {
        // Destruct game objects
        const { arrows, barriers, splatters, targets, winds } = this.state;
        arrows.forEach((arrow) => arrow.destruct());
        this.state.arrows = null;
        barriers.forEach((barrier) => barrier.destruct());
        this.state.barriers = null;
        splatters.forEach((splatter) => splatter.destruct());
        this.state.splatters = null;
        targets.forEach((target) => target.destruct());
        this.state.targets = null;
        winds.forEach((wind) => wind.destruct());
        this.state.winds = null;

        // Dispose ground and dome
        this.ground.geometry.dispose();
        this.ground.material.dispose();
        this.dome.geometry.dispose();
        this.dome.material.dispose();

        // Dispose the scene
        this.dispose();
    }
}

export default GameScene;
