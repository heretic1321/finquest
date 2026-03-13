import { staticResourcePaths } from '@client/config/staticResourcePaths'

type AvatarConfig = {
  gltfFilePath: string
  previewImagePath: string
  scale: number
  position: [x: number, y: number, z: number]
  rotation: [x: number, y: number, z: number]
}
type TSkinColorOptions = Record<string, string>

export const AvatarOptions: Record<string, AvatarConfig> = {
  feb: {
    gltfFilePath: staticResourcePaths.gltfFilePaths.feb,
    previewImagePath: staticResourcePaths.imagePreviewPaths.feb,
    scale: 2,
    position: [0, -1.5, 0],
    rotation: [0, Math.PI, 0],
  } as AvatarConfig,
  may: {
    gltfFilePath: staticResourcePaths.gltfFilePaths.may,
    previewImagePath: staticResourcePaths.imagePreviewPaths.may,
    scale: 2,
    position: [0, -1.5, 0],
    rotation: [0, Math.PI, 0],
  } as AvatarConfig,
}

export const SkinColorOptions: TSkinColorOptions = {
  fair: '#fadfd1',
  light: '#FADDCD',
  medium: '#ddb9a2',
  deep: '#E0AB8B',
  dark: '#C68863',
}
