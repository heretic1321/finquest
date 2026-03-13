import { TInventoryConsoleConfig } from '@client/config/InventoryConsoleConfig'

type SpecialMaterial = {
  type: 'glass' | 'emission'
  color?: string
}

export type MapConfigItem = {
  name: string
  modelPath?: string
  isCollidable: boolean
  colliderPath?: string
  bakedTextures?: Record<string, string>
  specialMaterial?: SpecialMaterial
}

export enum ItemsToHide {
  AroundStoreC1 = 'AroundStoreC1',
  AroundStoreC2 = 'AroundStoreC2',
  AroundStoreC3 = 'AroundStoreC3',
  Cafe = 'Cafe',
  CommunityArea = 'CommunityArea',
  ScreeningArea = 'ScreeningArea',
  TallStore = 'tallstore',
  DomeStore = 'domestore',
  OGStore = 'ogstore',
  Hub = 'hub',
  GardenAreaLarge1 = 'GardenAreaLarge1',
  GardenAreaLarge2 = 'GardenAreaLarge2',
  GardenAreaLarge3 = 'GardenAreaLarge3',
  GardenAreaMedium = 'GardenAreaMedium',
  GardenAreaSmall = 'GardenAreaSmall',
  FloatingDisplayPanels = 'FloatingDisplayPanels',
  FloatingDisplayContainers = 'FloatingDisplayContainers',
  InstancedFoliageAndDecor = 'InstancedFoliageAndDecor',
  AllVases = 'AllVases',
  CylinderStore = 'cylinderstore',
  None = 'None',
}


export type TDoorTriggerTransform = {
  position: [number, number, number]
  rotation: [number, number, number]
  scale: [number, number, number]
}

export type TPortalConfig = {
  portalName: string
  position: [number, number, number]
  rotation: [number, number, number]
  scale: [number, number, number]
  //After how much time portal will again become active
  exitPosition: [number, number, number]
  exitBuildingName: string
}

type TBuildingConfig = {
  name: string
  exterior: {
    //Indices Represent Detailing Level
    lod: {
      distance: number
      modelPath: string
    }[]
  }
  interior: {
    modelPath: string
    inventoryConsole?: TInventoryConsoleConfig
  }
  transform: {
    position: [number, number, number]
    rotation: [number, number, number]
    scale: [number, number, number]
  }
  portals: TPortalConfig[]
  doors: {
    name: string
    frontTransform: TDoorTriggerTransform
    backTransform: TDoorTriggerTransform
  }[]
}[]

