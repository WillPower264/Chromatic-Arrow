import { Vector3, Color } from 'three';

const CONSTS = {
    EPS: 0.0001,
    fullRotation: 2 * Math.PI,
    timeLimit: 60,          // in seconds
    msEndDelay: 1 * 1000,
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
            gravity: new Vector3(0, -6.9, 0),
            forceFactor: 10,
            mass: 10,
            chargeRate: 0.01,
            baseForce: 40000,
            maxForce: 40000,
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
    bloom: {
        exposure: 1,
        strength: 0.5,
        threshold: 0,
        radius: 0,
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
    dome: {
        radius: 45,
        color: 0xff0000,
        numSegments: 32,
    },
    ground: {
        // color: 0x136d15,
        color: 0x0a0a0f,
        size: 500,
        thickness: 1,
        yPos: 0,
    },
    powerBar: {
        width: 250,
        height: 50,
        buffer: 25,
        edgeThickness: 5,
        edgeColor: 'black',
        fillColor: 'red',
        text: 'Power Bar',
        style: {
            position: 'absolute',
            fontFamily: 'Verdana',
            fontSize: '40px',
            color: 'white',
            right: '45px',
            bottom: '28px',
        },
    },
    randomColor: () => {
        const h = Math.random();
        const s = 1;
        const l = 0.5;
        return new Color().setHSL(h, s, l).getHex();
    },
    scene: {
        backgroundColor: 0x050040, // 0x7ec0ee,
        maxTargets: 10,
        msBetweenTargets: 5 * 1000,
        wind: {
          msBetweenSpawn: 100,
          msBetweenChange: 12 * 1000,
          minSpeed: 1,
          maxSpeed: 3,
        },
        numBarriers: 15,
    },
    scoreBox: {
        text: 'Score: ',
        style: {
            position: 'absolute',
            fontFamily: 'Verdana',
            fontSize: '40px',
            color: 'white',
            left: '10px',
            top: '10px',
        },
    },
    splatter: {
        splatSize: 4,
    },
    start: {
      stepsPerSplatter: 6,
      maxSplatters: 15,
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
            0xccb800, // yellow
            0xB800AB, // pink
            0x0077B8, // blue
            0x0f00b3, // purple
            0xAAAAAA, // white
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
            fontFamily: 'Verdana',
            fontSize: '40px',
            color: 'white',
            right: '10px',
            top: '10px',
        },
    },
    tutorial: {
        style: {
            position: 'absolute',
            fontFamily: 'Verdana',
            fontSize: '20px',
            color: 'white',
            top: '80%',
        },
        initialTargetPosition: new Vector3(0, 3, 31),
        texts: {
            initial: 'Hold click to charge up a shot and hit the target. Score points by hitting each target near the center within the time limit.',
            lookAround: 'Targets spawn all around you. Use the mouse to look around.',
            wind: 'Arrows are also affected by wind. Aim carefully.',
            barriers: 'Invisible barriers can block your shots. Shoot one to reveal it.',
            finish: 'You\'re ready to go! Hit the last target to complete the tutorial.',
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

CONSTS.dome.color = CONSTS.scene.backgroundColor;

export default CONSTS;
