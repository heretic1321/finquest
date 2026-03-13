import { memo, useEffect, useRef, useState } from 'react'
import { Mesh, MeshBasicMaterial, sRGBEncoding, Texture } from 'three'
export type TJewelleryDisplayData = {
  id: number
  title: string
  price: number
  description: string
  imageTexture: Texture
  sidePanelsTexture: {
    left: Texture
    right: Texture
  }
}

export type InventoryConsoleDisplayPanelsProps = {
  jewelleryData: TJewelleryDisplayData[]
}

export type TDescriptionMeshTransform = {
  position: [number, number, number]
  rotation: [number, number, number]
  scale: [number, number, number]
}

enum DisplayPanels {
  sidePanels,
  mainPanel,
  deskPanelLeft,
  deskPanelRight,
  description,
  null,
}

enum DisplayMeshNames {
  description = 'description',
  mainDisplay = 'mainDisplay',
  deskDisplayLeft = 'deskDisplayLeft',
  deskDisplayRight = 'deskDisplayRight',
  sideDisplayLeft1 = 'sideDisplayLeft1',
  sideDisplayLeft2 = 'sideDisplayLeft2',
  sideDisplayLeft3 = 'sideDisplayLeft3',
  sideDisplayRight1 = 'sideDisplayRight1',
  sideDisplayRight2 = 'sideDisplayRight2',
  sideDisplayRight3 = 'sideDisplayRight3',
}

const getMeshMapping = (
  meshName: string,
  midIndex: number,
): { mappedIndex: number; panel: DisplayPanels } => {
  switch (meshName) {
    case DisplayMeshNames.sideDisplayLeft1:
      return { mappedIndex: midIndex - 3, panel: DisplayPanels.sidePanels }
    case DisplayMeshNames.sideDisplayLeft2:
      return { mappedIndex: midIndex - 2, panel: DisplayPanels.sidePanels }
    case DisplayMeshNames.sideDisplayLeft3:
      return { mappedIndex: midIndex - 1, panel: DisplayPanels.sidePanels }
    case DisplayMeshNames.sideDisplayRight1:
      return { mappedIndex: midIndex + 3, panel: DisplayPanels.sidePanels }
    case DisplayMeshNames.sideDisplayRight2:
      return { mappedIndex: midIndex + 2, panel: DisplayPanels.sidePanels }
    case DisplayMeshNames.sideDisplayRight3:
      return { mappedIndex: midIndex + 1, panel: DisplayPanels.sidePanels }
    case DisplayMeshNames.mainDisplay:
      return { mappedIndex: midIndex, panel: DisplayPanels.mainPanel }
    case DisplayMeshNames.description:
      return { mappedIndex: -2, panel: DisplayPanels.description }
    case DisplayMeshNames.deskDisplayLeft:
      return { mappedIndex: midIndex, panel: DisplayPanels.deskPanelLeft }
    case DisplayMeshNames.deskDisplayRight:
      return { mappedIndex: midIndex, panel: DisplayPanels.deskPanelRight }
    default:
      return { mappedIndex: -1, panel: DisplayPanels.null }
  }
}

const MAIN_PANEL_OFFSET = { x: -1.42, y: -1.1 }
const MAIN_PANEL_REPEAT = { x: 4, y: 4 }

const SIDE_PANEL_OFFSET = { x: -1.1, y: -1.3 }
const SIDE_PANEL_REPEAT = { x: 10, y: 10 }

const DESK_PANEL_OFFSET = { x: -0.8, y: -4.3 }
const DESK_PANEL_REPEAT = { x: 8, y: 8 }

const InventoryConsoleDisplayPanels = memo(
  ({ jewelleryData }: InventoryConsoleDisplayPanelsProps) => {
    const listOfPanelMaterials = useRef<MeshBasicMaterial[]>([])
    const displayRef = useRef<THREE.Group | null>(null)
    const [, setDescriptionTransform] = useState<TDescriptionMeshTransform>({
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [0, 0, 0],
    })
    const midIndex = Math.floor(jewelleryData.length / 2)

    useEffect(() => {
      if (!displayRef) return
      //Main Screen
      const descriptionObject = displayRef.current?.children.filter(
        (child) => child.name === 'description',
      )[0] as Mesh
      if (descriptionObject)
        setDescriptionTransform({
          position: descriptionObject.position.toArray() as [
            number,
            number,
            number,
          ],
          rotation: descriptionObject.rotation.toArray() as [
            number,
            number,
            number,
          ],
          scale: descriptionObject.scale.toArray() as [number, number, number],
        })
    }, [displayRef])

    useEffect(() => {
      if (!displayRef.current) return

      displayRef.current.children.forEach((child, index) => {
        if (child instanceof Mesh) child.material.dispose()
        const { mappedIndex, panel } = getMeshMapping(child.name, midIndex)
        if (mappedIndex === -1) return

        // if there is no element present at `index` in listOfPanelMaterials, then create a new material and add it to the list
        // otherwise use the existing material
        if (listOfPanelMaterials.current.length <= index) {
          listOfPanelMaterials.current.push(new MeshBasicMaterial())
        }
        const mat = listOfPanelMaterials.current[index]

        // for description panel, we don't wanna put any texture but a plane white material
        if (child.name === 'description' && child instanceof Mesh) {
          mat.toneMapped = false
          child.material = mat
          return
        }

        mat.map = jewelleryData[mappedIndex].imageTexture
        mat.map.flipY = false
        mat.map.encoding = sRGBEncoding
        mat.toneMapped = false

        const setPanelTexture = (
          offset: { x: number; y: number },
          repeat: { x: number; y: number },
        ) => {
          if (mat.map) {
            mat.map.offset.set(offset.x, offset.y)
            mat.map.repeat.set(repeat.x, repeat.y)
          }
        }

        switch (panel) {
          case DisplayPanels.mainPanel:
            setPanelTexture(MAIN_PANEL_OFFSET, MAIN_PANEL_REPEAT)
            break

          case DisplayPanels.sidePanels:
            setPanelTexture(SIDE_PANEL_OFFSET, SIDE_PANEL_REPEAT)
            break

          case DisplayPanels.deskPanelLeft:
            mat.map = jewelleryData[midIndex].sidePanelsTexture.left
            mat.map.flipY = false
            setPanelTexture(DESK_PANEL_OFFSET, DESK_PANEL_REPEAT)
            break

          case DisplayPanels.deskPanelRight:
            mat.map = jewelleryData[midIndex].sidePanelsTexture.right
            mat.map.flipY = false
            setPanelTexture(DESK_PANEL_OFFSET, DESK_PANEL_REPEAT)
            break

          default:
            break
        }

        if (child instanceof Mesh) {
          child.material = mat
        }
      })
    }, [displayRef, jewelleryData, midIndex])

    // cleanup function before this component is unmounted
    // this component is unmounted when the user exits the presentation mode.
    // we want to dispose of the materials to free up memory along with their textures
    useEffect(() => {
      return () => {
        listOfPanelMaterials.current.forEach((material) => {
          material.map?.dispose()
          material.map = null
          material.dispose()
        })
      }
    }, [])

    return <></>
  },
)

export default InventoryConsoleDisplayPanels
