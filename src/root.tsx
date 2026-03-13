import { createRoot } from 'react-dom/client'

import Main from '@client/main'

import '@client/tailwind.css'
import '@client/style.css'

const root = document.getElementById('root')

if (root)
  createRoot(root).render(
    // Note -- Strict mode will render components twice in dev mode
    // So while developing, you might see two players popping up on the scene/chat.
    // The join room call happens twice and two players get added to the room.
    // This is does not happen in production mode.
    // https://stackoverflow.com/a/71982736/13362230
    <Main />,
  )
