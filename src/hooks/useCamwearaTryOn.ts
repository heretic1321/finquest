import { useEffect, useState } from 'react'

import ARViewConfig from '@client/config/ARView'
import { IJewelleryItem } from '@client/utils/types'

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    loadTryOnButton: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getSkusListWithTryOn: any
  }
}

type TuseCamwearaTryOnProps = {
  currentItem: IJewelleryItem | null | undefined
}

export const useCamwearaTryOn = (props: TuseCamwearaTryOnProps) => {
  /**
   * Load Camweara Try On Script
   */
  const [scriptLoaded, setScriptLoaded] = useState(false)
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://camweara.com/integrations/camweara_api.js'
    script.onload = () => setScriptLoaded(true)
    document.body.appendChild(script)
    return () => {
      document.body.removeChild(script)
    }
  }, [])

  /**
   * Getting supported list of SKUs for senco company and storing that
   * in state
   */
  const [skuList, setSkuList] = useState<string[]>([])
  useEffect(() => {
    if (!scriptLoaded) return
    window
      .getSkusListWithTryOn({ companyName: ARViewConfig.companyName })
      .then((skuList: string[]) => {
        console.log('skuList', skuList)
        setSkuList(skuList)
      })
      .catch((err: Error) => {
        console.error(err)
      })
  }, [scriptLoaded])

  /**
   * when the current selected item is updated, and sku list is updated,
   * then we can load the try on button
   *
   * if this is being called in succession, for example, after using carousel,
   * then we need to cleanup the iframe and the existing try on button that their script loads
   */
  useEffect(() => {
    if (!props.currentItem) return
    if (!skuList || skuList.length === 0) return

    if (skuList.includes(props.currentItem.sku)) {
      window.loadTryOnButton({
        psku: props.currentItem.sku,
        page: 'product',
        company: 'Senco_Metaverse',
        buynow: { enable: 'false' },
        prependButton: {
          class: `button-container-${props.currentItem.sku}`,
        },
        styles: {
          tryonbutton: {
            backgroundColor: 'white',
            color: 'black',
            border: '1px solid black',
            borderRadius: '25px',
            marginTop: '8px',
            marginBottom: '8px',
          },
          tryonbuttonHover: {
            backgroundColor: 'black',
            color: 'white',
            border: 'none',
            borderRadius: '25px',
          },
          MBtryonbutton: { width: '100%', borderRadius: '25px' },
        },
        tryonButtonData: {
          text: 'Virtual Try-On',
          faIcon: 'fa fa-camera',
        },
      })
    } else {
      console.error(`Invalid SKU: ${props.currentItem.sku}`)
    }

    return () => {
      cleanupCamwearaTryOn()
    }
  }, [props.currentItem, skuList])
}

export const cleanupCamwearaTryOn = () => {
  const iframe = document.getElementById('iFrameID') as HTMLIFrameElement
  if (iframe !== null) iframe.parentNode?.removeChild(iframe)

  const button = document.querySelector('#tryonButton')
  if (button !== null) button?.parentNode?.removeChild(button)
}
