## [1.21.0](http://animech[secure]/clients/epic/gltf-web-viewer/compare/v1.20.2...v1.21.0) (2020-10-22)


### Features

* **variants:** add support for removing a mesh via a mesh variant ([2af1989](http://animech[secure]/clients/epic/gltf-web-viewer/commit/2af1989703ea694cd64022e8f2aec8d53a0a9508))
* **variants:** add support for restoring default-materials via material variants ([969005f](http://animech[secure]/clients/epic/gltf-web-viewer/commit/969005f00fe7dff5c364b9982d8f50b2eda05cad))


### Bug Fixes

* **variants:** make variants clickable even when they are marked as active in the UI ([4a3974c](http://animech[secure]/clients/epic/gltf-web-viewer/commit/4a3974c4bf4a84ea6b6fe6b42243c39b330d1e62))

### [1.20.2](http://animech[secure]/clients/epic/gltf-web-viewer/compare/v1.20.1...v1.20.2) (2020-10-15)


### Bug Fixes

* **HdriBackdrop:** always use camera position when calculating in_ variable ([dd62592](http://animech[secure]/clients/epic/gltf-web-viewer/commit/dd625920b1c14b90d9087ea42a618b29c3d80ef8))
* **HdriBackdrop:** fix incorrect lighting distance calculation ([882f828](http://animech[secure]/clients/epic/gltf-web-viewer/commit/882f828fa53c14f256eead3aa214dbebeb61c063))
* restore original skybox intensity when an hdri backdrop is disabled / destroyed ([225c047](http://animech[secure]/clients/epic/gltf-web-viewer/commit/225c047f5539109c3f3b5dea42c4eb9b8bfac68b))

### [1.20.1](http://animech[secure]/clients/epic/gltf-web-viewer/compare/v1.20.0...v1.20.1) (2020-10-10)


### Bug Fixes

* add missing intensity factor for skybox when using hdri backdrop ([13f4ed2](http://animech[secure]/clients/epic/gltf-web-viewer/commit/13f4ed20a35ac1d5694e05993a35121837cf9ff7))

## [1.20.0](http://animech[secure]/clients/epic/gltf-web-viewer/compare/v1.19.0...v1.20.0) (2020-10-06)


### Features

* **InteractionHotspot:** use a 3d sphere as proxy for each hotspot instead of a point-sprite ([4ce2967](http://animech[secure]/clients/epic/gltf-web-viewer/commit/4ce296705021e67b2877b00acb413fea3a29484a))

## [1.19.0](http://animech[secure]/clients/epic/gltf-web-viewer/compare/v1.18.0...v1.19.0) (2020-10-05)


### Features

* add empty state to viewport and don't show sidebar if no files are found ([8dde379](http://animech[secure]/clients/epic/gltf-web-viewer/commit/8dde379546c9ff3b4ca860324517c9973efc21c9))


### Bug Fixes

* remove fixed height of NavListItem to allow multiple lines ([74dca14](http://animech[secure]/clients/epic/gltf-web-viewer/commit/74dca14b79ca2bcab2dd3e45403c118a982ed267))

## [1.18.0](http://animech[secure]/clients/epic/gltf-web-viewer/compare/v1.17.2...v1.18.0) (2020-10-04)


### Features

* add temporary hack to make playcanvas work offline ([d8de8fd](http://animech[secure]/clients/epic/gltf-web-viewer/commit/d8de8fd4974310d0821195a8816928f3dc4482c5))


### Bug Fixes

* fallback to regular urls if URL.createObjectURL doesn't exists (which it doesn't in test framework) ([4e22b42](http://animech[secure]/clients/epic/gltf-web-viewer/commit/4e22b42ffa5b3be54fce284b0e536661259f857e))

### [1.17.2](http://animech[secure]/clients/epic/gltf-web-viewer/compare/v1.17.1...v1.17.2) (2020-10-02)


### Bug Fixes

* **InteractionHotspot:** fix jumps in animations when toggling direction ([c9b5056](http://animech[secure]/clients/epic/gltf-web-viewer/commit/c9b5056a6482a1be2b3b022a2d9901f7cac02995))

### [1.17.1](http://animech[secure]/clients/epic/gltf-web-viewer/compare/v1.17.0...v1.17.1) (2020-10-02)


### Bug Fixes

* **InteractionHotspot:** fix html hotspots lagging behind their entities ([4e90ff1](http://animech[secure]/clients/epic/gltf-web-viewer/commit/4e90ff196ae343ade99aa8a907a29ad31a8327bc))

## [1.17.0](http://animech[secure]/clients/epic/gltf-web-viewer/compare/v1.16.0...v1.17.0) (2020-10-01)


### Features

* add support for extension EPIC_animation_play_data ([cfbd455](http://animech[secure]/clients/epic/gltf-web-viewer/commit/cfbd45577314fbb4bf5024253e8e2ab0dec368db))


### Bug Fixes

* init animations in correct order for them to play ([a5f541d](http://animech[secure]/clients/epic/gltf-web-viewer/commit/a5f541d60904cfa6d44f966b729e27649137e150))
* play delayed animations from start time, if defined ([96edd55](http://animech[secure]/clients/epic/gltf-web-viewer/commit/96edd55fec8bfaecfb897adfdb47c0aa82a33c4a))

## [1.16.0](http://animech[secure]/clients/epic/gltf-web-viewer/compare/v1.15.0...v1.16.0) (2020-10-01)


### Features

* add debug function window.getStats to print VRAM usage stats ([c83fd76](http://animech[secure]/clients/epic/gltf-web-viewer/commit/c83fd76dddc0fa782deca46d24753591a092d956))
* make it possible to start the application without index.json ([17ff951](http://animech[secure]/clients/epic/gltf-web-viewer/commit/17ff9517574351b46570307a955b236de0e3f029))


### Bug Fixes

* remove outline from viewport root element ([4091949](http://animech[secure]/clients/epic/gltf-web-viewer/commit/40919493e6ecdafbe13152f75570d81127d9e5c1))
* **InteractionHotspot:** make hotspot images not draggable ([2c5e0ae](http://animech[secure]/clients/epic/gltf-web-viewer/commit/2c5e0aeaf5293fc9410c4b81c2e3a31fa21b2239))

## [1.15.0](http://animech[secure]/clients/epic/gltf-web-viewer/compare/v1.14.1...v1.15.0) (2020-09-30)


### Features

* **InteractionHotspot:** make it possible to have hotspots without an animation ([b17cbe6](http://animech[secure]/clients/epic/gltf-web-viewer/commit/b17cbe6afbd44180f6784ce636333b4d0ea2837d))

### [1.14.1](http://animech[secure]/clients/epic/gltf-web-viewer/compare/v1.14.0...v1.14.1) (2020-09-30)


### Bug Fixes

* fix GltfContent height issue for Safari ([5f0f0e1](http://animech[secure]/clients/epic/gltf-web-viewer/commit/5f0f0e196af096310b686f96cfb32bf340d602e0))
* remove black canvas borders in Safari ([f99e963](http://animech[secure]/clients/epic/gltf-web-viewer/commit/f99e9631016684a2a1f08603c6880618afdcc5e1))

## [1.14.0](http://animech[secure]/clients/epic/gltf-web-viewer/compare/v1.13.0...v1.14.0) (2020-09-29)


### Features

* **InteractionHotspot:** use image dimensions to set hotspot size and remove image transitions ([6524547](http://animech[secure]/clients/epic/gltf-web-viewer/commit/6524547080ff3d24b4a5272e305773df4e87dc23))

## [1.13.0](http://animech[secure]/clients/epic/gltf-web-viewer/compare/v1.12.0...v1.13.0) (2020-09-29)


### Features

* **OrbitCamera:** reset orbit camera to last focused position when pressing space key ([f8c2dbf](http://animech[secure]/clients/epic/gltf-web-viewer/commit/f8c2dbf985e5f14cb7df1fad0e9947e710140b14))
* **OrbitCamera:** reset position of default orbit camera when switching models ([b657404](http://animech[secure]/clients/epic/gltf-web-viewer/commit/b65740482cd24f71d112e0e3ff992521fdcc55c0))

## [1.12.0](http://animech[secure]/clients/epic/gltf-web-viewer/compare/v1.11.0...v1.12.0) (2020-09-29)


### Features

* **OrbitCamera:** add live-tracking of focused entity and generalize focus-function ([3aee020](http://animech[secure]/clients/epic/gltf-web-viewer/commit/3aee020da29bcfa1f6f7a56aa78a1513ce3bc74a))
* **OrbitCamera:** add parsing of more settings from extension-data ([b3e2989](http://animech[secure]/clients/epic/gltf-web-viewer/commit/b3e298938ab95ec2d3ccc5d71568086570cfac5a))
* **OrbitCamera:** allow focusEntity to be null and reset it if the entity is destroyed ([c4efffe](http://animech[secure]/clients/epic/gltf-web-viewer/commit/c4efffe38cb52d88fc07209567dda8792c708767))
* **OrbitCamera:** update positions in postUpdate to keep in sync with focused entity ([e490ca1](http://animech[secure]/clients/epic/gltf-web-viewer/commit/e490ca1417708540443f373ca39733cf8cfedb3d))


### Bug Fixes

* **OrbitCamera:** fix incorrect bounding-boxes when a hierarchy contains non-model entities ([377dbce](http://animech[secure]/clients/epic/gltf-web-viewer/commit/377dbce600ec61f80feb69ae728858b7e2748035))
* **OrbitCamera:** prevent focusEntity from becoming undefined if no valid node exists ([3a4dc12](http://animech[secure]/clients/epic/gltf-web-viewer/commit/3a4dc12ae7df89cccd9fffff5be808a4a3a556e0))

## [1.11.0](http://animech[secure]/clients/epic/gltf-web-viewer/compare/v1.10.0...v1.11.0) (2020-09-28)


### Features

* add selected glTF name to header ([121d0f3](http://animech[secure]/clients/epic/gltf-web-viewer/commit/121d0f3834beaa7d53bc67927c1b94a5fdd67224))


### Bug Fixes

* fix rounding issue when centering canvas vertically ([f047c46](http://animech[secure]/clients/epic/gltf-web-viewer/commit/f047c46cfd5ac1626cdd41bc0142b0891baf7d02))

## [1.10.0](http://animech[secure]/clients/epic/gltf-web-viewer/compare/v1.9.0...v1.10.0) (2020-09-28)


### Features

* add animated arrow icon ([6ceffbe](http://animech[secure]/clients/epic/gltf-web-viewer/commit/6ceffbedfa667ce8d29571214eab5207edf02fe5))
* add animated hamburger icon ([16b44d7](http://animech[secure]/clients/epic/gltf-web-viewer/commit/16b44d7e9e7d0d571ec5a91bc1e4df0446475c3c))
* add app title to topbar ([ac76e37](http://animech[secure]/clients/epic/gltf-web-viewer/commit/ac76e37a5a40a228cfa1d29563f7da6c7287cbcd))
* add appear animation to cameras ([d322d4f](http://animech[secure]/clients/epic/gltf-web-viewer/commit/d322d4fc9b2c3dff384c8f2e7293cf785b9bbf71))
* add appear animation to sidebar header ([a84b614](http://animech[secure]/clients/epic/gltf-web-viewer/commit/a84b6140a8a72d6e7f5dc4ddbc407a216664d40b))
* add appear animations to sidebar content ([fcb2b9e](http://animech[secure]/clients/epic/gltf-web-viewer/commit/fcb2b9e0c96ee6a8f8ce7969da211e10d1a56566))
* add left and right direction of appear animation depending on previous view ([85cf423](http://animech[secure]/clients/epic/gltf-web-viewer/commit/85cf423428d453574cacfc93e2ee290f0cdc08f5))
* add orbit icon to Camera ([8faff4d](http://animech[secure]/clients/epic/gltf-web-viewer/commit/8faff4daac526cf7df5136e9dd9a39e5f7ac8582))
* add transitions to Camera, NavListItem and Variant ([e4990b3](http://animech[secure]/clients/epic/gltf-web-viewer/commit/e4990b38c9d6ca9cc5f4583216344daa0108e531))
* allow showing FPS meter via query param ([a05f113](http://animech[secure]/clients/epic/gltf-web-viewer/commit/a05f11322388a958c74f0505fd7602dfac2e2362))
* create new Camera component ([cb4658f](http://animech[secure]/clients/epic/gltf-web-viewer/commit/cb4658f790278afd30386fe0f49887fbfca77d6e))
* new VariantSet style (WIP) ([209520d](http://animech[secure]/clients/epic/gltf-web-viewer/commit/209520d3af0a17119f6b52aa2c36966e3689c253))
* standardise error and empty states by introducing component ErrorMessage ([56a5c0d](http://animech[secure]/clients/epic/gltf-web-viewer/commit/56a5c0d7e7444db9a34f82cddd115a5ffd50b1a9))
* update state colors in Variant component using new utility function mixColor ([3033aa0](http://animech[secure]/clients/epic/gltf-web-viewer/commit/3033aa01818e097a0dc14b84ccd8a85f3c471988))


### Bug Fixes

* adjust font size to match design docs ([cef4685](http://animech[secure]/clients/epic/gltf-web-viewer/commit/cef46857a8e1fac03304c3852b03457d895369e8))
* adjust spacings to match design ([b3b089d](http://animech[secure]/clients/epic/gltf-web-viewer/commit/b3b089d6543974febe460164f46d3c95f90ce718))
* fix implementation of hideUI query param ([c851b48](http://animech[secure]/clients/epic/gltf-web-viewer/commit/c851b4801a39cbd6f61cf46c236e0a78a245d4e5))
* fix line height in sidebar header ([9d97773](http://animech[secure]/clients/epic/gltf-web-viewer/commit/9d9777312e1d1defd621f69a0e9a1bf380b94ba0))
* fix loading state to GltfContent when loading a single file ([fcc5986](http://animech[secure]/clients/epic/gltf-web-viewer/commit/fcc59869e157f6a81019f440c9f1d0c3047a72bc))
* remove margin of last variant child ([03b4ec8](http://animech[secure]/clients/epic/gltf-web-viewer/commit/03b4ec89eefa8ed687fbdb2721dd3526ef7c330f))
* remove sluggish NavListItem transition ([2f62f7d](http://animech[secure]/clients/epic/gltf-web-viewer/commit/2f62f7d7d6f12e9af9046a893d7515a7dbfe43c6))

## [1.9.0](http://animech[secure]/clients/epic/gltf-web-viewer/compare/v1.8.0...v1.9.0) (2020-09-22)


### Features

* **OrbitCamera:** calculate initial yaw and pitch based on angle to the focus-entity ([76f8204](http://animech[secure]/clients/epic/gltf-web-viewer/commit/76f820441c7a5203ce51764d549d0262039c25b2))
* **OrbitCamera:** correctly focus on initial focus-entity even if it has no models ([f56e114](http://animech[secure]/clients/epic/gltf-web-viewer/commit/f56e11436e86782cb9ef4e2e7f4660819f319088))
* **OrbitCamera:** never re-focus additional orbit-cameras since they're already initialized ([923b7ec](http://animech[secure]/clients/epic/gltf-web-viewer/commit/923b7eccc0601bcf71192ed38d1c1889d6ba0a79))
* **OrbitCamera:** switch to global rotation as basis for yaw and pitch ([79f40b7](http://animech[secure]/clients/epic/gltf-web-viewer/commit/79f40b7c33251c72af1379793dda6df4b58e1300))


### Bug Fixes

* **OrbitCamera:** avoid using the default size of 0.5, 0.5, 0.5 for empty aabb's ([a1641ef](http://animech[secure]/clients/epic/gltf-web-viewer/commit/a1641ef801bbc4cc1502a4a235e0eb7c0ccaa42f))
* **OrbitCamera:** use local rotation as basis when calculating yaw and pitch ([6d8f40a](http://animech[secure]/clients/epic/gltf-web-viewer/commit/6d8f40a9250df2c33e344edc107743a4bfc47de4))
* fix calculation of canvas-size to match aspect-ratio of cameras ([d80ebd9](http://animech[secure]/clients/epic/gltf-web-viewer/commit/d80ebd9c5f06816de023c1e572011df0934fd652))

## [1.8.0](http://animech[secure]/clients/epic/gltf-web-viewer/compare/v1.7.0...v1.8.0) (2020-09-22)


### Features

* re-introduce support for WebGL2 ([29eaab3](http://animech[secure]/clients/epic/gltf-web-viewer/commit/29eaab3b95f78de60a885dcfeb32775cfa32b589))
* **InteractionHotspot:** set z-index of hotspot using z-depth ([22bb3e9](http://animech[secure]/clients/epic/gltf-web-viewer/commit/22bb3e9ebc40ea86c44e3cca6af09c81da792a37))
* **InteractionHotspot:** use pc.Picker instead of reading the depthbuffer ([4001440](http://animech[secure]/clients/epic/gltf-web-viewer/commit/4001440d3dd8e906ad14e75262c2147b5f4ce0ab))
* add fade in/out for occluded hotspots ([5f66463](http://animech[secure]/clients/epic/gltf-web-viewer/commit/5f66463be7493954b2080c605bf3306961d42ecf))
* add hover state images to hotspots ([49db39b](http://animech[secure]/clients/epic/gltf-web-viewer/commit/49db39be4241001f3d2718778769c1724812db6d))
* add option to cache entity position in InteractionHotspot script ([67bf7a1](http://animech[secure]/clients/epic/gltf-web-viewer/commit/67bf7a16c4ddf2345be47a566da150ec11067012))
* implement hotspot occlusion (WIP) ([ef8a0e3](http://animech[secure]/clients/epic/gltf-web-viewer/commit/ef8a0e39134e3c7f87919fdd7d2fdd18d292ad55))


### Bug Fixes

* **InteractionHotspot:** fix incorrect limits when sampling pixels ([e1d838a](http://animech[secure]/clients/epic/gltf-web-viewer/commit/e1d838a309c025509c24e6f87f3faa6b60ebe56b))

## [1.7.0](http://animech[secure]/clients/epic/gltf-web-viewer/compare/v1.6.0...v1.7.0) (2020-08-31)


### Features

* disable camera pan for orbit cameras added via extension ([5ca49f5](http://animech[secure]/clients/epic/gltf-web-viewer/commit/5ca49f5efd9de017dba8738a1c51c9841a3bd694))

## [1.6.0](http://animech[secure]/clients/epic/gltf-web-viewer/compare/v1.5.0...v1.6.0) (2020-08-24)


### Features

* **lightmap-extension:** keep lightmaps up-to-date after variants have been changed ([44295ee](http://animech[secure]/clients/epic/gltf-web-viewer/commit/44295ee2859cfe4284ace6346f8ecdd81a9a849c))
* **lightmap-extension:** split parser into parser + script to allow manipulation of lightmaps after parse ([518e072](http://animech[secure]/clients/epic/gltf-web-viewer/commit/518e0728ea28e2848194f657f992e3b60ecef48d))
* **variants:** implement node-transform for mesh-variants ([8e7f6cd](http://animech[secure]/clients/epic/gltf-web-viewer/commit/8e7f6cdca24192054016fa17ebbd03a3c560f994))
* **variants:** implement parsing of mesh variants ([912b83e](http://animech[secure]/clients/epic/gltf-web-viewer/commit/912b83e17091cfd5297156ae0800277e2b99abfa))
* **variants:** make material-replacement insensitive to timing issues by mapping material-assets ([5f6c72a](http://animech[secure]/clients/epic/gltf-web-viewer/commit/5f6c72a76408411a199684e474b9c496741f4f6b))
* **variants:** make model-replacement more robust by switching model-asset instead of cloning the resource ([c3ce1f0](http://animech[secure]/clients/epic/gltf-web-viewer/commit/c3ce1f043f3ea04a06f2597d7fdd7795d8b1a81b))


### Bug Fixes

* **variants:** make anim-components keep their state when a model is changed via a variant ([070714d](http://animech[secure]/clients/epic/gltf-web-viewer/commit/070714de078099adec3e15c3d2f4f8b1a6b74c01))
* **variants:** remove early-exit when processing material variants, to ensure later steps are executed ([8b1f046](http://animech[secure]/clients/epic/gltf-web-viewer/commit/8b1f046de08dd622a01dda0b3604c67eaac9fb23))

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
