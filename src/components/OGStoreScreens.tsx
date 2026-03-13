import Screen from '@client/components/VideoPlayer'
import { screens } from '@client/config/dimensions'
import { staticResourcePaths } from '@client/config/staticResourcePaths'
import { Image } from '@react-three/drei'

const OGStoreScreens = () => {

  return (
    <>
      <Screen
        name={"1"}
        modelPath={staticResourcePaths.tvScreen}
        videoUrl={`${staticResourcePaths.s3_bucket_cdn}sencoMarketing1.mp4`}
        position={screens[0].position}
        scale={screens[0].scale}
        rotation={screens[0].rotation}
      />
      <Screen
        name={"2"}
        modelPath={staticResourcePaths.tvScreen}
        videoUrl={`${staticResourcePaths.s3_bucket_cdn}Sencomarketing2.mp4`}
        position={screens[1].position}
        scale={screens[1].scale}
        rotation={screens[1].rotation}
      />
      {/* first floor */}
      <Screen
        name={"3"}
        modelPath={staticResourcePaths.tvScreen}
        videoUrl={`${staticResourcePaths.s3_bucket_cdn}Sencomarketing2.mp4`}
        position={screens[2].position}
        scale={screens[2].scale}
        rotation={screens[2].rotation}
      />
      <Image
        url={`${staticResourcePaths.s3_bucket_cdn}poster_1.webp`}
        position={[
          -6.38053628,
          6.35034660,
          -115.5721321669848,
        ]}
        rotation={[
          -3.141592653589793,
          0.7837057777383358,
          -3.141592653589793,
          'XYZ',
        ]}
        scale={[2.09491882, 3.23730736]}
      />
      <Image
        url={`${staticResourcePaths.s3_bucket_cdn}poster_2.webp`}
        position={[
          -13.475471991819571,
          6.352703834954874,
          -122.66370359935293
        ]}
        rotation={[
          -3.141592653589793,
          0.7837057777383358,
          -3.141592653589793,
          'XYZ',
        ]}
        scale={[
          2.1662696995915938,
          3.34756686461856,
        ]}
      />
      <Image
        url={`${staticResourcePaths.s3_bucket_cdn}poster_3.webp`}
        position={[
          -26.010586483489224,
          18.59104547235755,
          -140.61404695848225
        ]}
        rotation={[-0, 0.789538340477256, -0, 'XYZ']}
        scale={[
          3.437021899154334,
          6.201941003786223,
        ]}
      />
      <Image
        url={`${staticResourcePaths.s3_bucket_cdn}poster_4.webp`}
        position={[
          -2.238326017082806,
          18.583819630165912,
          -164.36980407774652
        ]}
        rotation={[-0, 0.789538340477256, -0, 'XYZ']}
        scale={[
          3.191939343035014,
          5.759701297811949,
        ]}
      />
    </>
  )
}

export default OGStoreScreens
