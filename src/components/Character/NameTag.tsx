import { RefObject, useState } from 'react'
// import { useThree } from '@react-three/fiber'
import { Object3D } from 'three'

import { Html } from '@client/utils/ModifiedHtmlTag'

type TNameTag = {
  name: string
  el: HTMLDivElement
}

// The NameTag component displays an HTML label with the provided name
// that dynamically reacts to object occlusion in the 3D scene.
const NameTag = (props: TNameTag) => {
  // const { scene } = useThree()

  const [listOfMeshesToOccludeAgainst] = useState<Array<RefObject<Object3D>>>(
    [],
  )

  // NOTE -- Commenting this section below as this is the reason for a huge memory footprint
  // while more than 1 player is active. Will have to decide on occlusion logic later.

  // A hook that collects all Mesh children in the scene and
  // filters them based on visibility and specific names, then updates
  // the occludableMeshesRefsArray state accordingly.
  // useEffect(() => {
  //   scene.traverse((c) => {
  //     if (
  //       c instanceof Mesh &&
  //       (c.name === 'characterRoundedBox' ||
  //         c.name === 'nameTagOccludeSphere' ||
  //         c.visible === true)
  //     ) {
  //       setListOfMeshesToOccludeAgainst((prev) => [...prev, { current: c }])
  //     }
  //   })
  // }, [scene.children])

  const [isNameTagHidden, setIsNameTagHidden] = useState(false)


  // The main return block renders the Html component with the necessary
  // styling and event handling to display the name label in the 3D scene.
  return (
    <Html
      position={[0, 2.7, 0]}
      occlude={listOfMeshesToOccludeAgainst}
      zIndexRange={[1, 1]}
      wrapperClass='nameTag'
      center
      style={{
        transformOrigin: 'center',
      }}
      onOcclude={setIsNameTagHidden}
      el={props.el}
    >
      <div
        style={{
          transition: 'all 0.5s',
          opacity: isNameTagHidden ? 0 : 1,
          transform: `scale(${isNameTagHidden ? 0.5 : 0.8})`,
          transformOrigin: 'center',
          fontFamily: 'Helvetica, Arial',
          background: '#00000088',
          color: 'white',
          padding: '7px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          borderRadius: '20px',
          userSelect: 'none',
        }}
      >
        {props.name}
      </div>
    </Html>
  )
}

export default NameTag
