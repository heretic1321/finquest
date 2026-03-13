// import { PerformanceMonitor } from '@react-three/drei'
// import { useFrame } from '@react-three/fiber'
import { createContext, 
  // useEffect, 
  // useState 
} from 'react'
// import Stats from 'three/examples/jsm/libs/stats.module.js'

// import { useControls } from 'leva'

// import { HUDStore } from '@client/contexts/HUDContext'
// import { genericStore } from './GlobalStateContext'

export const PerformanceContext = createContext({})

// export const PerformanceContextProvider = ({
//   children,
//   setDpr,
// }: React.PropsWithChildren<{
//   setDpr: React.Dispatch<React.SetStateAction<number>>
// }>) => {
//   const isDebugMode = genericStore((state) => state.isDebugMode)

//   const [minDpr, maxDpr] = [1, 1.5]

//   const isShowcaseMode = HUDStore((state) => state.isShowcaseMode)

//   const setAdaptiveDpr = (perfMonFactor: number) => {
//     const newDpr =
//       Math.round((minDpr + (maxDpr - minDpr) * perfMonFactor) * 10) / 10
//     setDpr(newDpr)
//   }

//   const [isAdaptiveDPRActive, setIsAdaptiveDPRActive] = useState(true)

//   /**
//    * In showcase mode, we'll turn off adaptive DPR as the post processing
//    * effects reduce the fps which leads to performance reduction and the jewellery
//    * items look bad.
//    */
//   useEffect(() => {
//     if (isShowcaseMode) {
//       setIsAdaptiveDPRActive(false)
//       setDpr(1.5)
//     } else {
//       setIsAdaptiveDPRActive(true)
//     }
//   }, [isShowcaseMode])

//   useControls(
//     'Performance',
//     () => ({
//       isAdaptive: {
//         value: true,
//         onChange: (isActive: boolean) => {
//           setIsAdaptiveDPRActive(isActive)
//           if (!isActive) setDpr(2)
//         },
//       },
//     }),
//     {
//       collapsed: true,
//       render: () => {
//         // render the controls only if we are in debug mode
//         return isDebugMode || false
//       },
//     },
//   )

//   return (
//     <PerformanceContext.Provider value={{}}>
//       <PerformanceMonitor
//         ms={150}
//         iterations={5}
//         step={0.1}
//         bounds={() => [35, 36]}
//         factor={1}
//         onChange={({ factor }) => {
//           if (isAdaptiveDPRActive) setAdaptiveDpr(factor)
//         }}
//       >
//         {children}
//       </PerformanceMonitor>
//     </PerformanceContext.Provider>
//   )
// }
