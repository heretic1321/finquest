import { SkinColorOptions } from '@client/config/Avatar'

interface SkinColorProps {
  handleSkinColorClick: (colorName: string) => void
  currentlySelectedSkinColorTag: string
}

const SkinColor: React.FC<SkinColorProps> = ({
  handleSkinColorClick,
  currentlySelectedSkinColorTag,
}) => {
  return (
    <div className='no-scroll  flex  w-full gap-4 overflow-x-auto md:flex-wrap'>
      {Object.entries(SkinColorOptions).map(
        ([colorName, colorValue], index) => (
          <div
            key={index}
            className={`m-0 h-16 w-16 shrink-0 cursor-pointer rounded-full  md:h-16 md:w-16 ${
              currentlySelectedSkinColorTag === colorName
                ? 'border-4 border-[#8A2EFF] bg-[#251243AD]'
                : ''
            }`}
            style={{ backgroundColor: colorValue }}
            onClick={() => handleSkinColorClick(colorName)}
          />
        ),
      )}
    </div>
  )
}

export default SkinColor
