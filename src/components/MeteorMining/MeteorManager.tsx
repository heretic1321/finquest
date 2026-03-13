import { meteorPaths } from "@client/config/meteorPaths"
import { staticResourcePaths } from "@client/config/staticResourcePaths"
import { AuthAPIStore } from "@client/contexts/AuthContext"
import { HUDStore } from "@client/contexts/HUDContext"
import { MaterialStore } from "@client/contexts/MaterialContext"
import { usePMREMWithCubeMap } from "@client/hooks/usePMREM"
import { TransformLite } from "@client/utils/commonTypes"
import { MeteorResource, sendRewardsData, UserMeteorState } from "@client/utils/meteorAPI"
import { useGLTF, useTexture } from "@react-three/drei"
import CryptoJS from 'crypto-js'
import { useEffect, useMemo, useRef, useState } from "react"
import { BufferGeometry, Group, Mesh, MeshBasicMaterial, MeshStandardMaterial } from "three"
import { create } from "zustand"
import { CharacterRef } from "../Character"
import LeaderboardMachine from "./LeaderboardMachine"
import Meteor from "./Meteor"
import { RedeemMachine } from "./RedeemMachine"
import { trackEvent } from "@client/utils/api"
import { getUserID } from "@client/utils/helperFunctions"
import toast from "react-hot-toast"
import { genericStore } from "@client/contexts/GlobalStateContext"
// import { button, useControls } from "leva"

export interface MeteorPath {
  startPos: [number, number, number]
  posWhenStruckGround: [number, number, number]
  posAfterSinking: [number, number, number]
  posWhenGettingDestroyed: [number, number, number]
  startScale: [number, number, number]
  endScale: [number, number, number]
  posOfRocks: [number, number, number]
  endScaleOfRocks: [number, number, number]
  startScaleOfRocks: [number, number, number]
  triggerAreaTransform: TransformLite
  topTagTransform: TransformLite
}

export enum MeteorType {
  GOLD = 'GOLD',
  SILVER = 'SILVER',
  DIAMOND = 'DIAMOND',
}


export interface IMeteor extends MeteorPath {
  type: MeteorType
  quantity: number

}

export enum RewardMachineMode {
  OUTSIDE = 'OUTSIDE',
  INSIDE = 'INSIDE',
  TRAVELLING_OUTSIDE_TO_INSIDE = 'TRAVELLING_OUTSIDE_TO_INSIDE',
  TRAVELLING_INSIDE_TO_OUTSIDE = 'TRAVELLING_INSIDE_TO_OUTSIDE'
}

export enum MeteorMiningState {
  NOT_STARTED = 'NOT_STARTED',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  REWARDS_COLLECTED = 'REWARDS_COLLECTED'
}

interface MeteorManagerStoreState {
  secretKey: string
  rewardsData: UserMeteorState,
  meteorPaths: MeteorPath[]
  meteorMiningStates: MeteorMiningState[]
  meteorCurrentQuantities: number[]
  meteorMiningIntervals: (NodeJS.Timeout | null)[]
  generatedMeteors: IMeteor[]
  currentlyInteractingWithMeteorIndex: number | null
  startMining: (index: number) => void
  rewardsCollected: (index: number) => void
  miningRate: number // units per second
  rewardMachineMode: RewardMachineMode
  leaderboardMachineMode: RewardMachineMode
  meteorColliders: (Mesh | null)[];
  initializeMeteorColliders: (count: number) => void;
  setMeteorCollider: (index: number, collider: Mesh | null) => void;
}

const STARTING_QUANTITY = 1000

