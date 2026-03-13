import React, { ReactNode } from 'react'

const LoginLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <section className="flex h-screen w-full flex-col items-center justify-center bg-[#0a0f1a] text-white">
      <div className="w-full max-w-md px-6">
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-extrabold tracking-tight">
            <span className="text-emerald-400">Fin</span>
            <span className="text-white">Quest</span>
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Learn money. Live smart. Play your way.
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-8 backdrop-blur-sm">
          {children}
        </div>

        <p className="mt-6 text-center text-[11px] text-slate-600">
          A financial literacy experience for young India
        </p>
      </div>
    </section>
  )
}

export default LoginLayout
