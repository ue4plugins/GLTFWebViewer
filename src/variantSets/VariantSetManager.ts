import * as pc from "@animech-public/playcanvas";

export type VariantSet = {
  name: string;
  default: number;
  variants: Variant[];
};

export type Variant = {
  name: string;
  thumbnailSource: string;
  nodes: [
    {
      node: pc.Entity;
      properties: {
        visible?: boolean;
      };
    },
  ];
};

export class VariantSetManager {
  public constructor(private _variantSets: VariantSet[]) {}

  public get variantSets(): VariantSet[] {
    return this._variantSets;
  }

  public getVariants(variantSet: number): Variant[] | undefined {
    return this._variantSets[variantSet].variants;
  }

  public getVariant(variantSet: number, variant: number): Variant | undefined {
    return this.getVariants(variantSet)?.[variant];
  }
}

export type OnVariantChangeCallback = (
  variant: number,
  variantData: Variant,
) => void;

export class VariantSetConfigurator {
  private _configuration: number[];
  private _callbacks: OnVariantChangeCallback[][];

  public constructor(private _manager: VariantSetManager) {
    this._configuration = _manager.variantSets.map(
      variantSet => variantSet.default,
    );
    this._callbacks = _manager.variantSets.map(_ => []);
  }

  public get configuration(): (Variant | undefined)[] {
    return this._configuration.map((variant, variantSet) =>
      this._manager.getVariant(variantSet, variant),
    );
  }

  public getPossibleVariants(variantSet: number): Variant[] {
    return this._manager.getVariants(variantSet) || [];
  }

  public getVariant(variantSet: number): Variant | undefined {
    return this.configuration[variantSet];
  }

  public setVariant(variantSet: number, variant: number) {
    if (this._configuration[variantSet] === undefined) {
      throw new Error(`Invalid variant set ${variantSet}`);
    }

    const variantData = this._manager.getVariant(variantSet, variant);
    if (variantData === undefined) {
      throw new Error(
        `Invalid variant ${variant} for variant set ${variantSet}`,
      );
    }

    this._configuration[variantSet] = variant;

    this._onVariantChange(variantSet, variant, variantData);
  }

  public onVariantChange(
    variantSet: number,
    callback: OnVariantChangeCallback,
  ) {
    const callbacks = this._callbacks[variantSet];
    if (callbacks === undefined) {
      throw new Error(`Invalid variant set ${variantSet}`);
    }

    callbacks.push(callback);
  }

  public offVariantChange(
    variantSet: number,
    callback: OnVariantChangeCallback,
  ) {
    const callbacks = this._callbacks[variantSet];
    if (callbacks === undefined) {
      throw new Error(`Invalid variant set ${variantSet}`);
    }

    const index = callbacks.indexOf(callback);
    if (index === -1) {
      return;
    }

    callbacks.splice(index, 1);
  }

  private _onVariantChange(
    variantSet: number,
    variant: number,
    variantData: Variant,
  ) {
    const callbacks = this._callbacks[variantSet];
    callbacks.forEach(callback => callback(variant, variantData));
  }
}
