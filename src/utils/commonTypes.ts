export type ValueOrNull<T extends Record<string, unknown> | undefined> =
  T extends undefined
    ? never
    : {
        [key in keyof T]: T[key] | null
      }

/* eslint-disable */
export type ArgumentType<F extends (...args: any[]) => any> = F extends (
  arg: infer A,
) => any
  ? A
  : never
/* eslint-enable */

export type TransformLite = {
  position: [number, number, number]
  rotation: [number, number, number]
  scale: [number, number, number]
}

export type Transform = {
  position: THREE.Vector3
  rotation: THREE.Euler
  scale: THREE.Vector3
}

export type TransformWithNulls = {
  position: THREE.Vector3 | null
  rotation: THREE.Euler | null
  scale: THREE.Vector3 | null
}
