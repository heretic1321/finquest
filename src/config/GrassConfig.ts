// NOTE - commenting this out for performance reasons.
// in an experience this big, the preformace is reducing. its still good, about 60fps but without this
// it is 90fps. so we are commenting this out for now. we can add it back in later if we want to.
// good to have this sytem built, so we can use it later in any project

// NOTE --
// Add this code block in the experience.ts file when you want to enabled the grass
/* {GrassConfig.map((grassSurfaceMesh, index) => {
  return (
    <Grass
      key={index}
      name={grassSurfaceMesh.name}
      surfaceMeshGLTFPath={grassSurfaceMesh.surfaceMesh}
      imposterMeshGLTFPath={grassSurfaceMesh.imposterMesh}
      instances={grassSurfaceMesh.numberOfBlades}
      characterRef={characterRef}
      imposterTriggerTransform={grassSurfaceMesh.imposterTriggerTransform}
    ></Grass>
  )
})} */

// import { Vector3Tuple } from 'three'

// import dimensions from './dimensions'
// import { staticResourcePaths } from './staticResourcePaths'

export default [
  // {
  //   name: 'grassPatch1',
  //   surfaceMesh:
  //     staticResourcePaths.mapItems.grassPatches.grassPatch1.surfaceMesh,
  //   imposterMesh:
  //     staticResourcePaths.mapItems.grassPatches.grassPatch1.imposterMesh,
  //   numberOfBlades: 1500,
  //   imposterTriggerTransform: {
  //     position: [37.3587, 1.08, 15.3474] satisfies Vector3Tuple,
  //     boxDimensions: {
  //       width: 125,
  //       height: 5,
  //       depth: 125,
  //     },
  //   },
  // },
  // {
  //   name: 'grassPatch2',
  //   surfaceMesh:
  //     staticResourcePaths.mapItems.grassPatches.grassPatch2.surfaceMesh,
  //   imposterMesh:
  //     staticResourcePaths.mapItems.grassPatches.grassPatch2.imposterMesh,
  //   numberOfBlades: 1500,
  //   imposterTriggerTransform: {
  //     position: [
  //       -15.232 * dimensions.mapScale,
  //       0.71 * dimensions.mapScale,
  //       5.904 * dimensions.mapScale,
  //     ] satisfies Vector3Tuple,
  //     boxDimensions: {
  //       width: 125,
  //       height: 5,
  //       depth: 125,
  //     },
  //   },
  // },
  // {
  //   name: 'grassPatch3',
  //   surfaceMesh:
  //     staticResourcePaths.mapItems.grassPatches.grassPatch3.surfaceMesh,
  //   imposterMesh:
  //     staticResourcePaths.mapItems.grassPatches.grassPatch3.imposterMesh,
  //   numberOfBlades: 50000,
  //   imposterTriggerTransform: {
  //     position: [85.9172, 1.367, 110.4184] satisfies Vector3Tuple,
  //     boxDimensions: {
  //       width: 166,
  //       height: 10,
  //       depth: 166,
  //     },
  //   },
  // },
  // {
  //   name: 'grassPatch4',
  //   surfaceMesh:
  //     staticResourcePaths.mapItems.grassPatches.grassPatch4.surfaceMesh,
  //   imposterMesh:
  //     staticResourcePaths.mapItems.grassPatches.grassPatch4.imposterMesh,
  //   numberOfBlades: 2000,
  //   imposterTriggerTransform: {
  //     position: [75.0031, 1.367, 88.9804] satisfies Vector3Tuple,
  //     boxDimensions: {
  //       width: 108,
  //       height: 5,
  //       depth: 108,
  //     },
  //   },
  // },
  // {
  //   name: 'grassPatch5',
  //   surfaceMesh:
  //     staticResourcePaths.mapItems.grassPatches.grassPatch5.surfaceMesh,
  //   imposterMesh:
  //     staticResourcePaths.mapItems.grassPatches.grassPatch5.imposterMesh,
  //   numberOfBlades: 1500,
  //   imposterTriggerTransform: {
  //     position: [48.4993, 1.5088, 65.2062] satisfies Vector3Tuple,
  //     boxDimensions: {
  //       width: 150,
  //       height: 5,
  //       depth: 81,
  //     },
  //   },
  // },
  // {
  //   name: 'grassPatch6',
  //   surfaceMesh:
  //     staticResourcePaths.mapItems.grassPatches.grassPatch6.surfaceMesh,
  //   imposterMesh:
  //     staticResourcePaths.mapItems.grassPatches.grassPatch6.imposterMesh,
  //   numberOfBlades: 1500,
  //   imposterTriggerTransform: {
  //     position: [12.9318, 1.4354, 101.0422] satisfies Vector3Tuple,
  //     boxDimensions: {
  //       width: 135,
  //       height: 5,
  //       depth: 92,
  //     },
  //   },
  // },
  // {
  //   name: 'grassPatch7',
  //   surfaceMesh:
  //     staticResourcePaths.mapItems.grassPatches.grassPatch7.surfaceMesh,
  //   imposterMesh:
  //     staticResourcePaths.mapItems.grassPatches.grassPatch7.imposterMesh,
  //   numberOfBlades: 1500,
  //   imposterTriggerTransform: {
  //     position: [12.9318, 1.4354, 101.0422] satisfies Vector3Tuple,
  //     boxDimensions: {
  //       width: 135,
  //       height: 5,
  //       depth: 92,
  //     },
  //   },
  // },
  // {
  //   name: 'grassPatch8',
  //   surfaceMesh:
  //     staticResourcePaths.mapItems.grassPatches.grassPatch8.surfaceMesh,
  //   imposterMesh:
  //     staticResourcePaths.mapItems.grassPatches.grassPatch8.imposterMesh,
  //   numberOfBlades: 50000,
  //   imposterTriggerTransform: {
  //     position: [-55.6553, 1.367, 80.5551] satisfies Vector3Tuple,
  //     boxDimensions: {
  //       width: 135,
  //       height: 5,
  //       depth: 92,
  //     },
  //   },
  // },
  // {
  //   name: 'grassPatch9',
  //   surfaceMesh:
  //     staticResourcePaths.mapItems.grassPatches.grassPatch9.surfaceMesh,
  //   imposterMesh:
  //     staticResourcePaths.mapItems.grassPatches.grassPatch9.imposterMesh,
  //   numberOfBlades: 1500,
  //   imposterTriggerTransform: {
  //     position: [-101.001, 1.5657, 96.6197] satisfies Vector3Tuple,
  //     boxDimensions: {
  //       width: 114,
  //       height: 5,
  //       depth: 76,
  //     },
  //   },
  // },
]
