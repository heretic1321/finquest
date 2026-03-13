# TASK 06: Dialogue System

## Phase
Phase 2c --- Dialogue System

## Priority
P0 (Required for all NPC interactions: TechCorp quest, Scam Park, SIP Calculator, etc.)

## Prerequisites
- TASK_04 (Zustand Game Store) must be complete --- reads `activeDialogue`, `nearbyNPC`, `gamePhase` from store; calls `setDialogue()`, `clearDialogue()`, `setGamePhase()`
- TASK_05 (Bank HUD) should be complete --- so the UI overlay layer pattern is established in App.jsx
- Project setup complete (React, Vite running)

## Goal
Build a multi-step dialogue box component (HTML overlay, bottom-center) that displays NPC conversations with optional choice buttons, integrates with the `[E] Talk` proximity prompt from the NPC system, and pauses game movement during dialogue.

## Detailed Requirements

### 1. Files to Create

```
src/components/ui/DialogueBox.jsx       <-- The dialogue box component
src/components/ui/DialogueBox.css       <-- Styles for the dialogue box
src/components/ui/InteractionPrompt.jsx <-- The [E] Talk floating prompt
src/components/ui/InteractionPrompt.css <-- Styles for the prompt
```

### 2. DialogueBox Component

This is a **React DOM component** rendered OUTSIDE the `<Canvas>` (same overlay layer as BankHUD). It appears at bottom-center when `activeDialogue` is not null.

#### State Reads (from Zustand)

```js
import useGameStore from '../../stores/gameStore';

const activeDialogue = useGameStore((s) => s.activeDialogue);
const clearDialogue = useGameStore((s) => s.clearDialogue);
const setGamePhase = useGameStore((s) => s.setGamePhase);
```

#### Dialogue Data Structure (consumed by this component)

The `activeDialogue` object shape is defined in TASK_04's store. Here's what this component expects:

```js
{
  npcName: "HR Vikram",
  npcColor: "#4FC3F7",         // Color dot + name highlight color
  steps: [
    {
      text: "Congrats! You're hired at TechCorp. Your CTC is 8,00,000 per year!",
      choices: [                // OPTIONAL --- if omitted or empty, click-to-advance behavior
        {
          label: "Wow, 66,667/month!",
          action: () => { /* callback executed on click */ },
          nextStep: 1,          // Index of next step, or null to close
        },
        {
          label: "That seems too good to be true...",
          action: null,
          nextStep: 2,
        }
      ]
    },
    {
      text: "Classic mistake! CTC is not in-hand salary. Let me show you...",
      // No choices array = click anywhere on the text area to advance to next step
    },
    {
      text: "Your actual in-hand salary is 45,000/month after deductions.",
      choices: [
        {
          label: "Got it, thanks!",
          action: () => { useGameStore.getState().addMoney(45000, 'TechCorp salary'); },
          nextStep: null,       // null = close dialogue
        }
      ]
    }
  ]
}
```

#### Component Logic

```jsx
import { useState, useEffect, useCallback } from 'react';

function DialogueBox() {
  const activeDialogue = useGameStore((s) => s.activeDialogue);
  const clearDialogue = useGameStore((s) => s.clearDialogue);
  const setGamePhase = useGameStore((s) => s.setGamePhase);

  const [currentStep, setCurrentStep] = useState(0);

  // Reset step index whenever a new dialogue starts
  useEffect(() => {
    if (activeDialogue) {
      setCurrentStep(0);
      setGamePhase('dialogue');  // Pause movement
    }
  }, [activeDialogue, setGamePhase]);

  const handleClose = useCallback(() => {
    clearDialogue();
    setGamePhase('exploring');   // Resume movement
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

        {/* Dialogue text --- clickable to advance when no choices */}
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
```

#### Keyboard Integration

Add keyboard event listeners inside the DialogueBox component:

```js
// Inside DialogueBox component
useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && activeDialogue) {
      handleClose();
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [activeDialogue, handleClose]);
```

### 3. InteractionPrompt Component

