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
      {/* Dark overlay */}
      <div className='absolute inset-0 bg-black/90' />

      <div className='relative mx-auto flex min-h-full w-full max-w-md flex-col justify-start px-6 py-8 md:justify-center'>
        <div className='mb-8 text-center'>
          <h1 className='text-5xl font-black uppercase tracking-tighter'>
            <span className='text-[#00ff88]'>FIN</span>
            <span className='text-white'>QUEST</span>
          </h1>
          <p className='mt-3 font-mono text-xs uppercase tracking-[0.3em] text-neutral-500'>
            Learn money. Live smart. Play your way.
          </p>
        </div>

        <div className='relative border-2 border-[#00ff88] bg-[#0a0a0a] p-8 shadow-[8px_8px_0_#00ff88]'>
          {/* Corner accent top-left */}
          <div className='absolute -left-1.5 -top-1.5 h-3 w-3 bg-[#00ff88]' />
          {/* Corner accent bottom-right */}
          <div className='absolute -bottom-1.5 -right-1.5 h-3 w-3 bg-[#00ff88]' />
          {children}
        </div>

        <p className='mt-6 text-center font-mono text-xs uppercase tracking-wider text-neutral-600'>
          A financial literacy experience for young India
        </p>
      </div>
    </section>
  )
}

export default LoginLayout
