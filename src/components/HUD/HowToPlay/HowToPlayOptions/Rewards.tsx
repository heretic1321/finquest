const itemStyles = {
  container: 'flex items-center gap-2 py-3',
  badge:
    'yesave flex h-10 w-10 items-center justify-center rounded-full border border-[#C599FFCF] bg-[#17082FB2] p-2',
  description: 'max-w-[80%] md:max-w-[90%]',
}

const Rewards = () => {
  return (
    <div className='flex flex-col-reverse items-center justify-between gap-3 md:flex-row'>
      <div className='w-full md:w-[58%] md:p-4'>
        <div className={itemStyles.container}>
          <div className={itemStyles.badge}>1</div>
          <p className={itemStyles.description}>
            Complete the treasure hunt by searching all jewellery items
            mentioned int he treasure hunt menu.
          </p>
        </div>
        <div className={itemStyles.container}>
          <div className={itemStyles.badge}>2</div>
          <p className={itemStyles.description}>
            Visit your nearest Senco Gold or Everlite showroom.
          </p>
        </div>
        <div className={itemStyles.container}>
          <div className={itemStyles.badge}>3</div>
          <p className={itemStyles.description}>
            Navigate to the "Loyalty Points" or "Rewards" section within your
            account.
          </p>
        </div>
        <div className={itemStyles.container}>
          <div className={itemStyles.badge}>4</div>
          <p className={itemStyles.description}>
            Show your earned Loyalty points on the billing counter.
          </p>
        </div>
      </div>
      <div className='w-full md:w-[38%]  md:p-4'>
        <img
          src='/assets/images/rewardsPreview.png'
          className='h-full max-h-[350px] w-full object-contain'
          alt=''
        />
      </div>
    </div>
  )
}

export default Rewards
