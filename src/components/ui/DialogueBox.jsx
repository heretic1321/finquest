import { useState, useEffect, useCallback } from 'react';
import useGameStore from '../../stores/gameStore';
import './DialogueBox.css';

function DialogueBox() {
  const activeDialogue = useGameStore((s) => s.activeDialogue);
  const clearDialogue = useGameStore((s) => s.clearDialogue);
  const setGamePhase = useGameStore((s) => s.setGamePhase);

  const [currentStep, setCurrentStep] = useState(0);

  // Reset step index whenever a new dialogue starts
  useEffect(() => {
    if (activeDialogue) {
      setCurrentStep(0);
      setGamePhase('dialogue'); // Pause movement
    }
  }, [activeDialogue, setGamePhase]);

  const handleClose = useCallback(() => {
    clearDialogue();
    setGamePhase('exploring'); // Resume movement
  }, [clearDialogue, setGamePhase]);

  const handleChoiceClick = useCallback((choice) => {
    // Execute the action callback if provided
    if (choice.action && typeof choice.action === 'function') {
      choice.action();
    }

    // Navigate to next step or close
    if (choice.nextStep === null || choice.nextStep === undefined) {
      handleClose();
    } else {
      setCurrentStep(choice.nextStep);
    }
  }, [handleClose]);

  const handleTextClick = useCallback(() => {
    // Only advance on text click if there are no choices for this step
    if (!activeDialogue) return;
    const step = activeDialogue.steps[currentStep];
    if (!step.choices || step.choices.length === 0) {
      // Advance to next step, or close if this is the last step
      if (currentStep < activeDialogue.steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        handleClose();
      }
    }
  }, [activeDialogue, currentStep, handleClose]);

  // Keyboard: Escape to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && activeDialogue) {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeDialogue, handleClose]);

  // Don't render if no dialogue
  if (!activeDialogue) return null;

  const step = activeDialogue.steps[currentStep];
  if (!step) {
    handleClose();
    return null;
  }

  const hasChoices = step.choices && step.choices.length > 0;

  return (
    <div className="dialogue-backdrop">
      <div className="dialogue-box">
        {/* Close button */}
        <button className="dialogue-close" onClick={handleClose}>X</button>

        {/* NPC Name with color dot */}
        <div className="dialogue-npc-name">
          <span
            className="dialogue-npc-dot"
            style={{ backgroundColor: activeDialogue.npcColor }}
          />
          {activeDialogue.npcName}
        </div>

        {/* Dialogue text - clickable to advance when no choices */}
        <div
          className={`dialogue-text ${!hasChoices ? 'dialogue-text--clickable' : ''}`}
          onClick={handleTextClick}
        >
          {step.text}
          {!hasChoices && (
            <span className="dialogue-continue">Click to continue...</span>
          )}
        </div>

        {/* Choice buttons */}
        {hasChoices && (
          <div className="dialogue-choices">
            {step.choices.map((choice, index) => (
              <button
                key={index}
                className="dialogue-choice-btn"
                onClick={() => handleChoiceClick(choice)}
              >
                {choice.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DialogueBox;