export const getRandomQuantity = (min: number = STARTING_QUANTITY - 200, max: number = STARTING_QUANTITY + 200) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const MeteorManagerStore = create<MeteorManagerStoreState>((set, get) => ({
  secretKey: "e1Ep4h7gqO3eiRODz7314TL6x9i7wuvP",
  rewardsData: {
    mobile: '',
    name: '',
    gold: 0,
    silver: 0,
    diamond: 0
  },
  meteorPaths: meteorPaths,
  generatedMeteors: [],
  meteorMiningStates: [],
  meteorCurrentQuantities: [],
  currentlyInteractingWithMeteorIndex: null,
  startMining: (index) => {
    const isLoggedIn = AuthAPIStore.getState().isLoggedIn

    if (!isLoggedIn) {
      HUDStore.getState().setShowMeteorLoginRegister(true)
      return
    }

    const {generatedMeteors,rewardsData} = get()
    let resourceBeforeAction : MeteorResource = {
      gold: rewardsData.gold,
      silver: rewardsData.silver,
      diamond: rewardsData.diamond
    }
    if (generatedMeteors &&  generatedMeteors[index] )
    {
      trackEvent(
        'Meteor_Mining',
        {
          action: 'Mining_Started',
          meteor_type: generatedMeteors[index].type,
          meteor_quantity: generatedMeteors[index].quantity,
          resource_before_action: resourceBeforeAction,
        },
        getUserID(),
      )
    }

    set((state) => {
      return {
        ...state,
        meteorMiningStates: state.meteorMiningStates.map((state, i) => {
          if (i === index) {
            return MeteorMiningState.ONGOING
          }
          return state
        })
      }
    })

    const interval = setInterval(() => {
      const state = MeteorManagerStore.getState()

      // MINING COMPLETE
      if (state.meteorCurrentQuantities[index] <= 0) {
        clearInterval(interval)
        set((state) => {
          return {
            ...state,
            meteorMiningStates: state.meteorMiningStates.map((state, i) => {
              if (i === index) {
                return MeteorMiningState.COMPLETED
              }
              return state
            })
          }
        })
        return
      }
      set((state) => {
        return {
          ...state,
          meteorCurrentQuantities: state.meteorCurrentQuantities.map((quantity, i) => {
            if (i === index) {
              const miningAmount = genericStore.getState().isTutorialEnabled ? 200 : get().miningRate
              if (quantity > miningAmount) {
                return quantity - miningAmount
              }
              return 0
            }
            return quantity
          })
        }
      })
    }, 1000)

    set((state) => {
      return {
        ...state,
        meteorMiningIntervals: state.meteorMiningIntervals.map((interval, i) => {
          if (i === index) {
            return interval
          }
          return interval
        })
      }
    })
  },
  rewardsCollected: async (index) => {
    const { secretKey, generatedMeteors, rewardsData } = get();
    const { mobileNumberForMining, userDisplayName } = AuthAPIStore.getState();

    // Update the rewards data based on the mined meteor
    if (generatedMeteors && generatedMeteors[index]) {
      const meteorType = generatedMeteors[index].type;
      const quantity = generatedMeteors[index].quantity;
      let resourceBeforeAction : MeteorResource = {
        gold: rewardsData.gold,
        silver: rewardsData.silver,
        diamond: rewardsData.diamond
      }
      const currentValue = rewardsData[meteorType.toLowerCase() as keyof typeof rewardsData]
      const updatedRewardsData = {
        ...rewardsData,
        [meteorType.toLowerCase()]: (typeof currentValue === 'number' ? currentValue : 0) + quantity,
        mobile: mobileNumberForMining,
        name: userDisplayName,
      }

      // Encrypt the data
      const iv = CryptoJS.lib.WordArray.random(16);
      const encrypted = CryptoJS.AES.encrypt(JSON.stringify(updatedRewardsData), CryptoJS.enc.Utf8.parse(secretKey), {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });
      const encryptedData = iv.concat(encrypted.ciphertext).toString(CryptoJS.enc.Base64);

      // Send the encrypted data to the backend using the new API function
      try {
        await sendRewardsData(encryptedData);
        trackEvent(
          'Meteor_Mining',
          {
            action: 'Mining_Completed',
            meteor_type: meteorType,
            meteor_quantity: quantity,
            resource_before_action: resourceBeforeAction,
          },
          getUserID(),
        )

        // Update the meteor mining state
        set((state) => ({
          rewardsData: updatedRewardsData,
          meteorMiningStates: state.meteorMiningStates.map((state, i) => {
            if (i === index) {
              return MeteorMiningState.REWARDS_COLLECTED;
            }
            return state;
          })
        }));
      } catch (error) {
        console.error('Error sending rewards data:', error);
        toast.error('Something went wrong. Please try again later.')
      }
    }
  },
  miningRate: 20,
  meteorMiningIntervals: [],
  rewardMachineMode: RewardMachineMode.OUTSIDE,
  leaderboardMachineMode: RewardMachineMode.OUTSIDE,
  meteorColliders: [],
  initializeMeteorColliders: (count: number) => set(() => ({
    meteorColliders: new Array(count).fill(null)
  })),
  setMeteorCollider: (index: number, collider: Mesh | null) => set((state) => {
    const newColliders = [...state.meteorColliders];
    if (index >= newColliders.length) {
      // Extend the array if necessary
      newColliders.length = index + 1;
      newColliders.fill(null, state.meteorColliders.length);
    }
    newColliders[index] = collider;
    return { meteorColliders: newColliders };
  }),
}))

