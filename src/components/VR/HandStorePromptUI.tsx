import { useEffect } from 'react'
import { Root, Text } from '@react-three/uikit'
import { MeshPhongMaterial } from 'three'

import { useShallow } from 'zustand/react/shallow'

import { HUDStore } from '@client/contexts/HUDContext'
import { vrStore } from '@client/contexts/VRStateContext'

class WhiteFoggyGlassMaterial extends MeshPhongMaterial {
  constructor() {
    super({
      color: 0xffffff,
      specular: 0xffffff,
      shininess: 80,
      opacity: 0.5,
      transparent: true,
    })
  }
}

function HandStorePromptUI() {
  const { isEnterStorePromptShown, isExitStorePromptShown } = HUDStore(
    useShallow((state) => ({
      isEnterStorePromptShown: state.isEnterStorePromptShown,
      isExitStorePromptShown: state.isExitStorePromptShown,
    })),
  )

  const {
    setIsTriggerUIActive,
    isVRHudVisible,
    setIsVRHudVisible,
    isTriggerUIActive,
  } = vrStore(
    useShallow((state) => ({
      setIsTriggerUIActive: state.setIsTriggerUIActive,
      isVRHudVisible: state.isVRHudVisible,
      setIsVRHudVisible: state.setIsVRHudVisible,
      isTriggerUIActive: state.isTriggerUIActive,
    })),
  )

  useEffect(() => {
    const showTriggerUI = isEnterStorePromptShown || isExitStorePromptShown
    setIsTriggerUIActive(showTriggerUI)
    if (isVRHudVisible && showTriggerUI) {
      setIsVRHudVisible(false)
    }
  }, [isEnterStorePromptShown, isExitStorePromptShown])

  return (
    <>
      {/* conitional rendering wont work with text component, as it is creating a 3d mesh
        so we cant mount chnage text part when it is mounted already so we need to use grouo
        to hide it.
    */}
      <group rotation={[-Math.PI / 4, 0, 0]}>
        <group
          rotation={[0, 0, 0]}
          position={[0, 0.18, 0]}
          visible={isTriggerUIActive}
        >
          <group visible={isEnterStorePromptShown}>
            {/* @ts-ignore */}
            <Root
              backgroundColor='#ffffff'
              borderRadius={2}
              sizeX={0.25}
              sizeY={0.12}
              justifyContent='center'
              alignItems='center'
              padding={4}
              margin={2}
              panelMaterialClass={WhiteFoggyGlassMaterial}
            >
              {/* @ts-ignore */}
              <Text
                fontSize={2.5}
                fontWeight='bold'
                textAlign='center'
                verticalAlign='center'
                color='#333'
              >
                {"Press 'A' to Enter"}
              </Text>
            </Root>
          </group>
          <group visible={isExitStorePromptShown}>
            {/* @ts-ignore */}
            <Root
              backgroundColor='#ffffff'
              borderRadius={2}
              sizeX={0.25}
              sizeY={0.12}
              justifyContent='center'
              alignItems='center'
              padding={4}
              margin={2}
              panelMaterialClass={WhiteFoggyGlassMaterial}
            >
              {/* @ts-ignore */}
              <Text
                fontSize={2.5}
                fontWeight='bold'
                textAlign='center'
                verticalAlign='center'
                color='#333'
              >
                {"Press 'A' to Exit"}
              </Text>
            </Root>
          </group>
        </group>
      </group>
    </>
  )
}

export default HandStorePromptUI
