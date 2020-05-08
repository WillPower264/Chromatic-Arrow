import { Group, Mesh, MeshBasicMaterial, TextureLoader, Vector3 } from 'three';
import { DecalGeometry } from 'three/examples/jsm/geometries/DecalGeometry.js';
import SPLATTER from './splatter.png';
import CONSTS from '../../../constants';

class Splatter extends Group {
    constructor(mesh, position, rotation, scale, color) {
        // Call parent Group() constructor
        super();

        this.name = 'splatter';
        // Inspired by https://threejs.org/examples/webgl_decals.html
        const textureLoader = new TextureLoader();
        this.texture = textureLoader.load(SPLATTER);

        // Make sure there's a mesh
        if (mesh === undefined) { return; }

        // Create decal geometry, material, and mesh
        rotation.z = Math.random() * CONSTS.fullRotation;
        const decalGeom = new DecalGeometry(
            mesh, position, rotation, new Vector3(scale, scale, scale)
        );
        const decalMat = new MeshBasicMaterial({
            map: this.texture,
            color: color || Math.random() * 0xffffff,
            transparent: true,
            depthTest: true,
                depthWrite: false,
                polygonOffset: true,
                polygonOffsetFactor: -4
        });
        const decalMesh = new Mesh(decalGeom, decalMat);
        this.mesh = decalMesh;
    }
}

export default Splatter;