const updatePath = (path: MeteorPath, xOffset: number, zOffset: number): MeteorPath => {
  if (!path) {
    console.error("Attempted to update undefined path");
    return path;
  }

  const updatePosition = (pos: [number, number, number]): [number, number, number] => [
    pos[0] + xOffset,
    pos[1],
    pos[2] + zOffset
  ];

  return {
    ...path,
    startPos: updatePosition(path.startPos),
    posWhenStruckGround: updatePosition(path.posWhenStruckGround),
    posAfterSinking: updatePosition(path.posAfterSinking),
    posWhenGettingDestroyed: updatePosition(path.posWhenGettingDestroyed),
    posOfRocks: updatePosition(path.posOfRocks),
    triggerAreaTransform: {
      ...path.triggerAreaTransform,
      position: updatePosition(path.triggerAreaTransform.position as [number, number, number])
    },
    topTagTransform: {
      ...path.topTagTransform,
      position: updatePosition(path.topTagTransform.position as [number, number, number])
    }
  };
};

const updateMeteor = (meteor: IMeteor, xOffset: number, zOffset: number): IMeteor => {
  if (!meteor) {
    console.error("Attempted to update undefined meteor");
    return meteor;
  }
  return updatePath(meteor, xOffset, zOffset) as IMeteor;
};