A floating `[E] Talk` prompt that appears when the player is near an NPC. This component reads `nearbyNPC` from the store.

```jsx
import useGameStore from '../../stores/gameStore';

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
```

### 4. CSS Styling

#### DialogueBox.css

```css
/* src/components/ui/DialogueBox.css */

.dialogue-backdrop {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  padding-bottom: 32px;
  z-index: 200;
  pointer-events: none;
}

.dialogue-box {
  position: relative;
  width: 90%;
  max-width: 640px;

  background: rgba(15, 15, 20, 0.92);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px 24px;

  color: #fff;
  font-family: 'Inter', system-ui, sans-serif;
  pointer-events: auto;

  animation: dialogue-slide-up 0.25s ease-out;
}

@keyframes dialogue-slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Close button */
.dialogue-close {
  position: absolute;
  top: 12px;
  right: 16px;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.4);
  font-size: 16px;
  cursor: pointer;
  padding: 4px 8px;
  line-height: 1;
  transition: color 0.2s;
}

.dialogue-close:hover {
  color: rgba(255, 255, 255, 0.9);
}

/* NPC name header */
.dialogue-npc-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 10px;
}

.dialogue-npc-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* Dialogue text */
.dialogue-text {
  font-size: 16px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 16px;
  min-height: 48px;
}

.dialogue-text--clickable {
  cursor: pointer;
}

.dialogue-text--clickable:hover {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
}

.dialogue-continue {
  display: block;
  margin-top: 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.35);
  font-style: italic;
}

/* Choice buttons */
.dialogue-choices {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.dialogue-choice-btn {
  flex: 1 1 auto;
  min-width: 120px;
  padding: 10px 16px;

  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;

  color: #fff;
  font-size: 14px;
  font-family: 'Inter', system-ui, sans-serif;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
  text-align: center;
}

.dialogue-choice-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

.dialogue-choice-btn:active {
  background: rgba(255, 255, 255, 0.2);
}
```

#### InteractionPrompt.css

```css
/* src/components/ui/InteractionPrompt.css */

.interaction-prompt {
  position: fixed;
  bottom: 120px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 150;

  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;

  background: rgba(15, 15, 20, 0.85);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;

  color: #fff;
  font-family: 'Inter', system-ui, sans-serif;
  pointer-events: none;

  animation: prompt-fade-in 0.2s ease-out;
}

@keyframes prompt-fade-in {
  from { opacity: 0; transform: translateX(-50%) translateY(8px); }
  to   { opacity: 1; transform: translateX(-50%) translateY(0); }
}

.interaction-prompt__key {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;

  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;

  font-size: 14px;
  font-weight: 700;
  color: #fff;
}

.interaction-prompt__text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
}
```

### 5. Integration with App

Both components go in the UI overlay layer alongside BankHUD:

```jsx
// In App.jsx
import BankHUD from './components/ui/BankHUD';
import DialogueBox from './components/ui/DialogueBox';
import InteractionPrompt from './components/ui/InteractionPrompt';

function App() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* UI Overlay Layer */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 10, pointerEvents: 'none' }}>
        <BankHUD />
        <DialogueBox />
        <InteractionPrompt />
      </div>

      {/* 3D Canvas */}
      <Canvas ...>
        {/* ... 3D world ... */}
      </Canvas>
    </div>
  );
}
```

### 6. Movement Pause Integration

When dialogue is active (`gamePhase === 'dialogue'`), player movement must stop. This is handled by the character controller in the 3D world reading `gamePhase` from the store:

```js
// In the player controller component (NOT in this task --- just documenting the contract)
const gamePhase = useGameStore((s) => s.gamePhase);
// If gamePhase !== 'exploring', disable WASD input
```

This task does NOT modify the player controller. It only sets `gamePhase` to `'dialogue'` when dialogue opens and back to `'exploring'` when it closes. The player controller (TASK_02) is responsible for reading `gamePhase` and disabling input.

### 7. NPC-to-Dialogue Connection

