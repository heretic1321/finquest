// THIS COMPONENT IS NOW DEPRECATED AND IS BEING REPLACED WITH ReadyPlayerMe component

import { useState } from 'react'

import Gender from '@client/components/HUD/AvatarSelectionMenu/Options/Gender'
import SkinColor from '@client/components/HUD/AvatarSelectionMenu/Options/SkinColor'
import Button from '@client/components/shared/Button'
import { AvatarOptions, SkinColorOptions } from '@client/config/Avatar'
import { staticResourcePaths } from '@client/config/staticResourcePaths'
import { AvatarStore } from '@client/contexts/AvatarAppearanceContext'

enum SelectionTab {
  Gender = 'gender',
  Skin = 'skintone',
}

// const tabOptions: Array<{
//   name: SelectionTab
//   icon: string
// }> = [
//   {
//     name: SelectionTab.Gender,
//     icon: '/assets/icons/gender-icon.svg',
//   },
//   {
//     name: SelectionTab.Skin,
//     icon: '/assets/icons/skintone-icon.svg',
//   },
// ]

const AvatarSelectionMenu = () => {
  const [currentSelectionTab, ] = useState<SelectionTab>(
    SelectionTab.Gender,
  )

  const [currentlySelectedAvatar, setCurrentlySelectedAvatar] = useState<
    keyof typeof AvatarOptions
  >(Object.keys(AvatarOptions)[0])

  const handleAvatarClick = (avatar: keyof typeof AvatarOptions) => {
    setCurrentlySelectedAvatar(avatar)
  }

  const [currentlySelectedSkinColorTag, setCurrentlySelectedSkinColorTag] =
    useState<keyof typeof SkinColorOptions>(Object.keys(SkinColorOptions)[0])
  const handleSkinColorClick = (color: keyof typeof SkinColorOptions) => {
    setCurrentlySelectedSkinColorTag(color)
  }

  const saveButtonClicked = () => {
    // if (!isGuest) {
    //   localStorage.setItem('avatarName', currentlySelectedAvatar)
    //   localStorage.setItem('skinColorTag', currentlySelectedSkinColorTag)
    // }
    // if (setAvatarData !== null) {
    //   setAvatarData({
    //     avatarName: currentlySelectedAvatar,
    //     skinColorTag: currentlySelectedSkinColorTag,
    //   })
    // }

    let randomAvatar = ''
    if (currentlySelectedAvatar === 'feb') {
      // male
      randomAvatar = staticResourcePaths.listOfMaleAvatars[Math.floor(Math.random() * staticResourcePaths.listOfMaleAvatars.length)]
      AvatarStore.getState().handleOnAvatarExported(randomAvatar)

    } else if (currentlySelectedAvatar === 'may') {
      // female
      randomAvatar = staticResourcePaths.listOfFemaleAvatars[Math.floor(Math.random() * staticResourcePaths.listOfFemaleAvatars.length)]
    }
    AvatarStore.getState().handleOnAvatarExported(randomAvatar)
    AvatarStore.setState({ hasRandomAvatarBeenSelected: true })
  }

  const renderSelectionTab = () => {
    switch (currentSelectionTab) {
      case SelectionTab.Gender:
        return (
          <Gender
            handleAvatarClick={handleAvatarClick}
            currentlySelectedAvatar={currentlySelectedAvatar}
          />
        )
      case SelectionTab.Skin:
        return (
          <SkinColor
            handleSkinColorClick={handleSkinColorClick}
            currentlySelectedSkinColorTag={currentlySelectedSkinColorTag}
          />
        )
      default:
        return null
    }
  }

  return (
    <section className='flex h-screen items-center justify-between bg-avatarBackground bg-cover bg-center bg-no-repeat flex-row'>
      {/* <div
        className={`absolute -left-1/2 -top-[40%] h-3/4 w-[200%] translate-x-1/2 scale-[2] rounded-[45%] border border-[#DF4DBF] bg-[#17082FAD]
        md:-left-[40%] md:-top-[35%] md:bottom-0 md:h-[200vh] md:w-[75%]`}
        style={{ transform: 'rotate(-20deg)' }}
      ></div> */}
      {/* <div className='relative h-1/2 w-full md:h-screen md:w-[30%]'>
        <Canvas>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} />
          <PerspectiveCamera
            makeDefault
            position={[0, -15.3, 6.1]}
            rotation={[-0.2, 0, 0]}
            fov={70}
          />
          <group
            rotation={[0, Math.PI, 0]}
            position={[0.25, -19.5, 1.3]}
            scale={[2.4, 2.4, 2.4]}
          >
            <Avatar
              key={currentlySelectedAvatar}
              avatarData={{
                avatarName: currentlySelectedAvatar,
                skinColorTag: currentlySelectedSkinColorTag,
              }}
              playerSpeed={0}
              isPerformanceMonitorContextAvailable={false}
              currentAvatarAnimationState='idle'
            />
          </group>
        </Canvas>
      </div> */}
      <div className='relative overflow-y-auto text-white h-auto w-full pb-0'>
        <div className='mx-auto px-4 py-0 max-w-[95%] md:max-w-[75%]'>
          <h2 className='py-4 text-center text-5xl block'>
            Create your Avatar!
          </h2>

          <h3 className='py-4 text-center text-3xl block'>
            Choose your gender
          </h3>

          <div className='relative z-[2] mx-auto my-2 flex w-full flex-col-reverse items-stretch justify-center gap-2 md:flex-row'>
            <div className='flex min-h-[150px] items-center rounded-xl border border-[rgba(255,255,255,0.01)] bg-[#17082FB2] py-2 backdrop-blur-[8px] md:min-h-[400px] w-full md:w-[65%] md:items-start md:border-none md:px-10 md:py-14'>
              {renderSelectionTab()}
            </div>

            {/* <div className='flex w-full min-w-[175px] rounded-xl bg-none py-6 md:w-[25%] md:flex-col md:bg-[#17082FB2] md:px-6 md:backdrop-blur-[8px]'>
              {tabOptions.map((tab) => (
                <div
                  key={tab.name}
                  className={`cursor-pointer capitalize ${
                    currentSelectionTab === tab.name
                      ? 'bg-gradient-to-r from-[#A055FF] to-[#7D21F2] text-white'
                      : ''
                  } flex max-w-[170px] items-center rounded-full px-4 py-2 md:mb-4`}
                  onClick={() => setCurrentSelectionTab(tab.name)}
                >
                  <img src={tab.icon} alt={tab.name} />
                  <span className='ml-2'>{tab.name}</span>
                </div>
              ))}
            </div> */}
          </div>

          <span className='dark-bg-gradient fixed bottom-0 left-0 z-[0] block h-1/2 w-full md:hidden'></span>
          <div className='mx-auto w-[95%] py-4 md:w-3/4'>
            <Button onClick={saveButtonClicked} classNames='w-full gradient'>
              Save
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AvatarSelectionMenu
