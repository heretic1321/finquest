import { memo, MutableRefObject } from 'react'

import { CharacterRef } from '@client/components/Character'
import HighPolyShowcaseModel from '@client/components/Jewellery/HighPolyShowcaseModel'
import JewelleryGroup from '@client/components/Jewellery/JewelleryGroup'
import { genericStore } from '@client/contexts/GlobalStateContext'
import { HUDStore } from '@client/contexts/HUDContext'
import { IGroupWithItems } from '@client/utils/types/collectionAPI'

type JewelleryManagerProps = {
  characterRef: MutableRefObject<CharacterRef | null>
  storeName: string
  groups: IGroupWithItems[]
}

/**
 * This component is used to render and manage all the jewellery in the scene.
 */
const JewelleryManager = memo(
  ({ characterRef, storeName, groups }: JewelleryManagerProps) => {
    // const [visibleGroups, setVisibleGroups] = useState<IGroupWithItems[]>([]);
    const isShowcaseMode = HUDStore((state) => state.isShowcaseMode)

    // useEffect(() => {
    //   const interval = setInterval(() => {
    //     setVisibleGroups((currentGroups) => {
    //       const nextIndex = currentGroups.length;
    //       if (nextIndex < groups.length) {
    //         return [...currentGroups, groups[nextIndex]];
    //       } else {
    //         clearInterval(interval);
    //         return currentGroups;
    //       }
    //     });
    //   }, 250);

    //   return () => clearInterval(interval);
    // }, [groups]);

    const isDebugMode = genericStore((state) => state.isDebugMode)

    if (!groups || groups.length === 0) return null
    return (
      <>
        {groups.map((g, i) => {
          if (!isDebugMode) {
            if (g.slots === undefined || g.slots === null || g.slots.length === 0) return null
          }

          return (
            <JewelleryGroup
              key={i + storeName}
              groupIndex={i}
              {...g}
              characterRef={characterRef}
              storeName={storeName}
              groups={groups}
            />
          )
        })}
        {isShowcaseMode && (
          <HighPolyShowcaseModel storeName={storeName} groups={groups} />
        )}
      </>
    )
  },
)

export default JewelleryManager
