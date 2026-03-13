import { useEffect, useMemo } from 'react'
import { useLoader, useThree } from '@react-three/fiber'
import { PMREMGenerator } from 'three'
import { RGBELoader } from 'three-stdlib'
import { useCubeTexture } from '@react-three/drei'

// According to this - https://threejs.org/docs/#api/en/materials/MeshStandardMaterial.envMap
// When we're adding an envMap to a MeshStandardMaterial, to ensure a physically correct rendering,
// we should only add environment maps which were preprocessed by PMREMGenerator.
// This function takes in a url of an HDR image and returns a THREE.Texture preprocessed by PMREMGenerator
export default function usePMREM(url: string) {
  const { gl } = useThree()
  const texture = useLoader(RGBELoader, url)
  const pmremGenerator = useMemo(() => new PMREMGenerator(gl), [gl])
  const envMap = useMemo(
    () => pmremGenerator.fromEquirectangular(texture as THREE.Texture).texture,
    [pmremGenerator, texture],
  )

  useEffect(() => {
    pmremGenerator.dispose()
    ;(texture as THREE.Texture).dispose()
  }, [pmremGenerator, texture])

  return envMap
}

export function usePMREMWithCubeMap(path: string) {
  const { gl } = useThree()

  // generate a cube texture first
  const cubeTexture = useCubeTexture(['px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png'], { path: path })
  const pmremGenerator = useMemo(() => new PMREMGenerator(gl), [gl])
  const envMapPMREM = useMemo(() => pmremGenerator.fromCubemap(cubeTexture).texture, [cubeTexture, pmremGenerator])

  useEffect(() => {
    pmremGenerator.dispose()
    cubeTexture.dispose()
  }, [pmremGenerator, cubeTexture])

  return envMapPMREM
}
