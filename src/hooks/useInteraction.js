import { useEffect } from 'react'
import useGameStore from '../stores/gameStore'

export default function useInteraction() {
  const nearbyNPC = useGameStore((s) => s.nearbyNPC)
  const activeDialogue = useGameStore((s) => s.activeDialogue)
  const setDialogue = useGameStore((s) => s.setDialogue)

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'KeyE' && nearbyNPC && !activeDialogue) {
        // For now, set a simple single-step dialogue with the greeting
        // Quest-specific dialogues will override this in TASK_08+
        setDialogue({
          npcName: nearbyNPC.name,
          npcColor: nearbyNPC.color,
          steps: [
            {
              text: nearbyNPC.greeting,
              choices: [
                { label: 'Thanks!', action: null, nextStep: null }
              ]
            }
          ]
        })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [nearbyNPC, activeDialogue, setDialogue])
}
