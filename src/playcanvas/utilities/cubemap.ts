import * as pc from "@animech-public/playcanvas";

function syncCubemapToCpu(
  renderTarget: pc.RenderTarget,
  device: pc.GraphicsDevice,
) {
  const tex = renderTarget._colorBuffer;

  if (tex.format !== pc.PIXELFORMAT_R8_G8_B8_A8) {
    return;
  }

  const pixels = new Uint8Array(tex.width * tex.height * 4);
  const gl = device.gl;

  device.setFramebuffer(renderTarget._glFrameBuffer);
  gl.readPixels(0, 0, tex.width, tex.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

  if (!tex._levels) {
    tex._levels = [];
  }

  if (!tex._levels[0]) {
    tex._levels[0] = [];
  }

  for (let face = 0; face < 6; face += 1) {
    tex._levels[0][face] = pixels;
  }
}

/**
 * Creates a smaller cubemap from a larger cubemap by down-sampling it.
 *
 * @param sourceCubemap Source cubemap, must have a power-of-two size and must be larger than `outputSize`
 * @param outputSize Desired size of the created cubemap
 * @param device Graphics-device
 * @param syncToCpu (Optional) Fills the `_levels`-property of the created cubemap with mip-data
 */
export function downSampleCubemap(
  sourceCubemap: pc.Texture,
  outputSize: number,
  device: pc.GraphicsDevice,
  syncToCpu?: boolean,
): pc.Texture {
  const logSourceSize = Math.round(Math.log2(sourceCubemap.width));
  const logOutputSize = Math.round(Math.log2(outputSize));
  const steps = logSourceSize - logOutputSize;

  if (steps < 0) {
    throw new Error("Output-size must be less or equal than source-size");
  }

  const sourceType = sourceCubemap.type;
  const sourceFormat = sourceCubemap.format;

  const chunks = pc.shaderChunks;
  const shader = chunks.createShaderFromCode(
    device,
    chunks.fullscreenQuadVS,
    chunks.outputCubemapPS,
    "outputCubemap",
  );

  const constantTexSource = device.scope.resolve("source");
  const constantParams = device.scope.resolve("params");
  const params = new pc.Vec4();

  let inputCubemap = sourceCubemap;
  let outputCubemap = sourceCubemap;

  for (let i = 0; i < steps; i += 1) {
    const outputSize = inputCubemap.width * 0.5;

    outputCubemap = new pc.Texture(device, {
      cubemap: true,
      name: "prefiltered-cube",
      type: sourceType as string,
      format: sourceFormat,
      width: outputSize,
      height: outputSize,
      mipmaps: false,
    });

    for (let face = 0; face < 6; face += 1) {
      const renderTarget = new pc.RenderTarget({
        colorBuffer: outputCubemap,
        face: face,
        depth: false,
      });

      params.x = face;

      // TODO: do we need to decode / encode RGBM when down-sampling,
      // or is it ok to just let the data be down-sampled regardless?
      // params.w = isRgbm ? 3 : 0;

      constantTexSource.setValue(sourceCubemap);
      constantParams.setValue(params.data);

      pc.drawQuadWithShader(device, renderTarget, shader);

      if (syncToCpu) {
        syncCubemapToCpu(renderTarget, device);
      }
    }

    inputCubemap = outputCubemap;
  }

  return outputCubemap;
}

/**
 * Creates a new cubemap that uses the passed textures as faces for mip 0.
 * The cubemap will have the same format and type as the first texture.
 * All textures are assumed to have the same format, type and resolution.
 *
 * @param textures 6 textures to use as faces for the cubemap
 * @param device Graphics-device
 * @param mipmaps (Optional) Generate mipmaps for the cubemap
 */
export function createCubemapFromTextures(
  textures: pc.Texture[],
  device: pc.GraphicsDevice,
  mipmaps = false,
): pc.Texture {
  const { width, height, format, type } = textures[0];

  const cubemap = new pc.Texture(device, {
    cubemap: true,
    mipmaps: mipmaps,
    format: format,
    type: type,
    width: width,
    height: height,
    fixCubemapSeams: true,
    addressU: pc.ADDRESS_CLAMP_TO_EDGE,
    addressV: pc.ADDRESS_CLAMP_TO_EDGE,
  });

  cubemap._levels = [
    [
      textures[0]._levels[0],
      textures[1]._levels[0],
      textures[2]._levels[0],
      textures[3]._levels[0],
      textures[4]._levels[0],
      textures[5]._levels[0],
    ],
  ];

  cubemap.upload();

  return cubemap;
}

/**
 * Creates 6 prefiltered cubemaps from a single rgbm-encoded cubemap, with the following sizes:
 * 128x128, 64x64, 32x32, 16x16, 8x8, 4x4
 *
 * @param sourceCubemap Source cubemap, must have a size of atleast 128x128
 * @param device Graphics-device
 * @param options (Optional)
 * @param options.syncToCpu (Optional) Fills the `_levels`-property of the created cubemaps with mip-data
 * @param options.createMipChainInFirstMip (Optional) Modifies the 128x128 cubemap to contain all smaller cubemaps as mips
 */
export function prefilterRgbmCubemap(
  sourceCubemap: pc.Texture,
  device: pc.GraphicsDevice,
  options?: {
    syncToCpu?: boolean;
    createMipChainInFirstMip?: boolean;
  },
): pc.Texture[] {
  if (sourceCubemap.type !== pc.TEXTURETYPE_RGBM) {
    throw new Error("The source cubemap must use RGBM-encoding");
  }

  if (sourceCubemap.width < 128) {
    throw new Error("The source cubemap must have a size of 128 or more");
  }

  const syncToCpu = options?.syncToCpu || options?.createMipChainInFirstMip;

  if (sourceCubemap.width > 128) {
    sourceCubemap = downSampleCubemap(sourceCubemap, 128, device, syncToCpu);
    sourceCubemap.name = "prefiltered-cube-128";
  }

  const mipSizes = [128, 64, 32, 16, 8, 4];
  const mipGloss = [0, 512, 128, 32, 8, 2];

  const mipCubemaps = mipSizes.map((mipSize, mip) => {
    if (mip === 0) {
      return sourceCubemap;
    } else {
      return new pc.Texture(device, {
        cubemap: true,
        mipmaps: false,
        name: `prefiltered-cube-${mipSize}`,
        type: sourceCubemap.type as string,
        format: sourceCubemap.format,
        fixCubemapSeams: true,
        width: mipSize,
        height: mipSize,
        addressU: pc.ADDRESS_CLAMP_TO_EDGE,
        addressV: pc.ADDRESS_CLAMP_TO_EDGE,
      });
    }
  });

  const samples = 4096;
  const method = "phong";

  const chunks = pc.shaderChunks;
  const shader = chunks.createShaderFromCode(
    device,
    chunks.fullscreenQuadVS,
    chunks.rgbmPS +
      chunks.prefilterCubemapPS
        .replace(/\$METHOD/g, method)
        .replace(/\$NUMSAMPLES/g, samples)
        .replace(/\$textureCube/g, "textureCubeRGBM"),
    "prefilterRgbmCubemap",
  );

  const constantTexSource = device.scope.resolve("source");
  const constantParams = device.scope.resolve("params");
  const params = new pc.Vec4();

  for (let mip = 1; mip < mipSizes.length; mip += 1) {
    for (let face = 0; face < 6; face += 1) {
      const renderTarget = new pc.RenderTarget({
        colorBuffer: mipCubemaps[mip],
        face: face,
        depth: false,
      });

      params.x = face;
      params.y = mipGloss[mip];
      params.z = mipSizes[mip];

      // TODO: params.w is set to 3 in the engine's prefilterCubemap-function, and the shader
      // treats 1 and 3 different than other values.
      // It seems to be used to "fix" edges in the cubemap, but appears to have the opposite
      // effect when used on our RGBM-encoded textures.
      // We need to determine if we really have a need for fixing edges, and if so,
      // if we can do it without introducing artifacts.
      params.w = 2;

      constantTexSource.setValue(mipCubemaps[mip - 1]);
      constantParams.setValue(params.data);

      pc.drawQuadWithShader(device, renderTarget, shader);

      if (syncToCpu) {
        syncCubemapToCpu(renderTarget, device);
      }
    }
  }

  if (options?.createMipChainInFirstMip) {
    const cubemap = mipCubemaps[0];

    for (let mip = 1; mip < mipSizes.length; mip += 1) {
      cubemap._levels[mip] = mipCubemaps[mip]._levels[0];
    }

    cubemap.upload();
    cubemap._prefilteredMips = true;
  }

  return mipCubemaps;
}
