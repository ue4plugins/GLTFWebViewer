import { Field } from "./Field";

export class FieldManager<TMeta, TValue> {
  public constructor(
    public readonly fields: ReadonlyArray<Field<TMeta, TValue>>,
  ) {}

  public getField(fieldId: number): Field<TMeta, TValue> | undefined {
    return this.fields[fieldId];
  }

  public getValues(fieldId: number): TValue[] | undefined {
    return this.getField(fieldId)?.values;
  }

  public getValue(fieldId: number, valueId: number): TValue | undefined {
    return this.getValues(fieldId)?.[valueId];
  }
}