export type StoreConfig = {
  exterior: {
    lod: {
      low: {
        distance: number
      }
      mid: {
        distance: number
      }
      high: {
        distance: number
      }
    }
  }
  inventoryConsole: TInventoryConsoleConfig
  entrySpawnPosition: [number, number, number]
  exitSpawnPosition: [number, number, number]
  portals: TPortalConfig[]
  thingsToHide: ItemsToHide[]
}
export type ConsoleConfigsWithStore = {
  position:{
    x:number
    y:number
    z:number
  }
  touchDevice:{
    x:number
    y:number
    z:number
  }
  rotation:{
    x:number
    y:number
    z:number
  }
}
export type DigiGoldMachineConfig = {
  position: [number, number, number]
  rotation: [number, number, number]
  camera: {
    mobilePosition: [number, number, number]
    desktopPosition: [number, number, number]
    rotation: [number, number, number]
  }
}
export const ConsoleConfigs: Record<string, ConsoleConfigsWithStore> = {
  hub: {
    position: {
      x: 2.212483822,
      y: 4.004365929,
      z: 1.369457350
    },
    touchDevice:{
      x: 2.4812496891588063,
      y: 4.0037659294,
      z: 1.2303007883478321
    },
    rotation: {
      x: 3.135682345431919,
      y: 1.225587091938609,
      z: -3.1360310185996574
    }
  },
  domestore: {
    position: {
      x: -2.418934649,
      y: 4.003406839,
      z: -0.903564352
    },
    touchDevice:{
      x: -2.626143874,
      y: 4.005806799,
      z: -0.782491741
    },
    rotation: {
      x: -0.019819889178205534,
      y: -1.041914434682536,
      z: -0.017112503281254503
    }
  },
  ogstore: {
    position: {
      x: 0.168829504,
      y: 4.034197011,
      z: -2.466663981
    },
    touchDevice:{
      x: 0.035915374,
      y: 4.040576496,
      z: -2.746830246
    },
    rotation: {
      x: -3.109837688262288,
      y: -0.8053407198243813,
      z: -3.1186915085984688
    }
  },
  tallstore: {
    position: {
      x: 0.553716990,
      y: 4.001906736,
      z: -2.519858231
    },
    touchDevice:{
      x: 0.380689099,
      y: 4.036382705,
      z: -2.739341161
    },
    rotation: {
      x: -3.121219726278398,
      y: -0.6674917518171346,
      z: -3.1289803682472286
    }
  },
  cylinderstore: {
    position: {
      x: 1.372308800,
      y: 4.002329546,
      z: -2.177001316
    },
    touchDevice:{
      x: 1.259126050,
      y: 4.025728489,
      z: -2.497379459
    },
    rotation: {
      x: -3.1309870115565253,
      y: -0.3395749898608388,
      z: -3.1380599409008125
    }
  }
}
export const StoreConfigs: Record<string, StoreConfig> = {
  hub: {
    exterior: {
      lod: {
        low: {
          distance: 120,
        },
        mid: {
          distance: 80,
        },
        high: {
          distance: 40,
        },
      },
    },
    inventoryConsole: {
      name: 'Console 1',
      id: 0,
      CollectionID: 53,
      transform: {
        position: [-31.484608865443366, 1.6592779825625525, 7.836624962558863],
        rotation: [-3.14151557272254, 1.2110975830810928, -3.1404801157044533],
        scale: [1, 1, 1],
      },
      TriggerScale: [4, 2, 2.5],
    },
    entrySpawnPosition: [
      -4.007022483151185,
      3.017700613621118,
      23.640202488886597
  ],
    exitSpawnPosition: [
      -2.6129995505432664,
      2.8806964322935142,
      50.34199256115642
  ],
    portals: [
      {
        portalName: 'HubToOGStore',
        position: [8.75, 2, -20.6],
        rotation: [0, 2.7, 0],
        scale: [1, 1, 1],
        exitPosition: [3.3063, 4.418, -122.2933],
        exitBuildingName: 'ogstore',
      },
      {
        portalName: 'HubToDomeStore',
        position: [-7.96, 2, -21.8],
        rotation: [0, 3.58, 0],
        scale: [1, 1, 1],
        exitPosition: [-129.0, 4.418, -15.9973],
        exitBuildingName: 'domestore',
      },
      {
        portalName: 'HubToTallStore',
        position: [-0.2, 2, -22.2],
        rotation: [0, 3.14, 0],
        scale: [1, 1, 1],
        exitPosition: [101.593, 4.418, -82.9139],
        exitBuildingName: 'tallstore',
      },
    ],
    thingsToHide: [
      ItemsToHide.FloatingDisplayPanels,
      ItemsToHide.FloatingDisplayContainers,
      ItemsToHide.Cafe,
      ItemsToHide.CommunityArea,
      ItemsToHide.ScreeningArea,
      ItemsToHide.TallStore,
      ItemsToHide.DomeStore,
      ItemsToHide.OGStore,
      ItemsToHide.GardenAreaLarge1,
      ItemsToHide.GardenAreaLarge2,
      ItemsToHide.GardenAreaLarge3,
      ItemsToHide.GardenAreaMedium,
      ItemsToHide.GardenAreaSmall,
      ItemsToHide.InstancedFoliageAndDecor,
      ItemsToHide.AllVases,
      ItemsToHide.CylinderStore
    ],
  },
  tallstore: {
    exterior: {
      lod: {
        low: {
          distance: 120,
        },
        mid: {
          distance: 80,
        },
        high: {
          distance: 40,
        },
      },
    },
    inventoryConsole: {
      name: 'Console 2',
      id: 1,
      CollectionID: 53,
      transform: {
        position: [141.79, 1.884, -70.445],
        rotation: [3.141, -0.672, 3.141],
        scale: [1, 1, 1],
      },
      TriggerScale: [4, 2, 2.5],
    },
    // entrySpawnPosition: [102.34986060717425, 6.418, -82.13267217451391],
    entrySpawnPosition: [
      117.44513806583393,
      3.3829236166536836,
      -82.35978819830204
  ],
    // entrySpawnPosition: [
    //   102.34986060717425,
    //   3.3829236166381835,
    //   -82.13267217451391
    // ],
    // exitSpawnPosition: [66.68690622550798, 6.418, -81.4165118545669],
    exitSpawnPosition: [
      66.68690622550798,
      2.888402117958069,
      -81.4165118545669
  ],
    portals: [
      {
        portalName: 'TallStoreToHub',
        position: [143.07, 2.23, -95.47],
        rotation: [0, 2.54, 0],
        scale: [3, 4, 4],
        exitPosition: [-2.6264, 4.418, 27.514],
        exitBuildingName: 'hub',
      },
    ],
    thingsToHide: [
      ItemsToHide.Cafe,
      ItemsToHide.CommunityArea,
      ItemsToHide.ScreeningArea,
      ItemsToHide.Hub,
      ItemsToHide.DomeStore,
      ItemsToHide.OGStore,
      ItemsToHide.GardenAreaLarge1,
      ItemsToHide.GardenAreaLarge2,
      ItemsToHide.GardenAreaLarge3,
      ItemsToHide.GardenAreaSmall,
      ItemsToHide.AroundStoreC1,
      ItemsToHide.AroundStoreC2,
      ItemsToHide.AroundStoreC3,
      ItemsToHide.FloatingDisplayPanels,
      ItemsToHide.FloatingDisplayContainers,
      ItemsToHide.InstancedFoliageAndDecor,
      ItemsToHide.AllVases,
      ItemsToHide.CylinderStore
    ],
  },
  domestore: {
    exterior: {
      lod: {
        low: {
          distance: 120,
        },
        mid: {
          distance: 80,
        },
        high: {
          distance: 40,
        },
      },
    },
    inventoryConsole: {
      name: 'Console 2',
      id: 2,
      CollectionID: 53,
      transform: {
        position: [
          -126.94114164,
          2.420377463,
          -30.65241160
      ],
        rotation: [
          -0.0000533104,
          -1.0368427,
          0.001138,
      ],
        scale: [1, 1, 1],
      },
      TriggerScale: [4, 2, 2.5],
    },
    entrySpawnPosition: [
      -143.2453222205654,
      3.9490530626678466,
      -4.950573717075594
    ],
    // entrySpawnPosition: [
    //   -131.36855958801016,
    //   3.9490530626678466,
    //   -14.826252833194896
    // ],
    exitSpawnPosition: [
      -104.52042872402151,
      2.9872384057567243,
      -9.983416186634717
  ],
    portals: [
      {
        portalName: 'DomeStoreToHub',
        position: [-154.04, 2.79, 0.88],
        rotation: [0, -0.81, 0],
        scale: [3, 4, 4],
        exitPosition: [-2.6264, 4.418, 27.514],
        exitBuildingName: 'hub',
      },
    ],
    thingsToHide: [
      ItemsToHide.Cafe,
      ItemsToHide.CommunityArea,
      ItemsToHide.ScreeningArea,
      ItemsToHide.Hub,
      ItemsToHide.TallStore,
      ItemsToHide.OGStore,
      ItemsToHide.GardenAreaLarge1,
      ItemsToHide.GardenAreaLarge2,
      ItemsToHide.GardenAreaLarge3,
      ItemsToHide.GardenAreaSmall,
      ItemsToHide.AroundStoreC1,
      ItemsToHide.AroundStoreC2,
      ItemsToHide.AroundStoreC3,
      ItemsToHide.FloatingDisplayPanels,
      ItemsToHide.FloatingDisplayContainers,
      ItemsToHide.InstancedFoliageAndDecor,
      ItemsToHide.AllVases,
      ItemsToHide.CylinderStore
    ],
  },
  ogstore: {
    exterior: {
      lod: {
        low: {
          distance: 120,
        },
        mid: {
          distance: 80,
        },
        high: {
          distance: 40,
        },
      },
    },
    inventoryConsole: {
      name: 'Console 3',
      id: 3,
      CollectionID: 53,
      transform: {
        position: [24.31, 2.599, -128.403],
        rotation: [-3.141, -0.799, -3.141],

        scale: [1, 1, 1],
      },
      TriggerScale: [4, 2, 2.5],
    },
    entrySpawnPosition: [
      -5.279153041485522,
      4.0892872946167,
      -128.56654586576744
    ],
    // entrySpawnPosition: [
    //   2.696389016504317,
    //   4.0892872946167,
    //   -121.4813082748124
    // ],
    exitSpawnPosition: [
      2.4580340571837795,
      2.888402117958069,
      -90.41334376288961
  ],
    portals: [
      {
        portalName: 'OGStoreToHub',
        position: [11.67, 2.86, -140.86],
        rotation: [0, 2.37, 0],
        scale: [3, 4, 4],
        exitPosition: [-2.6264, 4.418, 27.514],
        exitBuildingName: 'hub',
      },
    ],
    thingsToHide: [
      ItemsToHide.Cafe,
      ItemsToHide.CommunityArea,
      ItemsToHide.ScreeningArea,
      ItemsToHide.Hub,
      ItemsToHide.TallStore,
      ItemsToHide.DomeStore,
      ItemsToHide.GardenAreaLarge1,
      ItemsToHide.GardenAreaLarge2,
      ItemsToHide.GardenAreaLarge3,
      ItemsToHide.GardenAreaSmall,
      ItemsToHide.AroundStoreC1,
      ItemsToHide.AroundStoreC2,
      ItemsToHide.AroundStoreC3,
      ItemsToHide.FloatingDisplayPanels,
      ItemsToHide.FloatingDisplayContainers,
      ItemsToHide.InstancedFoliageAndDecor,
      ItemsToHide.AllVases,
      ItemsToHide.CylinderStore
    ],
  },
  cylinderstore: {
    exterior: {
      lod: {
        low: {
          distance: 120,
        },
        mid: {
          distance: 80,
        },
        high: {
          distance: 40,
        },
      },
    },
    inventoryConsole: {
      name: 'Console 4',
      id: 4,
      CollectionID: 53,
      transform: {
        position: [
          141.52010239679836, 
          1.7975495267254598, 
          8.70713834037586
        ],
        rotation: [
          -3.1411510485120826,
          -0.35978222145856714,
          -3.141269254480229,
        ],
        scale: [1, 1, 1],
      },
      TriggerScale: [4, 2, 2.5],
    },
    entrySpawnPosition: [
        124.9410749010281,
        3.3676136867904662,
        -6.436216947137187
    ],
    exitSpawnPosition: [
      98.33594052830824,
      2.88500470348439,
      -5.474102476833126
    ],
    portals: [
      {
        portalName: 'CylinderStoreToHub',
        position: [11.67, 2.86, -140.86],
        rotation: [0, 2.37, 0],
        scale: [3, 4, 4],
        exitPosition: [-2.6264, 4.418, 27.514],
        exitBuildingName: 'hub',
      },
    ],
    thingsToHide: [
      ItemsToHide.AroundStoreC1,
      ItemsToHide.AroundStoreC2,
      ItemsToHide.AroundStoreC3,
      ItemsToHide.Cafe,
      ItemsToHide.CommunityArea,
      ItemsToHide.ScreeningArea,
      ItemsToHide.TallStore,
      ItemsToHide.DomeStore,
      ItemsToHide.Hub,
      ItemsToHide.OGStore,
      ItemsToHide.GardenAreaLarge1,
      ItemsToHide.GardenAreaLarge2,
      ItemsToHide.GardenAreaLarge3,
      ItemsToHide.GardenAreaSmall,
      ItemsToHide.GardenAreaMedium,
      ItemsToHide.FloatingDisplayPanels,
      ItemsToHide.FloatingDisplayContainers,
      ItemsToHide.InstancedFoliageAndDecor,
      ItemsToHide.AllVases
    ],
  },
  
}

