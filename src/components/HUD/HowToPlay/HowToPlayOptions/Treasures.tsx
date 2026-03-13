const itemStyles = {
  container: 'flex items-center gap-2 py-3',
  badge:
    'yesave flex h-10 w-10 items-center justify-center rounded-full border border-[#C599FFCF] bg-[#17082FB2] p-2',
  description: 'md:max-w-[90%] max-w-[80%]',
}

const Treasures = () => {
  return (
    <div className='flex flex-col-reverse items-center justify-between gap-3 md:flex-row'>
      <div className='w-full overflow-auto md:w-[58%] md:p-4'>
        <div className={itemStyles.container}>
          <div className={itemStyles.badge}>1</div>
          <p className={itemStyles.description}>
            Open the treasure hunt menu to view the four items you need to
            collect.
          </p>
        </div>
        <div className={itemStyles.container}>
          <div className={itemStyles.badge}>2</div>
          <p className={itemStyles.description}>
            Search the store to locate and find the four required jewelry items.
          </p>
        </div>
        <div className={itemStyles.container}>
          <div className={itemStyles.badge}>3</div>
          <p className={itemStyles.description}>
            Click on the item to collect it. You can check your progress from
            the treasure hunt menu.
          </p>
        </div>
        <div className={itemStyles.container}>
          <div className={itemStyles.badge}>4</div>
          <p className={itemStyles.description}>
            Collect all four items to successfully complete the hunt and receive
            a reward coupon.
          </p>
        </div>
      </div>
      <div className=' w-full md:w-[38%]  md:p-4'>
        <img
          src='/assets/images/treasureHuntPreview.png'
          className='h-full max-h-[350px] w-full object-contain'
          alt=''
        />
      </div>
    </div>
  )
}

export default Treasures
