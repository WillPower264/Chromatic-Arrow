import { Vector3 } from 'three';

const CONSTS = {
    // keep these top level objects in alphabetical order
    arrow: {

    },
    barrier: {
        width: 3,
        height: 3,
        spawn: {
            innerRadius: 20,
            outerRadius: 30,
            minPhi: Math.PI / 4,        // angle down from y axis
            maxPhi: 11 * Math.PI / 24,  // angle down from y axis
            halfRotation: Math.PI,
            fullRotation: 2 * Math.PI,
        },
        movement: {
            baseTheta: 0.01,
            basePhiPeriod: 0.001,
            basePhiScale: 0.001,
        },
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
        maxTargets: 10,
        msBetweenTargets: 5 * 1000,
        numBarriers: 10,
    },
    target: {
        ringSize: 0.5,              // total radius is 5
        thickness: 0.5,             // yellow is 0.5 thick, white is 0.1
        minDistApart: 15,
        colors: [
            0xFFFF3D, // yellow
            0xED242C, // red
            0x62BDEC, // blue
            0x221E20, // black
            0xFFFFFF, // white
        ],
        radiusSegments: 32,             // more segments = rounder target
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
