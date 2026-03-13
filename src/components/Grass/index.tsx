// inspired from https://codesandbox.io/s/grass-shader-5xho4
import { Gltf, TransformControls, useGLTF } from '@react-three/drei'
import { useFrame, useLoader, useThree } from '@react-three/fiber'
import {
  MutableRefObject,
  useEffect,
  useRef,
  useState
} from 'react'
import * as THREE from 'three'
import { Vector3Tuple, Vector4 } from 'three'
import { MeshSurfaceSampler } from 'three-stdlib'

import { useControls } from 'leva'

import { CharacterRef } from '@client/components/Character'
import TriggerArea from '@client/components/TriggerArea'
import { staticResourcePaths } from '@client/config/staticResourcePaths'
import { CameraControlsStore } from '@client/contexts/CameraControlsContext'

import { genericStore } from '@client/contexts/GlobalStateContext'
import { MapStore } from '@client/contexts/MapContext'
import './GrassMaterial'
import './GrassMaterialFallback'

type TGrass = {
  leafBladeOptions?: TLeafBladeOptions

  // an imposter which will replace the grass blades when
  // the user is not intersecting with the trigger area.
  imposterMeshGLTFPath?: string
  instances?: number
  surfaceMeshGLTFPath: string
  position?: [number, number, number]
  scale?: [number, number, number]
  name?: string
  characterRef: MutableRefObject<CharacterRef | null>

  // transforms for the trigger area.
  imposterTriggerTransform?: {
    position: Vector3Tuple
    boxDimensions: {
      width: number
      height: number
      depth: number
    }
  }
}

type TLeafBladeOptions = {
  width: number
  height: number
  joints: number
  stretch: number
  yTranslation: number
  minGrowthAngle: number
  maxGrowthAngle: number
  ratioOfStretchedBlades: number
}

type TGrassMaterialAttributes = {
  offsets: number[]
  orientations: number[]
  stretches: number[]
  halfRootAngleCos: number[]
  halfRootAngleSin: number[]
}

