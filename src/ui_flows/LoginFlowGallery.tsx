import { UI_FLOW_DEFINITIONS } from './config'
import { UIFlowStore } from './store'

const statusPillClass: Record<string, string> = {
  ready: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300',
  'in-progress': 'border-amber-500/40 bg-amber-500/15 text-amber-300',
  planned: 'border-slate-500/40 bg-slate-500/15 text-slate-300',
}

export default function LoginFlowGallery() {
  const openUIFlow = UIFlowStore((state) => state.openUIFlow)

  return (
    <div className='grid gap-3'>
      {UI_FLOW_DEFINITIONS.map((flow) => (
        <article
          key={flow.id}
          className='rounded-xl border border-white/10 bg-white/5 px-4 py-4'
        >
          <div className='flex flex-wrap items-center justify-between gap-2'>
            <h3 className='text-base font-semibold'>{flow.title}</h3>
            <span
              className={`rounded-full border px-2 py-1 text-xs ${statusPillClass[flow.status]}`}
            >
              {flow.status}
            </span>
          </div>
          <p className='mt-2 text-sm text-slate-300'>{flow.description}</p>
          <button
            type='button'
            onClick={() => openUIFlow(flow.id, { source: 'manual' })}
            className='mt-3 rounded-lg border border-indigo-400/30 bg-indigo-500/15 px-3 py-2 text-sm font-medium text-indigo-100 transition hover:bg-indigo-500/25'
          >
            Open flow
          </button>
        </article>
      ))}
    </div>
  )
}
