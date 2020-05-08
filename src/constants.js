import { Vector3 } from 'three';

const CONSTS = {
    EPS: 0.0001,
    fullRotation: 2 * Math.PI,
    msTimeLimit: 60 * 1000,
    // keep these top level objects in alphabetical order
    arrow: {
        position: new Vector3(0, 1.9, 0),
        radius: 0.02,
        height: 1.0,
        radiusSegments: 8,
        tipColor: 0xFFFFFF,
        featherColor: 0xFFFFFF,
        numFeathers: 3,
        movement: {
            deltaT: 18 / 1000,
            damping: 0.03,
            gravity: new Vector3(0, -10, 0),
            forceFactor: 10,
            mass: 10,
            chargeRate: 0.01,
            maxForce: 80000,
        },
    },
    barrier: {
        width: 6,
        height: 6,
        depth: 0.2,
        spawn: {
            innerRadius: 15,
            outerRadius: 30,
            minPhi: Math.PI / 4,        // angle down from y axis
            maxPhi: 11 * Math.PI / 24,  // angle down from y axis
        },
        movement: {
            baseTheta: 0.005,
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
    crosshairs: {
        thickness: 1,
        size: 25,
        color: 0x999999,
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
        wind: {
          msBetweenSpawn: 100,
          msBetweenChange: 8 * 1000,
          minSpeed: 2,
          maxSpeed: 5,
        },
        numBarriers: 15,
        groundPos: 0,
    },
    scoreBox: {
        text: 'Score: ',
        style: {
            position: 'absolute',
            fontSize: '40px',
            color: 'white',
            padding: '10px',
            top: '10px',
        },
    },
    start: {
      stepsPerSplatter: 6,
      maxSplatters: 30,
      xMin: -7,
      xMax: 7,
      yMin: -3,
      yMax: 5,
      minSize: 5,
      maxSize: 7,
    },
    target: {
        radius: 2.5,
        ringSize: 0.5,              // total diameter is 5
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
        },
        disappearing: false,
        msDuration: 5 * 1000,
    },
    timer: {
        text: 'Time Left: ',
        style: {
            position: 'absolute',
            fontSize: '40px',
            color: 'white',
            padding: '10px',
            top: '50px',
        },
    },
    wind: {
        nPoints: 300,
        shownLength: 60,
        opacity: 0.4,
        thickness: 0.02,
        loopRad: 0.005,
        pathStep: 0.05,
    },
};

export default CONSTS;
