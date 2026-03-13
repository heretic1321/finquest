import { useEffect, useState } from 'react'
import { Environment } from '@react-three/drei'

import { useControls } from 'leva'

import { genericStore } from '@client/contexts/GlobalStateContext'

function EnvironmentComponent() {
  const isDebugMode = genericStore((state) => state.isDebugMode)

  const [environmentConfig, setEnvironmentConfig, getEnvironmentConfig] =
    useControls(
      'Environment',
      // eslint-disable-next-line
      (): any => ({
        isFogEnabled: {
          value: true,
          onChange: (value: boolean) => {
            setIsFogEnabled(value)
          },
        },
        fogNear: {
          value: 64.95,
          min: 0.001,
          max: 100,
          step: 0.0001,
          onChange: (value: number) => setFogNear(value),
        },
        fogFar: {
          value: 335.8,
          min: 0,
          max: 2000,
          step: 0.1,
          onChange: (value: number) => setFogFar(value),
        },
        fogColor: {
          value: '#525252',
          onChange: (value: string) => setFogColor(value),
        },
        // fogDensity: {
        //   value: 0.00025,
        //   min: 0.0001,
        //   max: 0.1,
        //   step: 0.00001,
        //   onChange: (value: number) => {
        //     setFogDensity(value)
        //   },
        // },
        defaultFogNear: {
          value: 100,
        },
        defaultFogFar: {
          value: 262.5,
        },
        disabledFogNear: {
          value: 0.01,
        },
        disabledFogFar: {
          value: 2000,
        },
      }),
      {
        collapsed: true,
        render: () => {
          return isDebugMode || false
        },
      },
    )

  const [fogNear, setFogNear] = useState<number>(
    environmentConfig.defaultFogNear,
  )
  const [fogFar, setFogFar] = useState<number>(environmentConfig.defaultFogFar)
  const [fogColor, setFogColor] = useState<string>(environmentConfig.fogColor)
  const [isFogEnabled, setIsFogEnabled] = useState<boolean>(
    environmentConfig.isFogEnabled,
  )
  // const [fogDensity, setFogDensity] = useState<number>(
  //   environmentConfig.fogDensity,
  // )

  useEffect(() => {
    if (isFogEnabled) {
      setEnvironmentConfig({
        fogNear: getEnvironmentConfig('defaultFogNear'),
        fogFar: getEnvironmentConfig('defaultFogFar'),
      })
    } else {
      setEnvironmentConfig({
        fogNear: getEnvironmentConfig('disabledFogNear'),
        fogFar: getEnvironmentConfig('disabledFogFar'),
      })
    }
  }, [isFogEnabled])

  return (
    <>
      <fog attach='fog' color={fogColor} near={fogNear} far={fogFar} />
      {/* <fogExp2 attach='fog' color={fogColor} density={fogDensity} /> */}
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
        path='./assets/skybox/forBackground/'
      />
      {/* <Environment
        background={false}
        files={[
          'pxLg.png',
          'nxLg.png',
          'pyLg.png',
          'nyLg.png',
          'pzLg.png',
          'nzLg.png',
        ]}
        path='./assets/skybox/forLighting/'
      /> */}
    </>
  )
}

export default EnvironmentComponent
