export function BuildingManagerLoadingScreen() {
  return (
    <div
      style={{
        opacity: 1,
      }}
      className='absolute inset-0 z-[1000] flex items-center justify-center bg-[#0F0D10] bg-loaderBG bg-cover bg-center'
    >
      <div
        className={`absolute -right-1/4 -top-[30%] bottom-0 h-screen w-[200vh] rotate-45 scale-[2] rounded-[80%] border border-[#DF4DBF] bg-[#17082FAD]`}
      ></div>
      <div className='container relative z-10 mx-auto p-4'>
        <div className='mx-auto h-[220px] max-w-full short:h-[100px]'>
          <img
            className='h-full w-full object-contain'
            src='/assets/images/startThumbnail.png'
            alt=''
          />
        </div>
        <h1 className='py-4 text-center text-2xl text-white md:text-6xl'>
          Welcome
        </h1>

        <p className='md:text-md mx-auto max-w-[400px] py-3 text-center text-sm text-white short:py-1'>
          We are getting you ready for your unique shopping experience! Please
          Wait...
        </p>
      </div>
      <div className='container absolute bottom-10 left-1/2 mx-auto flex -translate-x-1/2 items-end justify-end'>
        <div className='text-right'>
          <span className='text-slate-300'>
            Made with ❤️ by&nbsp;
            <a
              href='https://www.indieverse.studio/'
              target='_blank'
              className='font-bold text-white'
            >
              Indieverse Studio
            </a>
          </span>
          {/* <span
                ref={progressSpanRef}
                style={{ ...dataStyles }}
                className='ml-auto  text-sm text-[#C599FF]'
              />
              <div className='relative mt-2 h-1 w-52 overflow-hidden rounded-full bg-radialGradient text-left'>
                <div
                  className={` ml-0  mr-auto h-full bg-white w-[${progress + '%'}]`}
                ></div>
              </div> */}
        </div>
      </div>
    </div>
  )
}
