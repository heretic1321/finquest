import { useEffect, useState } from 'react'
import { useGLTF } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { Vector3 } from 'three'
import {
  MeshBVH,
  MeshBVHVisualizer,
  StaticGeometryGenerator,
} from 'three-mesh-bvh'
import { MeshSurfaceSampler } from 'three-stdlib'

// @ts-ignore
import { Water as Water2 } from '@client/components/water/Water2.js'
import {
  ItemsToHide,
  StoreConfigs,
  TPortalConfig,
} from '@client/config/MapConfig'
import { staticResourcePaths } from '@client/config/staticResourcePaths'
import { MapStore, StoreInfo } from '@client/contexts/MapContext'
import { MaterialStore } from '@client/contexts/MaterialContext'
import {
  dummyMesh,
  dummyWireframeMaterial,
  oneVector,
  zeroEuler,
  zeroVector,
} from '@client/utils/commonMaterials'
import { Transform } from '@client/utils/commonTypes'

/**
 * Loads the meshes and collders defined in MapConfig.ts file.
 * @param {number} mapScale
 * @param {boolean} showVisualizer
 * @param {number} visualizerDepth
 * @returns {{ visualizer: MeshBVHVisualizer | null, collider: THREE.Mesh<THREE.BufferGeometry,THREE.MeshStandardMaterial> | null}}
 */
