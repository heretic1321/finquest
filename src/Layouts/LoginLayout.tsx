import React, { ReactNode } from 'react'

interface LoginLayoutProps {
  children: ReactNode
}

const LoginLayout: React.FC<LoginLayoutProps> = ({ children }) => {
  return (
    <section className='flex h-screen w-full flex-col items-center justify-center bg-gradient-to-br from-[#0a1628] via-[#0f2847] to-[#0a1628] text-white'>
      <div className='w-full max-w-md px-6'>
        <div className='mb-8 text-center'>
          <h1 className='text-5xl font-bold tracking-tight'>
            <span className='text-emerald-400'>Fin</span>
            <span className='text-white'>Quest</span>
          </h1>
          <p className='mt-2 text-sm text-slate-400'>
            Learn money. Live smart. Play your way.
          </p>
        </div>

        <div className='rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md'>
          {children}
        </div>

        <p className='mt-6 text-center text-xs text-slate-500'>
          A financial literacy experience for young India
        </p>
      </div>
    </section>
  )
}

export default LoginLayout
