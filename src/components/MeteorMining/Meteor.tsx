import { staticResourcePaths } from "@client/config/staticResourcePaths"
import { HUDStore } from "@client/contexts/HUDContext"
import { MaterialStore } from "@client/contexts/MaterialContext"
import { Text, useAnimations, useGLTF } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import { useEffect, useMemo, useRef, useState } from "react"
import { AnimationClip, BoxGeometry, BufferGeometry, Group, Material, Mesh, MeshBasicMaterial, Vector3 } from "three"
import { CharacterRef } from "../Character"
import MyBillboard from "../shared/MyBillboard"
// import MyTransformControls from "../shared/MyTransformControls"
import { MeshBVH, StaticGeometryGenerator } from "three-mesh-bvh"
import MyTransformControls from "../shared/MyTransformControls"
import { SpriteAnimator } from "../shared/SpriteAnimator"
import StoreEntryExitTriggerArea from "../StoreEntryExitTriggerArea"
import FlyingJewelPiecesSystem from "./FlyingRewardItems"
import { getRandomQuantity, MeteorManagerStore, MeteorMiningState, MeteorPath, MeteorType } from "./MeteorManager"
import { MyPositionalAudio } from "../shared/MyPositionalAudio"
import { genericStore } from "@client/contexts/GlobalStateContext"
import { SoundsStore } from "../Sounds"


// Easing function for acceleration
export const easeInQuad = (t: number) => t * t * t;
export const easeOutQuad = (t: number) => t * (2 - t);

type IMeteorComponent = MeteorPath & {
  delayBy: number
  meteorModel: Group
  meteorCollisionModel: Group
  index: number
  characterRef: React.MutableRefObject<CharacterRef | null>
  topTagItemTypeText: string
  type: MeteorType
  setIsMounted: React.Dispatch<React.SetStateAction<boolean>>
  nuggetGeometry: BufferGeometry
  nuggetMaterial: Material
}

enum MeteorStage {
  START = 'START',
  FALLING = 'FALLING',
  COLLIDING = 'COLLIDING',
  STABLE = 'STABLE',
  START_DESTROY = 'START_DESTROY',
  END = 'END'
}

