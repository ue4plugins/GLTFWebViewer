## [1.5.0](http://animech[secure]/clients/epic/gltf-web-viewer/compare/v1.4.0...v1.5.0) (2020-08-19)


### Features

* hide animation selector since we don't want users to be able to turn off non-hotspot animations ([bc4a194](http://animech[secure]/clients/epic/gltf-web-viewer/commit/bc4a194c544e38025022907bb7682043d3b4ba2a))

## [1.4.0](http://animech[secure]/clients/epic/gltf-web-viewer/compare/v1.3.1...v1.4.0) (2020-08-18)


### Features

* only show default camera if no other orbit cameras are present in glTF scene ([db3c0fd](http://animech[secure]/clients/epic/gltf-web-viewer/commit/db3c0fd2aa5f385f0b3b5ddbc80279715a37f636))
* update PlayCanvas scenes to use ACES tonemapping ([43b751a](http://animech[secure]/clients/epic/gltf-web-viewer/commit/43b751a1477509ab58fec5d6f0794e731c1c17a4))


### Bug Fixes

* init cameras with proper hotspot states ([5d91f84](http://animech[secure]/clients/epic/gltf-web-viewer/commit/5d91f84bdc2a168d9966b75c7523584a91297064))

### [1.3.1](http://animech[secure]/clients/epic/gltf-web-viewer/compare/v1.3.0...v1.3.1) (2020-08-13)


### Bug Fixes

* fix misspelled name and encoding-value for EPIC_texture_hdr_encoding in extension-test ([6bb81ab](http://animech[secure]/clients/epic/gltf-web-viewer/commit/6bb81ab9f3f2bce807915feec5bcd8abc202fcb3))

## [1.3.0](http://animech[secure]/clients/epic/gltf-web-viewer/compare/v1.2.3...v1.3.0) (2020-08-11)


### Features

* **lightmap-extension:** prevent gamma-correction when sampling from lightmaps (they're already linear) ([a8c3de6](http://animech[secure]/clients/epic/gltf-web-viewer/commit/a8c3de6c400ed3e450b6d2b15615d965475f9fa3))

### [1.2.3](http://animech[secure]/clients/epic/gltf-web-viewer/compare/v1.2.2...v1.2.3) (2020-08-10)


### Bug Fixes

* **lightmap-extension:** adapt shader-code to account for the changes to uv's in recent versions of PC ([e392029](http://animech[secure]/clients/epic/gltf-web-viewer/commit/e392029014501876b0270d0f880da7dccfd9db4b))

### [1.2.2](http://animech[secure]/clients/epic/gltf-web-viewer/compare/v1.2.1...v1.2.2) (2020-08-10)


### Bug Fixes

* **HdriBackdrop:** fix incorrect scaling of backdrops that have a radius less than 1.0 ([7ec3415](http://animech[secure]/clients/epic/gltf-web-viewer/commit/7ec3415c4ab70c3e3e01aa31813cd7b3ccfdbe54))

### [1.2.1](http://animech[secure]/clients/epic/gltf-web-viewer/compare/v1.2.0...v1.2.1) (2020-08-01)


### Bug Fixes

* fix misspelled extension EPIC_texture_hdrencoding (should be EPIC_texture_hdr_encoding) ([1837174](http://animech[secure]/clients/epic/gltf-web-viewer/commit/183717467dc5133afbe91d432c1685a9fc2edb8e))

## [1.2.0](http://animech[secure]/clients/epic/gltf-web-viewer/compare/v1.1.0...v1.2.0) (2020-07-31)


### Features

* add camera previews to UI ([d982e1a](http://animech[secure]/clients/epic/gltf-web-viewer/commit/d982e1af0d7c576a91f38764b551ffca76e6997d))
* implement previews for cameras ([e405acd](http://animech[secure]/clients/epic/gltf-web-viewer/commit/e405acdbbf20a637ebd3077eb695cc72f881d7f0))
* update background color of viewport and backdrop to better disguise the absence of a canvas when rendering camera previews ([65e1563](http://animech[secure]/clients/epic/gltf-web-viewer/commit/65e1563e09110c74157069d9a77dff726cdb2a8c))

## [1.1.0](http://animech[secure]/clients/epic/gltf-web-viewer/compare/v1.0.3...v1.1.0) (2020-07-30)


### Features

* **OrbitCamera:** add extension parser for orbit cameras ([1d5834f](http://animech[secure]/clients/epic/gltf-web-viewer/commit/1d5834f24dc3aef199aaf97067fb1695564606f4))
* **OrbitCamera:** add focusEntity prop as a way of storing a focus entity for later use without triggering the focus method ([a34bd90](http://animech[secure]/clients/epic/gltf-web-viewer/commit/a34bd90f766eb2806744ead6dc651307638f5e83))


### Bug Fixes

* **OrbitCamera:** only calculate near and/or far clip if nearClipFactor and/or farClipFactor are defined ([ee11fe5](http://animech[secure]/clients/epic/gltf-web-viewer/commit/ee11fe57138c6f1d41913f37d3167501629f792b))
* **OrbitCamera:** prevent all mouse, touch and keyboard events when script is disabled ([fe9bbfd](http://animech[secure]/clients/epic/gltf-web-viewer/commit/fe9bbfd51f2fd5a052bc93c23bd23b954e14f81c))

### [1.0.3](http://animech[secure]/clients/epic/gltf-web-viewer/compare/v1.0.2...v1.0.3) (2020-07-30)


### Bug Fixes

* test release ([6257718](http://animech[secure]/clients/epic/gltf-web-viewer/commit/625771865596584493b6adfe2842451fdaa1fb9a))

### [1.0.2](http://animech[secure]/clients/epic/gltf-web-viewer/compare/v1.0.1...v1.0.2) (2020-07-29)
