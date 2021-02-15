import {
  ColorObject,
  decomposeColor,
  recomposeColor,
} from "@material-ui/core/styles/colorManipulator";

function mixColorChannel(channelA: number, channelB: number, weight: number) {
  channelA = channelA * weight;
  channelB = channelB * (1 - weight);
  return Math.round(channelA + channelB);
}

export function mixColor(
  color1: string,
  color2: string,
  weight: number,
): string {
  weight = Math.min(Math.max(0, weight), 1);

  const color1Object = decomposeColor(color1);
  const color2Object = decomposeColor(color2);

  if (color1Object.type !== color2Object.type) {
    throw new Error("Cannot mix colors of different formats.");
  }

  if (
    ["rgba", "hsla"].includes(color1Object.type) ||
    ["rgba", "hsla"].includes(color2Object.type)
  ) {
    throw new Error("Cannot mix colors with alpha channel.");
  }

  const newColor: ColorObject = {
    type: color1Object.type,
    values: [
      mixColorChannel(color1Object.values[0], color2Object.values[0], weight),
      mixColorChannel(color1Object.values[1], color2Object.values[1], weight),
      mixColorChannel(color1Object.values[2], color2Object.values[2], weight),
    ],
  };

  return recomposeColor(newColor);
}
