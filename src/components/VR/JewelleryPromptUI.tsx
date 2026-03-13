import { Container, Root, Text } from '@react-three/uikit'
import { MeshPhongMaterial } from 'three'

class OuterMaterial extends MeshPhongMaterial {
  constructor() {
    super({
      color: 0xa98ed1,
      specular: 0xa98ed1,
      shininess: 5,
    })
  }
}

type TriggerUIProps = {
  offset: [number, number, number]
}

class InnerMaterial extends MeshPhongMaterial {
  constructor() {
    super({
      color: 0x6a0dad,
      specular: 0x6a0dad,
      shininess: 5,
      opacity: 0.9,
      transparent: true,
    })
  }
}

function JewelleryPromptUI({ offset }: TriggerUIProps) {
  return (
    <group position={offset}>
      {/* @ts-ignore */}
      <Root
        backgroundColor='##a98ed1'
        borderRadius={12}
        sizeX={1.5}
        sizeY={0.6}
        justifyContent='center'
        alignItems='center'
        padding={8}
        margin={2}
        borderColor='#b43fa2'
        borderWidth={1}
        panelMaterialClass={OuterMaterial}
      >
        {/* @ts-ignore */}
        <Container
          justifyContent='center'
          alignItems='center'
          backgroundColor='#6a0dad'
          width='30%'
          height='80%'
          borderRadius={8}
          borderColor='#b43fa2'
          borderWidth={1}
          panelMaterialClass={InnerMaterial}
        >
          {/* @ts-ignore */}
          <Text
            fontSize={20}
            fontWeight='bold'
            textAlign='center'
            verticalAlign='center'
            color='#FFFFFF'
          >
            {'B'}
          </Text>
        </Container>
        {/* @ts-ignore */}
        <Container
          justifyContent='center'
          alignItems='center'
          width='70%'
          height='100%'
        >
          {/* @ts-ignore */}
          <Text
            fontSize={12}
            fontWeight='bold'
            textAlign='center'
            verticalAlign='center'
            color='white'
          >
            {'Open Showcase'}
          </Text>
        </Container>
      </Root>
    </group>
  )
}

export default JewelleryPromptUI
