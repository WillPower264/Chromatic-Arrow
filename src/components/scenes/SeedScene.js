import * as Dat from 'dat.gui';
import { Scene, Color, MeshStandardMaterial, Mesh, PlaneBufferGeometry, Vector3, Spherical } from 'three';
import { Arrow, Flower, Land, Target } from 'objects';
import { BasicLights } from 'lights';
import _ from 'lodash';

class SeedScene extends Scene {
    constructor() {
        // Call parent Scene() constructor
        super();

        // Init state
        this.state = {
            gui: new Dat.GUI(), // Create GUI for scene
            rotationSpeed: 1,
            updateList: [],
            targets: [],
            maxTargets: 5,
            secondsBetweenTargets: 5,
        };

        // Set background to a nice color
        this.background = new Color(0x7ec0ee);
        // Set arrow and add
        this.arrow = new Arrow();
        this.add(this.arrow);

        // Add meshes to scene
        this.buildGround();
        const land = new Land();
        land.position.set(12, 0, 12);
        const flower = new Flower(this);
        flower.position.set(12, 0, 12);
        const lights = new BasicLights();
        this.add(land, flower, lights);

        // Throttled function
        this.throttledCreateTarget = _.throttle(this.createTarget, this.state.secondsBetweenTargets * 1000);

        // Populate GUI
        this.state.gui.add(this.state, 'rotationSpeed', -5, 5);

        // Add event listeners
        this.addEventListeners();
    }

    addToUpdateList(object) {
        this.state.updateList.push(object);
    }

    getRandomSphericalPosition() {
        const radius = _.random(20, 30);
        const phi = _.random(Math.PI / 6, Math.PI / 3);
        const theta = _.random(0, 2 * Math.PI);
        return new Spherical(radius, phi, theta);
    }

    createTarget() {
        if (this.state.targets.length >= this.state.maxTargets) { return; }

        const target = new Target();
        target.position.setFromSpherical(this.getRandomSphericalPosition());
        target.faceCenter(new Vector3(0, 2, 0));
        this.state.targets.push(target);
        this.add(target);
    }

    update(timeStamp) {
        const { rotationSpeed, updateList } = this.state;
        this.rotation.y = (rotationSpeed * timeStamp) / 10000;

        // Create targets if needed
        this.throttledCreateTarget();

        // Call update for each object in the updateList
        for (const obj of updateList) {
            obj.update(timeStamp);
        }
    }

    addEventListeners() {
        window.addEventListener("click", () => {
          this.arrow.setVelocity(new Vector3(0, 2, 5));
          console.log(this.arrow.velocity);
        }, false);
    }

    buildGround() {
        const ground = {};
        ground.textures = {};

        // ground material
        ground.material = new MeshStandardMaterial({
          color: 0x091200, //0x3c3c3c,
        //   specular: 0x404761, //0x3c3c3c//,
        //   metalness: 0.3,
        });

        // ground mesh
        ground.geometry = new PlaneBufferGeometry(500, 500);
        ground.mesh = new Mesh(ground.geometry, ground.material);
        ground.mesh.position.y = 0;
        ground.mesh.rotation.x = -Math.PI / 2;
        ground.mesh.receiveShadow = true;

        // handled in Scene.updateGroundTexture()
        // needed for ground texture
        // ground.texture = Scene.loader.load( "textures/terrain/grasslight-big.jpg" );
        // ground.texture.wrapS = ground.texture.wrapT = THREE.RepeatWrapping;
        // ground.texture.repeat.set( 25, 25 );
        // ground.texture.anisotropy = 16;
        // ground.material.map = ground.texture;

        this.add(ground.mesh); // add ground to scene

        // return ground;
    }
}

export default SeedScene;