const Meteor = (
  props: IMeteorComponent
) => {

  const [isDelayTimeOver, setIsDelayTimeOver] = useState(false)

  const {
    scene: axeScene,
    animations: axeAnimations
  } = useGLTF(staticResourcePaths.axe)

  useEffect(() => {
    const delay = setTimeout(() => {
      setIsDelayTimeOver(true)
    }, props.delayBy)
    return () => clearTimeout(delay)
  }, [])

  const [stage, setStage] = useState<MeteorStage>(MeteorStage.START)

  const animationProgressRef = useRef(0);
  const lerpedPosition = useRef<Vector3>(new Vector3(0, 0, 0));
  const startPosVector = useRef(new Vector3(...props.startPos))
  const endPosVector = useRef(new Vector3(...props.posWhenStruckGround))
  const posWhenGettingDestroyedVector = useRef(new Vector3(...props.posWhenGettingDestroyed))

  const rocksStartScaleVector = useRef(new Vector3(...props.startScaleOfRocks))
  const rocksEndScaleVector = useRef(new Vector3(...props.endScaleOfRocks))
  const lerpedScaleOfRocks = useRef(new Vector3(0, 0, 0))

  const animationTimeInSeconds = 4
  const collisionProgressRef = useRef(0);
  const collisionEndPosVector = useRef(new Vector3(...props.posAfterSinking))
  const collisionTimeInSeconds = 1

  const destroyTimeInSeconds = 2
  const destroyProgressRef = useRef(0);

  const [isTrailSpriteVisible, setIsTrailSpriteVisible] = useState(true);
  const trailSpriteRef = useRef<any>(null);
  const trailSpriteScaleRef = useRef(2.5);
  const trailSpritePositionRef = useRef(new Vector3(-0.056343632870703805, 0.7072167589103493, -0.009021550975279527));
  const trailSpriteFadeOutDuration = 1; // Duration in seconds for the trail to fade out
  const trailSpriteInitialY = 0.7072167589103493; // Store the initial Y position
  const trailSpriteFadeOutDistance = 0.5; // Distance to move down during fade out

  const meteorTrailTexture = useMemo(() => {
    switch (props.type) {
      case MeteorType.DIAMOND:
        return staticResourcePaths.diamondMeteorTrailSprite;
      case MeteorType.GOLD:
        return staticResourcePaths.goldMeteorTrailSprite;
      case MeteorType.SILVER:
        return staticResourcePaths.silverMeteorTrailSprite;
      default:
        return staticResourcePaths.goldMeteorTrailSprite;
    }
  }, [props.type]);

  const [playGroundImpactAnim, setPlayGroundImpactAnim] = useState(false)
  const [isGroundImpactSpriteVisible, setIsGroundImpactSpriteVisible] = useState(false)
  const groundImpactSpriteRef = useRef<any>(null)

  // Add new state for respawn timer
  const [isRespawning, setIsRespawning] = useState(false);
  const respawnTimeInSeconds = 15; // Adjust as needed
  const respawnTimerRef = useRef(0);

  // Reset function to restore meteor to initial state
  const resetMeteor = () => {
    setStage(MeteorStage.START);
    setIsDelayTimeOver(false);
    setIsTopTagVisible(false);
    setIsTrailSpriteVisible(true); // Make sure trail is visible
    setIsFlyingItemSystemTriggered(false);
    setIsRespawning(false);
    setPlayGroundImpactAnim(false);
    setIsGroundImpactSpriteVisible(false);
    setSpriteVisible(false);
    setPlayImpactAnim(false);
    
    // Reset all progress refs
    animationProgressRef.current = 0;
    collisionProgressRef.current = 0;
    destroyProgressRef.current = 0;
    respawnTimerRef.current = 0;

    // Reset trail sprite
    if (trailSpriteRef.current) {
      trailSpriteRef.current.position.copy(new Vector3(-0.056343632870703805, 0.7072167589103493, -0.009021550975279527));
      trailSpriteRef.current.scale.setScalar(2.5);
      trailSpritePositionRef.current = new Vector3(-0.056343632870703805, 0.7072167589103493, -0.009021550975279527);
      trailSpriteScaleRef.current = 2.5;
    }

    // Reset positions and scales
    if (rootGroupRef.current) {
      rootGroupRef.current.visible = false;
      rootGroupRef.current.position.copy(startPosVector.current);
      rootGroupRef.current.scale.set(...props.startScale);
    }

    if (meteorCollisionRocksRef.current) {
      meteorCollisionRocksRef.current.visible = false;
      meteorCollisionRocksRef.current.scale.copy(rocksStartScaleVector.current);
    }

    // Reset store states for this meteor
    MeteorManagerStore.setState(state => {
      const newMiningStates = [...state.meteorMiningStates];
      const newQuantities = [...state.meteorCurrentQuantities];
      
      newMiningStates[props.index] = MeteorMiningState.NOT_STARTED;
      newQuantities[props.index] = getRandomQuantity(); // Reset to initial quantity
      
      return {
        meteorMiningStates: newMiningStates,
        meteorCurrentQuantities: newQuantities
      };
    });

    triggerAreaOnOutside()

    // Start delay timer
    setTimeout(() => {
      setIsDelayTimeOver(true);
    }, props.delayBy);
  };

  const triggerAreaOnInside = () => {
    HUDStore.setState({ isStartMiningPromptShown: true })
    MeteorManagerStore.setState({ currentlyInteractingWithMeteorIndex: props.index })
  }

  const triggerAreaOnOutside = () => {
    if (MeteorManagerStore.getState().currentlyInteractingWithMeteorIndex === props.index) {
      HUDStore.setState({ isStartMiningPromptShown: false })
      MeteorManagerStore.setState({ currentlyInteractingWithMeteorIndex: null })
    }
  }

  // Add new ref at the top with other refs
  const meteorFallingAudioRef = useRef<THREE.PositionalAudio | null>(null);

  // Add a new useEffect to watch for stage changes
  useEffect(() => {
    if (stage === MeteorStage.FALLING) {
      // Play falling sound when meteor starts falling
      if (meteorFallingAudioRef.current && !SoundsStore.getState().isMuted && genericStore.getState().isTabFocused) {
        meteorFallingAudioRef.current.play();
      }
    }
  }, [stage]);

  // Modify the useFrame hook to handle respawning
  useFrame((_, delta) => {
    if (isRespawning) {
      respawnTimerRef.current += delta;
      if (respawnTimerRef.current >= respawnTimeInSeconds) {
        resetMeteor();
      }
      return;
    }

    // if (stage === MeteorStage.END) return
    if (rootGroupRef.current === null) return
    if (meteorCollisionRocksRef.current === null) return

    if (isDelayTimeOver) {
      if (stage === MeteorStage.START) {
        // unhide the meteor, set its scale and position as start values
        rootGroupRef.current!.visible = true
        rootGroupRef.current!.position.set(props.startPos[0], props.startPos[1], props.startPos[2]);
        setStage(MeteorStage.FALLING)
      } else if (stage === MeteorStage.FALLING) {
        // Update the animation progress
        animationProgressRef.current += delta / animationTimeInSeconds;
        animationProgressRef.current = Math.min(animationProgressRef.current, 1);

        // Apply easing function to the animation progress
        const easedProgress = easeInQuad(animationProgressRef.current);

        // Interpolate the position
        lerpedPosition.current.lerpVectors(startPosVector.current, endPosVector.current, easedProgress);
        rootGroupRef.current!.position.copy(lerpedPosition.current);

        // Reset the animation when it's complete
        if (animationProgressRef.current === 1) {
          animationProgressRef.current = 0;
          meteorCollisionRocksRef.current!.visible = true
          setPlayGroundImpactAnim(true)  // Start ground impact animation
          setIsGroundImpactSpriteVisible(true)  // Make the ground impact sprite visible
          setStage(MeteorStage.COLLIDING)
        }
      } else if (stage === MeteorStage.COLLIDING) {
        // play the colliding animation
        // Update the collision progress
        collisionProgressRef.current += delta / collisionTimeInSeconds;
        collisionProgressRef.current = Math.min(collisionProgressRef.current, 1);

        // Apply easing function to the collision progress
        const easedCollisionProgress = easeOutQuad(collisionProgressRef.current);

        // Interpolate the position for collision
        lerpedPosition.current.lerpVectors(endPosVector.current, collisionEndPosVector.current, easedCollisionProgress);
        rootGroupRef.current!.position.copy(lerpedPosition.current);

        // Interpolate the scale for rocks
        lerpedScaleOfRocks.current.lerpVectors(rocksStartScaleVector.current, rocksEndScaleVector.current, easedCollisionProgress);
        meteorCollisionRocksRef.current!.scale.copy(lerpedScaleOfRocks.current);

        // Update trail sprite scale and position
        const fadeOutProgress = Math.min(collisionProgressRef.current / trailSpriteFadeOutDuration, 1);
        trailSpriteScaleRef.current = 2 * (1 - fadeOutProgress);

        // Adjust Y position
        const newY = trailSpriteInitialY - (trailSpriteFadeOutDistance * fadeOutProgress);
        trailSpritePositionRef.current.setY(newY);

        if (trailSpriteRef.current) {
          trailSpriteRef.current.scale.setScalar(trailSpriteScaleRef.current);
          trailSpriteRef.current.position.copy(trailSpritePositionRef.current);
        }

        // Change to STEAM stage when collision completes
        if (collisionProgressRef.current === 1) {
          setIsTopTagVisible(true)
          // setIsTrailSpriteVisible(false)
          setStage(MeteorStage.STABLE)
        }
      } else if (stage === MeteorStage.STABLE) {
        // play the steam animation
      } else if (stage === MeteorStage.START_DESTROY) {
        // cubes keep flying to me and the meteor slowly scales to 0

        // then setStage(MeteorStage.END). Code below:

        // Update the destroy progress
        destroyProgressRef.current += delta / destroyTimeInSeconds;
        destroyProgressRef.current = Math.min(destroyProgressRef.current, 1);

        // Apply easing function to the destroy progress
        const easedDestroyProgress = easeInQuad(destroyProgressRef.current);

        // Interpolate the scale for rocks
        lerpedScaleOfRocks.current.lerpVectors(rocksEndScaleVector.current, new Vector3(0, 0, 0), easedDestroyProgress);
        meteorCollisionRocksRef.current!.scale.copy(lerpedScaleOfRocks.current);

        // Interpolate the scale for meteor
        lerpedScaleOfRocks.current.lerpVectors(new Vector3(...props.startScale), new Vector3(0, 0, 0), easedDestroyProgress);
        rootGroupRef.current!.scale.copy(lerpedScaleOfRocks.current);

        // interpolate the position for the meteor, it should slowly go down
        lerpedPosition.current.lerpVectors(collisionEndPosVector.current, posWhenGettingDestroyedVector.current, easedDestroyProgress);
        rootGroupRef.current!.position.copy(lerpedPosition.current);

        // Change to END stage when destroy completes
        if (destroyProgressRef.current === 1) {
          setStage(MeteorStage.END)
          // destroy / dispose all primitives
          // meteorModelRef.current?.traverse((child) => {
          //   if ((child as any).geometry) {
          //     (child as any).geometry.dispose()
          //   }
          //   if ((child as any).material) {
          //     (child as any).material.dispose()
          //   }
          // })
          // meteorCollisionRocksRef.current?.traverse((child) => {
          //   if ((child as any).geometry) {
          //     (child as any).geometry.dispose()
          //   }
          //   if ((child as any).material) {
          //     (child as any).material.dispose()
          //   }
          // })
          // axeModelRef.current?.traverse((child) => {
          //   if ((child as any).geometry) {
          //     (child as any).geometry.dispose()
          //   }
          //   if ((child as any).material) {
          //     (child as any).material.dispose()
          //   }
          // })

          // props.setIsMounted(false)
        }
      } else if (stage === MeteorStage.END) {
        setIsRespawning(true);
        return;
      }
    }
  })


  const clonedMeteorModel = useMemo(() => {
    return props.meteorModel.clone()
  }, [props.meteorModel])

  const [meteorCollider, setMeteorCollider] = useState<Mesh | null>(null)
  const scene = useThree((state) => state.scene)

  // Load the asteroid collider model
  const { scene: asteroidColliderScene } = useGLTF(staticResourcePaths.asteroidCollider)

  useEffect(() => {
    const groupForColliders = new Group()
    const envForColliders = new Group()
    const colliderModel = asteroidColliderScene.clone() 
    
    groupForColliders.add(colliderModel)

    const newScale = props.endScaleOfRocks[0] // Use the scale when meteor has sunk in
    const newPosition = props.posAfterSinking // Use the position when meteor has sunk in

    envForColliders.scale.set(newScale, newScale, newScale)
    envForColliders.position.set(newPosition[0], newPosition[1], newPosition[2])
    envForColliders.add(groupForColliders)
    envForColliders.updateMatrixWorld(true)

    const staticGenerator = new StaticGeometryGenerator(envForColliders)
    staticGenerator.attributes = ['position']

    const mergedGeometry = staticGenerator.generate()
    mergedGeometry.boundsTree = new MeshBVH(mergedGeometry)
    const collider: THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial> = new Mesh(mergedGeometry)
    collider.name = `meteorCollider_${props.index}`
    if (collider.material instanceof MeshBasicMaterial) {
      // collider.material.wireframe = true
      // collider.material.opacity = 0.5
      // collider.material.transparent = true
      // collider.visible = true
      // collider.material.color.set(0x0000ff)
      // collider.material.side = DoubleSide
    }

    // const visualizer = new MeshBVHVisualizer(collider, MapStore.getState().visualizerDepth)
    // scene.add(visualizer)
    // scene.add(collider.clone())
    setMeteorCollider(collider)

    return () => {
      // (collider as THREE.Mesh).geometry.dispose()
      // // // scene.remove(visualizer);
      // scene.remove(collider);

      // mergedGeometry.dispose()
      // colliderModel.traverse((child) => {
      //   if ((child as any).geometry) {
      //     (child as any).geometry.dispose()
      //   }
      // })
      // envForColliders.traverse((child) => {
      //   if ((child as any).geometry) {
      //     (child as any).geometry.dispose()
      //   }
      // })
      // scene.remove(envForColliders)
      // scene.remove(groupForColliders)
    };
  }, [asteroidColliderScene, props.index, props.endScaleOfRocks, props.posAfterSinking, scene])

  useEffect(() => {
    if (stage === MeteorStage.STABLE && meteorCollider) {
      MeteorManagerStore.getState().setMeteorCollider(props.index, meteorCollider);
    } else if (stage === MeteorStage.START_DESTROY) {
      MeteorManagerStore.getState().setMeteorCollider(props.index, null);
      // Play the chaChing sound when meteor starts destroying
      if (meteorCollectAudioRef.current) {
        meteorCollectAudioRef.current.setVolume(0.5)
        if (genericStore.getState().isTabFocused && !SoundsStore.getState().isMuted)
          meteorCollectAudioRef.current.play();
      }
    }
  }, [stage, meteorCollider, props.index]);

  const clonedMeteorCollisionRocks = useMemo(() => {
    return props.meteorCollisionModel.clone()
  }, [props.meteorCollisionModel])


  const [isTopTagVisible, setIsTopTagVisible] = useState(false)
  const meteorModelRef = useRef<Group>(null)
  const rootGroupRef = useRef<Group>(null)
  const meteorCollisionRocksRef = useRef<Group>(null)
  const topTagRef = useRef<typeof Text>(null)
  const geometry = useMemo(() => {
    return new BoxGeometry(
      props.triggerAreaTransform.scale[0], 
      0.01, 
      props.triggerAreaTransform.scale[2]
    )
  }, [])

  const [textMaterial, setTextMaterial] = useState<Material>(new MeshBasicMaterial({ color: 'white' }))
  useEffect(() => {
    const diamondMaterial = MaterialStore.getState().cheapDiamondMaterial
    const whiteGoldMaterial = MaterialStore.getState().whiteGoldMaterial
    const yellowGoldMaterial = MaterialStore.getState().yellowGoldMaterial
    if (props.type === MeteorType.DIAMOND && diamondMaterial !== null) {
      setTextMaterial(diamondMaterial)
    } else if (props.type === MeteorType.GOLD && yellowGoldMaterial !== null) {
      setTextMaterial(yellowGoldMaterial)
    } else if (props.type === MeteorType.SILVER && whiteGoldMaterial !== null) {
      setTextMaterial(whiteGoldMaterial)
    }

  }, [props.type])

  const meteorCurrentQuantities = MeteorManagerStore(state => state.meteorCurrentQuantities)
  const axeModelRef = useRef<Group>(null)

  const clonedAxeModel = useMemo(() => {
    return axeScene.clone()
  }, [axeScene])

  const clonedAxeAnimations = useMemo(() => {
    return axeAnimations.map((clip: AnimationClip) => {
      return clip.clone()
    })
  }, [axeAnimations])

  const { actions } = useAnimations(clonedAxeAnimations, clonedAxeModel)

  const meteorMiningStates = MeteorManagerStore(state => state.meteorMiningStates)
  const meteorMiningState = meteorMiningStates[props.index]
  useEffect(() => {
    if (axeModelRef.current === null) return
    if (meteorMiningState == MeteorMiningState.ONGOING) {
      axeModelRef.current.visible = true
      actions['Pick AxeAction']?.play()
      if (actions !== null) {
        // @ts-ignore
        actions['Pick AxeAction']?._mixer.addEventListener('loop', (event) => {
          setSpriteVisible(true)
          setPlayImpactAnim(true)
          // Play axe hit sound on each loop
          if (axeHitAudioRef.current) {
            if (genericStore.getState().isTabFocused && !SoundsStore.getState().isMuted)
              axeHitAudioRef.current.play();
          }
        })
      }
    } else if (meteorMiningState == MeteorMiningState.REWARDS_COLLECTED) {
      setIsFlyingItemSystemTriggered(true)
      HUDStore.setState({ isStartMiningPromptShown: false })
      setStage(MeteorStage.START_DESTROY)
    } else {
      axeModelRef.current.visible = false
      actions['Pick AxeAction']?.stop()
    }
  }, [meteorMiningState])

  useEffect(() => {
    if (meteorMiningState == MeteorMiningState.REWARDS_COLLECTED) {
      setIsTopTagVisible(false)
    }
  }, [meteorMiningState])

  const spriteRef = useRef<any>(null)

  const [playImpactAnim, setPlayImpactAnim] = useState(false)
  const [spriteVisible, setSpriteVisible] = useState(false)
  const [isFlyingItemSystemTriggered, setIsFlyingItemSystemTriggered] = useState(false)
  const meteorCollectAudioRef = useRef<THREE.PositionalAudio | null>(null);

  // Add new ref at the top with other refs
  const axeHitAudioRef = useRef<THREE.PositionalAudio | null>(null);

  return <>
    {
      isDelayTimeOver &&
      <>
        <group
          position={props.startPos}
          scale={props.startScale}
          ref={rootGroupRef}
        >
          <primitive object={clonedMeteorModel} ref={meteorModelRef}>
            <MyPositionalAudio
              url={staticResourcePaths.chaChingSound}
              distance={10}
              loop={false}
              autoplay={false}
              ref={meteorCollectAudioRef}
            />
            <MyPositionalAudio
              url={staticResourcePaths.axeSound}
              distance={10}
              loop={false}
              autoplay={false}
              ref={axeHitAudioRef}
            />
            <MyPositionalAudio
              url={staticResourcePaths.meteorFallingSound}
              distance={10}
              loop={false}
              autoplay={false}
              ref={meteorFallingAudioRef}
            />
          </primitive>
          <primitive object={clonedAxeModel} ref={axeModelRef} visible={false} position={[
            0.48392991109967376,
            0.007000158919209465,
            0
          ]} />
          <SpriteAnimator
            position={[
              0.21769327720961051,
              0.24090004015313743,
              0.008572851760189338
            ]}
            startFrame={0}
            autoPlay={false}
            play={playImpactAnim}
            onLoopEnd={() => {
              setPlayImpactAnim(false)
              setSpriteVisible(false)
            }}
            loop={true}
            scale={0.4}
            textureImageURL={'./assets/impactSprite.png'}
            textureDataURL={'./assets/impactSpriteData.json'}
            alphaTest={0.01}
            asSprite={true}
            fps={25}
            ref={spriteRef}
            visible={spriteVisible}
          />

          {/* trail sprite */}
          {isTrailSpriteVisible && (
            <SpriteAnimator
              position={trailSpritePositionRef.current.toArray()}
              scale={trailSpriteScaleRef.current}
              startFrame={0}
              autoPlay={true}
              loop={true}
              textureImageURL={meteorTrailTexture}
              textureDataURL={staticResourcePaths.meteorTrailSpriteData}
              alphaTest={0.5}
              asSprite={true}
              fps={54}
              ref={trailSpriteRef}
              visible={true}
            />
          )}

          {/* Ground impact sprite */}
          {isGroundImpactSpriteVisible && (
            <SpriteAnimator
              position={[
                -0.056343632870703805,
                -0.010232779178018905,
                -0.009021550975279527
              ]}
              startFrame={0}
              autoPlay={false}
              play={playGroundImpactAnim}
              onEnd={() => {
                setPlayGroundImpactAnim(false)
                setIsGroundImpactSpriteVisible(false)  // Hide the sprite after animation ends
              }}
              loop={false}
              scale={1.6684265193037344}
              textureImageURL={staticResourcePaths.meteorGroundImpactSprite}
              textureDataURL={staticResourcePaths.meteorGroundImpactSpriteData}
              alphaTest={0.5}
              asSprite={true}
              fps={25}
              ref={groundImpactSpriteRef}
            />
          )}
        </group>

        {/* <MyTransformControls objectRef={axeModelRef} />
        <MyTransformControls objectRef={spriteRef} /> */}
        <MyTransformControls objectRef={groundImpactSpriteRef} />

        {
          isTopTagVisible &&
          <>
            {/* <MyTransformControls objectRef={topTagRef} /> */}
            <MyBillboard objectRef={topTagRef} />
            <Text
              material={textMaterial}
              anchorX="center"
              anchorY="middle"
              ref={topTagRef}
              position={props.topTagTransform.position}
              rotation={props.topTagTransform.rotation}
              scale={props.topTagTransform.scale}
              font={staticResourcePaths.rajdhaniFont}
              outlineWidth={0.1}
            >
              {
                meteorMiningState === MeteorMiningState.COMPLETED
                  ? "Mining Completed!"
                  : meteorCurrentQuantities[props.index].toString() + "  " + props.topTagItemTypeText
              }
            </Text>
          </>
        }

        <primitive
          object={clonedMeteorCollisionRocks}
          ref={meteorCollisionRocksRef}
          scale={props.startScaleOfRocks}
          position={props.posOfRocks}
          visible={false}
        />
        {
          (stage === MeteorStage.STABLE) && // Only show trigger area in STABLE stage
          <StoreEntryExitTriggerArea
            key={props.index + "meteor"}
            keyId={props.index + "meteor"}
            characterRef={props.characterRef}
            // @ts-ignore
            geometry={geometry}
            transform={{
              position: props.triggerAreaTransform.position,
              rotation: props.triggerAreaTransform.rotation,
              scale: [1, 1, 1]
            }}
            onInside={triggerAreaOnInside}
            onOutside={triggerAreaOnOutside}
            transformControlsEnabled={false}
          />
        }
        {
          stage === MeteorStage.START_DESTROY &&
          <FlyingJewelPiecesSystem
            startPosition={props.posWhenStruckGround}
            userRef={props.characterRef.current!.playerRef}
            totalAnimationDuration={destroyTimeInSeconds / 2}
            geometry={props.nuggetGeometry}
            material={props.nuggetMaterial}
            isTriggered={isFlyingItemSystemTriggered}
          ></FlyingJewelPiecesSystem>
        }
      </>

    }
  </>
}

export default Meteor
