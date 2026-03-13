import { useEffect } from 'react'
import { Container, Root, Svg, Text } from '@react-three/uikit'
import { useXRStore } from '@react-three/xr'
import { MeshPhongMaterial } from 'three'

import { useShallow } from 'zustand/react/shallow'

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

function HandMenu() {
  const store = useXRStore()
  const { isVRHudVisible, isTriggerUIActive, setIsTriggerUIActive } = vrStore(
    useShallow((state) => ({
      isVRHudVisible: state.isVRHudVisible,
      isTriggerUIActive: state.isTriggerUIActive,
      setIsTriggerUIActive: state.setIsTriggerUIActive,
    })),
  )

  useEffect(() => {
    if (isVRHudVisible && isTriggerUIActive) {
      setIsTriggerUIActive(false)
    }
  }, [isTriggerUIActive, isVRHudVisible])

  return (
    <group rotation={[-Math.PI / 4, 0, 0]}>
      <group
        position={[0, 0.18, 0]}
        rotation={[0, 0, 0]}
        scale={[0.05, 0.05, 0.05]}
        visible={isVRHudVisible}
      >
        {/* @ts-ignore */}
        <Root
          backgroundColor='#ffffff'
          sizeX={6}
          sizeY={3}
          flexDirection='row'
          padding={16}
          borderRadius={8}
          panelMaterialClass={WhiteFoggyGlassMaterial}
        >
          {/* @ts-ignore */}
          <Container
            flexGrow={1}
            flexDirection='column'
            justifyContent='space-around'
            width='90%'
            height='100%'
          >
            {/* @ts-ignore */}
            <Container
              flexGrow={1}
              flexDirection='row'
              justifyContent='space-around'
              width='100%'
              height='50%'
            >
              {/* @ts-ignore */}
              <Container
                margin={10}
                flexGrow={1}
                flexDirection='column'
                justifyContent='center'
                alignItems='center'
                borderRadius={30}
                borderColor='#de4dbf'
                borderWidth={2}
                width='30%'
                backgroundColor='#140924'
                backgroundOpacity={0.8}
                onPointerUp={() => {
                  store.getState().session?.end()
                  window.location.reload()
                }}
              >
                {/* @ts-ignore */}
                <Svg
                  margin={8}
                  src='./assets/vr/icons/exitVR.svg'
                  width={50}
                  color='white'
                />
                {/* @ts-ignore */}
                <Text
                  fontSize={18}
                  fontWeight='bold'
                  color='#fff'
                  textAlign='center'
                >
                  Exit VR
                </Text>
              </Container>
              {/* @ts-ignore */}
              <Container
                margin={10}
                flexGrow={1}
                flexDirection='column'
                justifyContent='center'
                alignItems='center'
                borderRadius={30}
                borderColor='#de4dbf'
                borderWidth={2}
                width='30%'
                backgroundColor='#140924'
                backgroundOpacity={0.8}
              >
                {/* @ts-ignore */}
                <Svg margin={8} src='./assets/vr/icons/info.svg' width={15} />
                {/* @ts-ignore */}
                <Text
                  fontSize={18}
                  fontWeight='bold'
                  color='#fff'
                  textAlign='center'
                >
                  Info
                </Text>
              </Container>
              {/* @ts-ignore */}
              <Container
                margin={10}
                flexGrow={1}
                flexDirection='column'
                justifyContent='center'
                alignItems='center'
                borderRadius={30}
                borderColor='#de4dbf'
                borderWidth={2}
                width='30%'
                backgroundColor='#140924'
                backgroundOpacity={0.8}
              >
                {/* @ts-ignore */}
                <Svg
                  margin={10}
                  src='./assets/vr/icons/cart.svg'
                  width={60}
                  color='white'
                />
                {/* @ts-ignore */}
                <Text
                  fontSize={18}
                  fontWeight='bold'
                  color='#fff'
                  textAlign='center'
                >
                  Cart
                </Text>
              </Container>
            </Container>

            {/* @ts-ignore */}
            <Container
              flexGrow={1}
              flexDirection='row'
              justifyContent='space-around'
              width='100%'
              height='50%'
            >
              {/* @ts-ignore */}
              <Container
                margin={10}
                flexGrow={1}
                flexDirection='column'
                justifyContent='center'
                alignItems='center'
                borderRadius={30}
                borderColor='#de4dbf'
                borderWidth={2}
                width='30%'
                backgroundColor='#140924'
                backgroundOpacity={0.8}
              >
                {/* @ts-ignore */}
                <Svg
                  margin={2}
                  src='./assets/vr/icons/avatar.svg'
                  width={65}
                  color='white'
                />
                {/* @ts-ignore */}
                <Text
                  fontSize={18}
                  fontWeight='bold'
                  color='#fff'
                  textAlign='center'
                >
                  Character
                </Text>
              </Container>
              {/* @ts-ignore */}
              <Container
                margin={10}
                flexGrow={1}
                flexDirection='column'
                justifyContent='center'
                alignItems='center'
                borderRadius={30}
                borderColor='#de4dbf'
                borderWidth={2}
                width='30%'
                backgroundColor='#140924'
                backgroundOpacity={0.8}
              >
                {/* @ts-ignore */}
                <Svg
                  margin={7}
                  src='./assets/vr/icons/map.svg'
                  width={60}
                  color='white'
                />
                {/* @ts-ignore */}
                <Text
                  fontSize={18}
                  fontWeight='bold'
                  color='#fff'
                  textAlign='center'
                >
                  Map
                </Text>
              </Container>
              {/* @ts-ignore */}
              <Container
                margin={10}
                flexGrow={1}
                flexDirection='column'
                justifyContent='center'
                alignItems='center'
                borderRadius={30}
                borderColor='#de4dbf'
                borderWidth={2}
                width='30%'
                backgroundColor='#140924'
                backgroundOpacity={0.8}
              >
                {/* @ts-ignore */}
                <Svg
                  margin={8}
                  src='./assets/vr/icons/mute.svg'
                  width={50}
                  color='white'
                />
                {/* @ts-ignore */}
                <Text
                  fontSize={18}
                  fontWeight='bold'
                  color='#fff'
                  textAlign='center'
                >
                  Mute
                </Text>
              </Container>
            </Container>
          </Container>
          {/* @ts-ignore */}
          <Container
            flexGrow={1}
            flexDirection='row'
            justifyContent='space-around'
            width='10%'
            height='100%'
          >
            {/* @ts-ignore */}
            <Container
              width='100%'
              height='100%'
              marginLeft={10}
              backgroundColor='white'
              borderRadius={5}
              borderColor={'#51fc49'}
              borderWidth={2}
            >
              {/* @ts-ignore */}
              <Container
                marginTop={103}
                marginLeft={4}
                marginRight={4}
                width='100%'
                height='60%'
                backgroundColor='#51fc49'
                borderRadius={5}
              ></Container>
            </Container>
          </Container>
        </Root>
      </group>
    </group>
  )
}

export default HandMenu
