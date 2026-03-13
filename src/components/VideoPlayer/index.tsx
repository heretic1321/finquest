import { useGLTF, useVideoTexture } from '@react-three/drei'
import { PrimitiveProps } from '@react-three/fiber'
import {
  useEffect,
  useState
} from 'react'
import { BufferGeometry, LinearFilter, Mesh, MeshBasicMaterial } from 'three'
import { GLTF } from 'three-stdlib'

type TScreen = {
  name: string
  videoUrl: string
  modelPath: string
} & Partial<PrimitiveProps>

const Screen = (props: TScreen) => {
  const { scene } = useGLTF(props.modelPath) as GLTF
  const texture = useVideoTexture(props.videoUrl, { muted: true })
  const [material, setMaterial] = useState<MeshBasicMaterial | null>(null)
  const [geometry, setGeometry] = useState<BufferGeometry | null>(null)

  useEffect(() => {
    if (!scene || !texture) return

    if (texture) {
      texture.repeat.x = -1 //To correct the mirroring of the video texture
      texture.repeat.y = 1
      texture.offset.x = 1
      texture.minFilter = LinearFilter
      // texture.image.volume = 0.4
    }

    //Applying video texture to the Screen named mesh inside the TV model
    scene.traverse((object) => {
      if (object instanceof Mesh && object.name === 'Screen') {
        const material = new MeshBasicMaterial({
          map: texture,
          toneMapped: false,
        })
        setMaterial(material)
        setGeometry(object.geometry.clone())

        object.geometry.dispose()
      }
    })
  }, [scene, texture])

  return (
    <mesh
      geometry={geometry ?? undefined}
      material={material ?? undefined}
      {...props}
    >
    </mesh>
  )
}

export default Screen
