# Chromatic Arrow - COS 426 Final Project

Chromatic Arrow is a game that consists of shooting arrows at targets that randomly spawn in 360 degrees around the player. Arrows follow the laws of physics, so you have to deal with forces like gravity and wind as you aim. There are also invisible barriers throughout the scene that you can reveal by hitting them with paint-filled arrows. The more you shoot, the more of the level you uncover! You score points by revealing these walls and hitting the targets before time runs out.

[Online Demo](https://willpower264.github.io/Chromatic-Arrow)

## Installation
To build this project, GitHub's NodeJS Package Manager (npm) is needed to manage and install project dependencies. All npm settings, as well as project dependencies and their versionings, are defined in the file `package.json`. With [NodeJS and npm](https://www.npmjs.com/get-npm) installed, just run `npm install`.

## Launching a Local Webserver
Now that the development environment is ready to go, spin up a local development webserver using `npm start`. This command will bundle the project code and start a development server at [http://localhost:8080/](http://localhost:8080/).

## Building the Project for the Web
To build a production bundle, execute `npm run build`. This will place an optimized and minified executable version of your project in the `./build/` directory. Test out this production build by setting `./build/` as the working directory and starting out a python server.

With a working production build, deploy the project straight to GitHub Pages via `npm run deploy`. Note that this requires that (1) the project is part of a repository, and (2) the project's `package.json` file is set up correctly.

## Credits

This project was built off the sample skeleton project [three seed](https://reillybova.github.io/three-seed/) by Reilly Bova, which was was adapted from [edwinwebb's ThreeJS seed project](https://github.com/edwinwebb/three-seed]).

## License
[MIT](./LICENSE)
