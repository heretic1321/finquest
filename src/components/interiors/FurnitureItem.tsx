import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useControls, button, folder } from 'leva'

type FurnitureItemProps = {
  id: string
  name: string
  children: React.ReactNode
  defaultPosition?: [number, number, number]
  defaultRotation?: [number, number, number]
  defaultScale?: [number, number, number]
  folder?: string
}

// Persistent saved transforms (survives hot reload)
const savedTransforms: Record<string, { position: [number, number, number]; rotation: [number, number, number]; scale: [number, number, number] }> = {}

// Load from localStorage on init
try {
  const stored = localStorage.getItem('finquest_furniture_transforms')
  if (stored) Object.assign(savedTransforms, JSON.parse(stored))
} catch {}

export function getSavedTransform(id: string) {
  return savedTransforms[id]
}

export default function FurnitureItem({
  id,
  name,
  children,
  defaultPosition = [0, 0, 0],
  defaultRotation = [0, 0, 0],
  defaultScale = [1, 1, 1],
  folder: folderName,
}: FurnitureItemProps) {
  const groupRef = useRef<THREE.Group>(null!)

  const saved = savedTransforms[id]
  const initPos = saved?.position || defaultPosition
  const initRot = saved?.rotation || defaultRotation
  const initScl = saved?.scale || defaultScale

  const controls = useControls(
    folderName || 'Furniture',
    {
      [name]: folder({
        [`${id}_pos`]: { value: initPos, label: 'Position', step: 0.1 },
        [`${id}_rot`]: { value: initRot, label: 'Rotation', step: 0.05 },
        [`${id}_scl`]: { value: initScl, label: 'Scale', step: 0.1 },
        [`${id}_save`]: button(() => {
          if (!groupRef.current) return
          const p = groupRef.current.position.toArray() as [number, number, number]
          const r = [groupRef.current.rotation.x, groupRef.current.rotation.y, groupRef.current.rotation.z] as [number, number, number]
          const s = groupRef.current.scale.toArray() as [number, number, number]
          savedTransforms[id] = { position: p, rotation: r, scale: s }
          localStorage.setItem('finquest_furniture_transforms', JSON.stringify(savedTransforms))
          console.log(`[Furniture] Saved ${name}:`, JSON.stringify(savedTransforms[id]))
          alert(`Saved ${name}!\nPosition: [${p.map(v => v.toFixed(2))}]\nRotation: [${r.map(v => v.toFixed(2))}]\nScale: [${s.map(v => v.toFixed(2))}]`)
        }, { label: 'Save Transform' }),
      }),
    },
  )

  const pos = controls[`${id}_pos`] as [number, number, number]
  const rot = controls[`${id}_rot`] as [number, number, number]
  const scl = controls[`${id}_scl`] as [number, number, number]

  useFrame(() => {
    if (!groupRef.current) return
    groupRef.current.position.set(pos[0], pos[1], pos[2])
    groupRef.current.rotation.set(rot[0], rot[1], rot[2])
    groupRef.current.scale.set(scl[0], scl[1], scl[2])
  })

  return (
    <group ref={groupRef}>
      {children}
    </group>
  )
}
