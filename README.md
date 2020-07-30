# Epic Games - glTF Web Viewer

Web viewer app for the Unreal Engine glTF Exporter Plugin. This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Prerequisites

- [Node.js](https://nodejs.org/en/) 12.0.0 or greater 

## Installation

```bash
npm install
```

Run in the project root to install all project dependencies.

## Running the development server

```bash
npm run start
```

Runs the app in the development mode. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Testing

### Unit tests

```bash
npm run test
```

Launches the unit test runner in interactive watch mode.

### E2E tests

Currently we can't run e2e tests in headless mode. This is due to limitations in headless Chromium that makes it
impossible to render certain models in PlayCanvas. Headless also seems less performant than headful when using WebGL.

Please refrain from interacting with your computer while running the e2e tests as it may affect the test result.

⚠️ Note that the snapshot results may vary depending on the hardware/OS the tests are run on. This is mainly due to
hardware and system specific settings that affect web and WebGL rendering.
**The E2E tests are intended to run in Docker in a CI environment where the snapshot result will be consistent.**
Currently the project is set up to work with GitLab CI using a Windows runner.

#### Run on GitLab CI

E2E tests will automatically run on GitLab CI. If they fail, the snapshot diff output will be saved as an artifact and
can be viewed/downloaded via the GitLab CI web GUI.

![E2E fail artifacts](docs/test_e2e_artifacts.png "E2E fail artifacts")

If the tests fail due to an expected or intentional diff, the baseline snapshot should be updated by manually triggering
job `test_e2e_update` in the GitLab CI web GUI. This will run the tests again with the `--updateSnapshot` argument and
automatically commit the updated snapshots to the same branch.

![E2E update job](docs/test_e2e_update.png "E2E update job")

#### Run on local machine

⚠️ Don't expect results to match exactly with baseline, as explained above.

```bash
npm run test:e2e
```

Runs all e2e tests once.

```bash
npm run test:e2e-watch
```

Launches the e2e test runner in watch mode.

```bash
npm run test:e2e-update
```

Runs e2e tests with the `--updateSnapshot` argument, automatically updating the snapshot baseline from the test result.

## Building

```bash
npm run build
```

Builds the app for production to the `build` folder. It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.