const useMap = () => {
  const { scene } = useThree()

  const { scene: newEnvironmentScene } = useGLTF(
    staticResourcePaths.newEnvironment,
  )

  type TInstanceGroup = {
    positions: Array<THREE.Vector3>
    quaternions: Array<THREE.Quaternion>
    scales: Array<THREE.Vector3>
  }
  type TInstancedMeshData = {
    geometry: THREE.BufferGeometry
    material: THREE.Material
    instanceGroups: Array<TInstanceGroup>
    customColliderGeometry?: THREE.BufferGeometry
    customColliderTransform?: Transform
  }
  const instancedMeshesData: TInstancedMeshData[] = []

  type TGardenAreaInfo = {
    grassPlaneMeshes: Array<THREE.Mesh>
    counts: Array<number>
    foliageMeshesLODHigh: Array<THREE.Mesh>
    foliageMeshesLODMid: Array<THREE.Mesh>
    foliageMeshesLODLow: Array<THREE.Mesh>
    foliageWeightage: Array<number>
    foliageColliders: Array<THREE.Mesh | null>
  }
  const gardenAreaInfo: TGardenAreaInfo = {
    grassPlaneMeshes: [],
    counts: [],
    foliageMeshesLODHigh: [],
    foliageMeshesLODMid: [],
    foliageMeshesLODLow: [],
    foliageWeightage: [],
    foliageColliders: [],
  }

  const [groupForModels, setGroupForModels] = useState<THREE.Group | null>(null)
  const [groupForColliders, setGroupForColliders] =
    useState<THREE.Group | null>(null)

  const addToGroupForModels = (child: THREE.Object3D<THREE.Event>) => {
    setGroupForModels((prev) => {
      if (prev === null) {
        const group = new THREE.Group()
        group.add(child)
        scene.add(group)
        return group
      } else {
        prev.add(child)
        return prev
      }
    })
  }

  const addToGroupForColliders = (
    child: THREE.Object3D<THREE.Event>,
    transform?: Transform,
  ) => {
    setGroupForColliders((prev) => {
      if (prev === null) {
        const group = new THREE.Group()
        group.add(child)
        scene.add(group)

        if (transform) {
          child.position.copy(transform.position)
          child.rotation.copy(transform.rotation)
          child.scale.copy(transform.scale)
        }
        return group
      } else {
        prev.add(child)
        if (transform) {
          child.position.copy(transform.position)
          child.rotation.copy(transform.rotation)
          child.scale.copy(transform.scale)
        }
        return prev
      }
    })
  }

  // const waterBaseMaterial = MaterialStore((state) => state.waterBaseMaterial)

  useEffect(() => {
    if (!newEnvironmentScene) {
      return
    }

    newEnvironmentScene.traverse((child) => {
      if (
        child instanceof THREE.Object3D &&
        child.name.toLowerCase() === 'instances'
      ) {
        handleGroupedInstances(child)
      } else if (
        child instanceof THREE.Object3D &&
        child.name.toLowerCase() === 'gardenareas'
      ) {
        handleGardenAreas(child)
      } else if (
        child instanceof THREE.Object3D &&
        child.name.toLowerCase() === 'waterareas'
      ) {
        // handleWaterAreas(child)
      } else if (
        child.name.toLowerCase() === 'ground' &&
        child instanceof THREE.Group
      ) {
        handleGround(child)
      } else if (
        child.name.toLowerCase().includes('branding') &&
        child instanceof THREE.Group
      ) {
        handleBranding(child)
      } else if (
        child.name.toLowerCase() === 'NonGroupedInstances'.toLowerCase() &&
        child instanceof THREE.Object3D
      ) {
        const listOfThingsToHide: THREE.Object3D[] = []
        child.children.forEach((node) => {
          handleNonGroupedInstances(node, listOfThingsToHide)
        })

        MapStore.getState().addOrUpdateItemToHide(
          ItemsToHide.InstancedFoliageAndDecor,
          listOfThingsToHide,
        )
      } else if (
        child.name.toLowerCase() === 'GroupedInstances'.toLowerCase() &&
        child instanceof THREE.Object3D
      ) {
        child.children.forEach((node) => {
          NEWhandleGroupedInstances(node)
        })
      } else if (
        child.name.toLowerCase() === 'PlainLODs'.toLowerCase() &&
        child instanceof THREE.Object3D
      ) {
        child.children.forEach((node) => {
          handlePlainLODs(node)
        })
      } else if (
        child.name.toLowerCase() === 'Stores'.toLowerCase() &&
        child instanceof THREE.Object3D
      ) {
        child.children.forEach((node) => {
          handleStore(node)
        })
      } else if (
        child.name.toLowerCase() === 'Portals'.toLowerCase() &&
        child instanceof THREE.Object3D
      ) {
        handlePortal(child)
      } else if (
        child.name.toLowerCase() ===
          'screeningHorizontalScreen'.toLowerCase() &&
        child instanceof THREE.Mesh
      )
        handleHorizontalScreening(child)
      else if (
        child.name.toLowerCase() === 'ScreeningAreaPanels'.toLowerCase() &&
        child instanceof THREE.Object3D
      )
        handleScreeningAreaPanels(child)
    })

    instancedMeshesData.forEach((data) => {
      data.instanceGroups.forEach((instanceGroup) => {
        const instancedMesh = new THREE.InstancedMesh(
          data.geometry,
          data.material,
          instanceGroup.positions.length,
        )
        instancedMesh.instanceMatrix.setUsage(THREE.StaticDrawUsage)
        addToGroupForModels(instancedMesh)
        instanceGroup.positions.forEach((position, index) => {
          const matrix = new THREE.Matrix4()
          matrix.compose(
            position,
            instanceGroup.quaternions[index],
            instanceGroup.scales[index],
          )
          instancedMesh.setMatrixAt(index, matrix)
        })
        instancedMesh.instanceMatrix.needsUpdate = true
        instancedMesh.geometry.computeBoundingSphere()
      })
    })

    const _pos = new THREE.Vector3()
    const _matrix = new THREE.Matrix4()
    gardenAreaInfo.grassPlaneMeshes.forEach((grassPlaneMesh, index) => {
      addToGroupForModels(grassPlaneMesh)
      const surfaceSampler = new MeshSurfaceSampler(grassPlaneMesh).build()
      const group_HighLOD = new THREE.Group()
      const group_MidLOD = new THREE.Group()
      const group_LowLOD = new THREE.Group()

      const totalPoints = gardenAreaInfo.counts[index]
      const colliderGroup = new THREE.Group()
      const lod = new THREE.LOD()

      for (let i = 0; i < gardenAreaInfo.foliageMeshesLODHigh.length; i++) {
        const points = totalPoints * gardenAreaInfo.foliageWeightage[i]
        const highLODMesh = gardenAreaInfo.foliageMeshesLODHigh[i]
        const midLODMesh = gardenAreaInfo.foliageMeshesLODMid[i]
        const lowLODMesh = gardenAreaInfo.foliageMeshesLODLow[i]

        const instancedMesh_HighLOD = new THREE.InstancedMesh(
          highLODMesh.geometry,
          highLODMesh.material,
          points,
        )
        const instancedMesh_MidLOD = new THREE.InstancedMesh(
          midLODMesh.geometry,
          midLODMesh.material,
          points,
        )
        const instancedMesh_LowLOD = new THREE.InstancedMesh(
          lowLODMesh.geometry,
          lowLODMesh.material,
          points,
        )

        instancedMesh_HighLOD.instanceMatrix.setUsage(THREE.StaticDrawUsage)
        instancedMesh_MidLOD.instanceMatrix.setUsage(THREE.StaticDrawUsage)
        instancedMesh_LowLOD.instanceMatrix.setUsage(THREE.StaticDrawUsage)

        let colliderMesh = gardenAreaInfo.foliageColliders[i]
        if (colliderMesh !== null)
          colliderMesh = new THREE.Mesh(
            colliderMesh.geometry,
            dummyWireframeMaterial,
          )

        for (let i = 0; i < points; i++) {
          surfaceSampler.sample(_pos)
          _matrix.compose(_pos, highLODMesh.quaternion, highLODMesh.scale)

          instancedMesh_HighLOD.setMatrixAt(i, _matrix)
          instancedMesh_MidLOD.setMatrixAt(i, _matrix)
          instancedMesh_LowLOD.setMatrixAt(i, _matrix)

          if (colliderMesh !== null) {
            const _c = colliderMesh.clone()
            _c.position.copy(_pos)
            _c.rotation.copy(highLODMesh.rotation)
            _c.scale.copy(highLODMesh.scale)
            colliderGroup.add(_c)
          }
        }

        instancedMesh_HighLOD.instanceMatrix.needsUpdate = true
        instancedMesh_MidLOD.instanceMatrix.needsUpdate = true
        instancedMesh_LowLOD.instanceMatrix.needsUpdate = true
        instancedMesh_HighLOD.geometry.computeBoundingSphere()
        instancedMesh_MidLOD.geometry.computeBoundingSphere()
        instancedMesh_LowLOD.geometry.computeBoundingSphere()
        group_HighLOD.add(instancedMesh_HighLOD)
        group_MidLOD.add(instancedMesh_MidLOD)
        group_LowLOD.add(instancedMesh_LowLOD)
      }

      lod.addLevel(group_HighLOD, 40)
      lod.addLevel(group_MidLOD, 80)
      lod.addLevel(group_LowLOD, 120)
      lod.position.copy(grassPlaneMesh.position)
      lod.rotation.copy(grassPlaneMesh.rotation)
      lod.scale.copy(grassPlaneMesh.scale)
      lod.frustumCulled = true

      let whichGrassAreaItemToHide = ItemsToHide.None
      if (index === 0) whichGrassAreaItemToHide = ItemsToHide.GardenAreaLarge1
      else if (index === 1)
        whichGrassAreaItemToHide = ItemsToHide.GardenAreaLarge2
      else if (index === 2)
        whichGrassAreaItemToHide = ItemsToHide.GardenAreaLarge3
      else if (index === 3)
        whichGrassAreaItemToHide = ItemsToHide.GardenAreaSmall
      else if (index === 4)
        whichGrassAreaItemToHide = ItemsToHide.GardenAreaMedium

      MapStore.getState().addOrUpdateItemToHide(whichGrassAreaItemToHide, lod)

      addToGroupForModels(lod)

      addToGroupForColliders(colliderGroup, {
        position: grassPlaneMesh.position,
        rotation: grassPlaneMesh.rotation,
        scale: grassPlaneMesh.scale,
      })
    })
  }, [newEnvironmentScene])

  const handleHorizontalScreening = (child: THREE.Mesh) => {
    MapStore.setState({
      horizontalScreenDetails: {
        screenGeometry: child.geometry,
        screenTransform: {
          position: child.position,
          rotation: child.rotation,
          scale: child.scale,
        },
      },
    })
  }

  const handleScreeningAreaPanels = (child: THREE.Object3D<THREE.Event>) => {
    const arrayOfPanels: THREE.Mesh[] = []
    child.children.forEach((node) => {
      if (node instanceof THREE.Mesh) {
        node.position.multiplyScalar(MapStore.getState().mapScale)
        node.scale.multiplyScalar(MapStore.getState().mapScale)
        arrayOfPanels.push(node)
      }
    })

    MapStore.setState({ screeningAreaPanels: arrayOfPanels })
  }

  const handleGround = (child: THREE.Object3D<THREE.Event>) => {
    const _colliderGroup = new THREE.Group()
    child.children.forEach((child) => {
      if (child instanceof THREE.Mesh) {
        const _colliderMesh = new THREE.Mesh(
          child.geometry,
          dummyWireframeMaterial,
        )
        _colliderGroup.add(_colliderMesh)

        if (child.material.name.includes('branding')) {
          child.material.side = THREE.DoubleSide
        }
      }
    })
    addToGroupForModels(child)
    addToGroupForColliders(_colliderGroup, {
      position: child.position,
      rotation: child.rotation,
      scale: child.scale,
    })
  }

  const handleBranding = (child: THREE.Object3D<THREE.Event>) => {
    const _colliderGroup = new THREE.Group()
    child.children.forEach((child) => {
      if (child instanceof THREE.Mesh) {
        const _colliderMesh = new THREE.Mesh(
          child.geometry,
          dummyWireframeMaterial,
        )
        _colliderGroup.add(_colliderMesh)
      }
    })
    addToGroupForModels(child)
    addToGroupForColliders(_colliderGroup, {
      position: child.position,
      rotation: child.rotation,
      scale: child.scale,
    })
  }

  const handlePortal = (child: THREE.Object3D<THREE.Event>) => {
    child.children.forEach((node) => {
      if (node instanceof THREE.Mesh && node.name == 'portalCircle') {
        MapStore.setState({ portalCircleGeometry: node.geometry })
      } else if (node instanceof THREE.Group && node.name == 'portalBoundary') {
        MapStore.setState({ portalBoundaryMesh: node })
      } else if (
        node instanceof THREE.Object3D &&
        node.name.toLowerCase() == 'PortalConfigs'.toLowerCase()
      ) {
        const portalConfigs: Record<string, TPortalConfig[]> = {}

        node.children.forEach((building) => {
          portalConfigs[building.name] = []

          building.children.forEach((portalInBuilding) => {
            const config: TPortalConfig = {
              portalName: portalInBuilding.name,
              position: [0, 0, 0],
              rotation: [0, 0, 0],
              scale: [1, 1, 1],
              exitPosition: [0, 0, 0],
              exitBuildingName: '',
            }

            portalInBuilding.children.forEach((portalPart) => {
              if (
                portalPart instanceof THREE.Group &&
                portalPart.name
                  .toLowerCase()
                  .includes('portalTransform'.toLowerCase())
              ) {
                config.position = [
                  portalPart.position.x * MapStore.getState().mapScale,
                  portalPart.position.y * MapStore.getState().mapScale,
                  portalPart.position.z * MapStore.getState().mapScale,
                ]
                config.rotation = [
                  portalPart.rotation.x,
                  portalPart.rotation.y,
                  portalPart.rotation.z,
                ]
                config.scale = [
                  portalPart.scale.x * MapStore.getState().mapScale,
                  portalPart.scale.y * MapStore.getState().mapScale,
                  portalPart.scale.z * MapStore.getState().mapScale,
                ]
              } else if (
                portalPart instanceof THREE.Object3D &&
                portalPart.name
                  .toLowerCase()
                  .includes('exitPosition'.toLowerCase())
              ) {
                config.exitPosition = [
                  portalPart.position.x * MapStore.getState().mapScale,
                  portalPart.position.y * MapStore.getState().mapScale,
                  portalPart.position.z * MapStore.getState().mapScale,
                ]
              } else if (
                portalPart instanceof THREE.Object3D &&
                portalPart.userData.name
                  .toLowerCase()
                  .includes('exitBuildingName:domestore'.toLowerCase())
              ) {
                config.exitBuildingName = 'domestore'
              } else if (
                portalPart instanceof THREE.Object3D &&
                portalPart.userData.name
                  .toLowerCase()
                  .includes('exitBuildingName:tallstore'.toLowerCase())
              ) {
                config.exitBuildingName = 'tallstore'
              } else if (
                portalPart instanceof THREE.Object3D &&
                portalPart.userData.name
                  .toLowerCase()
                  .includes('exitBuildingName:ogstore'.toLowerCase())
              ) {
                config.exitBuildingName = 'ogstore'
              }else if (
                portalPart instanceof THREE.Object3D &&
                portalPart.userData.name
                  .toLowerCase()
                  .includes('exitBuildingName:cylinderstore'.toLowerCase())
              ) {
                config.exitBuildingName = 'cylinderstore'
              } else if (
                portalPart instanceof THREE.Object3D &&
                portalPart.userData.name
                  .toLowerCase()
                  .includes('exitBuildingName:hub'.toLowerCase())
              ) {
                config.exitBuildingName = 'hub'
              }
            })

            portalConfigs[building.name].push(config)
          })
        })
        MapStore.setState({ portalConfigs: portalConfigs })
      }
    })
  }

  const handleNonGroupedInstances = (
    node: THREE.Object3D<THREE.Event>,
    listOfThingsToHide: THREE.Object3D[],
  ) => {
    let referenceGeometries: THREE.BufferGeometry[] | null = null
    let referenceMaterials: THREE.Material[] | null = null

    if (node.children.length === 0) {
      return // Empty instance group, skip
    }

    if (node.children[0] instanceof THREE.Mesh) {
      // each individual blender mesh contains only one material, hence blender exported it as a single mesh
      referenceGeometries = [node.children[0].geometry]
      referenceMaterials = [node.children[0].material]
    } else if (node.children[0] instanceof THREE.Object3D) {
      // each individual blender mesh contains multiple materials, hence blender exported it as a group of meshes
      referenceGeometries = []
      referenceMaterials = []
      node.children[0].children.forEach((child) => {
        if (child instanceof THREE.Mesh) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          referenceGeometries!.push(child.geometry)
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          referenceMaterials!.push(child.material)
        }
      })
    }

    if (referenceGeometries === null || referenceMaterials === null) {
      console.error('Invalid instance group, no reference found')
      return
    }
    const nameParts = node.name.toLowerCase().split('_')
    if (!nameParts.includes('collider')) {
      console.error(
        'Invalid instance group name',
        node.name,
        ' doesnt contain collider',
      )
      return
    }
    if (!nameParts.includes('true') && !nameParts.includes('false')) {
      console.error(
        'Invalid instance group name',
        node.name,
        ' doesnt contain true/false',
      )
      return
    }
    const isColliderNeeded = nameParts.includes('true') ? true : false
    const colliderGroup = new THREE.Group()

    // Floating display instanced mesh for base left to hide

    if (nameParts.includes('display')) {
      const listOfDisplayContainers: THREE.Group[] = []
      const listOfDisplayPanels: THREE.Mesh[] = []
      node.children.forEach((instance) => {
        if (instance instanceof THREE.Group) {
          listOfDisplayContainers.push(instance)
        } else if (
          instance instanceof THREE.Mesh &&
          instance.name.toLowerCase().includes('display_here'.toLowerCase())
        ) {
          listOfDisplayPanels.push(instance)
        }
      })

      MapStore.setState({
        listOfDisplayContainers: listOfDisplayContainers,
        listOfDisplayPanels: listOfDisplayPanels,
      })
      MapStore.getState().addOrUpdateItemToHide(
        ItemsToHide.FloatingDisplayContainers,
        listOfDisplayContainers,
      )
    } else {
      const itemsToHideArray = []
      for (let i = 0; i < referenceGeometries.length; i++) {
        const instancedMesh = new THREE.InstancedMesh(
          referenceGeometries[i],
          referenceMaterials[i],
          node.children.length,
        )
        instancedMesh.instanceMatrix.setUsage(THREE.StaticDrawUsage)
        node.children.forEach((instance, index) => {
          if (
            instance instanceof THREE.Mesh ||
            instance instanceof THREE.Group
          ) {
            const matrix = new THREE.Matrix4()
            matrix.compose(
              instance.position,
              instance.quaternion,
              instance.scale,
            )
            instancedMesh.setMatrixAt(index, matrix)

            if (isColliderNeeded) {
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              const collider = new THREE.Mesh(
                referenceGeometries![i],
                dummyWireframeMaterial,
              )
              colliderGroup.add(collider)
              collider.position.copy(instance.position)
              collider.rotation.copy(instance.rotation)
              collider.scale.copy(instance.scale)
            }
          }
        })
        instancedMesh.instanceMatrix.needsUpdate = true
        instancedMesh.geometry.computeBoundingSphere()

        addToGroupForModels(instancedMesh)
        listOfThingsToHide.push(instancedMesh)
        if (isColliderNeeded) {
          addToGroupForColliders(colliderGroup)
        }

        if (nameParts.includes('plant')) {
          itemsToHideArray.push(instancedMesh)
        }
      }
      MapStore.getState().addOrUpdateItemToHide(
        ItemsToHide.AllVases,
        itemsToHideArray,
      )
    }
  }

  const handlePlainLODs = (node: THREE.Object3D<THREE.Event>) => {
    const nameParts = node.name.toLowerCase().split('_')
    if (!nameParts.includes('collider')) {
      console.error(
        'Invalid instance group name',
        node.name,
        ' doesnt contain collider',
      )
      return
    }
    if (!nameParts.includes('true') && !nameParts.includes('false')) {
      console.error(
        'Invalid instance group name',
        node.name,
        ' doesnt contain true/false',
      )
      return
    }

    const lowercaseName = node.name.toLowerCase()
    let itemToHideName = ItemsToHide.None
    if (lowercaseName.includes('AroundStoreC1'.toLowerCase())) {
      itemToHideName = ItemsToHide.AroundStoreC1
    } else if (lowercaseName.includes('AroundStoreC2'.toLowerCase())) {
      itemToHideName = ItemsToHide.AroundStoreC2
    } else if (lowercaseName.includes('AroundStoreC3'.toLowerCase())) {
      itemToHideName = ItemsToHide.AroundStoreC3
    } else if (lowercaseName.includes('Cafe'.toLowerCase())) {
      itemToHideName = ItemsToHide.Cafe
    } else if (lowercaseName.includes('CommunityArea'.toLowerCase())) {
      itemToHideName = ItemsToHide.CommunityArea
    } else if (lowercaseName.includes('Screening'.toLowerCase())) {
      itemToHideName = ItemsToHide.ScreeningArea
    }

    // there should be three children, each representing a different LOD.
    // Each children should either have 'low', 'mid' or 'high' in their names
    // if this is not the case, then we will throw an error and return
    const lodMeshes = {
      low: undefined as unknown as THREE.Mesh | THREE.Group,
      mid: undefined as unknown as THREE.Mesh | THREE.Group,
      high: undefined as unknown as THREE.Mesh | THREE.Group,
    }
    let lodTransform: Transform | null = null
    node.children.forEach((lodMesh) => {
      if (lodMesh instanceof THREE.Mesh || lodMesh instanceof THREE.Group) {
        if (lodTransform === null) {
          lodTransform = {
            position: lodMesh.position.clone(),
            rotation: lodMesh.rotation.clone(),
            scale: lodMesh.scale.clone(),
          }
        }

        if (lodMesh.name.toLowerCase().includes('low')) {
          lodMeshes.low = lodMesh
        } else if (lodMesh.name.toLowerCase().includes('mid')) {
          lodMeshes.mid = lodMesh
        } else if (lodMesh.name.toLowerCase().includes('high')) {
          lodMeshes.high = lodMesh
        }

        lodMesh.position.copy(zeroVector)
        lodMesh.rotation.copy(zeroEuler)
        lodMesh.scale.copy(oneVector)
      }
    })
    if (
      lodMeshes.low === undefined ||
      lodMeshes.mid === undefined ||
      lodMeshes.high === undefined
    ) {
      console.error(
        'Invalid instance group name',
        node.name,
        ' doesnt contain low/mid/high',
      )
      return
    }

    const isColliderNeeded = nameParts.includes('true') ? true : false

    if (lodTransform === null) {
      console.error(
        'Invalid instance group name',
        node.name,
        ' no transform found',
      )
      return
    }

    // handle glass material in LODs

    const glassNonReflectiveMaterial =
      MaterialStore.getState().glassNonReflectiveMaterial
    const glassReflectiveMaterial =
      MaterialStore.getState().glassReflectiveMaterial
    const domeGlassMaterial = MaterialStore.getState().domeGlassMaterial
    const glassDoorMaterial = MaterialStore.getState().glassDoorMaterial

    if (
      glassNonReflectiveMaterial === null ||
      glassReflectiveMaterial === null ||
      domeGlassMaterial === null ||
      glassDoorMaterial === null
    ) {
      console.error('Glass materials not loaded')
      return
    }

    // for highest lod
    if (lodMeshes.high instanceof THREE.Group) {
      lodMeshes.high.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (child.material.name.toLowerCase() == 'glass'.toLowerCase())
            child.material = glassNonReflectiveMaterial
          else if (
            child.material.name.toLowerCase() == 'glassreflective'.toLowerCase()
          )
            child.material = glassReflectiveMaterial
          else if (
            child.material.name.toLowerCase() ==
            'glassReflectiveDome'.toLowerCase()
          )
            child.material = domeGlassMaterial
          // else if (child.material.name.toLowerCase() == 'glassdoor'.toLowerCase())
          //   child.material = glassDoorMaterial
        }
      })
    } else if (lodMeshes.high instanceof THREE.Mesh) {
      if (
        (lodMeshes.high.material as THREE.Material).name.toLowerCase() ==
        'glass'.toLowerCase()
      )
        lodMeshes.high.material = glassNonReflectiveMaterial
      else if (
        (lodMeshes.high.material as THREE.Material).name.toLowerCase() ==
        'glassreflective'.toLowerCase()
      )
        lodMeshes.high.material = glassReflectiveMaterial
      else if (
        (lodMeshes.high.material as THREE.Material).name.toLowerCase() ==
        'glassReflectiveDome'.toLowerCase()
      )
        lodMeshes.high.material = domeGlassMaterial
      // else if ((lodMeshes.high.material as THREE.Material).name.toLowerCase() == 'glassdoor'.toLowerCase())
      //   lodMeshes.high.material = glassDoorMaterial
    }

    // for mid lod
    if (lodMeshes.mid instanceof THREE.Group) {
      lodMeshes.mid.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (child.material.name.toLowerCase() == 'glass'.toLowerCase()) {
            child.material = glassNonReflectiveMaterial
          } else if (
            child.material.name.toLowerCase() == 'glassreflective'.toLowerCase()
          ) {
            child.material = glassReflectiveMaterial
          } else if (
            child.material.name.toLowerCase() ==
            'glassReflectiveDome'.toLowerCase()
          ) {
            child.material = domeGlassMaterial
          }
          // else if (
          //   child.material.name.toLowerCase() == 'glassdoor'.toLowerCase()
          // ) {
          //   child.material = glassDoorMaterial
          // }
        }
      })
    } else if (lodMeshes.mid instanceof THREE.Mesh) {
      if (
        (lodMeshes.mid.material as THREE.Material).name.toLowerCase() ==
        'glass'.toLowerCase()
      ) {
        lodMeshes.mid.material = glassNonReflectiveMaterial
      } else if (
        (lodMeshes.mid.material as THREE.Material).name.toLowerCase() ==
        'glassreflective'.toLowerCase()
      ) {
        lodMeshes.mid.material = glassReflectiveMaterial
      } else if (
        (lodMeshes.mid.material as THREE.Material).name.toLowerCase() ==
        'glassReflectiveDome'.toLowerCase()
      ) {
        lodMeshes.mid.material = domeGlassMaterial
      }
      // else if (
      //   (lodMeshes.mid.material as THREE.Material).name.toLowerCase() ==
      //   'glassdoor'.toLowerCase()
      // ) {
      //   lodMeshes.mid.material = glassDoorMaterial
      // }
    }

    // for low lod
    if (lodMeshes.low instanceof THREE.Group) {
      lodMeshes.low.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (child.material.name.toLowerCase() == 'glass'.toLowerCase()) {
            child.material = glassNonReflectiveMaterial
          } else if (
            child.material.name.toLowerCase() == 'glassreflective'.toLowerCase()
          ) {
            child.material = glassReflectiveMaterial
          } else if (
            child.material.name.toLowerCase() ==
            'glassReflectiveDome'.toLowerCase()
          ) {
            child.material = domeGlassMaterial
          }
          // else if (
          //   child.material.name.toLowerCase() == 'glassdoor'.toLowerCase()
          // ) {
          //   child.material = glassDoorMaterial
          // }
        }
      })
    } else if (lodMeshes.low instanceof THREE.Mesh) {
      if (
        (lodMeshes.low.material as THREE.Material).name.toLowerCase() ==
        'glass'.toLowerCase()
      ) {
        lodMeshes.low.material = glassNonReflectiveMaterial
      } else if (
        (lodMeshes.low.material as THREE.Material).name.toLowerCase() ==
        'glassreflective'.toLowerCase()
      ) {
        lodMeshes.low.material = glassReflectiveMaterial
      } else if (
        (lodMeshes.low.material as THREE.Material).name.toLowerCase() ==
        'glassReflectiveDome'.toLowerCase()
      ) {
        lodMeshes.low.material = domeGlassMaterial
      }
      // else if (
      //   (lodMeshes.low.material as THREE.Material).name.toLowerCase() ==
      //   'glassdoor'.toLowerCase()
      // ) {
      //   lodMeshes.low.material = glassDoorMaterial
      // }
    }

    const lod = new THREE.LOD()
    lod.position.copy((lodTransform as Transform).position)
    lod.rotation.copy((lodTransform as Transform).rotation)
    lod.scale.copy((lodTransform as Transform).scale)
    lod.addLevel(lodMeshes.high, 40)
    lod.addLevel(lodMeshes.mid, 110)
    lod.addLevel(lodMeshes.low, 150)

    MapStore.getState().addOrUpdateItemToHide(itemToHideName, lod)
    addToGroupForModels(lod)

    if (isColliderNeeded) {
      if (lodMeshes.high instanceof THREE.Mesh) {
        const collider = new THREE.Mesh(
          lodMeshes.high.geometry,
          dummyWireframeMaterial,
        )
        addToGroupForColliders(collider, {
          position: (lodTransform as Transform).position,
          rotation: (lodTransform as Transform).rotation,
          scale: (lodTransform as Transform).scale,
        })
      } else if (lodMeshes.high instanceof THREE.Group) {
        lodMeshes.high.children.forEach((child) => {
          if (child instanceof THREE.Mesh) {
            const collider = new THREE.Mesh(
              child.geometry,
              dummyWireframeMaterial,
            )
            addToGroupForColliders(collider, {
              position: (lodTransform as Transform).position,
              rotation: (lodTransform as Transform).rotation,
              scale: (lodTransform as Transform).scale,
            })
          } else {
            console.error('Invalid model, no MESH found. Found Group instead')
            return
          }
        })
      }
    }
  }

  const NEWhandleGroupedInstances = (node: THREE.Object3D<THREE.Event>) => {
    // extract collider information
    const nameParts = node.name.toLowerCase().split('_')
    if (!nameParts.includes('collider')) {
      console.error(
        'Invalid instance group name',
        node.name,
        ' doesnt contain collider',
      )
      return
    }
    if (!nameParts.includes('true') && !nameParts.includes('false')) {
      console.error(
        'Invalid instance group name',
        node.name,
        ' doesnt contain true/false',
      )
      return
    }
    const isColliderNeeded = nameParts.includes('true') ? true : false

    // we need to travel down the tree to get the first mesh. That will be our reference mesh, both for instancing and collider
    let referenceMesh: THREE.Mesh | null = null
    node.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        referenceMesh = child
        return
      }
    })

    if (referenceMesh === null) {
      console.error('Invalid model, no reference found')
      return
    }

    // now we can build out grouped instances. each group will have one InstancedMesh. And all these InstancedMeshs will be added to a group
    const groupForInstances = new THREE.Group()

    node.children.forEach((instanceGroup) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const instancedMesh = new THREE.InstancedMesh(
        referenceMesh!.geometry,
        referenceMesh!.material,
        instanceGroup.children.length,
      )
      instancedMesh.instanceMatrix.setUsage(THREE.StaticDrawUsage)
      instanceGroup.children.forEach((instance, index) => {
        if (instance instanceof THREE.Mesh) {
          const matrix = new THREE.Matrix4()
          matrix.compose(instance.position, instance.quaternion, instance.scale)
          instancedMesh.setMatrixAt(index, matrix)

          if (isColliderNeeded) {
            const collider = new THREE.Mesh(
              instance.geometry,
              dummyWireframeMaterial,
            )
            addToGroupForColliders(collider, {
              position: instance.position,
              rotation: instance.rotation,
              scale: instance.scale,
            })
          }
        }
      })
      instancedMesh.instanceMatrix.needsUpdate = true
      instancedMesh.geometry.computeBoundingSphere()
      groupForInstances.add(instancedMesh)
    })

    addToGroupForModels(groupForInstances)
  }

  const handleGroupedInstances = (node: THREE.Object3D<THREE.Event>) => {
    const instancesCollection = node
    instancesCollection.children.forEach((typeOfObject) => {
      const data: TInstancedMeshData = {
        geometry: null as unknown as THREE.BufferGeometry,
        material: null as unknown as THREE.Material,
        instanceGroups: [],
      }

      typeOfObject.children.forEach((node) => {
        if (node instanceof THREE.Mesh) {
          if (node.name.toLowerCase() === 'reference') {
            data.geometry = node.geometry
            data.material = node.material
          } else if (node.name.toLowerCase() === 'collider_reference') {
            data.customColliderGeometry = node.geometry
            data.customColliderTransform = {
              position: node.position,
              rotation: node.rotation,
              scale: node.scale,
            }
          }
        }
      })

      if (data.geometry === null || data.material === null) {
        console.error('Invalid model, no reference found')
        return
      }

      typeOfObject.children.forEach((node) => {
        if (node instanceof THREE.Object3D) {
          const nodeName = node.name.toLowerCase()
          if (
            nodeName.includes('reference') ||
            nodeName.includes('collider_reference')
          )
            return

          if (!nodeName.includes('_collider_')) {
            console.error(
              'Invalid instance group name',
              nodeName,
              ' doesnt contain collider',
            )
            return
          }

          const colliderState = nodeName.split('_')[2]
          const isColliderNeeded = colliderState === 'true' ? true : false
          const colliderGeometry = isColliderNeeded
            ? data.customColliderGeometry || data.geometry
            : null
          const colliderMesh = colliderGeometry
            ? new THREE.Mesh(colliderGeometry, dummyWireframeMaterial)
            : null

          const instanceGroup = node
          const instanceGroupData: TInstanceGroup = {
            positions: [],
            quaternions: [],
            scales: [],
          }
          instanceGroup.children.forEach((instance) => {
            if (instance instanceof THREE.Mesh) {
              instanceGroupData.positions.push(instance.position)
              instanceGroupData.quaternions.push(instance.quaternion)
              instanceGroupData.scales.push(instance.scale)

              if (isColliderNeeded && colliderMesh !== null) {
                const collider = colliderMesh.clone()
                const _transform: Transform = {
                  position: instance.position,
                  rotation: instance.rotation,
                  scale: instance.scale,
                }
                if (
                  data.customColliderGeometry !== null &&
                  data.customColliderTransform != null
                ) {
                  _transform.position = instance.position
                  _transform.rotation = instance.rotation
                  _transform.scale = data.customColliderTransform.scale
                } else {
                  const euler = new THREE.Euler().setFromQuaternion(
                    instance.quaternion,
                  )
                  _transform.position = instance.position
                  _transform.rotation = euler
                  _transform.scale = instance.scale
                }

                addToGroupForColliders(collider, _transform)
              }
            }
          })
          data.instanceGroups.push(instanceGroupData)
        }
      })

      instancedMeshesData.push(data)
    })
  }

  const handleGardenAreas = (node: THREE.Object3D<THREE.Event>) => {
    // Setup grass plane meshes and their colliders
    const child = node
    child.children.forEach((gardenAreaElement) => {
      const name = gardenAreaElement.name.toLowerCase()
      if (
        name.includes('grassplane') &&
        gardenAreaElement instanceof THREE.Mesh
      ) {
        if (name.includes('NonSamplable'.toLowerCase())) {
          addToGroupForModels(gardenAreaElement)
        } else {
          if (!name.includes('_count_')) {
            console.error(
              'Invalid garden area name',
              gardenAreaElement.name,
              ' doesnt contain count',
            )
            return
          }
          gardenAreaInfo.grassPlaneMeshes.push(gardenAreaElement)
          const nameParts = name.split('_')
          const count = parseInt(nameParts[nameParts.indexOf('count') + 1])
          gardenAreaInfo.counts.push(count)
        }

        const collider = gardenAreaElement.clone()
        collider.material = dummyWireframeMaterial
        addToGroupForColliders(collider)
      } else if (
        gardenAreaElement instanceof THREE.Object3D &&
        name.includes('foliages')
      ) {
        gardenAreaElement.children.forEach((foliageGroup) => {
          const name = foliageGroup.name.toLowerCase()
          if (!name.includes('weightage')) {
            console.error(
              'Invalid garden area name',
              gardenAreaElement.name,
              ' doesnt contain weightage',
            )
            return
          }

          if (!name.includes('collider')) {
            console.error(
              'Invalid garden area name',
              gardenAreaElement.name,
              ' doesnt contain collider',
            )
            return
          }

          const nameParts = name.split('_')
          const isColliderNeeded =
            nameParts[nameParts.indexOf('collider') + 1] === 'true'
              ? true
              : false
          const weightage =
            parseInt(nameParts[nameParts.indexOf('weightage') + 1]) / 100
          gardenAreaInfo.foliageWeightage.push(weightage)

          let lowestLOD: THREE.Mesh | null = null
          let collider = null
          foliageGroup.children.forEach((foliageMeshLOD) => {
            if (foliageMeshLOD instanceof THREE.Mesh) {
              if (foliageMeshLOD.name.toLowerCase().includes('_high')) {
                gardenAreaInfo.foliageMeshesLODHigh.push(foliageMeshLOD)
              } else if (foliageMeshLOD.name.toLowerCase().includes('_mid')) {
                gardenAreaInfo.foliageMeshesLODMid.push(foliageMeshLOD)
              } else if (foliageMeshLOD.name.toLowerCase().includes('_low')) {
                lowestLOD = foliageMeshLOD
                gardenAreaInfo.foliageMeshesLODLow.push(foliageMeshLOD)
              } else if (
                foliageMeshLOD.name.toLowerCase().includes('collider')
              ) {
                collider = new THREE.Mesh(
                  foliageMeshLOD.geometry,
                  dummyWireframeMaterial,
                )
              }
            }
          })

          if (isColliderNeeded) {
            if (collider !== null) {
              gardenAreaInfo.foliageColliders.push(collider)
            } else {
              if (lowestLOD == null) {
                console.error(
                  'Lowest LOD not found for ',
                  gardenAreaElement.name,
                )
                return
              }
              const collider = (lowestLOD as THREE.Mesh).clone()
              gardenAreaInfo.foliageColliders.push(collider)
            }
          } else {
            gardenAreaInfo.foliageColliders.push(null)
          }
        })
      }
    })
  }

  // @ts-ignore
  const handleWaterAreas = (node: THREE.Object3D<THREE.Event>) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const thingsToAddToScene: THREE.Object3D[] = []

    node.children.forEach((waterArea) => {
      if (
        waterArea instanceof THREE.Object3D &&
        waterArea.name.toLowerCase().includes('Area'.toLowerCase())
      ) {
        // Area 1
        const lod = new THREE.LOD()
        lod.name = waterArea.name

        const mirrorObjectLod = new THREE.LOD()
        mirrorObjectLod.name = waterArea.name + '_mirror'

        waterArea.children.forEach((waterAreaElement) => {
          if (
            waterAreaElement.name
              .toLowerCase()
              .includes('FloorMesh'.toLowerCase()) &&
            waterAreaElement instanceof THREE.Mesh
          ) {
            const _collider = waterAreaElement.clone()
            _collider.material = dummyWireframeMaterial
            addToGroupForColliders(_collider)

            // scene.add(waterAreaElement)
            waterAreaElement.layers.set(2)
            thingsToAddToScene.push(waterAreaElement)
          } else if (
            waterAreaElement.name
              .toLowerCase()
              .includes('ObjectsForVirtualCamera'.toLowerCase()) &&
            waterAreaElement instanceof THREE.Group
          ) {
            const lodTransform = {
              position: waterAreaElement.position.clone(),
              rotation: waterAreaElement.rotation.clone(),
              scale: waterAreaElement.scale.clone(),
            }
            waterAreaElement.position.copy(zeroVector)
            waterAreaElement.rotation.copy(zeroEuler)

            waterAreaElement.layers.set(2)
            waterAreaElement.traverse((child) => {
              child.layers.set(2)
              if (
                child instanceof THREE.Mesh &&
                child.material instanceof THREE.Material
              ) {
                const glassNonReflectiveMaterial =
                  MaterialStore.getState().glassNonReflectiveMaterial
                const glassReflectiveMaterial =
                  MaterialStore.getState().glassReflectiveMaterial
                const domeGlassMaterial =
                  MaterialStore.getState().domeGlassMaterial

                if (
                  glassNonReflectiveMaterial === null ||
                  glassReflectiveMaterial === null ||
                  domeGlassMaterial === null
                ) {
                  console.error('Glass materials not loaded')
                  return
                }

                if (
                  child.material.name.toLowerCase() == 'glass'.toLowerCase()
                ) {
                  child.material = glassNonReflectiveMaterial
                } else if (
                  child.material.name.toLowerCase() ==
                  'glassReflective'.toLowerCase()
                ) {
                  child.material = glassReflectiveMaterial
                } else if (
                  child.material.name.toLowerCase() ==
                  'glassReflectiveDome'.toLowerCase()
                ) {
                  child.material = domeGlassMaterial
                }
              }
            })
            mirrorObjectLod.frustumCulled = true
            mirrorObjectLod.addLevel(waterAreaElement, 80)
            mirrorObjectLod.addLevel(dummyMesh, 100)
            mirrorObjectLod.position.copy(lodTransform.position)
            mirrorObjectLod.rotation.copy(lodTransform.rotation)

            // thingsToAddToScene.push(waterAreaElement)
            thingsToAddToScene.push(mirrorObjectLod)
          } else if (
            waterAreaElement.name
              .toLowerCase()
              .includes('ShaderPlaneReference'.toLowerCase()) &&
            waterAreaElement instanceof THREE.Mesh
          ) {
            const shaderGeometryReference = waterAreaElement.geometry
            const shaderPlaneDimensions = {
              width: 0,
              depth: 0,
            }
            shaderGeometryReference.computeBoundingBox()
            const boundingBox = shaderGeometryReference.boundingBox
            if (boundingBox == null) console.error('Bounding Box is null')
            else {
              const width = boundingBox.max.x - boundingBox.min.x
              // const height = boundingBox.max.y - boundingBox.min.y
              const depth = boundingBox.max.z - boundingBox.min.z
              shaderPlaneDimensions.width = width
              shaderPlaneDimensions.depth = depth
            }

            const shaderPlaneGeometry = new THREE.PlaneGeometry(
              shaderPlaneDimensions.width,
              shaderPlaneDimensions.depth,
              1,
              1,
            )

            const water = new Water2(shaderPlaneGeometry, {
              color: '#ffffff',
              scale: 2,
              flowDirection: new THREE.Vector2(1, 1),
              flowSpeed: 0.005,
              textureWidth: 1024 / 4,
              textureHeight: 1024 / 4,
              clipBias: 0.0001,
              reflectivity: 0.4,
            })
            // water.position.copy(waterAreaElement.position)
            water.rotation.x = -Math.PI / 2

            const _waterBaseMaterial =
              MaterialStore.getState().waterBaseMaterial
            if (_waterBaseMaterial !== null) {
              const dummyWater = new THREE.Mesh(
                shaderPlaneGeometry,
                _waterBaseMaterial,
              )
              dummyWater.rotation.x = -Math.PI / 2

              const isSmallArea = waterAreaElement.name
                .toLowerCase()
                .includes('small')
              lod.frustumCulled = true
              lod.addLevel(water, 60)
              lod.addLevel(dummyWater, isSmallArea ? 80 : 100)
              lod.position.copy(waterAreaElement.position)
              thingsToAddToScene.push(lod)
            } else {
              console.error('Water base material not loaded')
            }
          }
        })
      }
    })

    // MapStore.getState().addOrUpdateItemToHide(ItemsToHide.WaterAreas, thingsToAddToScene)

    thingsToAddToScene.forEach((thing) => {
      addToGroupForModels(thing)
    })
  }

  const handleStore = (store: THREE.Object3D<THREE.Event>) => {
    const _storeName = store.name.toLowerCase()
    const _mapScale = MapStore.getState().mapScale

    const map: StoreInfo = {
      lods: {
        distances: [0, 0, 0],
        objects: [null, null, null],
        transform: {
          position: null,
          rotation: null,
          scale: null,
        },
      },
      entryTriggerAreaGeometry: null,
      entryTriggerAreaTransform: {
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
      },
      exitTriggerAreaGeometry: null,
      exitTriggerAreaTransform: {
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
      },
    }
    store.children.forEach((child) => {
      if (child instanceof THREE.Mesh || child instanceof THREE.Group) {
        if (
          child.name.toLowerCase().includes('low') ||
          child.name.toLowerCase().includes('mid') ||
          child.name.toLowerCase().includes('high')
        ) {
          if (map.lods.transform.position === null) {
            map.lods.transform.position = child.position.clone()
            map.lods.transform.rotation = child.rotation.clone()
            map.lods.transform.scale = child.scale.clone()
          }
        }

        if (child.name.toLowerCase().includes('low')) {
          map.lods.objects[2] = child
          map.lods.distances[2] =
            StoreConfigs[_storeName]?.exterior?.lod?.low?.distance || 120

          child.position.copy(zeroVector)
          child.rotation.copy(zeroEuler)
          child.scale.copy(oneVector)
        } else if (child.name.toLowerCase().includes('mid')) {
          map.lods.objects[1] = child
          map.lods.distances[1] =
            StoreConfigs[_storeName]?.exterior?.lod?.mid?.distance || 80

          child.position.copy(zeroVector)
          child.rotation.copy(zeroEuler)
          child.scale.copy(oneVector)
        } else if (child.name.toLowerCase().includes('high')) {
          map.lods.objects[0] = child
          map.lods.distances[0] =
            StoreConfigs[_storeName]?.exterior?.lod?.high?.distance || 40

          child.position.copy(zeroVector)
          child.rotation.copy(zeroEuler)
          child.scale.copy(oneVector)
        }
      }
    })

    store.children.forEach((child) => {
      if (child instanceof THREE.Mesh) {
        if (
          child.name.toLowerCase().includes('entrytriggerarea')
        ) {
          map.entryTriggerAreaGeometry = child.geometry
          map.entryTriggerAreaTransform.position = child.position
            .clone().toArray()
            .map((num) => num * _mapScale) as [number, number, number]
          map.entryTriggerAreaTransform.rotation = child.rotation
            .clone().toArray() as [number, number, number]
          map.entryTriggerAreaTransform.scale = child.scale
            .clone().toArray()
            .map((num) => num * _mapScale) as [number, number, number]
        } else if (
          child.name.toLowerCase().includes('exittriggerarea')
        ) {
          map.exitTriggerAreaGeometry = child.geometry
          map.exitTriggerAreaTransform.position = child.position
            .clone().toArray()
            .map((num) => num * _mapScale) as [number, number, number]
          map.exitTriggerAreaTransform.rotation = child.rotation
            .clone().toArray() as [number, number, number]
          map.exitTriggerAreaTransform.scale = child.scale
            .clone().toArray()
            .map((num) => num * _mapScale) as [number, number, number]
        }
      }
    })

    let customColliderMesh: THREE.Mesh | null = null
    store.children.forEach((child) => {
      if (
        child instanceof THREE.Mesh &&
        child.name.toLowerCase().includes('collider')
      )
        customColliderMesh = child
    })

    // Fill missing LODs: use whatever LOD exists for the missing ones
    const anyLod = map.lods.objects[0] || map.lods.objects[1] || map.lods.objects[2]
    if (!anyLod) {
      console.error('Invalid store, no low/mid/high found for', _storeName)
      return
    }
    if (map.lods.objects[0] === null) map.lods.objects[0] = anyLod
    if (map.lods.objects[1] === null) map.lods.objects[1] = anyLod
    if (map.lods.objects[2] === null) map.lods.objects[2] = anyLod
    // Fill missing distances
    if (!map.lods.distances[0]) map.lods.distances[0] = StoreConfigs[_storeName]?.exterior?.lod?.high?.distance || 40
    if (!map.lods.distances[1]) map.lods.distances[1] = StoreConfigs[_storeName]?.exterior?.lod?.mid?.distance || 80
    if (!map.lods.distances[2]) map.lods.distances[2] = StoreConfigs[_storeName]?.exterior?.lod?.low?.distance || 120

    // assign any custom glass materials to the lods
    map.lods.objects.map((node) => {
      node?.traverse((child) => {
        if (
          child instanceof THREE.Mesh &&
          child.material instanceof THREE.Material
        ) {
          // if (child.material.name.toLowerCase() == 'glass'.toLowerCase()) {
          //   child.material.dispose()
          //   child.material = MaterialStore.getState().glassNonReflectiveMaterial
          // }
          // else if (child.material.name.toLowerCase() == 'glassreflective'.toLowerCase()) {
          //   child.material.dispose()
          //   child.material = MaterialStore.getState().glassReflectiveMaterial
          // }
          // else if (child.material.name.toLowerCase() == 'glassReflectiveDome'.toLowerCase()) {
          //   child.material.dispose()
          //   child.material = MaterialStore.getState().domeGlassMaterial
          // } else
          if (child.material.name.toLowerCase() == 'glassdoor'.toLowerCase()) {
            child.material.dispose()
            child.material = MaterialStore.getState().glassDoorMaterial
          } else if (child.material.name.toLowerCase() == 'logos') {
            const newMat = new THREE.MeshBasicMaterial({
              map: (child.material as THREE.MeshStandardMaterial).map,
              toneMapped: false,
              side: THREE.DoubleSide,
            })
            child.material.dispose()
            child.material = newMat
          }
        }
      })
    })

    if (
      map.entryTriggerAreaGeometry === null ||
      map.exitTriggerAreaGeometry === null
    ) {
      console.error('Invalid store, no entry/exit trigger are found')
      return
    }

    if (customColliderMesh === null) {
      const highestLOD = map.lods.objects[0]
      if (highestLOD instanceof THREE.Mesh) {
        const collider = new THREE.Mesh(
          highestLOD.geometry,
          dummyWireframeMaterial,
        )
        addToGroupForColliders(collider, {
          position: map.lods.transform.position ?? zeroVector,
          rotation: map.lods.transform.rotation ?? zeroEuler,
          scale: map.lods.transform.scale ?? oneVector,
        })
      } else if (highestLOD instanceof THREE.Group) {
        highestLOD.children.forEach((child) => {
          if (child instanceof THREE.Mesh) {
            const collider = new THREE.Mesh(
              child.geometry,
              dummyWireframeMaterial,
            )
            addToGroupForColliders(collider, {
              position: map.lods.transform.position ?? zeroVector,
              rotation: map.lods.transform.rotation ?? zeroEuler,
              scale: map.lods.transform.scale ?? oneVector,
            })
          } else {
            console.error('Invalid model, no MESH found. Found Group instead')
            return
          }
        })
      }
    } else {
      const collider = new THREE.Mesh(
        (customColliderMesh as THREE.Mesh).geometry,
        dummyWireframeMaterial,
      )
      addToGroupForColliders(collider, {
        position: (customColliderMesh as THREE.Mesh).position,
        rotation: (customColliderMesh as THREE.Mesh).rotation,
        scale: (customColliderMesh as THREE.Mesh).scale,
      })
    }

    MapStore.getState().addOrUpdateAllStoresInfo(store.name.toLowerCase(), map)
  }

  useEffect(() => {
    if (groupForModels == null || groupForColliders == null) return
    const envForModels = new THREE.Group()

    // building models are being handled by LOD Manager, so we're not adding them here.
    scene.add(envForModels)

    const envForColliders = new THREE.Group()

    if (
      groupForColliders == null ||
      groupForColliders.parent !== scene ||
      groupForColliders.children.length < 10
    )
      return

    const mapScale = MapStore.getState().mapScale

    // adding a timeout because sometimes transforms of the colliders were not set and the BVH got generated with default origin geomteries
    setTimeout(() => {
      // scaling up the collider group and models group at once at the very end before we create BVH and colliders
      envForColliders.scale.set(mapScale, mapScale, mapScale)
      envForColliders.add(groupForColliders)
      envForColliders.updateMatrixWorld(true)

      groupForModels?.scale.set(mapScale, mapScale, mapScale)
      groupForModels?.updateMatrixWorld(true)

      const staticGenerator = new StaticGeometryGenerator(envForColliders)
      staticGenerator.attributes = ['position']

      const mergedGeometry = staticGenerator.generate()
      mergedGeometry.boundsTree = new MeshBVH(mergedGeometry)
      const collider: THREE.Mesh<
        THREE.BufferGeometry,
        THREE.MeshStandardMaterial
      > = new THREE.Mesh(mergedGeometry)
      collider.name = 'customCollider'
      if (collider.material instanceof THREE.MeshBasicMaterial) {
        collider.material.wireframe = true
        collider.material.opacity = 0.5
        collider.material.transparent = true
        collider.visible = true
        collider.material.color.set(0x0000ff)
        collider.material.side = THREE.DoubleSide
      }

      const visualizer = new MeshBVHVisualizer(
        collider,
        MapStore.getState().visualizerDepth,
      )
      if (MapStore.getState().showVisualizer) {
        scene.add(visualizer)
        scene.add(collider.clone())
      }

      MapStore.setState({
        mapModel: envForModels,
        collider: collider,
        visualizer: visualizer,
        geometry: mergedGeometry,
        mapTransform: {
          position: envForModels.position,
          rotation: envForModels.rotation,
          scale: new Vector3().set(mapScale, mapScale, mapScale),
        },
      })
    }, 2000)
  }, [groupForColliders, groupForModels])

  return {}
}

export default useMap
