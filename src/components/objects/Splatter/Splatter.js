import { Group, Color, DoubleSide, Mesh, MeshBasicMaterial, TextureLoader, Vector3 } from 'three';
import { DecalGeometry } from 'three/examples/jsm/geometries/DecalGeometry.js';
import SPLATTER from './splatter.png';
import CONSTS from '../../../constants';

class Splatter extends Group {
    constructor() {
        // Call parent Group() constructor
        super();

        this.name = 'splatter';
        // Inspired by https://threejs.org/examples/webgl_decals.html
        const textureLoader = new TextureLoader();
        this.texture = textureLoader.load(SPLATTER);

        this.materialBase = new MeshBasicMaterial({
            map: this.texture,
            transparent: true,
            depthTest: true,
            depthWrite: false,
            polygonOffset: true,
            polygonOffsetFactor: -4,
        });
    }

    getMesh(mesh, position, rotation, scale, color, isDouble) {
        // Update material
        const decalMat = this.materialBase.clone();
        color = color || CONSTS.randomColor();
        decalMat.color = new Color(color);
        if (isDouble) {
            decalMat.side = DoubleSide;
        }
        // Create decal geometry
        rotation.z = Math.random() * CONSTS.fullRotation;
        const decalGeom = new DecalGeometry(
            mesh, position, rotation, new Vector3(scale, scale, scale)
        );
        return new Mesh(decalGeom, decalMat);
    }

    // Client should dispose of invididual geometries and materials
    destruct() {
        this.texture.dispose();
        this.materialBase.dispose();
    }
}

export default Splatter;
