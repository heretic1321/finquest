import React, { ReactNode } from 'react'

const LoginLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <section
      className='fixed inset-0 z-50 flex h-screen w-full items-center justify-center text-white'
      style={{
        backgroundImage:
          "url('/assets/ui/login/login_bg.png'), url('/assets/ui/login/login_bg.jpg')",
        backgroundSize: 'cover, cover',
        backgroundPosition: 'center, center',
        backgroundRepeat: 'no-repeat, no-repeat',
      }}
    >
      {/* Dark overlay */}
      <div className='absolute inset-0 bg-black/90' />

      <div className='relative flex w-full max-w-lg flex-col px-6'>
        <div className='mb-4 text-center'>
          <h1 className='text-4xl font-black uppercase tracking-tighter'>
            <span className='text-[#00ff88]'>FIN</span>
            <span className='text-white'>QUEST</span>
          </h1>
          <p className='mt-1 font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-500'>
            Learn money. Live smart. Play your way.
          </p>
        </div>

        <div className='relative border-2 border-[#00ff88] bg-[#0a0a0a] p-5 shadow-[6px_6px_0_#00ff88]'>
          {/* Corner accents */}
          <div className='absolute -left-1.5 -top-1.5 h-2.5 w-2.5 bg-[#00ff88]' />
          <div className='absolute -bottom-1.5 -right-1.5 h-2.5 w-2.5 bg-[#00ff88]' />
          {children}
        </div>

        <p className='mt-3 text-center font-mono text-[10px] uppercase tracking-wider text-neutral-600'>
          A financial literacy experience for young India
        </p>
      </div>
    </section>
  )
}

export default LoginLayout