const MeteorManager = (props: {
  characterRef: React.MutableRefObject<CharacterRef | null>
}) => {
  const [
    xOffset,
    // setXOffset
  ] = useState(0);
  const [
    zOffset,
    // setZOffset
  ] = useState(0);
  const initialPositionRef = useRef<MeteorPath | null>(null);
  const initialMeteorRef = useRef<IMeteor | null>(null);
  const currentUpdatedMeteorRef = useRef<IMeteor | null>(null);

  // useControls('Third Meteor Position', {
  //   xOffset: {
  //     value: 0,
  //     min: -200,
  //     max: 200,
  //     step: 0.1,
  //     onChange: (value) => setXOffset(value)
  //   },
  //   zOffset: {
  //     value: 0,
  //     min: -200,
  //     max: 200,
  //     step: 0.1,
  //     onChange: (value) => setZOffset(value)
  //   },
  //   print: button(() => {
  //     if (currentUpdatedMeteorRef.current) {
  //       const { type, quantity, ...positionData } = currentUpdatedMeteorRef.current;
  //       console.log("Updated Third Asteroid Positions:");
  //       console.log(JSON.stringify(positionData, null, 2));
  //     } else {
  //       console.log("No updated positions available.");
  //     }
  //   })
  // });

  useEffect(() => {
    const updateThirdMeteorPosition = () => {
      const index = 7
      const currentPaths = MeteorManagerStore.getState().meteorPaths;
      const currentMeteors = MeteorManagerStore.getState().generatedMeteors;

      // Check if the third meteor exists
      if (currentPaths.length < 6 || currentMeteors.length < 6) {
        console.warn("Third meteor not yet generated. Skipping position update.");
        return;
      }

      if (!initialPositionRef.current) {
        initialPositionRef.current = JSON.parse(JSON.stringify(currentPaths[index]));
      }

      if (!initialMeteorRef.current) {
        initialMeteorRef.current = JSON.parse(JSON.stringify(currentMeteors[index]));
      }


      const updatedPath = updatePath(initialPositionRef.current!, xOffset, zOffset);
      const updatedMeteor = updateMeteor(initialMeteorRef.current!, xOffset, zOffset);

      currentUpdatedMeteorRef.current = updatedMeteor;

      const newPaths = [...currentPaths];
      newPaths[index] = updatedPath;

      const newMeteors = [...currentMeteors];
      newMeteors[index] = updatedMeteor;

      MeteorManagerStore.setState({
        meteorPaths: newPaths,
        generatedMeteors: newMeteors
      });
    };

    updateThirdMeteorPosition();
  }, [xOffset, zOffset]);

  const generatedMeteors = MeteorManagerStore((state) => state.generatedMeteors)
  const delayFactorInSeconds = 15
  const diamondAsteroidGLB = useGLTF(staticResourcePaths.asteroidDiamondMesh)
  const metalAsteroidGLB = useGLTF(staticResourcePaths.asteroidMetalMesh)
  const collisionRocks = useGLTF(staticResourcePaths.asteroidCollideRocks)
  const metalNuggetGLB = useGLTF(staticResourcePaths.metalNugget)
  const diamondNugggetGLB = useGLTF(staticResourcePaths.diamondNugget)
  const {
    yellowGoldMaterial,
    whiteGoldMaterial,
    diamondMaterial,
  } = MaterialStore((state) => ({
    yellowGoldMaterial: state.yellowGoldMaterial,
    whiteGoldMaterial: state.whiteGoldMaterial,
    diamondMaterial: state.diamondMaterial
  }))
  const [diamondAsteroid, setDiamondAsteroid] = useState<Group | null>(null)
  const [goldAsteroid, setGoldAsteroid] = useState<Group | null>(null)
  const [silverAsteroid, setSilverAsteroid] = useState<Group | null>(null)
  // a list of states which track if a Meteor component is mounted or not. Only the setters are sent to the Meteor component so they can unmout themselves
  // when the Meteor component is no longer in view. This should be an array of useStates
  const meteorMountedStates = Array.from({ length: meteorPaths.length }, () => useState(true))
  const [goldNuggetGeometry, setGoldNuggetGeometry] = useState<BufferGeometry | null>(null)
  const [silverNuggetGeometry, setSilverNuggetGeometry] = useState<BufferGeometry | null>(null)
  const [diamondNuggetGeometry, setDiamondNuggetGeometry] = useState<BufferGeometry | null>(null)
  const [baseColorTexture, metallicRoughnessTexture] = useTexture([
    staticResourcePaths.redeemMachineAlbedoTransparency,
    staticResourcePaths.redeemMachineMetallicRoughness,
  ], (textures) => {
    if (textures instanceof Array) {
      textures.forEach((texture) => {
        texture.flipY = false;
        texture.encoding = texture.encoding === 3000 ? 3001 : texture.encoding;
      });
    }
  });
  const mainSkyTexture = usePMREMWithCubeMap(staticResourcePaths.mainSkyTexture);
  const material = useMemo(() => {
    return new MeshStandardMaterial({
      map: baseColorTexture,
      transparent: true,
      metalnessMap: metallicRoughnessTexture,
      roughnessMap: metallicRoughnessTexture,
      envMap: mainSkyTexture,
      toneMapped: false,
    });
  }, [baseColorTexture, metallicRoughnessTexture, mainSkyTexture]);
  const [screenMaterial, _] = useState(new MeshBasicMaterial({ color: "#202A37", transparent: true, opacity: 0.9 }))

  useEffect(() => {
    return () => {
      if (material) {
        material.dispose();
      }
    };
  }, [material]);

  useEffect(() => {
    if (metalNuggetGLB == null || diamondNugggetGLB == null) return

    metalNuggetGLB.scene.traverse((child) => {
      if (child instanceof Mesh && 'geometry' in child && child.geometry !== null) {
        (child.geometry as BufferGeometry).scale(2, 2, 2)
        setGoldNuggetGeometry(child.geometry)
        setSilverNuggetGeometry(child.geometry)
      }
    })

    diamondNugggetGLB.scene.traverse((child) => {
      if (child instanceof Mesh && 'geometry' in child && child.geometry !== null) {
        (child.geometry as BufferGeometry).scale(10, 10, 10)
        setDiamondNuggetGeometry(child.geometry)
      }
    })

  }, [
    metalNuggetGLB, diamondNugggetGLB
  ])

  useEffect(() => {
    if (
      diamondAsteroidGLB == null ||
      metalAsteroidGLB == null
    ) return

    // creating diamond asteroid
    diamondAsteroidGLB.scene.traverse((child) => {
      if (child instanceof Mesh && 'material' in child && child.material !== null) {
        if (child.material.name === 'diamondMaterial') {
          child.material.transparent = true
          child.material = MaterialStore.getState().diamondMaterial
        } else if (child.material.name == 'asteroidMaterial' && MaterialStore.getState().asteroidRockMaterial !== null) {
          child.material = MaterialStore.getState().asteroidRockMaterial
        }
      }
    })
    setDiamondAsteroid(diamondAsteroidGLB.scene)

    // creating gold asteroid
    const clone = metalAsteroidGLB.scene.clone()
    clone.traverse((child) => {
      if (child instanceof Mesh && 'material' in child && child.material !== null) {
        if (child.material.name === 'metalMaterial') {
          child.material = MaterialStore.getState().yellowGoldMaterial
        } else if (child.material.name == 'asteroidMaterial' && MaterialStore.getState().asteroidRockMaterial !== null) {
          child.material = MaterialStore.getState().asteroidRockMaterial
        }
      }
    })
    setGoldAsteroid(clone)

    // creating silver asteroid
    metalAsteroidGLB.scene.traverse((child) => {
      if (child instanceof Mesh && 'material' in child && child.material !== null) {
        if (child.material.name === 'metalMaterial') {
          child.material = MaterialStore.getState().whiteGoldMaterial
        } else if (child.material.name == 'asteroidMaterial' && MaterialStore.getState().asteroidRockMaterial !== null) {
          child.material = MaterialStore.getState().asteroidRockMaterial
        }
      }
    })
    setSilverAsteroid(metalAsteroidGLB.scene)

  }, [diamondAsteroidGLB, metalAsteroidGLB])

  useEffect(() => {
    if (diamondAsteroid == null || goldAsteroid == null || silverAsteroid == null) return

    const meteorPathsCount = MeteorManagerStore.getState().meteorPaths.length;
    MeteorManagerStore.getState().initializeMeteorColliders(meteorPathsCount);

    // Initialize states for all meteors
    MeteorManagerStore.setState({
      meteorMiningStates: Array.from({ length: meteorPathsCount }, () => MeteorMiningState.NOT_STARTED),
      meteorMiningIntervals: Array.from({ length: meteorPathsCount }, () => null)
    });

    // Generate initial meteors
    const generateMeteors = () => {
      type RandomMeteorType = keyof typeof MeteorType;
      const generatedMeteors: IMeteor[] = meteorPaths.map(meteorPath => {
        const randomType: RandomMeteorType = Object.keys(MeteorType)[
          Math.floor(Math.random() * Object.keys(MeteorType).length)
        ] as RandomMeteorType;
        
        return {
          ...meteorPath,
          type: randomType as MeteorType,
          quantity: getRandomQuantity()
        };
      });

      MeteorManagerStore.setState({
        generatedMeteors,
        meteorCurrentQuantities: generatedMeteors.map(meteor => meteor.quantity)
      });
    };
    
    generateMeteors();
  }, [diamondAsteroid, goldAsteroid, silverAsteroid]);

  return <>
    {
      diamondAsteroid && goldAsteroid && silverAsteroid && goldNuggetGeometry && silverNuggetGeometry && diamondNuggetGeometry && diamondMaterial && yellowGoldMaterial && whiteGoldMaterial &&
      generatedMeteors?.map((meteor, index) => {
        if (meteorMountedStates[index][0] === false) return null
        return <Meteor
          key={index}
          startPos={meteor.startPos}
          posWhenStruckGround={meteor.posWhenStruckGround}
          posAfterSinking={meteor.posAfterSinking}
          posWhenGettingDestroyed={meteor.posWhenGettingDestroyed}
          startScale={meteor.startScale}
          endScale={meteor.endScale}
          delayBy={index * delayFactorInSeconds * 1000}
          meteorModel={meteor.type === MeteorType.DIAMOND ? diamondAsteroid : meteor.type === MeteorType.GOLD ? goldAsteroid : silverAsteroid}
          topTagItemTypeText={meteor.type === MeteorType.DIAMOND ? 'Diamond' : meteor.type === MeteorType.GOLD ? 'Gold' : 'Silver'}
          meteorCollisionModel={collisionRocks.scene}
          index={index}
          posOfRocks={meteor.posOfRocks}
          endScaleOfRocks={meteor.endScaleOfRocks}
          startScaleOfRocks={meteor.startScaleOfRocks}
          characterRef={props.characterRef}
          triggerAreaTransform={meteor.triggerAreaTransform}
          topTagTransform={meteor.topTagTransform}
          type={meteor.type}
          setIsMounted={meteorMountedStates[index][1]}
          nuggetGeometry={meteor.type === MeteorType.DIAMOND ? diamondNuggetGeometry : meteor.type === MeteorType.GOLD ? goldNuggetGeometry : silverNuggetGeometry}
          nuggetMaterial={meteor.type === MeteorType.DIAMOND ? diamondMaterial : meteor.type === MeteorType.GOLD ? yellowGoldMaterial : whiteGoldMaterial}
        />
      })
    }

    <RedeemMachine
      transform={{
        position: [
          -72.63324429620634,
          1.3046557297772745,
          -123.23880665218404
        ],
        rotation: [
          -6.409988861874009e-20,
          0.006291455746590281,
          2.4492974633365403e-16,
        ],
        scale: [
          2.3665757520338655,
          2.3665757520338655,
          2.3665757520338655
        ]
      }}
      characterRef={props.characterRef}
      material={material}
      screenMaterial={screenMaterial}
    />

    <LeaderboardMachine
      characterRef={props.characterRef}
      material={material}
      screenMaterial={screenMaterial}
    />

  </>
}

export default MeteorManager
