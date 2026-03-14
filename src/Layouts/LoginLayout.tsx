import React, { ReactNode } from 'react'

const LoginLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <section
      className='fixed inset-0 z-50 w-full overflow-y-auto touch-pan-y text-white'
      style={{
        backgroundImage:
          "url('/assets/ui/login/login_bg.png'), url('/assets/ui/login/login_bg.jpg')",
        backgroundSize: 'cover, cover',
        backgroundPosition: 'center, center',
        backgroundRepeat: 'no-repeat, no-repeat',
      }}
    >
      <div className='mx-auto flex min-h-full w-full max-w-md flex-col justify-start px-6 py-8 md:justify-center'>
        <div className='mb-8 text-center'>
          <h1 className='text-5xl font-bold tracking-tight'>
            <span className='text-emerald-400'>Fin</span>
            <span className='text-white'>Quest</span>
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Learn money. Live smart. Play your way.
          </p>
        </div>

        <div className='rounded-2xl border border-white/15 bg-[#0b162bbb]/80 p-8 backdrop-blur-md'>
          {children}
        </div>

        <p className="mt-6 text-center text-[11px] text-slate-400">
          A financial literacy experience for young India
        </p>
      </div>
    </section>
  )
}

export default LoginLayout