export default function Grass(props: TGrass) {
  const isDebugMode = genericStore((state) => state.isDebugMode)
  const orbitControlsRef = CameraControlsStore((state) => state.orbitControlsRef)

  // Options for the geometry of the leaf blade.
  // width - width of one leaf blade
  // height - height of one leaf blade
  // joints - number of joints in the leaf blade.
  //          this is used for the bending of the leaf blade
  // stretch - stretch of the leaf blade.
  //           this is used for setting the y coordinate of
  //           the leaf geometry vertices
  // yTranslation - translation of the leaf blade UVs along the y axis
  // minGrowthAngle - minimum angle of growth of the leaf blade, bending around x and z axes
  // maxGrowthAngle - maximum angle of growth of the leaf blade, bending around x and z axes
  // ratioOfStretchedBlades - ratio of stretched blades to non-stretched blades
  const [leafBladeOptions, setLeafBladeOptions] = useState(
    props.leafBladeOptions ?? {
      width: 0.09,
      height: 0.66,
      joints: 5,
      stretch: 0.1,
      yTranslation: 1.75,
      minGrowthAngle: -0.25,
      maxGrowthAngle: 0.25,
      ratioOfStretchedBlades: 0.3,
    },
  )

  const { gl } = useThree()

  /**
   * Check if OES_draw_buffers_indexed extension is supported by the device.
   * This is required for the grass shader to work properly.
   * If this extension is not supported, we will use a fallback shader code.
   */
  const [
    is_OES_draw_buffers_indexed_Supported,
    setIs_OES_draw_buffers_indexed_Supported,
  ] = useState<boolean>(false)
  useEffect(() => {
    if (gl.extensions.get('OES_draw_buffers_indexed') !== null) {
      setIs_OES_draw_buffers_indexed_Supported(true)
    } else {
      setIs_OES_draw_buffers_indexed_Supported(false)
    }
  }, [gl])

  // Number of grass blades to render
  const [numberOfBlades, setNumberOfBlades] = useState(props.instances ?? 500)

  // Ref for the grass shader material
  const grassMaterialRef = useRef<THREE.ShaderMaterial | undefined>(undefined)
  // Ref for the grass instanced mesh
  const instancedGrassMeshRef = useRef<THREE.Mesh>(null)

  // Diffuse and alpha maps for the grass shader material
  const [diffuseMap, alphaMap] = useLoader(THREE.TextureLoader, [
    staticResourcePaths.grassLeafBlade.diffuse,
    staticResourcePaths.grassLeafBlade.alpha,
  ])

  // Surface mesh on which the grass will be rendered
  const [surfaceMesh, setSurfaceMesh] = useState<THREE.Mesh | null>(null)
  // ref for the above surface mesh
  const surfaceMeshRef = useRef<THREE.Mesh | null>(null)
  // GLTF scene for the surface mesh, imported from a gltf provided in the props
  const { scene: surfaceMeshGLTFScene } = useGLTF(props.surfaceMeshGLTFPath)
  const [surfaceMeshColor, setSurfaceMeshColor] = useState('#205107')

  const [surfaceMeshMaterial] = useState<THREE.MeshStandardMaterial>(
    new THREE.MeshStandardMaterial({
      color: surfaceMeshColor,
    }),
  )

  const [triggerAreaBoxDimensions, setTriggerAreaBoxDimensions] = useState({
    width: props.imposterTriggerTransform?.boxDimensions.width ?? 10,
    height: props.imposterTriggerTransform?.boxDimensions.height ?? 10,
    depth: props.imposterTriggerTransform?.boxDimensions.depth ?? 10,
  })

  const [isImposterActive, setIsImposterActive] = useState<boolean>(true)
  const imposterRef = useRef<THREE.Group | null>(null)
  const [imposterMaterial] = useState<THREE.MeshStandardMaterial>(
    new THREE.MeshStandardMaterial({
      color: '#4B7215',
    }),
  )
  useEffect(() => {
    if (
      imposterRef === null ||
      imposterMaterial === null ||
      imposterMaterial === undefined
    )
      return

    imposterRef.current?.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.scale(
          MapStore.getState().mapScale * 1.01,
          MapStore.getState().mapScale * 1.01,
          MapStore.getState().mapScale * 1.01,
        )
        child.material = imposterMaterial
      }
    })
  }, [imposterRef, imposterMaterial])

  // container group for this whole componnet. This group will include
  // the instanced meshes of the grass blades and the surface mesh on
  // which the grass will be rendered
  const containerRef = useRef<THREE.Group | null>(null)

  // Geometry for a single leaf blade
  const [leafBladeGeometry, setLeafBladeGeometry] =
    useState<THREE.PlaneGeometry | null>(null)

  /**
   * Attribute data for the grass shader material
   * More details about the attributes can be found in `getAttributeData` function
   * @see getAttributeData
   */
  const [attributeData, setAttributeData] = useState<TGrassMaterialAttributes>({
    offsets: [],
    orientations: [],
    stretches: [],
    halfRootAngleCos: [],
    halfRootAngleSin: [],
  })

  const [transformControlsTarget, setTransformControlsTarget] =
    useState<THREE.Object3D | null>(null)
  const [showTransformControls, setShowTransformControls] = useState(false)
  const [transformControlsMode, setTransformControlsMode] = useState<
    'translate' | 'rotate' | 'scale'
  >('scale')

  useControls(
    `Grass ${props.name ?? 'unkown'}`,
    () => ({
      leafBladeWidth: {
        value: leafBladeOptions.width,
        min: 0,
        max: 1,
        step: 0.001,
        onChange: (value: number) => {
          setLeafBladeOptions((prev) => {
            return {
              ...prev,
              width: value,
            }
          })
        },
      },
      leafBladeHeight: {
        value: leafBladeOptions.height,
        min: 0,
        max: 2,
        step: 0.001,
        onChange: (value: number) => {
          setLeafBladeOptions((prev) => {
            return {
              ...prev,
              height: value,
            }
          })
        },
      },
      leafBladeJoints: {
        value: leafBladeOptions.joints,
        min: 0,
        max: 10,
        step: 1,
        onChange: (value: number) => {
          setLeafBladeOptions((prev) => {
            return {
              ...prev,
              joints: value,
            }
          })
        },
      },
      leafBladeYTranslation: {
        value: leafBladeOptions.yTranslation,
        min: 0,
        max: 10,
        step: 0.001,
        onChange: (value: number) => {
          setLeafBladeOptions((prev) => {
            return {
              ...prev,
              yTranslation: value,
            }
          })
        },
      },
      minGrowthAngle: {
        value: leafBladeOptions.minGrowthAngle,
        min: -Math.PI,
        max: Math.PI,
        step: 0.001,
        onChange: (value: number) => {
          setLeafBladeOptions((prev) => {
            return {
              ...prev,
              minGrowthAngle: value,
            }
          })
        },
      },
      maxGrowthAngle: {
        value: leafBladeOptions.maxGrowthAngle,
        min: -Math.PI,
        max: Math.PI,
        step: 0.001,
        onChange: (value: number) => {
          setLeafBladeOptions((prev) => {
            return {
              ...prev,
              maxGrowthAngle: value,
            }
          })
        },
      },
      numberOfBlades: {
        value: numberOfBlades,
        min: 0,
        max: 500000,
        step: 100,
        onChange: (value: number) => {
          setNumberOfBlades(value)
        },
      },
      leafStretch: {
        value: leafBladeOptions.stretch,
        min: 0,
        max: 10,
        step: 0.001,
        onChange: (value: number) => {
          setLeafBladeOptions((prev) => {
            return {
              ...prev,
              stretch: value,
            }
          })
        },
      },
      ratioOfStretchedBlades: {
        value: leafBladeOptions.ratioOfStretchedBlades,
        min: 0,
        max: 1,
        step: 0.001,
        onChange: (value: number) => {
          setLeafBladeOptions((prev) => {
            return {
              ...prev,
              ratioOfStretchedBlades: value,
            }
          })
        },
      },
      surfaceMeshColor: {
        value: surfaceMeshColor,
        onChange: (value: string) => {
          setSurfaceMeshColor(value)
        },
      },
      transformControlsEnabled: {
        value: false,
        onChange: (value: boolean) => {
          if (!orbitControlsRef?.current) return
          if (value === true) {
            orbitControlsRef.current.enabled = false
            setShowTransformControls(true)
            setTransformControlsTarget(containerRef.current)
          } else {
            orbitControlsRef.current.enabled = true
            setTransformControlsTarget(null)
            setShowTransformControls(false)
          }
        },
      },
      transformControlsTarget: {
        value: 'containerGroup',
        options: ['containerGroup', 'surfaceMesh', 'instancedGrassMesh'],
        onChange: (value: string) => {
          if (value === 'containerGroup') {
            setTransformControlsTarget(containerRef.current)
          } else if (value === 'surfaceMesh') {
            setTransformControlsTarget(surfaceMeshRef.current)
          } else if (value === 'instancedGrassMesh') {
            setTransformControlsTarget(instancedGrassMeshRef.current)
          }
        },
      },
      transformControlsMode: {
        value: 'translate',
        options: ['translate', 'rotate', 'scale'],
        onChange: (value: 'translate' | 'rotate' | 'scale') => {
          setTransformControlsMode(value)
        },
      },
      isSurfaceMeshVisible: {
        value: true,
        onChange: (value: boolean) => {
          if (surfaceMeshRef.current === null) return
          surfaceMeshRef.current.visible = value
        },
      },
      boxDimensions: {
        value: [
          triggerAreaBoxDimensions.width,
          triggerAreaBoxDimensions.height,
          triggerAreaBoxDimensions.depth,
        ],
        onChange: (value: [number, number, number]) => {
          setTriggerAreaBoxDimensions({
            width: value[0],
            height: value[1],
            depth: value[2],
          })
        },
        step: 1,
      },
    }),
    {
      collapsed: true,
      render: () => {
        // render the controls only if we are in debug mode
        return isDebugMode || false
      },
    },
  )

  useEffect(() => {
    // Creating the geometry for a single leaf blade
    const createLeafBladeBaseGeometry = () => {
      const geom = new THREE.PlaneGeometry(
        leafBladeOptions.width,
        leafBladeOptions.height,
        1,
        leafBladeOptions.joints,
      )
      geom.translate(
        0,
        leafBladeOptions.height / leafBladeOptions.yTranslation,
        0,
      )
      setLeafBladeGeometry(geom)
    }
    const cleanupLeafBladeBaseGeometry = () => {
      leafBladeGeometry?.dispose()
      setLeafBladeGeometry(null)
    }

    // Creating the surface mesh on which the grass will be rendered
    const createSurfaceMesh = () => {
      let surfaceGeometry: THREE.BufferGeometry | null = null
      surfaceMeshGLTFScene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          surfaceGeometry = child.geometry.clone() as THREE.BufferGeometry

          // scale of the map. This is used to scale imported geometry
          // to the correct size, which fits the map. NOTE - The GLTF file using which
          // the surface mesh is imported should be centered at origin and have all its
          // transformations applied
          surfaceGeometry.scale(
            MapStore.getState().mapScale,
            MapStore.getState().mapScale,
            MapStore.getState().mapScale
          )
        }
      })
      if (surfaceGeometry === null) return
      const surfaceMaterial = surfaceMeshMaterial
      const _surfaceMesh = new THREE.Mesh(surfaceGeometry, surfaceMaterial)
      setSurfaceMesh(_surfaceMesh)
    }
    const cleanupSurfaceMesh = () => {
      if (surfaceMesh === null) return
      surfaceMesh?.geometry.dispose()
      if ('dispose' in surfaceMesh.material) surfaceMesh.material.dispose()
      setSurfaceMesh(null)
    }

    // Creating the attribute data for the grass shader material
    const createAttributeData = () => {
      if (surfaceMesh === null) return
      setAttributeData(
        getAttributeData(numberOfBlades, surfaceMesh, leafBladeOptions),
      )
    }
    const cleanupAttributeData = () => {
      setAttributeData({
        offsets: [],
        orientations: [],
        stretches: [],
        halfRootAngleCos: [],
        halfRootAngleSin: [],
      })
    }

    createLeafBladeBaseGeometry()
    createSurfaceMesh()
    createAttributeData()

    return () => {
      cleanupLeafBladeBaseGeometry()
      cleanupSurfaceMesh()
      cleanupAttributeData()
    }
  }, [leafBladeOptions, numberOfBlades, surfaceMeshGLTFScene, surfaceMeshColor])

  // Show/hide the transform controls of the trigger area (for debugging purposes)
  const [showTriggerTransformControls, setShowTriggerTransformControls] =
    useState<boolean>(false)
  useEffect(() => {
    if (!orbitControlsRef?.current) return
    orbitControlsRef.current.enabled = !showTriggerTransformControls
  }, [showTriggerTransformControls])

  useFrame((state) => {
    if (!genericStore.getState().isTabFocused) return
    if (grassMaterialRef.current === undefined || isImposterActive) return
    grassMaterialRef.current.uniforms.time.value = state.clock.elapsedTime / 4
  })

  return (
    <>
      {showTransformControls && transformControlsTarget && (
        <TransformControls
          object={transformControlsTarget}
          mode={transformControlsMode}
          onMouseUp={() => {
            if (transformControlsMode === 'translate') {
              console.log(transformControlsTarget.position)
            } else if (transformControlsMode === 'rotate') {
              console.log(transformControlsTarget.rotation)
            } else if (transformControlsMode === 'scale') {
              console.log(transformControlsTarget.scale)
            }
          }}
        />
      )}
      <group {...props} ref={containerRef}>
        {!isImposterActive && (
          <mesh
            frustumCulled={false}
            ref={instancedGrassMeshRef}
            key={JSON.stringify(leafBladeGeometry)}
          >
            <instancedBufferGeometry
              index={leafBladeGeometry?.index}
              attributes-position={leafBladeGeometry?.attributes.position}
              attributes-uv={leafBladeGeometry?.attributes.uv}
            >
              <instancedBufferAttribute
                attach='attributes-offset'
                args={[new Float32Array(attributeData.offsets), 3]}
              />
              <instancedBufferAttribute
                attach='attributes-orientation'
                args={[new Float32Array(attributeData.orientations), 4]}
              />
              <instancedBufferAttribute
                attach='attributes-stretch'
                args={[new Float32Array(attributeData.stretches), 1]}
              />
              <instancedBufferAttribute
                attach='attributes-halfRootAngleSin'
                args={[new Float32Array(attributeData.halfRootAngleSin), 1]}
              />
              <instancedBufferAttribute
                attach='attributes-halfRootAngleCos'
                args={[new Float32Array(attributeData.halfRootAngleCos), 1]}
              />
            </instancedBufferGeometry>
            {is_OES_draw_buffers_indexed_Supported ? (
              <grassMaterial
                //@ts-ignore
                ref={grassMaterialRef}
                map={diffuseMap}
                alphaMap={alphaMap}
                toneMapped={false}
                side={THREE.DoubleSide}
              />
            ) : (
              <grassMaterialFallback
                //@ts-ignore
                ref={grassMaterialRef}
                map={diffuseMap}
                alphaMap={alphaMap}
                toneMapped={false}
                side={THREE.DoubleSide}
              />
            )}
          </mesh>
        )}
        <mesh
          ref={surfaceMeshRef}
          position={[0, 0.01, 0]}
          visible={true}
          geometry={surfaceMesh?.geometry}
          material={surfaceMesh?.material}
        />

        {/* imposter ref */}
        {props.imposterMeshGLTFPath && (
          <Gltf
            ref={imposterRef}
            src={props.imposterMeshGLTFPath}
            visible={isImposterActive}
          ></Gltf>
        )}
      </group>

      {/* trigger area to detect intersection of player and grass and switch between
      grass and imposter */}
      <TriggerArea
        name={props.name}
        target={
          props.characterRef.current?.roundedBoxRef.current
            ? props.characterRef.current?.roundedBoxRef.current
            : null
        }
        onEnter={() => setIsImposterActive(false)}
        onExit={() => setIsImposterActive(true)}
        showTransformControls={showTriggerTransformControls}
        setShowTransformControls={setShowTriggerTransformControls}
        position={props.imposterTriggerTransform?.position ?? [0, 0, 0]}
        _boxWidth={triggerAreaBoxDimensions.width}
        _boxHeight={triggerAreaBoxDimensions.height}
        _boxDepth={triggerAreaBoxDimensions.depth}
      />
    </>
  )
}

