import { getFlowMeta } from './config'
import BankFlow from './BankFlow'
import BlockchainFlow from './BlockchainFlow'
import HospitalInsuranceFlow from './HospitalInsuranceFlow'
import InvestmentCenterFlow from './InvestmentCenterFlow'
import LaxmiIntroFlow from './LaxmiIntroFlow'
import LoginFlowGallery from './LoginFlowGallery'
import { UIFlowStore } from './store'
import { SoundsStore } from '@client/components/Sounds'

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
    <section className={`absolute inset-0 z-[120] overflow-y-auto bg-[#0a0a0a]/95 ${isImmersiveInsurance ? 'px-2 py-2' : 'px-4 py-6'}`}>
      <div className={`mx-auto w-full rounded-none border-2 border-[#00ff88] bg-[#0a0a0a] text-white ${isImmersiveInsurance ? 'max-w-[98vw] p-3' : 'max-w-6xl p-6 shadow-[6px_6px_0_#00ff88]'}`}>
        {!isImmersiveInsurance && (
          <>
            <div className='mb-6 flex items-start justify-between gap-4'>
              <div>
                <h2 className='font-black uppercase tracking-tight text-xl text-white'>UI Flows Sandbox</h2>
                <p className='mt-1 font-mono text-xs text-neutral-500 uppercase tracking-wider'>
                  Separate UI pipeline for screen flows outside the 3D world interactions.
                </p>
                <p className='mt-2 font-mono text-xs text-[#00ff88]'>
                  Entry: {entrySource || 'manual'}
                  {entryStoreKey ? ` // Trigger: ${entryStoreKey}` : ''}
                </p>
              </div>

              <button
                className='bg-[#ff3366] text-white font-bold uppercase tracking-wider text-sm border-2 border-[#ff3366] px-4 py-2 rounded-none shadow-[3px_3px_0_white] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all'
                onClick={() => { SoundsStore.getState().playUIClick(); closeUIFlow() }}
              >
                Exit to World
              </button>
            </div>

            {activeFlow && (
              <div className='mb-4 bg-black border-2 border-[#00ff88] p-3 rounded-none'>
                <p className='font-mono text-xs uppercase tracking-[0.2em] text-[#00ff88]'>Active flow</p>
                <p className='mt-1 font-bold text-white'>{activeFlow.title}</p>
              </div>
            )}
          </>
        )}

        {isImmersiveInsurance && (
          <div className='mb-2 flex justify-end'>
            <button
              className='bg-[#ff3366] text-white font-bold uppercase tracking-wider text-sm border-2 border-[#ff3366] px-4 py-2 rounded-none shadow-[3px_3px_0_white] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all'
              onClick={() => { SoundsStore.getState().playUIClick(); closeUIFlow() }}
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
