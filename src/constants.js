import { Vector3 } from 'three';

const CONSTS = {
    // keep these top level objects in alphabetical order
    arrow: {

    },
    camera: {
        position: new Vector3(0, 2, 0),
        initialDirection: new Vector3(0, 2, 1), // +z axis
        near: 1,    // for orthographic camera
        far: 10,    // for orthographic camera
    },
    directions: {
        // make sure you don't change these! use .clone()
        xAxis: new Vector3(1, 0, 0),
        yAxis: new Vector3(0, 1, 0),
        zAxis: new Vector3(0, 0, 1),
    },
    scene: {
        backgroundColor: 0x7ec0ee,
        groundColor: 0x091200,
        maxTargets: 5,
        msBetweenTargets: 5 * 1000,
    },
    target: {
        ringSize: 0.5,
        thickness: 0.5,
        minDistApart: 10,
        colors: [
            0xFFFF3D, // yellow
            0xED242C, // red
            0x62BDEC, // blue
            0x221E20, // black
            0xFFFFFF, // white
        ],
        radiusSegments: 16,
        spawn: {
            innerRadius: 30,
            outerRadius: 40,
            minPhi: Math.PI / 4,        // angle down from y axis
            maxPhi: 11 * Math.PI / 24,  // angle down from y axis
            fullRotation: 2 * Math.PI,
        },
    },
};

export default CONSTS;
