import { memo } from 'react'
import {
  EffectComposer,
  Bloom,
  SMAA,
} from '@react-three/postprocessing'
import useWorldStore from '../stores/worldStore'

const Effects = memo(() => {
  const areEffectsEnabled = useWorldStore((state) => state.areEffectsEnabled)

  return (
    <>
      <directionalLight
        color={0xffffff}
        intensity={0.5}
        position={[-93, 202, -177]}
        name="directionalLight"
      />
      <hemisphereLight
        color={0xffffff}
        groundColor={0x223344}
        intensity={0.3}
        name="hemisphereLight"
      />

      <EffectComposer
        multisampling={0}
        enabled={areEffectsEnabled}
      >
        <SMAA />
        <Bloom
          intensity={3}
          luminanceThreshold={0.8}
          luminanceSmoothing={0.5}
          mipmapBlur
        />
      </EffectComposer>
    </>
  )
})

Effects.displayName = 'Effects'

export default Effects
