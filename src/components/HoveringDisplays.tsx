import { Detailed, Gltf, useVideoTexture } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { MutableRefObject, createRef, useEffect, useRef, useState } from 'react'
import { DoubleSide, LOD, Mesh, MeshBasicMaterial, RepeatWrapping } from 'three'

import { ItemsToHide } from '@client/config/MapConfig'
import { staticResourcePaths } from '@client/config/staticResourcePaths'
import { MapStore } from '@client/contexts/MapContext'
import { useShallow } from 'zustand/react/shallow'
import { genericStore } from '@client/contexts/GlobalStateContext'

const HoveringDisplays = () => {
  const { listOfDisplayContainers, listOfDisplayPanels } = MapStore(
    useShallow((state) => ({
      listOfDisplayContainers: state.listOfDisplayContainers,
      listOfDisplayPanels: state.listOfDisplayPanels,
    })),
  )
  const { camera } = useThree()
  const allDone = useRef(false)

  // images
  // const imageTextures = useTexture([
  //   `${staticResourcePaths.s3_bucket_cdn}poster_1.webp`,
  //   `${staticResourcePaths.s3_bucket_cdn}poster_2.webp`,
  //   `${staticResourcePaths.s3_bucket_cdn}poster_3.webp`,
  //   `${staticResourcePaths.s3_bucket_cdn}poster_4.webp`,
  //   `${staticResourcePaths.s3_bucket_cdn}poster_4.webp`,
  //   `${staticResourcePaths.s3_bucket_cdn}poster_4.webp`,
  // ])

  // const mapping = {
  //   rajwada: 4,
  //   sutra: 2,
  //   mariposa: 0,
  // }
  // videos
  const videoTextures = [
    // mariposa
    useVideoTexture(
      staticResourcePaths.videoBranding[0],
      {start: true}
    ),
    useVideoTexture(
      staticResourcePaths.videoBranding[1],
      {start: true}
    ),
    // sutra
    useVideoTexture(
      staticResourcePaths.videoBranding[2],
      {start: true}
    ),
    useVideoTexture(
      staticResourcePaths.videoBranding[3],
      {start: true}
    ),
    // rajwada
    useVideoTexture(
      staticResourcePaths.videoBranding[4],
      {start: true}
    ),
    useVideoTexture(
      staticResourcePaths.videoBranding[5],
      {start: true}
    ),

    useVideoTexture(
      staticResourcePaths.videoBranding[0],
      {start: true}
    ),
    useVideoTexture(
      staticResourcePaths.videoBranding[1],
      {start: true}
    ),
    useVideoTexture(
      staticResourcePaths.videoBranding[2],
      {start: true}
    ),
    useVideoTexture(
      staticResourcePaths.videoBranding[3],
      {start: true}
    ),
    useVideoTexture(
      staticResourcePaths.videoBranding[4],
      {start: true}
    ),
    useVideoTexture(
      staticResourcePaths.videoBranding[5],
      {start: true}
    ),
  ]


  const [displayPanels, setDisplayPanels] = useState<Mesh[] | null>(null)

  useEffect(() => {
    if (allDone.current) return
    // if (imageTextures.some((texture) => texture == null)) return
    if (videoTextures.some((texture) => texture == null)) return
    if (listOfDisplayContainers == null) return
    if (listOfDisplayPanels == null) return
    if (listOfDisplayContainers.length !== listOfDisplayPanels.length) return
    // if (listOfDisplayPanels.length < (imageTextures.length + videoTextures.length)) return
    if (listOfDisplayPanels.length < videoTextures.length) return
    const displayPanels: Mesh[] = []

    // for image textures
    // for (let i = 0; i < imageTextures.length; i++) {
    //   const mat = new MeshBasicMaterial({
    //     map: imageTextures[i],
    //     toneMapped: false,
    //     side: FrontSide,
    //   })
    //   listOfDisplayPanels[i].material = mat
    //   displayPanels.push(listOfDisplayPanels[i])
    // }

    // for video textures
    for (let i = 0; i < videoTextures.length; i++) {
      videoTextures[i].wrapS = RepeatWrapping
      videoTextures[i].repeat.x = 1.7
      videoTextures[i].offset.x = 0.65
      videoTextures[i].needsUpdate = true
      const mat = new MeshBasicMaterial({
        map: videoTextures[i],
        toneMapped: false,
        side: DoubleSide,
      })
      // listOfDisplayPanels[i + imageTextures.length].material = mat
      // displayPanels.push(listOfDisplayPanels[i + imageTextures.length])
      listOfDisplayPanels[i].material = mat
      displayPanels.push(listOfDisplayPanels[i])
    }

    setDisplayPanels(displayPanels)
    lodRefs.current = displayPanels.map(
      (_, i) => lodRefs.current[i] || createRef(),
    )
    allDone.current = true
  }, [
    // imageTextures,
    videoTextures,
    listOfDisplayContainers,
    listOfDisplayPanels,
  ])

  const [haveAllRefsBeenAssigned, setHaveAllRefsBeenAssigned] = useState(false)
  useFrame(() => {
    if (!genericStore.getState().isTabFocused) return
    if (displayPanels == null) return
    if (listOfDisplayContainers == null) return
    // have the billboard displays always face the camera
    listOfDisplayContainers.forEach((_, index) => {
      if (lodRefs.current[index]) {
        const targetPosition = camera.position.clone()
        targetPosition.y = lodRefs.current[index].current.position.y
        // @ts-ignore
        lodRefs.current[index].current.lookAt(targetPosition)
      }
    })


    if (haveAllRefsBeenAssigned) return
    else {
      if (
        lodRefs.current.length == displayPanels.length &&
        lodRefs.current.every((ref) => ref.current != null) &&
        lodRefs.current.every((ref) => ref.current instanceof LOD)
      ) setHaveAllRefsBeenAssigned(true)
    }
  })

  const lodRefs = useRef<Array<MutableRefObject<LOD>>>([])

  useEffect(() => {
    if (haveAllRefsBeenAssigned) {
      MapStore.getState().addOrUpdateItemToHide(
        ItemsToHide.FloatingDisplayPanels,
        [... lodRefs.current.map((ref) => ref.current), ...listOfDisplayContainers ?? []],
      )
    }
  }, [haveAllRefsBeenAssigned])

  return (
    listOfDisplayContainers &&
    displayPanels && (
      <group scale={MapStore.getState().mapScale}>
        {/* {listOfDisplayContainers?.map((billboardDisplay, index) => (
          <primitive
            key={index + 'container'}
            object={billboardDisplay}
          ></primitive>
        ))} */}
        {displayPanels.map((panel, index) => (
          <Detailed
            key={index + 'detailed'}
            distances={[0, 80]}
            objects={null}
            position={[panel.position.x, panel.position.y, panel.position.z]}
            rotation={[panel.rotation.x, panel.rotation.y, panel.rotation.z]}
            scale={[panel.scale.x, panel.scale.y, panel.scale.z]}
            // @ts-ignore
            ref={lodRefs.current[index]}
          >
            <mesh
              position={[0, 0, 0]}
              rotation={[0, 0, 0]}
              geometry={panel.geometry}
              material={panel.material}
            ></mesh>
            <Gltf
              src={staticResourcePaths.dummyTriGltf}
              scale={[0, 0, 0]}
              visible={false}
            />
          </Detailed>
        ))}
      </group>
    )
  )
}

export default HoveringDisplays