export const DigiGoldMachineConfigs: Record<string, DigiGoldMachineConfig> = {
  domestore: {
    position: [-113.0938, 1.7, 2.27184],
    rotation: [0, 1.8853, 0],
    camera: {
      mobilePosition: [
        -111.39797318782786, 5.784821766228653, 1.6880932667045192,
      ],
      desktopPosition: [
        -111.68325017789437, 5.775823116167904, 1.7804840846231984,
      ],
      rotation: [-3.044501227368797, 1.2562062507587894, 3.0492384146685847],
    },
  },
  ogstore: {
    position: [-6.7141, 1.7, -98.3144],
    rotation: [0, 0.4706, 0],
    camera: {
      mobilePosition: [
        -5.82864249515115, 5.661135563928218, -96.64869881679387,
      ],
      desktopPosition: [
        -6.009779256450357, 5.666735380996679, -97.00529118316594,
      ],
      rotation: [0.01570240237447413, 0.4699502207845005, -0.00711117038249132],
    },
  },
  tallstore: {
    position: [74.2994, 1.7, -94.7276],
    rotation: [0, -0.7242, 0],
    camera: {
      mobilePosition: [
        73.09371189160204, 5.650390037633765, -93.41617254240495,
      ],
      desktopPosition: [
        73.29361592537605, 5.658550133042449, -93.63971625205436,
      ],
      rotation: [0.03648715451599752, -0.729298564544816, 0.024319097698319827],
    },
  },
  cylinderstore: {
    position: [106.5746, 1.7, -15.58718],
    rotation: [0, -0.9774, 0],
    camera: {
      mobilePosition: [
        105.01166717153593, 5.702784607988928, -14.602895512697744,
      ],
      desktopPosition: [
        105.26313088180507, 5.702184608388927, -14.766497598314555,
      ],
      rotation: [
        -0.003667416021924694, -0.9939969259189905, -0.0030740775653549626,
      ],
    },
  },
  glassbenches: {
    position: [104.5592, 1.7, 45.3712],
    rotation: [0, -1.6428, 0],
    camera: {
      mobilePosition: [
        102.74228848652089, 5.7344459627494535, 45.250681364497254,
      ],
      desktopPosition: [
        103.04132646303084, 5.730846049148832, 45.274415922148606,
      ],
      rotation: [-2.991066015449143, -1.4906906428164977, -2.991541491772198],
    },
  },
  hub: {
    position: [-13.88434, 1.7, 37.0842],
    rotation: [0, 0.3101, 0],
    camera: {
      mobilePosition: [
        -13.376151277069042, 5.720732714679944, 38.79490130565235,
      ],
      desktopPosition: [
        -13.463660229090017, 5.720732714679944, 38.50794802841685,
      ],
      rotation: [
        6.528942175200949e-17, 0.2960000000000005, -1.9044696251912725e-17,
      ],
    },
  },
  normalbenches: {
    position: [-82.3802, 1.7, 72.2648],
    rotation: [0, -3.0833, 0],
    camera: {
      mobilePosition: [-82.5211310017052, 5.740236329434258, 70.53521360497089],
      desktopPosition: [
        -82.5074606379443, 5.738636346500869, 70.73473944592703,
      ],
      rotation: [-3.1335738995658313, -0.06840515396599615, -3.141044545474686],
    },
  },
}
export const TutorialStore : Record<string, [number, number, number]> = {
  //this is the position of the player when they enter the hubstore in tutorial state to view the showcase
  tutorialStartPosition: [-2.6, 10, 64.72],
  entrySpawnPosition: [-23.19537191119853, 10, -17.748236338571246],
  meteorMiningPosition:[-28.80359546003403, 10, 81.25717954487384],
  redeemMiningRewards : [-75.9955639732512, 10, -117.10994969745062],
  //these are the postions to enable trigger for entering the store for each store
  domestore: [-115.66769966831029, 2.9870252991923305, -14.335985798594669],
  cylinderstore: [109.57178241255414, 2.8165685794837696, -5.884985556908027],
  tallstore: [88.19512278846175, 3.424183143844613, -82.34801149948245],
  ogstore: [1.894404911196652, 4.013628019561768, -104.39037315284]
}

