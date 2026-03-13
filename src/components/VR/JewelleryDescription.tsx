import { Container, Root, Text } from '@react-three/uikit'

type JewelleryDescriptionProps = {
  offset: [number, number, number]
}

function JewelleryDescription({ offset }: JewelleryDescriptionProps) {
  const onClickBuyNowButton = () => {
    window.open(
      'https://sencogoldanddiamonds.com/jewellery/dual-butterfly-glow-gold-ring',
    )
  }
  return (
    <group position={offset}>
      {/* @ts-ignore */}
      <Root
        backgroundColor='#150829'
        borderRadius={12}
        sizeX={3}
        sizeY={2}
        justifyContent='center'
        alignItems='center'
        padding={8}
        margin={2}
        borderColor='#b43fa2'
        flexDirection='column'
        borderWidth={1}
        //panelMaterialClass={WhiteFoggyGlassMaterial}
        paddingLeft={12}
      >
        {/* @ts-ignore */}
        <Container flexGrow={'1'} width={'100%'} height={'15%'}>
          {/* @ts-ignore */}
          <Text fontWeight='bold' fontSize={14} color='#FFFFFF'>
            Dual Butterfly Glow Gold Ring
          </Text>
        </Container>
        {/* @ts-ignore */}
        <Container flexGrow={'1'} width={'100%'} height={'10%'}>
          {/* @ts-ignore */}
          <Text fontSize={12} fontWeight='bold' color='#D0D0D0'>
            91.66kt | 9 Size - 15.7 mm | 22K Yellow Gold
          </Text>
        </Container>
        {/* @ts-ignore */}
        <Container
          flexDirection='column'
          flexGrow={1}
          width='100%'
          height='50%'
          justifyContent='space-between'
          padding={10}
          paddingLeft={0}
          paddingBottom={20}
        >
          {/* @ts-ignore */}
          <Text fontSize={10} fontWeight='bold' color='#FF6F61'>
            Rs. 150 off on Gold Rate & 25% off on Making Charge
          </Text>
          {/* @ts-ignore */}
          <Text fontWeight='bold' fontSize={16} color='#FFFFFF'>
            Rs. 28,209
          </Text>
          {/* @ts-ignore */}
          <Text fontSize={10} fontWeight='bold' color='#A0A0A0'>
            Inclusive of all taxes
          </Text>
        </Container>
        {/* @ts-ignore */}
        <Container
          flexDirection='row'
          flexGrow={1}
          width='100%'
          height='25%'
          justifyContent='space-between'
          padding={5}
          paddingLeft={40}
          paddingRight={40}
        >
          {/* @ts-ignore */}
          <Container
            backgroundColor='#261246'
            width='98%'
            borderRadius={8}
            alignItems='center'
            justifyContent='center'
            padding={10}
            borderColor='#b43fa2'
            borderWidth={1}
            onPointerUp={() => onClickBuyNowButton()}
          >
            {/* @ts-ignore */}
            <Text fontWeight='bold' color='#FFFFFF' fontSize={14}>
              Buy Now
            </Text>
          </Container>
        </Container>
      </Root>
    </group>
  )
}

export default JewelleryDescription
