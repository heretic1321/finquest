import { staticResourcePaths } from "@client/config/staticResourcePaths"
import { MapStore } from "@client/contexts/MapContext"
import { useVideoTexture } from "@react-three/drei"
import { useEffect, useState } from "react"
import { FrontSide, MeshBasicMaterial, RepeatWrapping } from "three"
// import { useControls, button } from 'leva'

const ScreeningAreaPanels = () => {

  const screeningAreaPanels = MapStore(state => state.screeningAreaPanels)


  // const meshRefs = useRef<THREE.Mesh[]>([])
  // const indexToTest = 2
  // const textureControls = useControls(`Video Texture ${indexToTest}`, {
  //   repeatX: { 
  //     value: 2, 
  //     min: 0, 
  //     max: 10, 
  //     step: 0.1,
  //     onChange: (value) => {
  //       if (meshRefs.current[indexToTest]?.material) {
  //         const material = meshRefs.current[indexToTest].material as THREE.MeshBasicMaterial;
  //         if (material.map) {
  //           material.map.repeat.x = value;
  //           material.map.needsUpdate = true;
  //         }
  //       }
  //     }
  //   },
  //   repeatY: { 
  //     value: 1, 
  //     min: 0, 
  //     max: 10, 
  //     step: 0.1,
  //     onChange: (value) => {
  //       if (meshRefs.current[indexToTest]?.material) {
  //         const material = meshRefs.current[indexToTest].material as THREE.MeshBasicMaterial;
  //         if (material.map) {
  //           material.map.repeat.y = value;
  //           material.map.needsUpdate = true;
  //         }
  //       }
  //     }
  //   },
  //   offsetX: { 
  //     value: 0, 
  //     min: -1, 
  //     max: 1, 
  //     step: 0.01,
  //     onChange: (value) => {
  //       if (meshRefs.current[indexToTest]?.material) {
  //         const material = meshRefs.current[indexToTest].material as THREE.MeshBasicMaterial;
  //         if (material.map) {
  //           material.map.offset.x = value;
  //           material.map.needsUpdate = true;
  //         }
  //       }
  //     }
  //   },
  //   offsetY: { 
  //     value: 0, 
  //     min: -1, 
  //     max: 1, 
  //     step: 0.01,
  //     onChange: (value) => {
  //       if (meshRefs.current[indexToTest]?.material) {
  //         const material = meshRefs.current[indexToTest].material as THREE.MeshBasicMaterial;
  //         if (material.map) {
  //           material.map.offset.y = value;
  //           material.map.needsUpdate = true;
  //         }
  //       }
  //     }
  //   },
  //   'Print Values': button(() => {
  //     const material = meshRefs.current[indexToTest]?.material as THREE.MeshBasicMaterial;
  //     if (material?.map) {
  //       const values = `vt.repeat.x = ${material.map.repeat.x}
  //     vt.repeat.y = ${material.map.repeat.y}
  //     vt.offset.x = ${material.map.offset.x}
  //     vt.offset.y = ${material.map.offset.y}`;
  //       console.log(values);
  //     }
  //   })
  // })

  const videoTextures = [
 
    useVideoTexture(
      staticResourcePaths.mainStageSidePanelVideos.portrait1,
      {start: true}
    ),
    useVideoTexture(
      staticResourcePaths.mainStageSidePanelVideos.portrait2,
      {start: true}
    ),
    useVideoTexture(
      staticResourcePaths.mainStageSidePanelVideos.landscape1,
      {start: true}
    ),
    useVideoTexture(
      staticResourcePaths.mainStageSidePanelVideos.landscape2,
      {start: true}
    ),
  ]

  const [allDone, setAllDone] = useState(false)
  useEffect(() => {
    if (allDone) return
    if (screeningAreaPanels.length !== 4) return
    if (videoTextures.some((texture) => texture == null)) return

    // for video textures
    for (let i = 0; i < videoTextures.length; i++) {
      const vt = videoTextures[i].clone()
      vt.wrapS = RepeatWrapping
      
      if (i === 0) {
        vt.repeat.x = 3.49
        vt.repeat.y = 1.02
        vt.offset.x = -0.27
        vt.offset.y = 0
      } else if (i === 1) {
        vt.repeat.x = 3.45
        vt.repeat.y = 1.1
        vt.offset.x = 0.52
        vt.offset.y = -0.07
      } else if (i === 2) {
        vt.repeat.x = 1
        vt.repeat.y = 0.93
        vt.offset.x = 0
        vt.offset.y = 0.03
      } else if (i === 3) {
        vt.repeat.x = 1
        vt.repeat.y = 0.91
        vt.offset.x = 0
        vt.offset.y = 0.04
      }
      vt.needsUpdate = true
      const mat = new MeshBasicMaterial({
        map: vt,
        toneMapped: false,
        side: FrontSide,
      })
      screeningAreaPanels[i].material = mat
      screeningAreaPanels[i].scale.y *= -1
    }

    setAllDone(true)
  }, [
    videoTextures,
    screeningAreaPanels,
    allDone,
    // textureControls
  ])

  if (screeningAreaPanels.length === 0 || !allDone) return null

  return (
    <>
      {
        screeningAreaPanels.map((panel, index) => {
          return (
          <mesh 
            // ref={(el) => {
            //   if (el) meshRefs.current[index] = el
            // }}
            key={index} 
            position={panel.position} 
            scale={panel.scale} 
            geometry={panel.geometry}
            material={panel.material}
          >
          </mesh>
          )
        })
      }
    </>
  )
}

export default ScreeningAreaPanels