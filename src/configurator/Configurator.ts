import { FieldManager } from "./FieldManager";
import { Field } from "./Field";

export type OnFieldChangeCallback = (valueId: number) => void;

export class Configurator<TMeta, TValue> {
  private _configuration: number[];
  private _callbacks: OnFieldChangeCallback[][];

  public constructor(public readonly manager: FieldManager<TMeta, TValue>) {
    this._configuration = manager.fields.map(field => field.defaultValue);
    this._callbacks = manager.fields.map(_ => []);
  }

  public get configuration(): ReadonlyArray<number> {
    return this._configuration;
  }

  public get configurationData(): TValue[] {
    return this._configuration.map(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      (valueId, fieldId) => this.manager.getValue(fieldId, valueId)!,
    );
  }

  public getField(fieldId: number): Field<TMeta, TValue> | undefined {
    return this.manager.getField(fieldId);
  }

  public getPossibleValues(fieldId: number): number[] {
    return this.manager.getValues(fieldId)?.map((_, i) => i) || [];
  }

  public getValue(fieldId: number): number | undefined {
    return this.configuration[fieldId];
  }

  public getValueData(fieldId: number): TValue | undefined {
    return this.configurationData[fieldId];
  }

  public setValue(fieldId: number, valueId: number) {
    if (this._configuration[fieldId] === undefined) {
      throw new Error(`Invalid field ${fieldId}`);
    }

    const value = this.manager.getValue(fieldId, valueId);
    if (value === undefined) {
      throw new Error(`Invalid value ${valueId} for field ${fieldId}`);
    }

    this._configuration[fieldId] = valueId;

    this._onVariantChange(fieldId, valueId);
  }

  public onValueChange(field: number, callback: OnFieldChangeCallback) {
    const callbacks = this._callbacks[field];
    if (callbacks === undefined) {
      throw new Error(`Invalid variant set ${field}`);
    }

    callbacks.push(callback);
  }

  public offVariantChange(variantSet: number, callback: OnFieldChangeCallback) {
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

  private _onVariantChange(fieldId: number, valueId: number) {
    const callbacks = this._callbacks[fieldId];
    callbacks.forEach(callback => callback(valueId));
  }
}

// TODO: remove
export type VariantSet = {
  name: string;
  default: number;
  variants: Variant[];
};

export type Variant = {
  name: string;
  thumbnailSource?: string;
  nodes: {
    node: pc.Entity;
    properties: {
      visible?: boolean;
    };
  }[];
};

export type VariantSetField = Field<{ name: string }, Variant>;

export const variantSets: VariantSet[] = [
  {
    name: "field 1",
    default: 0,
    variants: [
      {
        name: "value 1",
        nodes: [
          {
            node: new pc.Entity(),
            properties: {
              visible: true,
            },
          },
        ],
      },
      {
        name: "value 2",
        nodes: [
          {
            node: new pc.Entity(),
            properties: {
              visible: false,
            },
          },
        ],
      },
    ],
  },
];

export const fields: VariantSetField[] = variantSets.map(vs => ({
  name: vs.name,
  values: vs.variants,
  defaultValue: vs.default,
}));

export const fieldManager = new FieldManager(fields);

export const field = fieldManager.getField(0);
export const value = fieldManager.getValue(0, 1);
export const values = fieldManager.getValues(0);

export const config = new Configurator(fieldManager);

export const configField = config.getField(0);
export const configPosValues = config.getPossibleValues(0);
export const configValue = config.getValue(0);
export const configValueData = config.getValueData(0);
