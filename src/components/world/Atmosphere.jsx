import { Sky, Environment } from '@react-three/drei';
import { useControls } from 'leva';

export default function Atmosphere() {
  const {
    fogNear,
    fogFar,
    fogColor,
    useCubemapSky,
    sunPosition,
    turbidity,
    rayleigh,
    envIntensity,
  } = useControls('Atmosphere', {
    fogColor: { value: '#eeeeff' },
    fogNear: { value: 20, min: 0, max: 100, step: 1 },
    fogFar: { value: 50, min: 20, max: 200, step: 1 },
    useCubemapSky: { value: true, label: 'Use Cubemap Skybox' },
    sunPosition: { value: { x: 100, y: 20, z: 100 } },
    turbidity: { value: 0.5, min: 0, max: 10, step: 0.1 },
    rayleigh: { value: 0.5, min: 0, max: 4, step: 0.05 },
    envIntensity: { value: 0.3, min: 0, max: 2, step: 0.01 },
  });

  return (
    <>
      {/* Fog — creates depth, hides ocean edge */}
      <fog attach="fog" args={[fogColor, fogNear, fogFar]} />

      {useCubemapSky ? (
        /* Cubemap skybox from everlite-store */
        <Environment
          background
          files={['px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png']}
          path="/skybox/"
          environmentIntensity={envIntensity}
        />
      ) : (
        <>
          {/* Procedural sky dome */}
          <Sky
            sunPosition={[sunPosition.x, sunPosition.y, sunPosition.z]}
            turbidity={turbidity}
            rayleigh={rayleigh}
          />
          <Environment preset="sunset" environmentIntensity={envIntensity} />
        </>
      )}
    </>
  );
}
