import { useEffect } from 'react';
import useGameStore from '../../stores/gameStore';

const overlayStyles = `
@keyframes overlay-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes overlay-content-scale {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.overlay {
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: overlay-fade-in 0.2s ease-out;
}

.overlay__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  cursor: pointer;
}

.overlay__content {
  position: relative;
  width: min(800px, 90vw);
  max-height: 85vh;
  background: rgba(15, 15, 35, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #ffffff;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: overlay-content-scale 0.2s ease-out;
}

.overlay__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.overlay__title {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  color: #ffffff;
}

.overlay__close {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 24px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  padding: 0;
  transition: background 0.15s ease, color 0.15s ease;
}

.overlay__close:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
}

.overlay__body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.overlay__body::-webkit-scrollbar {
  width: 6px;
}

.overlay__body::-webkit-scrollbar-track {
  background: transparent;
}

.overlay__body::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}
`;

function Overlay({ isOpen, onClose, title, children }) {
  const setOverlayOpen = useGameStore((s) => s.setOverlayOpen);

  useEffect(() => {
    setOverlayOpen(isOpen);
    return () => setOverlayOpen(false);
  }, [isOpen, setOverlayOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.code === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <style>{overlayStyles}</style>
      <div className="overlay">
        {/* Dark backdrop */}
        <div className="overlay__backdrop" onClick={onClose} />

        {/* Content container */}
        <div className="overlay__content">
          {/* Header with title and close button */}
          <div className="overlay__header">
            <h2 className="overlay__title">{title}</h2>
            <button className="overlay__close" onClick={onClose}>
              &times;
            </button>
          </div>

          {/* Scrollable body */}
          <div className="overlay__body">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}

export default Overlay;