export const BuildingConfigs: TBuildingConfig = [
  {
    name: 'Hub',
    exterior: {
      lod: [
        //Indices Represent Detailing Level
        {
          distance: 20,
          // modelPath: './assets/map/LOD/storeAndInteriorLODHigh.glb',
          // modelPath: staticResourcePaths.reusableDiamondMesh,
          modelPath: 'mainBuildingHub_LOD_High',
        },
        {
          distance: 40,
          // modelPath: './assets/map/LOD/storeAndInteriorLODMid.glb',
          // modelPath: staticResourcePaths.reusableDiamondMesh,
          modelPath: 'mainBuildingHub_LOD_Mid',
        },
        {
          distance: 60,
          // modelPath: './assets/map/LOD/storeAndInteriorLODLow.glb',
          // modelPath: staticResourcePaths.reusableDiamondMesh,
          modelPath: 'mainBuildingHub_LOD_Low',
        },
      ],
    },
    interior: {
      // modelPath: './assets/map/LOD/mainBuilding.glb',
      // modelPath: staticResourcePaths.reusableDiamondMesh,
      modelPath: 'mainBuildingHub_LOD_High',
      inventoryConsole: {
        name: 'Console 1',
        id: 0,
        CollectionID: 53,
        transform: {
          // position: [-22, 0, 50],
          position: [-11.3, 0.9, -17.73],
          rotation: [0, Math.PI / 4, 0],
          scale: [1, 1, 1],
        },
        TriggerScale: [4, 2, 2.5],
      },
    },
    transform: {
      position: [0, 0, 5],
      rotation: [0, 0, 0],
      scale: [2, 2, 2],
    },
    portals: [
      {
        portalName: 'Main Building Portal 1',
        position: [-5, 2, -8],
        rotation: [0, 5.41, 0],
        scale: [5, 5, 5],
        exitPosition: [-52, 3, 122],
        exitBuildingName: 'Third Building',
      },
      {
        portalName: 'Main Building Portal 2',
        position: [-2, 2, -10],
        rotation: [0, 2.3, 0],
        scale: [5, 5, 5],
        exitPosition: [41, 2, 120],
        exitBuildingName: 'Second Building',
      },
    ],
    doors: [
      {
        name: 'Main Building Doors',
        frontTransform: {
          position: [-2, 5, 14],
          rotation: [0, -1.51, 0],
          scale: [1, 10, 12],
        },
        backTransform: {
          position: [-1.2, 5, 5],
          rotation: [0, -1.51, 0],
          scale: [1, 10, 12],
        },
      },
    ],
    // colliderPath: './assets/map/LOD/storeAndInteriorLODHigh.glb',
    // colliderPath: staticResourcePaths.reusableDiamondMesh,
  },
  // {
  //   name: 'Second Building',
  //   exterior: {
  //     lod: [
  //       //Indices Represent Detailing Level
  //       {
  //         distance: 20,
  //         modelPath: './assets/map/LOD/storeAndInteriorLODHigh.glb',
  //       },
  //       {
  //         distance: 40,
  //         modelPath: './assets/map/LOD/storeAndInteriorLODMid.glb',
  //       },
  //       {
  //         distance: 60,
  //         modelPath: './assets/map/LOD/storeAndInteriorLODLow.glb',
  //       },
  //     ],
  //   },
  //   interior: {
  //     modelPath: './assets/map/LOD/secondBuilding.glb',
  //     inventoryConsole: {
  //       name: 'Console 2',
  //       id: 1,
  //       CollectionID: 120,
  //       transform: {
  //         // position: [22, 0, 50],
  //         position: [28.8, 0.9, 109.4],
  //         rotation: [0, Math.PI / 4, 0],
  //         scale: [1, 1, 1],
  //       },
  //       TriggerScale: [4, 2, 2.5],
  //     },
  //   },
  //   transform: {
  //     position: [15, 0, 112],
  //     rotation: [0, -Math.PI / 1.5, 0],
  //     scale: [2, 2, 2],
  //   },
  //   portals: [
  //     {
  //       portalName: 'Second Building Portal',
  //       position: [38, 2, 120],
  //       rotation: [0, 1.54, 0],
  //       scale: [5, 5, 5],
  //       exitPosition: [-2, 2, -10],
  //       exitBuildingName: 'Main Building Hub',
  //     },
  //   ],
  //   doors: [
  //     {
  //       name: 'Second Building Doors',
  //       frontTransform: {
  //         position: [10.2, 5, 108],
  //         rotation: [0, -0.8, 0],
  //         scale: [1, 10, 10],
  //       },
  //       backTransform: {
  //         position: [17, 5, 112],
  //         rotation: [0, 2.53, 0],
  //         scale: [1, 10, 10],
  //       },
  //     },
  //   ],
  //   colliderPath: './assets/map/LOD/storeAndInteriorLODHigh.glb',
  // },
  // {
  //   name: 'Third Building',
  //   exterior: {
  //     lod: [
  //       //Indices Represent Detailing Level
  //       {
  //         distance: 20,
  //         modelPath: './assets/map/LOD/storeAndInteriorLODHigh.glb',
  //       },
  //       {
  //         distance: 40,
  //         modelPath: './assets/map/LOD/storeAndInteriorLODMid.glb',
  //       },
  //       {
  //         distance: 60,
  //         modelPath: './assets/map/LOD/storeAndInteriorLODLow.glb',
  //       },
  //     ],
  //   },
  //   interior: {
  //     modelPath: './assets/map/LOD/thirdBuilding.glb',
  //   },
  //   transform: {
  //     position: [-25, 0, 110],
  //     rotation: [0, Math.PI / 1.5, 0],
  //     scale: [2, 2, 2],
  //   },
  //   portals: [
  //     {
  //       portalName: 'Third Building Portal',
  //       position: [-53, 1, 122],
  //       rotation: [0, -1.4, 0],
  //       scale: [5, 5, 5],
  //       exitPosition: [-2, 2, -10],
  //       exitBuildingName: 'Main Building Hub',
  //     },
  //   ],
  //   doors: [
  //     {
  //       name: 'Third Building Doors',
  //       frontTransform: {
  //         position: [-18, 5, 107],
  //         rotation: [0, 0.5, 0],
  //         scale: [1, 10, 14],
  //       },
  //       backTransform: {
  //         position: [-25.6, 5, 111],
  //         rotation: [0, 0.5, 0],
  //         scale: [1, 10, 14],
  //       },
  //     },
  //   ],
  //   colliderPath: './assets/map/LOD/storeAndInteriorLODHigh.glb',
  // },
]
