import { useEffect } from 'react';
import useGameStore from '../../stores/gameStore';
import './InteractionPrompt.css';

function InteractionPrompt() {
  const nearbyNPC = useGameStore((s) => s.nearbyNPC);
  const activeDialogue = useGameStore((s) => s.activeDialogue);
  const setDialogue = useGameStore((s) => s.setDialogue);
  const gamePhase = useGameStore((s) => s.gamePhase);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'e' || e.key === 'E') {
        // Only trigger if: NPC is nearby, no dialogue open, and in exploring phase
        if (nearbyNPC && !activeDialogue && gamePhase === 'exploring') {
          if (nearbyNPC.dialogue) {
            setDialogue(nearbyNPC.dialogue);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nearbyNPC, activeDialogue, gamePhase, setDialogue]);

  // Don't show prompt if: no NPC nearby, dialogue already open, or not exploring
  if (!nearbyNPC || activeDialogue || gamePhase !== 'exploring') return null;

  return (
    <div className="interaction-prompt">
      <span className="interaction-prompt__key">E</span>
      <span className="interaction-prompt__text">Talk to {nearbyNPC.name}</span>
    </div>
  );
}

export default InteractionPrompt;
