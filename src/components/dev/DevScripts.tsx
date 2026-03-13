import { useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import { Mesh, Object3D } from 'three'

import { staticResourcePaths } from '@client/config/staticResourcePaths'
import { TransformLite } from '@client/utils/commonTypes'

const DevScripts = () => {
  // useEffect(() => {
  //   deleteGroupData(true)
  // }, [])
  // syncGroupDataToDB(true)

  // useEffect(() => {
  //   deleteItemData(true)
  // }, [])
  // syncItemDataToDB(true)

  return null
}

export default DevScripts

// @ts-ignore
const deleteGroupData = async (toRun: boolean) => {
  if (!toRun) return

  const baseUrl = 'http://localhost:8000'
  fetch(`${baseUrl}/groups`, {
    method: 'DELETE',
  })
}

// @ts-ignore
const deleteItemData = async (toRun: boolean) => {
  if (!toRun) return

  const baseUrl = 'http://localhost:8000'
  fetch(`${baseUrl}/items`, {
    method: 'DELETE',
  })
}

// @ts-ignore
const syncItemDataToDB = async (toRun: boolean) => {
  if (!toRun) return

  // const skuFileList = [
  //   'DLR-D000284426.glb',
  //   'DLR-D000284427.glb',
  //   'DLR-D000284440.glb',
  //   'DLR-D000284443.glb',
  //   'DPN-D000284428.glb',
  //   'DPN-D000284429.glb',
  //   'DPN-D000284430.glb',
  //   'DT-D000284438.glb',
  //   'DT-D000284437.glb',
  //   'DT-D000284439.glb',
  // ].map(
  //   // replace _ with - in sku
  //   (sku) => sku.replace('_', '-'),
  // )

  // const skuFileList = [
  //   "DBR-D000563895.glb",
  //   "DBR-D000563963.glb",
  //   "DBR-D000564060.glb",
  //   "DCP-D000683134.glb",
  //   "DCP-D000683136.glb",
  //   "DCP-D000683140.glb",
  //   "DCP-D000683166.glb",
  //   "DCP-D000710774.glb",
  //   "DCP-D000710775.glb",
  //   "DCP-D000710776.glb",
  //   "DCP-D000710777.glb",
  //   "DLR-D000284426.glb",
  //   "DLR-D000284427.glb",
  //   "DLR-D000284440.glb",
  //   "DLR-D000284443.glb",
  //   "DLR-D000599281.glb",
  //   "DLR-D000683128.glb",
  //   "DLR-D000683129.glb",
  //   "DLR-D000683168.glb",
  //   "DLR-D000683237.glb",
  //   "DLR-D000686411.glb",
  //   "DLR-D000686431.glb",
  //   "DLR-D000733993.glb",
  //   "DLR-D000733994.glb",
  //   "DPN-D000284428.glb",
  //   "DPN-D000284429.glb",
  //   "DPN-D000284430.glb",
  //   "DPN-D000284431.glb",
  //   "DPN-D000284432.glb",
  //   "DPN-D000284433.glb",
  //   "DPN-D000284434.glb",
  //   "DPN-D000284435.glb",
  //   "DT-D000284436.glb",
  //   "DT-D000284437.glb",
  //   "DT-D000284438.glb",
  //   "DT-D000284439.glb",
  //   "GLR-D000559282.glb",
  //   "GLR-D000578688.glb",
  //   "GLR-D000578732.glb",
  //   "GLR-D000578753.glb",
  //   "GLR-D000578755.glb",
  //   "GLR-D000578764.glb",
  //   "GLR-D000705677.glb",
  //   "GLR-D000705679.glb",
  //   "GLR-D000705680.glb",
  //   "GLR-D000705681.glb",
  //   "GLR-D000705682.glb",
  //   "GLR-SAD0003037.glb",
  //   "GLR-SAD0003038.glb",
  //   "GN-SAD0003027.glb",
  //   "GN-SAD0003028.glb",
  //   "GN-SAD0003029.glb",
  //   "GN-SAD0003050.glb",
  //   "GP-D000705672.glb",
  //   "GP-D000705673.glb",
  //   "GP-D000705675.glb",
  //   "GP-D000705676.glb",
  //   "GP-SAD0003033.glb",
  //   "GP-SAD0003034.glb",
  //   "GP-SAD0003035.glb",
  //   "GP-SAD0003036.glb",
  //   "GP-SAD0003039.glb",
  //   "GP-SAD0003042.glb",
  //   "GP-SAD0003045.glb",
  //   "GPGN-SAD0003030.glb",
  //   "GPN-SAD0003041.glb",
  //   "GPN-SAD0003046.glb",
  //   "GPN-SAD0003048.glb",
  //   "GPNGP-SAD0003040.glb",
  //   "GPNGP-SAD0003043.glb",
  //   "GPNGP-SAD0003047.glb",
  //   "GT-D000705689.glb",
  //   "GT-D000705692.glb",
  //   "GT-D000705694.glb",
  //   "GT-D000705695.glb",
  //   "GT-D000705696.glb",
  //   "GT-D000705697.glb",
  //   "GT-D000705698.glb",
  // ]

  // const skuFileList = [
  //   'DBR-D000563895.glb',
  //   'DBR-D000563895_hub.glb',
  //   'DBR-D000563963.glb',
  //   'DBR-D000564060.glb',
  //   'DBR-D000564060_hub.glb',
  //   'DCP-D000683134.glb',
  //   'DCP-D000683134_hub.glb',
  //   'DCP-D000683136.glb',
  //   'DCP-D000683140.glb',
  //   'DCP-D000683166.glb',
  //   'DCP-D000710774.glb',
  //   'DCP-D000710775.glb',
  //   'DCP-D000710776.glb',
  //   'DCP-D000710777.glb',
  //   'DLR-D000284426.glb',
  //   'DLR-D000284426_hub.glb',
  //   'DLR-D000284427.glb',
  //   'DLR-D000284427_hub.glb',
  //   'DLR-D000284440.glb',
  //   'DLR-D000284443.glb',
  //   'DLR-D000599281.glb',
  //   'DLR-D000677455.glb',
  //   'DLR-D000677455_hub.glb',
  //   'DLR-D000677458.glb',
  //   'DLR-D000677504.glb',
  //   'DLR-D000677521.glb',
  //   'DLR-D000677776.glb',
  //   'DLR-D000677781.glb',
  //   'DLR-D000677783.glb',
  //   'DLR-D000677783_hub.glb',
  //   'DLR-D000677785.glb',
  //   'DLR-D000677791.glb',
  //   'DLR-D000677795.glb',
  //   'DLR-D000677823.glb',
  //   'DLR-D000677831.glb',
  //   'DLR-D000677834.glb',
  //   'DLR-D000677837.glb',
  //   'DLR-D000677838.glb',
  //   'DLR-D000677894.glb',
  //   'DLR-D000677903.glb',
  //   'DLR-D000683128.glb',
  //   'DLR-D000683129.glb',
  //   'DLR-D000683168.glb',
  //   'DLR-D000683237.glb',
  //   'DLR-D000686411.glb',
  //   'DLR-D000686431.glb',
  //   'DLR-D000733993.glb',
  //   'DLR-D000733994.glb',
  //   'DPN-D000284428.glb',
  //   'DPN-D000284428_hub.glb',
  //   'DPN-D000284429.glb',
  //   'DPN-D000284430.glb',
  //   'DPN-D000284431.glb',
  //   'DPN-D000284432.glb',
  //   'DPN-D000284433.glb',
  //   'DPN-D000284434.glb',
  //   'DPN-D000284435.glb',
  //   'DPN-D000539534.glb',
  //   'DPN-D000539534_hub.glb',
  //   'DPN-D000546709.glb',
  //   'DPN-D000546893.glb',
  //   'DPN-D000555837.glb',
  //   'DPN-D000555840.glb',
  //   'DPN-D000563859.glb',
  //   'DPN-D000563881.glb',
  //   'DPN-D000601538.glb',
  //   'DPN-D000601574.glb',
  //   'DPN-D000607608.glb',
  //   'DPN-D000607667.glb',
  //   'DPN-D000619850.glb',
  //   'DPN-D000619922.glb',
  //   'DPN-D000620794.glb',
  //   'DPN-D000621405.glb',
  //   'DPN-D000621411.glb',
  //   'DPN-D000621414.glb',
  //   'DPN-D000623959.glb',
  //   'DPN-D000623961.glb',
  //   'DPN-D000636790.glb',
  //   'DPN-D000636792.glb',
  //   'DPN-D000642235.glb',
  //   'DPN-D000642250.glb',
  //   'DPN-D000642250_hub.glb',
  //   'DPN-D000647316.glb',
  //   'DPN-D000673499.glb',
  //   'DPN-D000673500.glb',
  //   'DPN-D000673502.glb',
  //   'DPN-D000673514.glb',
  //   'DPN-D000673516.glb',
  //   'DPN-D000673518.glb',
  //   'DPN-D000673519.glb',
  //   'DPN-D000673583.glb',
  //   'DPN-D000673584.glb',
  //   'DPN-D000677447.glb',
  //   'DPN-D000677447_hub.glb',
  //   'DPN-D000677453.glb',
  //   'DPN-D000677991_GT-D000685784.glb',
  //   'DPN-D000679115_GT-D000685787.glb',
  //   'DPN-D000679126_GT-D000685776.glb',
  //   'DPN-D000680241.glb',
  //   'DPN-D000680242.glb',
  //   'DPN-D000680243.glb',
  //   'DPN-D000680247.glb',
  //   'DPN-D000680248.glb',
  //   'DPN-D000692729.glb',
  //   'DPN-D000692730.glb',
  //   'DPN-D000692732.glb',
  //   'DPN-D000692734.glb',
  //   'DPN-D000692737.glb',
  //   'DPN-D000692740.glb',
  //   'DPN-D000692743.glb',
  //   'DPN-D000692743_hub.glb',
  //   'DPN-D000692745.glb',
  //   'DPN-D000692748.glb',
  //   'DPN-D000699877.glb',
  //   'DPN-D000699878.glb',
  //   'DPN-D000699881.glb',
  //   'DPN-D000706561.glb',
  //   'DT-D000284436.glb',
  //   'DT-D000284437.glb',
  //   'DT-D000284437_hub.glb',
  //   'DT-D000284438.glb',
  //   'DT-D000284439.glb',
  //   'DT-D000284439_hub.glb',
  //   'DT-D000641163.glb',
  //   'DT-D000663196.glb',
  //   'DT-D000663209.glb',
  //   'DT-D000663212.glb',
  //   'DT-D000670614.glb',
  //   'DT-D000677360.glb',
  //   'DT-D000677419.glb',
  //   'DT-D000677419_hub.glb',
  //   'DT-D000677443.glb',
  //   'DT-D000677443_hub.glb',
  //   'DT-D000677577.glb',
  //   'DT-D000677577_hub.glb',
  //   'DT-D000679128.glb',
  //   'DT-D000683111.glb',
  //   'DT-D000683112.glb',
  //   'DT-D000683114.glb',
  //   'DT-D000683114_hub.glb',
  //   'DT-D000683117.glb',
  //   'DT-D000733758.glb',
  //   'DT-D000733759.glb',
  //   'DT-D000733760.glb',
  //   'DT-D000733760_hub.glb',
  //   'DTPN-D000677450.glb',
  //   'DTPN-D000677454.glb',
  //   'GLR-D000559282.glb',
  //   'GLR-D000578688.glb',
  //   'GLR-D000578688_hub.glb',
  //   'GLR-D000578732.glb',
  //   'GLR-D000578753.glb',
  //   'GLR-D000578755.glb',
  //   'GLR-D000578755_hub.glb',
  //   'GLR-D000578764.glb',
  //   'GLR-D000705677.glb',
  //   'GLR-D000705677_hub.glb',
  //   'GLR-D000705679.glb',
  //   'GLR-D000705680.glb',
  //   'GLR-D000705681.glb',
  //   'GLR-D000705682.glb',
  //   'GLR-SAD0003037.glb',
  //   'GLR-SAD0003038.glb',
  //   'GN-SAD0003027.glb',
  //   'GN-SAD0003027_hub.glb',
  //   'GN-SAD0003028.glb',
  //   'GN-SAD0003029.glb',
  //   'GN-SAD0003050.glb',
  //   'GP-D000705672.glb',
  //   'GP-D000705672_hub.glb',
  //   'GP-D000705673.glb',
  //   'GP-D000705675.glb',
  //   'GP-D000705676.glb',
  //   'GP-D000705676_hub.glb',
  //   'GP-SAD0003033.glb',
  //   'GP-SAD0003034.glb',
  //   'GP-SAD0003035.glb',
  //   'GP-SAD0003036.glb',
  //   'GP-SAD0003039.glb',
  //   'GP-SAD0003042.glb',
  //   'GP-SAD0003045.glb',
  //   'GPGN-SAD0003030.glb',
  //   'GPN-SAD0003041.glb',
  //   'GPN-SAD0003046.glb',
  //   'GPN-SAD0003048.glb',
  //   'GPNGP-SAD0003040.glb',
  //   'GPNGP-SAD0003043.glb',
  //   'GPNGP-SAD0003047.glb',
  //   'GT-D000589576.glb',
  //   'GT-D000589579.glb',
  //   'GT-D000589582.glb',
  //   'GT-D000589583.glb',
  //   'GT-D000618917.glb',
  //   'GT-D000618918.glb',
  //   'GT-D000618919.glb',
  //   'GT-D000618920.glb',
  //   'GT-D000618921.glb',
  //   'GT-D000618923.glb',
  //   'GT-D000618925.glb',
  //   'GT-D000618927.glb',
  //   'GT-D000620981.glb',
  //   'GT-D000671524.glb',
  //   'GT-D000673254.glb',
  //   'GT-D000673256.glb',
  //   'GT-D000705689.glb',
  //   'GT-D000705692.glb',
  //   'GT-D000705694.glb',
  //   'GT-D000705695.glb',
  //   'GT-D000705696.glb',
  //   'GT-D000705697.glb',
  //   'GT-D000705698.glb',
  // ]

  // ogstore
  const skuFileList = [
    'DBR-D000568866.glb',
    'DBR-D000683177.glb',
    'DBR-D000684783.glb',
    'DBR-D000688489.glb',
    'DBR-D000688496.glb',
    'DBR-D000688766.glb',
    'DCP-D000587369.glb',
    'DCP-D000587372.glb',
    'DCP-D000657432.glb',
    'DLR-D000611086.glb',
    'DLR-D000619536.glb',
    'DLR-D000644585.glb',
    'DLR-D000646310.glb',
    'DLR-D000657509.glb',
    'DLR-D000657512.glb',
    'DLR-D000668593.glb',
    'DLR-D000675380.glb',
    'DLR-D000675381.glb',
    'DLR-D000675384.glb',
    'DLR-D000675660.glb',
    'DLR-D000675664.glb',
    'DLR-D000675665.glb',
    'DLR-D000675701.glb',
    'DLR-D000675707.glb',
    'DLR-D000675719.glb',
    'DLR-D000675722.glb',
    'DLR-D000679231.glb',
    'DLR-D000679233.glb',
    'DLR-D000679265.glb',
    'DLR-D000679370.glb',
    'DLR-D000679374.glb',
    'DLR-D000679393.glb',
    'DNB-D000683167.glb',
    'DPN-D000589032.glb',
    'DPN-D000611094.glb',
    'DPN-D000612024.glb',
    'DPN-D000612028.glb',
    'DPN-D000621400.glb',
    'DPN-D000621730.glb',
    'DPN-D000623560.glb',
    'DPN-D000638176.glb',
    'DPN-D000659845.glb',
    'DPN-D000659860.glb',
    'DPN-D000659923.glb',
    'DPN-D000666710.glb',
    'DPN-D000673500.glb',
    'DPN-D000673518.glb',
    'DPN-D000673583.glb',
    'DPN-D000673584.glb',
    'DPN-D000675369.glb',
    'DPN-D000675374.glb',
    'DPN-D000675377.glb',
    'DPN-D000675383.glb',
    'DPN-D000675385.glb',
    'DPN-D000675387.glb',
    'DPN-D000675389.glb',
    'DPN-D000675671.glb',
    'DPN-D000675672.glb',
    'DPN-D000675675.glb',
    'DPN-D000675678.glb',
    'DPN-D000675683.glb',
    'DPN-D000675691.glb',
    'DPN-D000675695.glb',
    'DPN-D000675696.glb',
    'DPN-D000675697.glb',
    'DT-D000577561.glb',
    'DT-D000583490.glb',
    'DT-D000585645.glb',
    'DT-D000588185.glb',
    'DT-D000588186.glb',
    'DT-D000589171.glb',
    'DT-D000590478.glb',
    'DT-D000591543.glb',
    'DT-D000591557.glb',
    'DT-D000594278.glb',
    'DT-D000595411.glb',
    'DT-D000597948.glb',
    'DT-D000614572.glb',
    'DT-D000618265.glb',
    'DT-D000619023.glb',
    'DT-D000619031.glb',
    'DT-D000623270.glb',
    'DT-D000625263.glb',
    'DT-D000628377.glb',
    'DT-D000636421.glb',
    'DT-D000636787.glb',
    'DT-D000639888.glb',
    'DT-D000640935.glb',
    'DT-D000646190.glb',
    'DT-D000657421.glb',
    'DT-D000657429.glb',
    'DT-D000657444.glb',
    'DT-D000659939.glb',
    'DT-D000673844.glb',
    'DT-D000675736.glb',
    'DT-D000675739.glb',
    'DT-D000675741.glb',
    'DT-D000675742.glb',
    'DT-D000675743.glb',
    'DT-D000675744.glb',
    'DT-D000675745.glb',
    'DT-D000683111.glb',
    'DT-D000683112.glb',
    'DT-D000683114.glb',
    'DT-D000683117.glb',
    'DT-D000683169.glb',
    'DT-D000683170.glb',
    'DTGN-D000657497.glb',
    'DTGN-D000659934.glb',
  ]

  const joinedPathFileList = skuFileList.map(
    (sku) => `./assets/jewelleryItemsToUploadOGSTORE/${sku}`,
  )

  const loadedModels = useGLTF(joinedPathFileList)

  useEffect(() => {
    // console.log(loadedModels)

    type FinalItemData = {
      name: string
      sku: string
      highPolyModelConfig: TransformLite
      itemType: string
      collection: string
    }

    loadedModels.forEach((gltf, i) => {
      const item: FinalItemData = {
        name: '',
        sku: '',
        highPolyModelConfig: {
          position: [0, 0, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
        },
        itemType: '',
        collection: '',
      }

      const scene = gltf.scene

      const itemDetails: Object3D = scene.children[0]
      if (
        itemDetails.userData.name.includes('_') &&
        itemDetails.userData.name.includes('-')
      ) {
        // don't replace
        item.sku = itemDetails.userData.name
      } else {
        item.sku = itemDetails.userData.name.replace('_', '-')
      }

      // Set of collection names
      const collectionNames = new Set<string>()

      const itemTypeNames = new Set<string>()

      itemDetails.traverse((child) => {
        if ('name' in child.userData) {
          if (child.userData.name.toLowerCase().includes('collection:')) {
            collectionNames.add(child.userData.name.split(':')[1])
          }

          if (
            child.userData.name
              .toLowerCase()
              .includes('collection:colors'.toLowerCase())
          ) {
            item.collection = 'colors'
          } else if (
            child.userData.name
              .toLowerCase()
              .includes('collection:mariposa'.toLowerCase())
          ) {
            item.collection = 'mariposa'
          } else if (
            child.userData.name
              .toLowerCase()
              .includes('collection:rajwada'.toLowerCase())
          ) {
            item.collection = 'rajwada'
          } else if (
            child.userData.name
              .toLowerCase()
              .includes('collection:cera'.toLowerCase())
          ) {
            item.collection = 'cera'
          } else if (
            child.userData.name
              .toLowerCase()
              .includes('collection:sruti'.toLowerCase())
          ) {
            item.collection = 'sruti'
          } else if (
            child.userData.name
              .toLowerCase()
              .includes('collection:sutra'.toLowerCase())
          ) {
            item.collection = 'sutra'
          } else if (
            child.userData.name
              .toLowerCase()
              .includes('collection:everlite'.toLowerCase())
          ) {
            item.collection = 'everlite'
          }
        }
      })

      itemDetails.traverse((child) => {
        if ('name' in child.userData) {
          if (
            child.userData.name.toLowerCase().includes('itemType:') ||
            child.userData.name.toLowerCase().includes('itemTypep:')
          ) {
            itemTypeNames.add(child.userData.name.split(':')[1])
          }

          if (
            child.userData.name
              .toLowerCase()
              .includes('itemType:ringhub'.toLowerCase()) ||
            child.userData.name
              .toLowerCase()
              .includes('itemTypep:ringhub'.toLowerCase())
          ) {
            item.itemType = 'ringhub'
          } else if (
            child.userData.name
              .toLowerCase()
              .includes('itemType:earringhub'.toLowerCase()) ||
            child.userData.name
              .toLowerCase()
              .includes('itemTypep:earringhub'.toLowerCase())
          ) {
            item.itemType = 'earringhub'
          } else if (
            child.userData.name
              .toLowerCase()
              .includes('itemType:necklacehub'.toLowerCase()) ||
            child.userData.name
              .toLowerCase()
              .includes('itemTypep:necklacehub'.toLowerCase())
          ) {
            item.itemType = 'necklacehub'
          } else if (
            child.userData.name
              .toLowerCase()
              .includes('itemType:pendanthub'.toLowerCase()) ||
            child.userData.name
              .toLowerCase()
              .includes('itemTypep:pendanthub'.toLowerCase())
          ) {
            item.itemType = 'pendanthub'
          } else if (
            child.userData.name
              .toLowerCase()
              .includes('itemType:bracelethub'.toLowerCase()) ||
            child.userData.name
              .toLowerCase()
              .includes('itemTypep:bracelethub'.toLowerCase())
          ) {
            item.itemType = 'bracelethub'
          } else if (
            child.userData.name
              .toLowerCase()
              .includes('itemType:earring'.toLowerCase()) ||
            child.userData.name
              .toLowerCase()
              .includes('itemTypep:earring'.toLowerCase())
          ) {
            item.itemType = 'earring'
          } else if (
            child.userData.name
              .toLowerCase()
              .includes('itemType:ring'.toLowerCase()) ||
            child.userData.name
              .toLowerCase()
              .includes('itemTypep:ring'.toLowerCase())
          ) {
            item.itemType = 'ring'
          } else if (
            child.userData.name
              .toLowerCase()
              .includes('itemType:necklace'.toLowerCase()) ||
            child.userData.name
              .toLowerCase()
              .includes('itemTypep:necklace'.toLowerCase())
          ) {
            item.itemType = 'necklace'
          } else if (
            child.userData.name
              .toLowerCase()
              .includes('itemType:pendant'.toLowerCase()) ||
            child.userData.name
              .toLowerCase()
              .includes('itemTypep:pendant'.toLowerCase()) ||
            child.userData.name
              .toLowerCase()
              .includes('itemType:pendat'.toLowerCase())
          ) {
            item.itemType = 'pendant'
          } 

          else if (
            child.userData.name
              .toLowerCase()
              .includes('itemType:flatbracelet'.toLowerCase()) ||
            child.userData.name
              .toLowerCase()
              .includes('itemTypep:flatbracelet'.toLowerCase())
          ) {
            item.itemType = 'flatbracelet'
          }
          
          else if (
            child.userData.name
              .toLowerCase()
              .includes('itemType:bracelet'.toLowerCase()) ||
            child.userData.name
              .toLowerCase()
              .includes('itemTypep:bracelet'.toLowerCase())
          ) {
            item.itemType = 'bracelet'
          }
        }
      })

      console.log(
        item,
        itemDetails.userData.name,
        joinedPathFileList[i],
        collectionNames,
        itemTypeNames,
      )
      let timer = 1000
      const baseUrl = 'http://localhost:8000'
      try {
        setTimeout(() => {
          fetch(
            `${baseUrl}/items/create_and_add_to_any_valid_slot`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(item),
            },
          )
        }, timer)
        timer += 1000
      } catch (e) {
        console.log(e, item)
      }
    })
  }, [loadedModels])
}

// @ts-ignore
const syncGroupDataToDB = async (toRun: boolean) => {
  if (!toRun) return
  const { scene: dummyScene } = useGLTF(staticResourcePaths.groupInfoToUpdate)
  console.log('hello')

  useEffect(() => {
    console.log(dummyScene)
    let groups: Object3D[] = []
    dummyScene.traverse((child) => {
      if (child.name.toLowerCase().includes('Groups'.toLowerCase())) {
        groups = child.children
      }
    })

    type FinalSlotData = {
      name: string
      itemTypes: string[]
      itemTransform: {
        ring?: {
          position: number[]
          rotation: number[]
          scale: number[]
        }
        ringhub?: {
          position: number[]
          rotation: number[]
          scale: number[]
        }
        earring?: {
          position: number[]
          rotation: number[]
          scale: number[]
        }
        earringhub?: {
          position: number[]
          rotation: number[]
          scale: number[]
        }
        necklace?: {
          position: number[]
          rotation: number[]
          scale: number[]
        }
        necklacehub?: {
          position: number[]
          rotation: number[]
          scale: number[]
        }
        pendant?: {
          position: number[]
          rotation: number[]
          scale: number[]
        }
        pendanthub?: {
          position: number[]
          rotation: number[]
          scale: number[]
        }
        bracelet?: {
          position: number[]
          rotation: number[]
          scale: number[]
        }
        bracelethub?: {
          position: number[]
          rotation: number[]
          scale: number[]
        }
        flatbracelet?: {
          position: number[]
          rotation: number[]
          scale: number[]
        }
      }
    }

    type TriggerArea = {
      position: number[]
      rotation: number[]
      scale: number[]
      presentationCamera: {
        position: number[]
        target: number[]
        fov: number
      }
      showcaseCamera: {
        position: number[]
        target: number[]
        fov: number
      }
    }

    type FinalGroupData = {
      name: string
      collection: string
      storeName: string
      slots: FinalSlotData[]
      triggerArea: TriggerArea
    }

    groups.forEach((group) => {
      const groupData: FinalGroupData = {
        name: '',
        collection: '',
        slots: [],
        triggerArea: {
          position: [0, 0, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          presentationCamera: {
            position: [0, 0, 0],
            target: [0, 0, 0],
            fov: 90,
          },
          showcaseCamera: {
            position: [0, 0, 0],
            target: [0, 0, 0],
            fov: 90,
          },
        },
        storeName: '',
      }

      const collectionNames = new Set<string>()

      group.children.forEach((groupChild) => {
        // console.log("groupchild name 1", groupChild.userData.name.toLowerCase())

        if (groupChild.userData.name.toLowerCase().includes('collection:')) {
          collectionNames.add(groupChild.userData.name.split(':')[1])
        }

        // collection name
        if (
          groupChild.userData.name.toLowerCase().includes('collection:colors')
        ) {
          groupData.collection = 'colors'
        } else if (
          groupChild.userData.name.toLowerCase().includes('collection:mariposa')
        ) {
          groupData.collection = 'mariposa'
        } else if (
          groupChild.userData.name.toLowerCase().includes('collection:rajwada')
        ) {
          groupData.collection = 'rajwada'
        } else if (
          groupChild.userData.name.toLowerCase().includes('collection:cera')
        ) {
          groupData.collection = 'cera'
        } else if (
          groupChild.userData.name.toLowerCase().includes('collection:sruti')
        ) {
          groupData.collection = 'sruti'
        } else if (
          groupChild.userData.name.toLowerCase().includes('collection:sutra')
        ) {
          groupData.collection = 'sutra'
        } else if (
          groupChild.userData.name.toLowerCase().includes('collection:everlite')
        ) {
          groupData.collection = 'everlite'
        }

        // group name
        else if (
          groupChild.userData.name.toLowerCase().includes('groupname:')
        ) {
          groupData.name = groupChild.userData.name.split(':')[1]
        }

        // store name
        else if (
          groupChild.userData.name.toLowerCase().includes('storename:tallstore')
        ) {
          groupData.storeName = 'tallstore'
        } else if (
          groupChild.userData.name.toLowerCase().includes('storename:ogstore')
        ) {
          console.log(groupChild.userData.name.toLowerCase())
          groupData.storeName = 'ogstore'
        } else if (
          groupChild.userData.name.toLowerCase().includes('storename:domestore')
        ) {
          console.log(groupChild.userData.name.toLowerCase())
          groupData.storeName = 'domestore'
        } else if (
          groupChild.userData.name.toLowerCase().includes('storename:hub')
        ) {
          console.log(groupChild.userData.name.toLowerCase())
          groupData.storeName = 'hub'
        } else if (
          groupChild.userData.name.toLowerCase().includes('triggerarea') &&
          groupChild instanceof Mesh
        ) {
          groupData.triggerArea.position = groupChild.position.toArray()
          groupData.triggerArea.rotation = [
            groupChild.rotation.x,
            groupChild.rotation.y,
            groupChild.rotation.z,
          ]
          groupData.triggerArea.scale = groupChild.scale.toArray()
        } else if (
          groupChild.userData.name
            .toLowerCase()
            .includes('presentationCameraPosition'.toLowerCase()) &&
          groupChild instanceof Mesh
        ) {
          groupData.triggerArea.presentationCamera.position =
            groupChild.position.toArray()
        } else if (
          groupChild.userData.name
            .toLowerCase()
            .includes('presentationCameraTarget'.toLowerCase()) &&
          groupChild instanceof Mesh
        ) {
          groupData.triggerArea.presentationCamera.target =
            groupChild.position.toArray()
        }

        // else if (
        //   groupChild.userData.name.toLowerCase().includes('presentationCameraFov'.toLowerCase()) &&
        //   groupChild instanceof Mesh
        // ) {
        //   groupData.triggerArea.presentationCamera.fov = groupChild.scale.x
        // }
        else if (
          groupChild.userData.name
            .toLowerCase()
            .includes('showcaseCameraPosition'.toLowerCase()) &&
          groupChild instanceof Mesh
        ) {
          groupData.triggerArea.showcaseCamera.position =
            groupChild.position.toArray()
        } else if (
          groupChild.userData.name
            .toLowerCase()
            .includes('showcaseCameraTarget'.toLowerCase()) &&
          groupChild instanceof Mesh
        ) {
          groupData.triggerArea.showcaseCamera.target =
            groupChild.position.toArray()
        }

        // else if (
        //   groupChild.userData.name.toLowerCase().includes('showcaseCameraFov'.toLowerCase()) &&
        //   groupChild instanceof Mesh
        // ) {
        //   groupData.triggerArea.showcaseCamera.fov = groupChild.scale.x
        // }
      })

      group.children.forEach((groupChild) => {
        console.log('groupchild name 2', groupChild.userData.name.toLowerCase())
        if (groupChild.userData.name.toLowerCase().includes('slots')) {
          const slotsData: FinalSlotData[] = []
          groupChild.children.forEach((slotHeirarchy, index) => {
            console.log(
              'slot heirarchy',
              slotHeirarchy.userData.name.toLowerCase(),
            )
            const slotData: FinalSlotData = {
              name: groupData.name + '_slot_' + index,
              itemTypes: [],
              itemTransform: {},
            }

            slotHeirarchy.children[0].children.forEach((supportedItemType) => {
              if (
                supportedItemType.userData.name
                  .toLowerCase()
                  .includes('earringhub')
              ) {
                slotData.itemTypes.push('earringhub')
                slotData.itemTransform.earringhub = {
                  position: supportedItemType.children[0].position.toArray(),
                  rotation: [
                    supportedItemType.children[0].rotation.x,
                    supportedItemType.children[0].rotation.y,
                    supportedItemType.children[0].rotation.z,
                  ],
                  scale: supportedItemType.children[0].scale.toArray(),
                }
              } else if (
                supportedItemType.userData.name
                  .toLowerCase()
                  .includes('ringhub')
              ) {
                slotData.itemTypes.push('ringhub')
                slotData.itemTransform.ringhub = {
                  position: supportedItemType.children[0].position.toArray(),
                  rotation: [
                    supportedItemType.children[0].rotation.x,
                    supportedItemType.children[0].rotation.y,
                    supportedItemType.children[0].rotation.z,
                  ],
                  scale: supportedItemType.children[0].scale.toArray(),
                }
              } else if (
                supportedItemType.userData.name
                  .toLowerCase()
                  .includes('necklacehub')
              ) {
                slotData.itemTypes.push('necklacehub')
                slotData.itemTransform.necklacehub = {
                  position: supportedItemType.children[0].position.toArray(),
                  rotation: [
                    supportedItemType.children[0].rotation.x,
                    supportedItemType.children[0].rotation.y,
                    supportedItemType.children[0].rotation.z,
                  ],
                  scale: supportedItemType.children[0].scale.toArray(),
                }
              } else if (
                supportedItemType.userData.name
                  .toLowerCase()
                  .includes('pendanthub')
              ) {
                slotData.itemTypes.push('pendanthub')
                slotData.itemTransform.pendanthub = {
                  position: supportedItemType.children[0].position.toArray(),
                  rotation: [
                    supportedItemType.children[0].rotation.x,
                    supportedItemType.children[0].rotation.y,
                    supportedItemType.children[0].rotation.z,
                  ],
                  scale: supportedItemType.children[0].scale.toArray(),
                }
              } else if (
                supportedItemType.userData.name
                  .toLowerCase()
                  .includes('bracelethub')
              ) {
                slotData.itemTypes.push('bracelethub')
                slotData.itemTransform.bracelethub = {
                  position: supportedItemType.children[0].position.toArray(),
                  rotation: [
                    supportedItemType.children[0].rotation.x,
                    supportedItemType.children[0].rotation.y,
                    supportedItemType.children[0].rotation.z,
                  ],
                  scale: supportedItemType.children[0].scale.toArray(),
                }
              } else if (
                supportedItemType.userData.name
                  .toLowerCase()
                  .includes('earring')
              ) {
                slotData.itemTypes.push('earring')
                slotData.itemTransform.earring = {
                  position: supportedItemType.children[0].position.toArray(),
                  rotation: [
                    supportedItemType.children[0].rotation.x,
                    supportedItemType.children[0].rotation.y,
                    supportedItemType.children[0].rotation.z,
                  ],
                  scale: supportedItemType.children[0].scale.toArray(),
                }
              } else if (
                supportedItemType.userData.name.toLowerCase().includes('ring')
              ) {
                slotData.itemTypes.push('ring')
                slotData.itemTransform.ring = {
                  position: supportedItemType.children[0].position.toArray(),
                  rotation: [
                    supportedItemType.children[0].rotation.x,
                    supportedItemType.children[0].rotation.y,
                    supportedItemType.children[0].rotation.z,
                  ],
                  scale: supportedItemType.children[0].scale.toArray(),
                }
              } else if (
                supportedItemType.userData.name
                  .toLowerCase()
                  .includes('necklace')
              ) {
                slotData.itemTypes.push('necklace')
                slotData.itemTransform.necklace = {
                  position: supportedItemType.children[0].position.toArray(),
                  rotation: [
                    supportedItemType.children[0].rotation.x,
                    supportedItemType.children[0].rotation.y,
                    supportedItemType.children[0].rotation.z,
                  ],
                  scale: supportedItemType.children[0].scale.toArray(),
                }
              } else if (
                supportedItemType.userData.name
                  .toLowerCase()
                  .includes('pendant')
              ) {
                slotData.itemTypes.push('pendant')
                slotData.itemTransform.pendant = {
                  position: supportedItemType.children[0].position.toArray(),
                  rotation: [
                    supportedItemType.children[0].rotation.x,
                    supportedItemType.children[0].rotation.y,
                    supportedItemType.children[0].rotation.z,
                  ],
                  scale: supportedItemType.children[0].scale.toArray(),
                }
              } 
              
              else if (
                supportedItemType.userData.name
                  .toLowerCase()
                  .includes('flatbracelet')
              ) {
                slotData.itemTypes.push('flatbracelet')
                slotData.itemTransform.flatbracelet = {
                  position: supportedItemType.children[0].position.toArray(),
                  rotation: [
                    supportedItemType.children[0].rotation.x,
                    supportedItemType.children[0].rotation.y,
                    supportedItemType.children[0].rotation.z,
                  ],
                  scale: supportedItemType.children[0].scale.toArray(),
                }
              } 
              
              else if (
                supportedItemType.userData.name
                  .toLowerCase()
                  .includes('bracelet')
              ) {
                slotData.itemTypes.push('bracelet')
                slotData.itemTransform.bracelet = {
                  position: supportedItemType.children[0].position.toArray(),
                  rotation: [
                    supportedItemType.children[0].rotation.x,
                    supportedItemType.children[0].rotation.y,
                    supportedItemType.children[0].rotation.z,
                  ],
                  scale: supportedItemType.children[0].scale.toArray(),
                }
              } 
            })

            slotsData.push(slotData)
          })
          groupData.slots = slotsData
        }
      })

      console.log(groupData)

      const baseUrl = 'http://localhost:8000'
      fetch(`${baseUrl}/groups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(groupData),
      })
    })
  }, [dummyScene])
}
