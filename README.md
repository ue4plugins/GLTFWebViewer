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
impossible to render certain models in PlayCanvas.

Please refrain from interacting with your computer while running the e2e tests as it may affect the test result.

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
