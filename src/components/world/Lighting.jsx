import { useControls } from 'leva';

export default function Lighting() {
  const {
    ambientIntensity,
    dirIntensity,
    dirPosition,
    shadowMapSize,
    shadowNormalBias,
  } = useControls('Lighting', {
    ambientIntensity: { value: 0.4, min: 0, max: 2, step: 0.01 },
    dirIntensity: { value: 0.42, min: 0, max: 2, step: 0.01 },
    dirPosition: { value: { x: 3, y: 8, z: 3 } },
    shadowMapSize: { value: 2048, options: [1024, 2048, 4096] },
    shadowNormalBias: { value: 0.06, min: 0, max: 0.2, step: 0.001 },
  });

  return (
    <>
      <ambientLight intensity={ambientIntensity} />
      <directionalLight
        castShadow
        position={[dirPosition.x, dirPosition.y, dirPosition.z]}
        intensity={dirIntensity}
        shadow-mapSize-width={shadowMapSize}
        shadow-mapSize-height={shadowMapSize}
        shadow-camera-far={50}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
        shadow-normalBias={shadowNormalBias}
      />
    </>
  );
}
