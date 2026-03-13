import { genericStore } from "@client/contexts/GlobalStateContext"
import { useFrame, useThree } from "@react-three/fiber"
// import { useControls } from "leva"
import { useEffect, useRef } from "react"
import { BufferAttribute, DoubleSide, DynamicDrawUsage, Mesh, MeshStandardMaterial, PlaneGeometry, RepeatWrapping, TextureLoader, sRGBEncoding } from "three"

const Water = () => {
  const geometryRef = useRef<PlaneGeometry | null>(null)
  const materialRef = useRef<MeshStandardMaterial | null>(null)
  const meshRef = useRef<Mesh | null>(null)
  const { scene } = useThree()
  // const isDebugMode = genericStore((state) => state.isDebugMode)

  const amplitude = useRef(0.5)
  const factor1 = useRef(5)
  const factor2 = useRef(7)

  const waterInitialState = useRef({
    color: '#29a6db',
    repeatX: 6,
    repeatY: 6,
    offsetX: 0,
    offsetY: 0,
    transparent: false,
    envMapIntensity: 1.2,
    metalness: 0,
    roughness: 0.08,
    opacity: 1,
    toneMapped: true,
    amplitude: 0.44,
    factor1: 5.2,
    factor2: 6.49,
    bumpScale: 0.09,
    displacementScale: 0.2,
    displacementBias: 0,
  })

  // useControls(
  //   'Waterrr',
  //   () => ({
  //     waterColor: {
  //       value: waterInitialState.current.color,
  //       onChange: (value: string) => {
  //         if (materialRef.current) {
  //           materialRef.current.color.set(value)
  //           materialRef.current.needsUpdate = true
  //         }
  //       }
  //     },
  //     repeatX: {
  //       value: waterInitialState.current.repeatX,
  //       min: 0,
  //       max: 30,
  //       step: 0.1,
  //       onChange: (value: number) => {
  //         if (materialRef.current) {
  //           materialRef.current.map?.repeat.setX(value)
  //           materialRef.current.needsUpdate = true
  //         }
  //       }
  //     },
  //     repeatY: {
  //       value: waterInitialState.current.repeatY,
  //       min: 0,
  //       max: 30,
  //       step: 0.1,
  //       onChange: (value: number) => {
  //         if (materialRef.current) {
  //           materialRef.current.map?.repeat.setY(value)
  //           materialRef.current.needsUpdate = true
  //         }
  //       }
  //     },
  //     offsetX: {
  //       value: waterInitialState.current.offsetX,
  //       min: 0,
  //       max: 10,
  //       step: 0.1,
  //       onChange: (value: number) => {
  //         if (materialRef.current) {
  //           materialRef.current.map?.offset.setX(value)
  //           materialRef.current.needsUpdate = true
  //         }
  //       }
  //     },
  //     offsetY: {
  //       value: waterInitialState.current.offsetY,
  //       min: 0,
  //       max: 10,
  //       step: 0.1,
  //       onChange: (value: number) => {
  //         if (materialRef.current) {
  //           materialRef.current.map?.offset.setY(value)
  //           materialRef.current.needsUpdate = true
  //         }
  //       }
  //     },
  //     transparent: {
  //       value: waterInitialState.current.transparent,
  //       onChange: (value: boolean) => {
  //         if (materialRef.current) {
  //           materialRef.current.transparent = value
  //           materialRef.current.needsUpdate = true
  //         }
  //       }
  //     },
  //     envMapIntensity: {
  //       value: waterInitialState.current.envMapIntensity,
  //       min: 0,
  //       max: 10,
  //       step: 0.1,
  //       onChange: (value: number) => {
  //         if (materialRef.current) {
  //           materialRef.current.envMapIntensity = value
  //           materialRef.current.needsUpdate = true
  //         }
  //       }
  //     },
  //     metalness: {
  //       value: waterInitialState.current.metalness,
  //       min: 0,
  //       max: 1,
  //       step: 0.01,
  //       onChange: (value: number) => {
  //         if (materialRef.current) {
  //           materialRef.current.metalness = value
  //           materialRef.current.needsUpdate = true
  //         }
  //       }
  //     },
  //     roughness: {
  //       value: waterInitialState.current.roughness,
  //       min: 0,
  //       max: 1,
  //       step: 0.01,
  //       onChange: (value: number) => {
  //         if (materialRef.current) {
  //           materialRef.current.roughness = value
  //           materialRef.current.needsUpdate = true
  //         }
  //       }
  //     },
  //     opacity: {
  //       value: waterInitialState.current.opacity,
  //       min: 0,
  //       max: 1,
  //       step: 0.01,
  //       onChange: (value: number) => {
  //         if (materialRef.current) {
  //           materialRef.current.opacity = value
  //           materialRef.current.needsUpdate = true
  //         }
  //       }
  //     },
  //     toneMapped: {
  //       value: waterInitialState.current.toneMapped,
  //       onChange: (value: boolean) => {
  //         if (materialRef.current) {
  //           materialRef.current.toneMapped = value
  //           materialRef.current.needsUpdate = true
  //         }
  //       }
  //     },
  //     amplitude: {
  //       value: waterInitialState.current.amplitude,
  //       min: 0,
  //       max: 10,
  //       step: 0.01,
  //       onChange: (value: number) => {
  //         amplitude.current = value
  //       }
  //     },
  //     factor1: {
  //       value: waterInitialState.current.factor1,
  //       min: 4,
  //       max: 6,
  //       step: 0.01,
  //       onChange: (value: number) => {
  //         factor1.current = value
  //       }
  //     },
  //     factor2: {
  //       value: waterInitialState.current.factor2,
  //       min: 6,
  //       max: 8,
  //       step: 0.01,
  //       onChange: (value: number) => {
  //         factor2.current = value
  //       }
  //     },
  //     bumpScale: {
  //       value: waterInitialState.current.bumpScale,
  //       min: 0,
  //       max: 10,
  //       step: 0.01,
  //       onChange: (value: number) => {
  //         if (materialRef.current) {
  //           // materialRef.current.normalScale.setX(value)
  //           materialRef.current.bumpScale = value
  //           materialRef.current.needsUpdate = true
  //         }
  //       }
  //     },
  //     displacementScale: {
  //       value: waterInitialState.current.displacementScale,
  //       min: 0,
  //       max: 1,
  //       step: 0.01,
  //       onChange: (value: number) => {
  //         if (materialRef.current) {
  //           materialRef.current.displacementScale = value
  //           materialRef.current.needsUpdate = true
  //         }
  //       }
  //     },
  //     displacementBias: {
  //       value: waterInitialState.current.displacementBias,
  //       min: 0,
  //       max: 1,
  //       step: 0.01,
  //       onChange: (value: number) => {
  //         if (materialRef.current) {
  //           materialRef.current.displacementBias = value
  //           materialRef.current.needsUpdate = true
  //         }
  //       }
  //     },
  //   }),
  //   {
  //     collapsed: true,
  //     render: () => {
  //       // render the controls only if we are in debug mode
  //       return isDebugMode || false
  //     },
  //   },
  // )

  useEffect(() => {
    const texture = new TextureLoader().load( './assets/water.jpg' );
    texture.wrapS = texture.wrapT = RepeatWrapping;
    texture.repeat.set(
      waterInitialState.current.repeatX,
      waterInitialState.current.repeatY
    );
    texture.encoding = sRGBEncoding;

    const geometry = new PlaneGeometry( 220, 220, 127, 127 );
    geometry.rotateX( - Math.PI / 2 );
    const position = geometry.attributes.position;
    (position as BufferAttribute).usage = DynamicDrawUsage;

    for ( let i = 0; i < position.count; i ++ ) {
      const y = 0.5 * Math.sin( i / 2 );
      (position as BufferAttribute).setY( i, y );
    }

    const material = new MeshStandardMaterial( { 
      color: waterInitialState.current.color, 
      map: texture,
      side: DoubleSide,
      transparent: waterInitialState.current.transparent,
      envMapIntensity: waterInitialState.current.envMapIntensity,
      metalness: waterInitialState.current.metalness,
      roughness: waterInitialState.current.roughness,
      opacity: waterInitialState.current.opacity,
      toneMapped: waterInitialState.current.toneMapped
    } );
    // material.normalMap = texture.clone()
    // material.normalScale.set(
    //   waterInitialState.current.normalScaleX,
    //   waterInitialState.current.normalScaleY
    // )
    material.bumpMap = texture
    material.bumpScale = waterInitialState.current.bumpScale

    material.displacementMap = texture
    material.displacementScale = waterInitialState.current.displacementScale
    material.displacementBias = waterInitialState.current.displacementBias

    geometryRef.current = geometry
    materialRef.current = material
    const mesh = new Mesh( geometry, material );
    meshRef.current = mesh
    scene.add( mesh );
  }, [scene])

  useFrame(({clock}) => {
    if (!genericStore.getState().isTabFocused) return
    if (geometryRef.current) {
      const position = geometryRef.current.attributes.position
      if (position == undefined) return
      const time = clock.getElapsedTime() * 10;

      for ( let i = 0; i < position.count; i ++ ) {

        // const y = 0.5 * Math.sin( i / 5 + ( time + i ) / 7 );
        const y = amplitude.current * Math.sin(
           i / factor1.current + 
           ( time + i ) / factor2.current
        );
        (position as BufferAttribute).setY( i, y );
      }
      position.needsUpdate = true;
    }
  })
  
  return (
    geometryRef.current && materialRef.current &&
    meshRef.current &&
    <mesh
      ref={meshRef}
    ></mesh>  
  )
}

export default Water