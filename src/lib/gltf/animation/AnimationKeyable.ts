import pc from "playcanvas";
import { SingleDOF, BlendValue } from "../types";

export enum AnimationKeyableType {
  NUM,
  VEC,
  QUAT,
}

export class AnimationKeyable {
  public type: AnimationKeyableType | undefined;
  public time = -1;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public value: any; // SingleDOF | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public inTangent: any; // SingleDOF | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public outTangent: any; // SingleDOF | undefined;
  public _cacheKeyIdx: number | undefined;

  constructor(type?: AnimationKeyableType, time?: number, value?: BlendValue) {
    return this.init(type, time, value);
  }

  init(type = AnimationKeyableType.NUM, time = 0, value: BlendValue = 0) {
    this.type = type || AnimationKeyableType.NUM;
    this.time = time || 0;
    if (value) {
      this.value = value as SingleDOF;
    } else {
      switch (type) {
        case AnimationKeyableType.NUM:
          this.value = 0;
          break;
        case AnimationKeyableType.VEC:
          this.value = new pc.Vec3();
          break;
        case AnimationKeyableType.QUAT:
          this.value = new pc.Quat();
          break;
      }
    }
    return this;
  }

  copy(keyable: AnimationKeyable): AnimationKeyable {
    if (!keyable) {
      return this;
    }
    const value = AnimationKeyable._cloneValue(keyable.value);

    this.init(keyable.type, keyable.time, value);
    if (keyable.inTangent || keyable.inTangent === 0) {
      this.inTangent = AnimationKeyable._cloneValue(keyable.inTangent);
    }
    if (keyable.outTangent || keyable.outTangent === 0) {
      this.outTangent = AnimationKeyable._cloneValue(keyable.outTangent);
    }
    return this;
  }

  clone() {
    const value = AnimationKeyable._cloneValue(this.value);
    const cloned = new AnimationKeyable(this.type, this.time, value);
    if (this.inTangent || this.inTangent === 0) {
      cloned.inTangent = AnimationKeyable._cloneValue(this.inTangent);
    }
    if (this.outTangent || this.outTangent === 0) {
      cloned.outTangent = AnimationKeyable._cloneValue(this.outTangent);
    }
    return cloned;
  }

  static _cloneValue<T>(value?: T): T {
    if (
      value instanceof pc.Vec3 ||
      value instanceof pc.Quat ||
      value instanceof AnimationKeyable ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (typeof value === "object" && typeof (value as any).clone === "function")
    ) {
      // eslint-disable-next-line
      return (value as any).clone() as T;
    }
    return value as T;
  }

  static sum(
    keyable1: AnimationKeyable,
    keyable2: AnimationKeyable,
  ): AnimationKeyable | undefined {
    if (!keyable1 || !keyable2 || keyable1.type !== keyable2.type) {
      return;
    }

    const resKeyable = new AnimationKeyable(keyable1.type);
    switch (keyable1.type) {
      case AnimationKeyableType.NUM:
        resKeyable.value =
          (keyable1.value as number) + (keyable2.value as number);
        break;
      case AnimationKeyableType.VEC:
        (resKeyable.value as pc.Vec3).add2(
          keyable1.value as pc.Vec3,
          keyable2.value as pc.Vec3,
        );
        break;
      case AnimationKeyableType.QUAT: {
        const resVal = resKeyable.value as pc.Quat;
        const keyVal1 = keyable1.value as pc.Quat;
        const keyVal2 = keyable2.value as pc.Quat;
        resVal.x = keyVal1.x + keyVal2.x;
        resVal.y = keyVal1.y + keyVal2.y;
        resVal.z = keyVal1.z + keyVal2.z;
        resVal.w = keyVal1.w + keyVal2.w;
        break;
      }
    }
    return resKeyable;
  }