NPCs (built in TASK_03) trigger `setNearbyNPC(npcData)` via Rapier sensor callbacks when the player enters their proximity radius. Each NPC has a `dialogue` property containing the full dialogue object. When the player presses E, `InteractionPrompt` reads `nearbyNPC.dialogue` and calls `setDialogue(nearbyNPC.dialogue)`.

The NPC data shape set by the 3D NPC system:

```js
// Set by NPC sensor (TASK_03):
useGameStore.getState().setNearbyNPC({
  id: 'hr-vikram',
  name: 'HR Vikram',
  color: '#4FC3F7',
  dialogue: {
    npcName: 'HR Vikram',
    npcColor: '#4FC3F7',
    steps: [ /* ... */ ]
  }
});
```

## Financial Constants Referenced

These live in the game store (TASK_04) but are documented here for context:

| Constant | Value | Used In |
|----------|-------|---------|
| Monthly salary (in-hand) | 45,000 | TechCorp dialogue |
| Mandatory expenses total | 26,500 | Budget dialogue |
| Discretionary income | 18,500 | Budget dialogue |
| Scam UPI amount | 5,000 | Scam Park dialogue |
| Scam bonus for avoiding | 2,000 | Scam Park dialogue |
| Insurance premium | 1,000/mo | Budget dialogue |
| SIP range | 1,000--15,000/mo | SIP NPC dialogue |
| Total months | 12 | All dialogues reference months |

## File Structure

```
src/
  components/
    ui/
      DialogueBox.jsx          <-- CREATE
      DialogueBox.css          <-- CREATE
      InteractionPrompt.jsx    <-- CREATE
      InteractionPrompt.css    <-- CREATE
  App.jsx                      <-- MODIFY (add DialogueBox + InteractionPrompt to overlay layer)
```

## Acceptance Criteria

- [ ] `DialogueBox` renders at bottom-center as a DOM overlay (not inside Canvas)
- [ ] Shows NPC name with a colored dot matching `npcColor`
- [ ] Displays the current step's `text` content
- [ ] Shows choice buttons when the step has `choices[]`
- [ ] Clicking a choice executes its `action` callback (if provided)
- [ ] Clicking a choice with `nextStep: N` advances to step N
- [ ] Clicking a choice with `nextStep: null` closes the dialogue
- [ ] Steps without choices are click-to-advance (shows "Click to continue...")
- [ ] Click-to-advance on the last step closes the dialogue
- [ ] Close button (X) in top-right closes dialogue at any point
- [ ] Pressing Escape closes the dialogue
- [ ] Opening dialogue sets `gamePhase` to `'dialogue'`
- [ ] Closing dialogue sets `gamePhase` to `'exploring'`
- [ ] `InteractionPrompt` shows "[E] Talk to {npcName}" when `nearbyNPC` is set and no dialogue is open
- [ ] `InteractionPrompt` hides when `nearbyNPC` is null, dialogue is open, or `gamePhase` is not `'exploring'`
- [ ] Pressing E when near an NPC and no dialogue is open starts the NPC's dialogue
- [ ] E key does NOT trigger during active dialogue or minigame phases
- [ ] Semi-transparent dark background with backdrop blur on dialogue box
- [ ] Slide-up animation on dialogue appearance
- [ ] Does NOT block 3D canvas click events (pointer-events handled correctly)
- [ ] Dialogue step index resets to 0 when a new dialogue starts

## What NOT to Do

- Do NOT render inside the Canvas (no `<Html>` from drei) --- this is pure React DOM
- Do NOT add typewriter text animation (waste of time, slows the demo)
- Do NOT add NPC avatar/portrait images (color dot is sufficient)
- Do NOT handle any specific quest logic (TechCorp, Scam, etc.) --- those are separate tasks that provide dialogue data
- Do NOT modify the player controller --- just set `gamePhase` and let the controller read it
- Do NOT add sound effects
- Do NOT persist dialogue state --- it resets naturally when dialogue closes

## Estimated Complexity
Medium --- two components with keyboard integration, CSS animations, and store integration.
