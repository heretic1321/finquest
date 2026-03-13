import { RenderProps } from '@react-three/fiber'

const config = {
  shadows: false,
  camera: {
    fov: 60,
    near: 0.1,
    far: 300,
    position: [3, 2, 6],
  },
} satisfies RenderProps<HTMLCanvasElement>

export default config
