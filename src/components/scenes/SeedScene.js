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
        const { backgroundColor, msBetweenTargets } = CONSTS.scene;
        const { msBetweenSpawn, msBetweenChange }  = CONSTS.scene.wind;

        // Init state
        this.state = {
            updateList: [],
            targets: [],
            numTargetsInUse: 0,
            barriers: [],
        };

        // Firing arrow
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

        // Throttled functions
        this.throttledCreateTarget = _.throttle(
            this.createTarget,
            msBetweenTargets
        );

        this.throttledCreateWind = _.throttle(
            this.createWind,
            msBetweenSpawn
        );

        this.throttledChangeWind = _.throttle(
            this.changeWind,
            msBetweenChange
        );

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
        this.removeEventListeners();
    }

    createTarget() {
        // Check how many targets are in use
        if (this.state.numTargetsInUse >= CONSTS.scene.maxTargets) { return; }

        const target = this.state.targets[this.state.numTargetsInUse];
        target.setRandomPosition();
        target.faceCenter();
        this.state.numTargetsInUse++;
        this.add(target);
        if (CONSTS.target.disappearing) {
            _.delay(() => {
                if (target.parent !== null) {
                    target.remove();
                }
            }, CONSTS.target.msDuration);
        }
    }

    changeWind() {
        const direction = 2*Math.PI*Math.random();
        const { minSpeed, maxSpeed } = CONSTS.scene.wind;
        const speed = minSpeed + (maxSpeed-minSpeed)*Math.random();
        this.windVec = new Vector3(
          speed*Math.cos(direction), 0, speed*Math.sin(direction)
        ).normalize();
        this.windSpeed = Math.round(speed);
    }

    // TODO: Dispose when done
    createWind() {
        const wind = new Wind(this.windSpeed, this.windVec);
        this.add(wind);
        this.state.updateList.push(wind);
    }

    initializeTargets() {
        _.times(CONSTS.scene.maxTargets, () => {
            this.state.targets.push(new Target(this));
        });
    }

    removeObj(obj) {
        // Swap the places so there is no hole
        const len = this.state.updateList.length;
        const ind = this.state.updateList.indexOf(obj);
        this.state.updateList[ind] = this.state.updateList[len-1];
        this.state.updateList.pop();
        this.remove(obj);
    }

    // TODO: scale by impact velocity
    addSplatterGround(position, color) {
        const splat = new Splatter(
          this.ground.mesh, position, new Euler(-Math.PI/2, 0, 0), 1, color
        );
        this.add(splat.mesh);
    }

    // TODO: scale by impact velocity
    addSplatterBarrier(position, barrier, plane, color) {
        const projPos = new Vector3(0, 0, 0);
        plane.projectPoint(position, projPos);
        const rot = new Euler(0, Math.atan2(plane.normal.x, plane.normal.z), 0);
        const splat = new Splatter(
          barrier.children[0], projPos, rot, 1, color
        );
        barrier.attach(splat.mesh);
        barrier.children[0].visible = false;
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

        // Update targets and wind if needed
        this.throttledCreateTarget();
        this.throttledCreateWind();
        this.throttledChangeWind();

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

    setFiring() {
        this.isFiring = true;
    }

    fireArrow() {
        // Shoot this arrow
        const totalTime = this.currentStep - this.beginFireStep;
        const factor = Math.min(totalTime*CONSTS.arrow.movement.chargeRate, 1);
        this.currentArrow.addForce(
          this.direction.normalize().clone().multiplyScalar(
            factor*CONSTS.arrow.movement.maxForce
          )
        );
        // Create new arrow
        this.currentArrow = new Arrow(this);
        this.add(this.currentArrow);
        this.addToUpdateList(this.currentArrow);
        this.isFiring = false;
    }

    revealRandBarrier() {
        const randIdx = _.random(CONSTS.scene.numBarriers - 1);
        const randCol = Math.random() * 0xffffff;
        this.state.barriers[randIdx].reveal(randCol);
    }

    addEventListeners() {
        window.addEventListener("mousedown", this.setFiring, false);
        window.addEventListener("mouseup", this.fireArrow, false);
        window.addEventListener('keydown', this.revealRandBarrier);
    }

    removeEventListeners() {
        window.removeEventListener("mousedown", this.setFiring, false);
        window.removeEventListener("mouseup", this.fireArrow, false);
        window.removeEventListener('keydown', this.revealRandBarrier);
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