  static minus(
    keyable1: AnimationKeyable,
    keyable2: AnimationKeyable,
  ): AnimationKeyable | undefined {
    if (!keyable1 || !keyable2 || keyable1.type !== keyable2.type) {
      return;
    }

    const resKeyable = new AnimationKeyable(keyable1.type);
    switch (keyable1.type) {
      case AnimationKeyableType.NUM:
        resKeyable.value =
          (keyable1.value as number) - (keyable2.value as number);
        break;
      case AnimationKeyableType.VEC:
        (resKeyable.value as pc.Vec3).sub2(
          keyable1.value as pc.Vec3,
          keyable2.value as pc.Vec3,
        );
        break;
      case AnimationKeyableType.QUAT: {
        const resVal = resKeyable.value as pc.Quat;
        const keyVal1 = keyable1.value as pc.Quat;
        const keyVal2 = keyable2.value as pc.Quat;
        resVal.x = keyVal1.x - keyVal2.x;
        resVal.y = keyVal1.y - keyVal2.y;
        resVal.z = keyVal1.z - keyVal2.z;
        resVal.w = keyVal1.w - keyVal2.w;
        break;
      }
    }
    return resKeyable;
  }

  static mul(
    keyable: AnimationKeyable,
    coeff: number,
  ): AnimationKeyable | undefined {
    if (!keyable) {
      return;
    }

    const resKeyable = new AnimationKeyable();
    resKeyable.copy(keyable);
    switch (keyable.type) {
      case AnimationKeyableType.NUM:
        (resKeyable.value as number) *= coeff;
        break;
      case AnimationKeyableType.VEC:
        (resKeyable.value as pc.Vec3).scale(coeff);
        break;
      case AnimationKeyableType.QUAT: {
        const resVal = resKeyable.value as pc.Quat;
        resVal.x *= coeff;
        resVal.y *= coeff;
        resVal.z *= coeff;
        resVal.w *= coeff;
        break;
      }
    }
    return resKeyable;
  }

  static div(
    keyable: AnimationKeyable,
    coeff: number,
  ): AnimationKeyable | undefined {
    if (coeff === 0) {
      return;
    }

    return AnimationKeyable.mul(keyable, 1 / coeff);
  }

  static linearBlend(
    keyable1: AnimationKeyable,
    keyable2: AnimationKeyable,
    p: number,
    cacheValue?: AnimationKeyable,
  ): AnimationKeyable | undefined {
    if (!keyable1 || !keyable2 || keyable1.type !== keyable2.type) {
      return;
    }

    let resKeyable: AnimationKeyable;
    if (cacheValue) {
      resKeyable = cacheValue;
    } else {
      resKeyable = new AnimationKeyable(keyable1.type);
    }

    if (p === 0) {
      resKeyable.copy(keyable1);
      return resKeyable;
    }

    if (p === 1) {
      resKeyable.copy(keyable2);
      return resKeyable;
    }

    switch (keyable1.type) {
      case AnimationKeyableType.NUM: {
        const v1 = keyable1.value as number;
        const v2 = keyable2.value as number;
        (resKeyable.value as number) = (1 - p) * v1 + p * v2;
        break;
      }
      case AnimationKeyableType.VEC: {
        const v1 = keyable1.value as pc.Vec3;
        const v2 = keyable2.value as pc.Vec3;
        (resKeyable.value as pc.Vec3).lerp(v1, v2, p);
        break;
      }
      case AnimationKeyableType.QUAT:
        (resKeyable.value as pc.Quat).slerp(
          keyable1.value as pc.Quat,
          keyable2.value as pc.Quat,
          p,
        );
        break;
    }
    return resKeyable;
  }

  static linearBlendValue<T1, T2>(value1: T1, value2: T2, p: number) {
    if (typeof value1 === "number" && typeof value2 === "number") {
      return (1 - p) * value1 + p * value2;
    }

    if (
      (value1 instanceof pc.Vec2 && value2 instanceof pc.Vec2) ||
      (value1 instanceof pc.Vec3 && value2 instanceof pc.Vec3) ||
      (value1 instanceof pc.Vec4 && value2 instanceof pc.Vec4)
    ) {
      const valRes = value1.clone();
      // eslint-disable-next-line
      valRes.lerp(value1 as any, value2 as any, p);
      return valRes;
    }

    if (value1 instanceof pc.Quat && value2 instanceof pc.Quat) {
      const valRes = value1.clone();
      valRes.slerp(value1, value2, p);
      return valRes;
    }
    return null;
  }
}
