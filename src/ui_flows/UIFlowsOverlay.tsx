import { getFlowMeta } from './config'
import BankFlow from './BankFlow'
import BlockchainFlow from './BlockchainFlow'
import HospitalInsuranceFlow from './HospitalInsuranceFlow'
import InvestmentCenterFlow from './InvestmentCenterFlow'
import LaxmiIntroFlow from './LaxmiIntroFlow'
import LoginFlowGallery from './LoginFlowGallery'
import { UIFlowStore } from './store'

const renderFlowContent = (activeFlowId: string | null) => {
  if (activeFlowId === 'investment-center') {
    return <InvestmentCenterFlow />
  }

  if (activeFlowId === 'hospital-insurance') {
    return <HospitalInsuranceFlow />
  }

  if (activeFlowId === 'bank-flow') {
    return <BankFlow />
  }

  if (activeFlowId === 'blockchain-flow') {
    return <BlockchainFlow />
  }

  if (activeFlowId === 'laxmi-intro') {
    return <LaxmiIntroFlow />
  }

  return <LoginFlowGallery />
}

export default function UIFlowsOverlay() {
  const { activeFlowId, entrySource, entryStoreKey, closeUIFlow } = UIFlowStore(
    (state) => ({
      activeFlowId: state.activeFlowId,
      entrySource: state.entrySource,
      entryStoreKey: state.entryStoreKey,
      closeUIFlow: state.closeUIFlow,
    }),
  )

  const activeFlow = activeFlowId ? getFlowMeta(activeFlowId) : null
  const isImmersiveInsurance =
    activeFlowId === 'hospital-insurance' ||
    activeFlowId === 'bank-flow' ||
    activeFlowId === 'blockchain-flow' ||
    activeFlowId === 'laxmi-intro'

  return (
    <section className={`absolute inset-0 z-[120] overflow-y-auto bg-[#05070fcc] backdrop-blur-md ${isImmersiveInsurance ? 'px-2 py-2' : 'px-4 py-6'}`}>
      <div className={`mx-auto w-full rounded-2xl border border-white/15 bg-gradient-to-b from-[#111a2b] to-[#0e1624] text-white shadow-2xl ${isImmersiveInsurance ? 'max-w-[98vw] p-3' : 'max-w-6xl p-6'}`}>
        {!isImmersiveInsurance && (
          <>
            <div className='mb-6 flex items-start justify-between gap-4'>
              <div>
                <h2 className='text-2xl font-semibold'>UI Flows Sandbox</h2>
                <p className='mt-1 text-sm text-slate-300'>
                  Separate UI pipeline for screen flows outside the 3D world interactions.
                </p>
                <p className='mt-2 text-xs text-slate-400'>
                  Entry: {entrySource || 'manual'}
                  {entryStoreKey ? ` · Trigger: ${entryStoreKey}` : ''}
                </p>
              </div>

              <button
                className='rounded-lg border border-rose-400/30 bg-rose-500/15 px-3 py-2 text-sm font-medium text-rose-200 transition hover:bg-rose-500/25'
                onClick={closeUIFlow}
              >
                Exit to World
              </button>
            </div>

            {activeFlow && (
              <div className='mb-4 rounded-xl border border-indigo-400/20 bg-indigo-500/10 px-4 py-3'>
                <p className='text-xs uppercase tracking-wide text-indigo-200'>Active flow</p>
                <p className='mt-1 font-medium text-indigo-100'>{activeFlow.title}</p>
              </div>
            )}
          </>
        )}

        {isImmersiveInsurance && (
          <div className='mb-2 flex justify-end'>
            <button
              className='rounded-lg border border-rose-400/30 bg-rose-500/15 px-3 py-2 text-sm font-medium text-rose-200 transition hover:bg-rose-500/25'
              onClick={closeUIFlow}
            >
              Exit to World
            </button>
          </div>
        )}

        {renderFlowContent(activeFlowId)}
      </div>
    </section>
  )
}