function getAttributeData(
  instances: number,
  surfaceMesh: THREE.Mesh | null,
  leafBladeOptions?: TLeafBladeOptions,
) {
  const offsets: number[] = []
  const orientations: number[] = []
  const stretches: number[] = []
  const halfRootAngleSin: number[] = []
  const halfRootAngleCos: number[] = []

  if (surfaceMesh === null) {
    return {
      offsets,
      orientations,
      stretches,
      halfRootAngleCos,
      halfRootAngleSin,
    }
  }

  let quaternion_0 = new THREE.Vector4()
  const quaternion_1 = new THREE.Vector4()

  //The min and max angle for the growth direction (in radians)
  const min = leafBladeOptions?.minGrowthAngle ?? -0.25
  const max = leafBladeOptions?.maxGrowthAngle ?? 0.25

  const sampler = new MeshSurfaceSampler(surfaceMesh).build()

  const _position = new THREE.Vector3()
  const _normal = new THREE.Vector3()
  const dummy = new THREE.Object3D()

  //For each instance of the grass blade
  for (let i = 0; i < instances; i++) {
    sampler.sample(_position, _normal)
    _normal.add(_position)

    dummy.position.copy(_position)
    dummy.lookAt(_normal)
    dummy.updateMatrix()

    const dummyPosition = new THREE.Vector3()
    const dummyQuaternion = new THREE.Quaternion()
    const dummyScale = new THREE.Vector3()
    dummy.matrix.decompose(dummyPosition, dummyQuaternion, dummyScale)

    // offset of the roots
    offsets.push(dummyPosition.x, dummyPosition.y, dummyPosition.z)

    //Define random growth directions
    //Rotate around Y
    let angle = Math.PI - Math.random() * (2 * Math.PI)
    halfRootAngleSin.push(Math.sin(0.5 * angle))
    halfRootAngleCos.push(Math.cos(0.5 * angle))

    let RotationAxis = new THREE.Vector3(0, 1, 0)
    let x = RotationAxis.x * Math.sin(angle / 2.0)
    let y = RotationAxis.y * Math.sin(angle / 2.0)
    let z = RotationAxis.z * Math.sin(angle / 2.0)
    let w = Math.cos(angle / 2.0)
    quaternion_0.set(x, y, z, w).normalize()

    //Rotate around X
    angle = Math.random() * (max - min) + min
    RotationAxis = new THREE.Vector3(1, 0, 0)
    x = RotationAxis.x * Math.sin(angle / 2.0)
    y = RotationAxis.y * Math.sin(angle / 2.0)
    z = RotationAxis.z * Math.sin(angle / 2.0)
    w = Math.cos(angle / 2.0)
    quaternion_1.set(x, y, z, w).normalize()

    //Combine rotations to a single quaternion
    quaternion_0 = multiplyQuaternions(quaternion_0, quaternion_1)

    //Rotate around Z
    angle = Math.random() * (max - min) + min
    RotationAxis = new THREE.Vector3(0, 0, 1)
    x = RotationAxis.x * Math.sin(angle / 2.0)
    y = RotationAxis.y * Math.sin(angle / 2.0)
    z = RotationAxis.z * Math.sin(angle / 2.0)
    w = Math.cos(angle / 2.0)
    quaternion_1.set(x, y, z, w).normalize()

    //Combine rotations to a single quaternion
    quaternion_0 = multiplyQuaternions(quaternion_0, quaternion_1)

    orientations.push(
      quaternion_0.x,
      quaternion_0.y,
      quaternion_0.z,
      quaternion_0.w,
    )

    //Define variety in height
    if (i < instances * (leafBladeOptions?.ratioOfStretchedBlades ?? 0.3)) {
      stretches.push(Math.random() * (leafBladeOptions?.stretch ?? 0.1))
    } else {
      stretches.push(0)
    }
  }

  return {
    offsets,
    orientations,
    stretches,
    halfRootAngleCos,
    halfRootAngleSin,
  }
}

function multiplyQuaternions(q1: Vector4, q2: Vector4) {
  const x = q1.x * q2.w + q1.y * q2.z - q1.z * q2.y + q1.w * q2.x
  const y = -q1.x * q2.z + q1.y * q2.w + q1.z * q2.x + q1.w * q2.y
  const z = q1.x * q2.y - q1.y * q2.x + q1.z * q2.w + q1.w * q2.z
  const w = -q1.x * q2.x - q1.y * q2.y - q1.z * q2.z + q1.w * q2.w
  return new THREE.Vector4(x, y, z, w)
}
