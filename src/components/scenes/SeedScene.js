import { Scene, BoxGeometry, Color, Euler, MeshStandardMaterial, Mesh, Vector3 } from 'three';
import { Arrow, Target, Barrier, Splatter, Wind } from 'objects';
import { BasicLights } from 'lights';
import _ from 'lodash';
import CONSTS from '../../constants';

class SeedScene extends Scene {
    constructor() {
        // Call parent Scene() constructor
        super();

        // Get constants
        const { backgroundColor } = CONSTS.scene;

        // Init state
        this.state = {
            updateList: [],
            targets: [],
            numTargetsInUse: 0,
            barriers: [],
        };

        // Firing arrow
        this.disableControls = false;
        this.isFiring = false;
        this.direction = new Vector3();
        this.beginFireStep = 0;
        this.currentStep = 0;

        // Set background to a nice color
        this.background = new Color(backgroundColor);

        // Set arrow and add, add to update list
        this.currentArrow = new Arrow(this);
        this.add(this.currentArrow);
        this.addToUpdateList(this.currentArrow);

        // Set up targets, barriers, and wind
        this.initializeTargets();
        this.initializeBarriers();
        this.changeWind();

        // Add meshes to scene
        this.ground = this.initializeGround();
        const lights = new BasicLights();
        this.add(lights);

        // Create targets and wind
        this.createTarget();
        this.createWind();
        this.changeWind();

        // Add event listeners
        this.addEventListeners();
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

    createTarget() {
        // Check how many targets are in use
        if (this.state.numTargetsInUse < CONSTS.scene.maxTargets) {
            // Create new target
            const { disappearing, msDuration } = CONSTS.target;
            const target = this.state.targets[this.state.numTargetsInUse];
            target.setRandomPosition();
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
        // Call function again, but later
        _.delay(() => this.createTarget(), CONSTS.scene.msBetweenTargets);
    }

    changeWind() {
        const direction = 2*Math.PI*Math.random();
        const { minSpeed, maxSpeed } = CONSTS.scene.wind;
        const speed = _.random(minSpeed, maxSpeed, true);
        this.windVec = new Vector3(
          speed*Math.cos(direction), 0, speed*Math.sin(direction)
        ).normalize();
        this.windSpeed = Math.round(speed);
        _.delay(() => this.changeWind(), CONSTS.scene.wind.msBetweenChange);
    }

    // TODO: Dispose when done
    createWind() {
        const wind = new Wind(this.windSpeed, this.windVec);
        this.add(wind);
        this.state.updateList.push(wind);
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

    // TODO: scale by impact velocity
    addSplatterGround(position, color) {
        const splat = new Splatter(
          this.ground.mesh, position, new Euler(-Math.PI/2, 0, 0), CONSTS.splatter.splatSize, color
        );
        this.add(splat.mesh);
    }

    // TODO: scale by impact velocity
    addSplatterBarrier(position, barrier, plane, color) {
        const projPos = new Vector3(0, 0, 0);
        plane.projectPoint(position, projPos);
        const rot = new Euler(0, Math.atan2(plane.normal.x, plane.normal.z), 0);
        const splat = new Splatter(
          barrier.children[0], projPos, rot, CONSTS.splatter.splatSize, color
        );
        barrier.attach(splat.mesh);
    }

    initializeBarriers() {
        _.times(CONSTS.scene.numBarriers, (n) => {
            const barrier = new Barrier(n);
            this.add(barrier);
            this.addToUpdateList(barrier);
            this.state.barriers.push(barrier);
        });
    }

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

    addEventListeners() {
        window.addEventListener("mousedown", () => {
            this.isFiring = true;
        }, false);

        window.addEventListener("mouseup", () => {
            // Shoot this arrow
            if (this.disableControls) return;

            const { chargeRate, baseForce, maxForce} = CONSTS.arrow.movement;
            const totalTime = this.currentStep - this.beginFireStep;
            const factor = Math.min(totalTime * chargeRate, 1);
            this.currentArrow.addForce(
              this.direction.normalize().clone().multiplyScalar(
                baseForce + factor * maxForce
              )
            );
            // Create new arrow
            this.currentArrow = new Arrow(this);
            this.add(this.currentArrow);
            this.addToUpdateList(this.currentArrow);
            this.isFiring = false;
        }, false);

        // TODO: remove
        window.addEventListener('keydown', () => {
            if (this.disableControls) return;
            const randIdx = _.random(CONSTS.scene.numBarriers - 1);
            const randCol = Math.random() * 0xffffff;
            this.state.barriers[randIdx].reveal(randCol);
        });
    }

    removeEventListeners() {
        window.removeEventListener("mousedown", this.setFiring.bind(this), false);
        window.removeEventListener("mouseup", this.fireArrow.bind(this), false);
        window.removeEventListener('keydown', this.revealRandBarrier.bind(this));
    }

    initializeGround() {
        const ground = {};
        ground.textures = {};

        // ground material
        ground.material = new MeshStandardMaterial({
            color: CONSTS.scene.groundColor, //0x3c3c3c,
            //   specular: 0x404761, //0x3c3c3c//,
            //   metalness: 0.3,
        });

        // ground mesh
        ground.geometry = new BoxGeometry(500, 1, 500);
        ground.mesh = new Mesh(ground.geometry, ground.material);
        ground.mesh.position.y = CONSTS.scene.groundPos;
        ground.mesh.receiveShadow = true;

        // handled in Scene.updateGroundTexture()
        // needed for ground texture
        // ground.texture = Scene.loader.load( "textures/terrain/grasslight-big.jpg" );
        // ground.texture.wrapS = ground.texture.wrapT = THREE.RepeatWrapping;
        // ground.texture.repeat.set( 25, 25 );
        // ground.texture.anisotropy = 16;
        // ground.material.map = ground.texture;
        this.add(ground.mesh); // add ground to scene
        return ground;
    }
}

export default SeedScene;
