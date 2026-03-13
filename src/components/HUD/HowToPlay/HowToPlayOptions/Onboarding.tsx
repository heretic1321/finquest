import { HUDStore } from '@client/contexts/HUDContext'

const itemStyles = {
  container: 'flex items-center gap-2 py-3',
  badge:
    'yesave flex h-10 w-10 items-center justify-center rounded-full border border-[#C599FFCF] bg-[#17082FB2] p-2',
  description: 'md:max-w-[90%] max-w-[80%]',
}

const Onboarding = () => {
  return (
    <div className='flex flex-col-reverse items-center justify-between gap-3 md:flex-row'>
      <div className='w-full overflow-auto md:w-[58%] md:p-4'>
        <div className={itemStyles.container}>
          <p className={`${itemStyles.description} text-center`}>
            Learn about the controls and get a comprehensive overview of the shopping experience in Sencoverse.
          </p>
        </div>
        <div
          className={`max-w-full md:max-w-[90%] ${itemStyles.container} justify-center`}
        >
          <button
            onClick={() => {
              HUDStore.setState({ startTutorialUIClicked: true })
            }}
            className='rounded-lg bg-radialGradient px-6 py-3 font-semibold text-white shadow-lg transition-opacity duration-200 hover:opacity-90 hover:shadow-xl active:scale-95 active:transform'
          >
            Start Onboarding
          </button>
        </div>
      </div>
      <div className=' w-full md:w-[38%]  md:p-4'>
        <img
          src='/assets/images/onboarding.png'
          className='h-full max-h-[350px] w-full object-contain'
          alt=''
        />
      </div>
    </div>
  )
}

export default Onboarding
