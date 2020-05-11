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

        // Collision helper and splatter
        this.helper = new Mesh(
            new BoxGeometry(1, 1, 10), new MeshStandardMaterial({color: 0xffffff})
        );
        this.helper.visible = false;
        this.splatter = new Splatter();

        // Firing arrow
        this.disableControls = false;
        this.isFiring = false;
        this.direction = new Vector3();
        this.beginFireStep = 0;
        this.currentStep = 0;
        this.barriersHit = 0;

        // Set background, ground, and lights
        this.background = new Color(backgroundColor);
        this.ground = this.createGround();
        this.dome = this.createDome();
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
            this.initializeBarriers();
            this.createTargets();
            this.changeWind();
            this.createWind();
        }
    }

    /* Update Lists */
    addToUpdateList(object) {
        this.state.updateList.push(object);
    }

    removeFromUpdateList(object) {
        const ind = this.state.updateList.indexOf(object);
        this.state.updateList[ind] = this.state.updateList.pop();
    }

    /* Targets */
    initializeTargets() {
        _.times(CONSTS.scene.maxTargets, () => {
            this.state.targets.push(new Target(this));
        });
    }

    spawnTarget(position) {
        // Check how many targets are in use
        if (this.state.numTargetsInUse < CONSTS.scene.maxTargets && this.state.targets !== null) {
            // Create new target
            const target = this.state.targets[this.state.numTargetsInUse];
            if (position === undefined) {
                target.setRandomPosition();
            } else {
                target.position.copy(position);
            }
            target.faceCenter();
            this.state.numTargetsInUse++;
            this.add(target);
        }
    }

    createTargets() {
        this.spawnTarget();
        // Call function again, but later
        _.delay(() => this.createTargets(), CONSTS.scene.msBetweenTargets);
    }

    /* Wind */
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

    /* Create barriers, ground, dome */
    initializeBarriers() {
        _.times(CONSTS.scene.numBarriers, (n) => {
            const barrier = new Barrier(n);
            this.add(barrier);
            this.addToUpdateList(barrier);
            this.state.barriers.push(barrier);
        });
    }

    createGround() {
        const { size, thickness, color, yPos } = CONSTS.ground;
        const geometry = new BoxGeometry(size, thickness, size);
        const material = new MeshStandardMaterial({ color });
        const mesh = new Mesh(geometry, material);
        mesh.receiveShadow = true;
        mesh.position.setY(yPos);
        this.add(mesh);
        return mesh;
    }

    createDome() {
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

    /* Splatter code */
    addSplatterGround(position, color) {
        const mesh = this.splatter.getMesh(
          this.ground,
          position,
          new Euler(-Math.PI/2, 0, 0),
          CONSTS.splatter.splatSize,
          color
        );
        this.add(mesh);
        this.state.splatters.push(mesh);
    }

    addSplatterBarrier(position, barrier, plane, color) {
        const projPos = new Vector3(0, 0, 0);
        plane.projectPoint(position, projPos);
        const rot = barrier.rotation.clone();
        const mesh = this.splatter.getMesh(
          barrier.children[0], projPos, rot, CONSTS.splatter.splatSize, color
        );
        mesh.renderOrder = barrier.children.length;
        barrier.attach(mesh);
        this.state.splatters.push(mesh);
    }

    addSplatterDome(position, color) {
        const domeHit = position.clone().normalize().multiplyScalar(CONSTS.dome.radius);
        const norm = position.clone().negate().normalize();
        this.helper.lookAt(norm);
        const mesh = this.splatter.getMesh(
            this.dome, domeHit, this.helper.rotation, CONSTS.splatter.splatSize, color, true
        );
        this.add(mesh);
        this.state.splatters.push(mesh);
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
                this.removeFromUpdateList(obj);
                this.remove(obj);
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
        barriers.forEach((barrier) => barrier.destruct());
        splatters.forEach((splatter) => {
            splatter.geometry.dispose();
            splatter.material.dispose();
        });
        targets.forEach((target) => target.destruct());
        winds.forEach((wind) => wind.destruct());


        // Remove pointers
        this.state.arrows = null;
        this.state.barriers = null;
        this.state.splatters = null;
        this.state.targets = null;
        this.state.winds = null;
        this.state.updateList = null;

        // Dispose collision helper, ground, and dome
        this.helper.geometry.dispose();
        this.helper.material.dispose();
        this.helper = null;
        this.ground.geometry.dispose();
        this.ground.material.dispose();
        this.ground = null;
        this.dome.geometry.dispose();
        this.dome.material.dispose();
        this.dome = null;

        // Dispose the scene
        this.dispose();
    }
}

export default GameScene;
