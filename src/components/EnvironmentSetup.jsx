import { Environment } from '@react-three/drei'

function EnvironmentSetup() {
  return (
    <>
      <fog attach="fog" args={['#87CEEB', 80, 300]} />
      <Environment
        background={true}
        files={[
          'px.png',
          'nx.png',
          'py.png',
          'ny.png',
          'pz.png',
          'nz.png',
        ]}
        path="./skybox/"
      />
    </>
  )
}

export default EnvironmentSetup
