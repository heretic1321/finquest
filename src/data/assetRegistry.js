// Asset registry — declarative placements for the entire Coastal World island.
// Each entry: { model, position: [x,y,z], rotation: [rx,ry,rz], scale }

export const WORLD_ASSETS = [
  // =====================================================================
  //  SPAWN CLEARING — open area at center, a few decorative touches
  // =====================================================================
  // Fountain at spawn center
  { model: '/models/buildings/fountain-round.glb', position: [0, 1, 0], rotation: [0, 0, 0], scale: 1.5 },
  // Sign near spawn
  { model: '/models/props/sign.glb', position: [3, 1, -2], rotation: [0, -0.5, 0], scale: 1.2 },
  // Flowers around spawn
  { model: '/models/nature/flower_redA.glb', position: [2, 1, 3], rotation: [0, 0.4, 0], scale: 1.5 },
  { model: '/models/nature/flower_yellowA.glb', position: [-2, 1, 2], rotation: [0, 1.2, 0], scale: 1.5 },
  { model: '/models/nature/flower_purpleA.glb', position: [1, 1, -3], rotation: [0, 2.5, 0], scale: 1.5 },
  { model: '/models/nature/flower_redA.glb', position: [-3, 1, -1], rotation: [0, 0.8, 0], scale: 1.3 },
  // Bushes framing the clearing
  { model: '/models/nature/plant_bush.glb', position: [6, 1, 0], rotation: [0, 0.3, 0], scale: 1.2 },
  { model: '/models/nature/plant_bushLarge.glb', position: [-6, 1, 1], rotation: [0, 1.8, 0], scale: 1.0 },
  { model: '/models/nature/plant_bushDetailed.glb', position: [0, 1, 7], rotation: [0, 0.6, 0], scale: 1.1 },
  // Lanterns at spawn
  { model: '/models/buildings/lantern.glb', position: [4, 1, 4], rotation: [0, 0, 0], scale: 1.0 },
  { model: '/models/buildings/lantern.glb', position: [-4, 1, 4], rotation: [0, 0, 0], scale: 1.0 },

  // =====================================================================
  //  PATHS — ground_pathStraight radiating from center to each zone
  // =====================================================================
  // Path to TechCorp (northeast)
  { model: '/models/props/ground_pathStraight.glb', position: [6, 1.01, -5], rotation: [0, -0.7, 0], scale: 2.0 },
  { model: '/models/props/ground_pathStraight.glb', position: [12, 1.01, -10], rotation: [0, -0.7, 0], scale: 2.0 },
  { model: '/models/props/ground_pathStraight.glb', position: [18, 1.01, -15], rotation: [0, -0.7, 0], scale: 2.0 },
  { model: '/models/props/ground_pathStraight.glb', position: [24, 1.01, -20], rotation: [0, -0.7, 0], scale: 2.0 },
  // Path to Scam Park (northwest)
  { model: '/models/props/ground_pathStraight.glb', position: [-6, 1.01, -3], rotation: [0, 0.4, 0], scale: 2.0 },
  { model: '/models/props/ground_pathStraight.glb', position: [-12, 1.01, -6], rotation: [0, 0.4, 0], scale: 2.0 },
  { model: '/models/props/ground_pathStraight.glb', position: [-18, 1.01, -9], rotation: [0, 0.4, 0], scale: 2.0 },
  { model: '/models/props/ground_pathStraight.glb', position: [-24, 1.01, -13], rotation: [0, 0.4, 0], scale: 2.0 },
  // Path to MF Tower (east / southeast)
  { model: '/models/props/ground_pathStraight.glb', position: [5, 1.01, 5], rotation: [0, 0.8, 0], scale: 2.0 },
  { model: '/models/props/ground_pathStraight.glb', position: [10, 1.01, 10], rotation: [0, 0.8, 0], scale: 2.0 },
  { model: '/models/props/ground_pathStraight.glb', position: [15, 1.01, 15], rotation: [0, 0.8, 0], scale: 2.0 },
  { model: '/models/props/ground_pathStraight.glb', position: [20, 1.01, 20], rotation: [0, 0.8, 0], scale: 2.0 },

  // =====================================================================
  //  TECHCORP ZONE (northeast ~[30, 1, -25]) — corporate park
  // =====================================================================
  // Hedges forming a courtyard
  { model: '/models/buildings/hedge.glb', position: [26, 1, -22], rotation: [0, 0, 0], scale: 2.0 },
  { model: '/models/buildings/hedge.glb', position: [28, 1, -22], rotation: [0, 0, 0], scale: 2.0 },
  { model: '/models/buildings/hedge.glb', position: [32, 1, -22], rotation: [0, 0, 0], scale: 2.0 },
  { model: '/models/buildings/hedge.glb', position: [34, 1, -22], rotation: [0, 0, 0], scale: 2.0 },
  { model: '/models/buildings/hedge.glb', position: [26, 1, -28], rotation: [0, 0, 0], scale: 2.0 },
  { model: '/models/buildings/hedge.glb', position: [28, 1, -28], rotation: [0, 0, 0], scale: 2.0 },
  { model: '/models/buildings/hedge.glb', position: [32, 1, -28], rotation: [0, 0, 0], scale: 2.0 },
  { model: '/models/buildings/hedge.glb', position: [34, 1, -28], rotation: [0, 0, 0], scale: 2.0 },
  // Lanterns at TechCorp entrance
  { model: '/models/buildings/lantern.glb', position: [26, 1, -24], rotation: [0, 0, 0], scale: 1.2 },
  { model: '/models/buildings/lantern.glb', position: [34, 1, -24], rotation: [0, 0, 0], scale: 1.2 },
  // Trees around TechCorp
  { model: '/models/nature/tree_pineRoundA.glb', position: [24, 1, -20], rotation: [0, 0.5, 0], scale: 1.5 },
  { model: '/models/nature/tree_pineRoundA.glb', position: [36, 1, -20], rotation: [0, 2.1, 0], scale: 1.3 },
  { model: '/models/nature/tree_pineDefaultA.glb', position: [24, 1, -30], rotation: [0, 1.2, 0], scale: 1.4 },
  { model: '/models/nature/tree_pineDefaultA.glb', position: [36, 1, -30], rotation: [0, 3.0, 0], scale: 1.6 },
  // Flag at TechCorp
  { model: '/models/props/flag.glb', position: [30, 1, -21], rotation: [0, 0, 0], scale: 1.5 },
  // Flowers in corporate garden
  { model: '/models/nature/flower_yellowA.glb', position: [27, 1, -25], rotation: [0, 0.8, 0], scale: 1.2 },
  { model: '/models/nature/flower_redA.glb', position: [33, 1, -25], rotation: [0, 1.6, 0], scale: 1.2 },
  // Cart outside office
  { model: '/models/buildings/cart.glb', position: [35, 1, -26], rotation: [0, 1.2, 0], scale: 1.0 },

  // =====================================================================
  //  SCAM PARK (northwest ~[-30, 1, -18]) — shady, overgrown area
  // =====================================================================
  // Dense trees (shady canopy)
  { model: '/models/nature/tree_oak.glb', position: [-28, 1, -16], rotation: [0, 0.7, 0], scale: 2.0 },
  { model: '/models/nature/tree_oak.glb', position: [-32, 1, -14], rotation: [0, 2.3, 0], scale: 1.8 },
  { model: '/models/nature/tree_fat.glb', position: [-26, 1, -20], rotation: [0, 1.1, 0], scale: 1.6 },
  { model: '/models/nature/tree_detailed.glb', position: [-34, 1, -18], rotation: [0, 0.4, 0], scale: 1.5 },
  { model: '/models/nature/tree_default.glb', position: [-30, 1, -22], rotation: [0, 3.1, 0], scale: 1.7 },
  { model: '/models/nature/tree_thin.glb', position: [-27, 1, -13], rotation: [0, 1.9, 0], scale: 1.4 },
  // Tent (shady meeting spot)
  { model: '/models/props/tent_smallOpen.glb', position: [-30, 1, -18], rotation: [0, 0.5, 0], scale: 1.8 },
  // Campfire in the shady area
  { model: '/models/props/campfire_stones.glb', position: [-29, 1, -16], rotation: [0, 0, 0], scale: 1.2 },
  // Barrels (suspicious goods)
  { model: '/models/props/barrel.glb', position: [-33, 1, -16], rotation: [0, 0.3, 0], scale: 1.0 },
  { model: '/models/props/barrel.glb', position: [-33, 1, -17.5], rotation: [0, 1.5, 0], scale: 0.9 },
  { model: '/models/props/barrel.glb', position: [-32, 1, -20], rotation: [0, 0.9, 0], scale: 1.1 },
  // Bushes (overgrown)
  { model: '/models/nature/plant_bushLarge.glb', position: [-25, 1, -18], rotation: [0, 0.5, 0], scale: 1.5 },
  { model: '/models/nature/plant_bushDetailed.glb', position: [-35, 1, -15], rotation: [0, 2.0, 0], scale: 1.3 },
  { model: '/models/nature/plant_bush.glb', position: [-31, 1, -12], rotation: [0, 0.8, 0], scale: 1.4 },
  // Fences (broken, sketchy perimeter)
  { model: '/models/props/fence_simple.glb', position: [-26, 1, -14], rotation: [0, 0.3, 0], scale: 1.5 },
  { model: '/models/props/fence_simple.glb', position: [-26, 1, -16], rotation: [0, 0.3, 0], scale: 1.5 },
  { model: '/models/props/fence_corner.glb', position: [-26, 1, -18], rotation: [0, 0.3, 0], scale: 1.5 },

  // =====================================================================
  //  MF TOWER ZONE (east ~[25, 3, 25]) — elevated hilltop
  // =====================================================================
  // Trees on the hill
  { model: '/models/nature/tree_oak.glb', position: [22, 3, 22], rotation: [0, 1.0, 0], scale: 1.6 },
  { model: '/models/nature/tree_pineRoundA.glb', position: [28, 3, 28], rotation: [0, 0.3, 0], scale: 1.8 },
  { model: '/models/nature/tree_default.glb', position: [20, 3, 27], rotation: [0, 2.2, 0], scale: 1.4 },
  // Lanterns lining the hill approach
  { model: '/models/buildings/lantern.glb', position: [22, 2, 20], rotation: [0, 0, 0], scale: 1.0 },
  { model: '/models/buildings/lantern.glb', position: [24, 2.5, 22], rotation: [0, 0, 0], scale: 1.0 },
  { model: '/models/buildings/lantern.glb', position: [28, 3, 24], rotation: [0, 0, 0], scale: 1.0 },
  // Flag at MF Tower
  { model: '/models/props/flag.glb', position: [25, 3, 22], rotation: [0, 1.5, 0], scale: 1.5 },
  // Flowers on the hilltop
  { model: '/models/nature/flower_purpleA.glb', position: [23, 3, 26], rotation: [0, 0.5, 0], scale: 1.5 },
  { model: '/models/nature/flower_yellowA.glb', position: [27, 3, 23], rotation: [0, 1.8, 0], scale: 1.3 },
  // Hedges around MF Tower entrance
  { model: '/models/buildings/hedge.glb', position: [23, 3, 24], rotation: [0, 0.8, 0], scale: 1.8 },
  { model: '/models/buildings/hedge.glb', position: [27, 3, 24], rotation: [0, 0.8, 0], scale: 1.8 },

  // =====================================================================
  //  BEACH PERIMETER — palms, rocks, boats, barrels around the edge
  // =====================================================================
  // Palm trees along the shore (radius ~42-46)
  { model: '/models/nature/tree_palmTall.glb', position: [42, 0.5, 0], rotation: [0, 0.2, 0], scale: 1.5 },
  { model: '/models/nature/tree_palmBend.glb', position: [40, 0.5, 10], rotation: [0, 1.0, 0], scale: 1.4 },
  { model: '/models/nature/tree_palmShort.glb', position: [38, 0.5, -12], rotation: [0, 2.5, 0], scale: 1.6 },
  { model: '/models/nature/tree_palmTall.glb', position: [35, 0.5, -20], rotation: [0, 0.8, 0], scale: 1.3 },
  { model: '/models/nature/tree_palmBend.glb', position: [30, 0.5, -35], rotation: [0, 1.4, 0], scale: 1.5 },
  { model: '/models/nature/tree_palmShort.glb', position: [20, 0.5, -40], rotation: [0, 0.3, 0], scale: 1.7 },
  { model: '/models/nature/tree_palmTall.glb', position: [5, 0.5, -42], rotation: [0, 2.0, 0], scale: 1.4 },
  { model: '/models/nature/tree_palmBend.glb', position: [-10, 0.5, -40], rotation: [0, 0.6, 0], scale: 1.6 },
  { model: '/models/nature/tree_palmShort.glb', position: [-25, 0.5, -35], rotation: [0, 1.8, 0], scale: 1.3 },
  { model: '/models/nature/tree_palmTall.glb', position: [-35, 0.5, -25], rotation: [0, 0.1, 0], scale: 1.5 },
  { model: '/models/nature/tree_palmBend.glb', position: [-42, 0.5, -10], rotation: [0, 2.8, 0], scale: 1.4 },
  { model: '/models/nature/tree_palmShort.glb', position: [-42, 0.5, 5], rotation: [0, 1.2, 0], scale: 1.6 },
  { model: '/models/nature/tree_palmTall.glb', position: [-38, 0.5, 18], rotation: [0, 0.9, 0], scale: 1.5 },
  { model: '/models/nature/tree_palmBend.glb', position: [-30, 0.5, 30], rotation: [0, 2.4, 0], scale: 1.3 },
  { model: '/models/nature/tree_palmShort.glb', position: [-18, 0.5, 38], rotation: [0, 0.5, 0], scale: 1.7 },
  { model: '/models/nature/tree_palmTall.glb', position: [-5, 0.5, 42], rotation: [0, 1.6, 0], scale: 1.4 },
  { model: '/models/nature/tree_palmBend.glb', position: [10, 0.5, 40], rotation: [0, 0.7, 0], scale: 1.5 },
  { model: '/models/nature/tree_palmShort.glb', position: [25, 0.5, 35], rotation: [0, 2.2, 0], scale: 1.6 },
  { model: '/models/nature/tree_palmTall.glb', position: [35, 0.5, 22], rotation: [0, 1.1, 0], scale: 1.3 },

  // Additional palm props (larger / detailed)
  { model: '/models/props/palm-bend.glb', position: [44, 0.3, 5], rotation: [0, 0.4, 0], scale: 1.0 },
  { model: '/models/props/palm-straight.glb', position: [-44, 0.3, -5], rotation: [0, 1.3, 0], scale: 1.0 },
  { model: '/models/props/palm-detailed-bend.glb', position: [0, 0.3, 44], rotation: [0, 2.6, 0], scale: 1.0 },
  { model: '/models/props/palm-bend.glb', position: [0, 0.3, -44], rotation: [0, 0.9, 0], scale: 1.0 },

  // Rocks along the beach
  { model: '/models/nature/stone_tallA.glb', position: [45, 0, 15], rotation: [0, 0.5, 0], scale: 2.0 },
  { model: '/models/nature/stone_tallB.glb', position: [-45, 0, 12], rotation: [0, 1.8, 0], scale: 2.0 },
  { model: '/models/nature/stone_smallA.glb', position: [43, 0.2, -8], rotation: [0, 0.3, 0], scale: 2.5 },
  { model: '/models/nature/stone_smallB.glb', position: [-40, 0.2, -20], rotation: [0, 2.1, 0], scale: 2.5 },
  { model: '/models/nature/stone_smallC.glb', position: [15, 0.2, -43], rotation: [0, 1.0, 0], scale: 2.0 },
  { model: '/models/nature/stone_tallA.glb', position: [-15, 0, 42], rotation: [0, 0.7, 0], scale: 1.8 },
  { model: '/models/nature/stone_smallA.glb', position: [38, 0.2, 25], rotation: [0, 2.5, 0], scale: 2.0 },
  { model: '/models/nature/stone_smallB.glb', position: [-35, 0.2, 28], rotation: [0, 0.4, 0], scale: 2.2 },
  { model: '/models/nature/stone_tallB.glb', position: [30, 0, 38], rotation: [0, 1.5, 0], scale: 1.5 },

  // Boats at the shore
  { model: '/models/props/boat-row-small.glb', position: [46, -0.2, 0], rotation: [0, 1.5, 0], scale: 1.2 },
  { model: '/models/props/canoe.glb', position: [-46, -0.2, 0], rotation: [0, 0.3, 0], scale: 1.0 },
  { model: '/models/props/boat-row-small.glb', position: [0, -0.2, -46], rotation: [0, 2.0, 0], scale: 1.0 },
  { model: '/models/props/canoe.glb', position: [-30, -0.2, 36], rotation: [0, 1.1, 0], scale: 1.2 },

  // Barrels at docks / shore
  { model: '/models/props/barrel.glb', position: [44, 0.3, -2], rotation: [0, 0.5, 0], scale: 1.0 },
  { model: '/models/props/barrel.glb', position: [44, 0.3, 2], rotation: [0, 1.2, 0], scale: 0.9 },
  { model: '/models/props/barrel.glb', position: [-44, 0.3, 2], rotation: [0, 0.8, 0], scale: 1.1 },

  // =====================================================================
  //  INTERIOR FOREST — scattered trees between zones
  // =====================================================================
  // Northeast corridor (between spawn and TechCorp)
  { model: '/models/nature/tree_oak.glb', position: [15, 1, -8], rotation: [0, 0.9, 0], scale: 1.8 },
  { model: '/models/nature/tree_default.glb', position: [12, 1, -14], rotation: [0, 2.0, 0], scale: 1.5 },
  { model: '/models/nature/tree_thin.glb', position: [18, 1, -6], rotation: [0, 0.4, 0], scale: 1.6 },
  { model: '/models/nature/plant_bushLarge.glb', position: [14, 1, -11], rotation: [0, 1.3, 0], scale: 1.2 },

  // Northwest corridor (between spawn and Scam Park)
  { model: '/models/nature/tree_fat.glb', position: [-14, 1, -8], rotation: [0, 1.7, 0], scale: 1.5 },
  { model: '/models/nature/tree_detailed.glb', position: [-18, 1, -12], rotation: [0, 0.6, 0], scale: 1.3 },
  { model: '/models/nature/tree_oak.glb', position: [-10, 1, -5], rotation: [0, 2.8, 0], scale: 1.7 },
  { model: '/models/nature/plant_bush.glb', position: [-16, 1, -10], rotation: [0, 0.2, 0], scale: 1.4 },

  // Southern forest (between spawn and MF Tower)
  { model: '/models/nature/tree_pineDefaultA.glb', position: [8, 1, 12], rotation: [0, 1.5, 0], scale: 1.6 },
  { model: '/models/nature/tree_pineRoundA.glb', position: [12, 1, 8], rotation: [0, 0.8, 0], scale: 1.4 },
  { model: '/models/nature/tree_oak.glb', position: [14, 1, 16], rotation: [0, 2.3, 0], scale: 1.5 },
  { model: '/models/nature/tree_default.glb', position: [6, 1, 15], rotation: [0, 0.1, 0], scale: 1.8 },

  // West forest fill
  { model: '/models/nature/tree_fat.glb', position: [-20, 1, 5], rotation: [0, 0.9, 0], scale: 1.6 },
  { model: '/models/nature/tree_thin.glb', position: [-25, 1, 10], rotation: [0, 2.5, 0], scale: 1.4 },
  { model: '/models/nature/tree_detailed.glb', position: [-22, 1, 15], rotation: [0, 1.1, 0], scale: 1.5 },
  { model: '/models/nature/tree_oak.glb', position: [-18, 1, 20], rotation: [0, 0.3, 0], scale: 1.7 },
  { model: '/models/nature/tree_default.glb', position: [-28, 1, 20], rotation: [0, 1.9, 0], scale: 1.3 },
  { model: '/models/nature/plant_bushDetailed.glb', position: [-24, 1, 8], rotation: [0, 0.7, 0], scale: 1.3 },

  // East forest fill
  { model: '/models/nature/tree_pineDefaultA.glb', position: [25, 1, 5], rotation: [0, 1.2, 0], scale: 1.5 },
  { model: '/models/nature/tree_pineRoundA.glb', position: [30, 1, 10], rotation: [0, 0.6, 0], scale: 1.6 },
  { model: '/models/nature/tree_oak.glb', position: [28, 1, -5], rotation: [0, 2.0, 0], scale: 1.4 },

  // North fill
  { model: '/models/nature/tree_detailed.glb', position: [5, 1, -18], rotation: [0, 1.4, 0], scale: 1.5 },
  { model: '/models/nature/tree_fat.glb', position: [-5, 1, -22], rotation: [0, 0.8, 0], scale: 1.6 },
  { model: '/models/nature/tree_thin.glb', position: [0, 1, -28], rotation: [0, 2.6, 0], scale: 1.3 },
  { model: '/models/nature/tree_oak.glb', position: [10, 1, -30], rotation: [0, 0.2, 0], scale: 1.8 },
  { model: '/models/nature/tree_default.glb', position: [-10, 1, -30], rotation: [0, 1.7, 0], scale: 1.5 },

  // South fill
  { model: '/models/nature/tree_oak.glb', position: [-5, 1, 25], rotation: [0, 0.5, 0], scale: 1.6 },
  { model: '/models/nature/tree_pineDefaultA.glb', position: [5, 1, 30], rotation: [0, 1.9, 0], scale: 1.4 },
  { model: '/models/nature/tree_fat.glb', position: [-12, 1, 28], rotation: [0, 2.7, 0], scale: 1.5 },
  { model: '/models/nature/tree_thin.glb', position: [15, 1, 28], rotation: [0, 0.4, 0], scale: 1.7 },

  // Extra scattered nature for density
  { model: '/models/nature/plant_bushLarge.glb', position: [20, 1, -2], rotation: [0, 1.0, 0], scale: 1.0 },
  { model: '/models/nature/plant_bush.glb', position: [-15, 1, 15], rotation: [0, 2.2, 0], scale: 1.3 },
  { model: '/models/nature/plant_bushDetailed.glb', position: [8, 1, -25], rotation: [0, 0.6, 0], scale: 1.1 },
  { model: '/models/nature/flower_purpleA.glb', position: [-8, 1, 10], rotation: [0, 1.5, 0], scale: 1.4 },
  { model: '/models/nature/flower_redA.glb', position: [18, 1, 18], rotation: [0, 0.9, 0], scale: 1.3 },
  { model: '/models/nature/flower_yellowA.glb', position: [-20, 1, -2], rotation: [0, 2.0, 0], scale: 1.5 },
  { model: '/models/nature/stone_smallA.glb', position: [10, 1, -2], rotation: [0, 0.7, 0], scale: 2.0 },
  { model: '/models/nature/stone_smallC.glb', position: [-8, 1, -15], rotation: [0, 1.3, 0], scale: 1.8 },
]

// Collect unique model URLs for preloading
export const UNIQUE_MODELS = [...new Set(WORLD_ASSETS.map((a) => a.model))]
