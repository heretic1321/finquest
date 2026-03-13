import backgroundSoundSource from "@client/assets/sounds/ambient.mp3";
import jumpSoundSource from "@client/assets/sounds/jump.mp3";
import clickSoundSource from "@client/assets/sounds/menuClick.mp3";
import shineSoundSource from "@client/assets/sounds/shine.mp3";
import walkingSoundSource from "@client/assets/sounds/walk.mp3";
import { genericStore } from "@client/contexts/GlobalStateContext";
import { HUDStore } from '@client/contexts/HUDContext';
import { Howl } from 'howler';
import { MutableRefObject, createRef, useEffect } from 'react';
import { create } from 'zustand';
import { LOD, PositionalAudio as PositionalAudioImpl} from 'three'

interface SoundsZustandState {
  backgroundSoundRef: MutableRefObject<Howl | null>
  setupAndPlayBackgroundMusic: (onlySetupNoPlay?: boolean) => void
  stopBackgroundMusic: () => void
  playBackgroundMusic: () => void
  isMuted: boolean
  toggleMuted: (mute?: boolean) => void
  
  walkingSoundRef: MutableRefObject<Howl | null>
  playWalkingSound: () => void
  stopWalkingSound: () => void

  shineSoundRef: MutableRefObject<Howl | null>
  playShineSound: () => void
  stopShineSound: () => void

  clickSoundRef: MutableRefObject<Howl | null>
  playClickSoundOnce: () => void

  jumpSoundRef: MutableRefObject<Howl | null>
  jumpTimeout: NodeJS.Timeout | null
  playJumpSoundOnce: () => void
  mainScreenDetailedRef: MutableRefObject<LOD | null>
  mainScreenVideoRef: MutableRefObject<HTMLVideoElement | null>
  mainScreenAudioRef: MutableRefObject<PositionalAudioImpl | null>
}

const backgroundSoundRef = createRef<Howl | null>() as MutableRefObject<Howl | null>
backgroundSoundRef.current = null

const walkingSoundRef = createRef<Howl | null>() as MutableRefObject<Howl | null>
walkingSoundRef.current = null

const shineSoundRef = createRef<Howl | null>() as MutableRefObject<Howl | null>
shineSoundRef.current = null

const clickSoundRef = createRef<Howl | null>() as MutableRefObject<Howl | null>
clickSoundRef.current = null

const jumpSoundRef = createRef<Howl | null>() as MutableRefObject<Howl | null>
jumpSoundRef.current = null

const mainScreenDetailedRef = createRef<LOD | null>() as MutableRefObject<LOD | null>
mainScreenDetailedRef.current = null

const mainScreenVideoRef = createRef<HTMLVideoElement | null>() as MutableRefObject<HTMLVideoElement | null>
mainScreenVideoRef.current = null

const mainScreenAudioRef = createRef<PositionalAudioImpl | null>() as MutableRefObject<PositionalAudioImpl | null>
mainScreenAudioRef.current = null

export const SoundsStore = create<SoundsZustandState>((set, get) => ({
  backgroundSoundRef,

  setupAndPlayBackgroundMusic: (onlySetupNoPlay: boolean = false) => {
    if (get().backgroundSoundRef.current === null) {
      get().backgroundSoundRef.current = new Howl({
        src: [backgroundSoundSource],
        loop: true,
        volume: 0.7
      })

      if (!onlySetupNoPlay) get().backgroundSoundRef.current?.play()
    }
  },
  stopBackgroundMusic: () => {
    if (get().backgroundSoundRef.current?.playing()) {
      get().backgroundSoundRef.current?.fade(0.7, 0, 1000)
      setTimeout(() => {
        get().backgroundSoundRef.current?.stop()
      }, 1000)
    }
  },
  playBackgroundMusic: () => {
      if (!get().isMuted && !get().backgroundSoundRef.current?.playing()) {
        get().backgroundSoundRef.current?.play()
        get().backgroundSoundRef.current?.fade(0, 0.5, 1000)
      }
  },

  isMuted: false,

  toggleMuted: (mute?: boolean) => {
    set((state) => ({ isMuted: mute ??!state.isMuted }))

    if (get().isMuted) {
        // Stop all sounds when muting
        mainScreenAudioRef.current?.setVolume(0)
        get().backgroundSoundRef.current?.pause()
        get().walkingSoundRef.current?.stop()
        get().shineSoundRef.current?.stop()
        get().clickSoundRef.current?.stop()
        get().jumpSoundRef.current?.stop()
    } else {
        // Only resume background music when unmuting
        const isInsideStore = genericStore.getState().insideStore !== null

        if (
          (mainScreenDetailedRef.current?.getCurrentLevel() === 0 &&
            isInsideStore) ||
          mainScreenDetailedRef.current?.getCurrentLevel() === 1
        ) {
          get().backgroundSoundRef.current?.play()
          get().backgroundSoundRef.current?.fade(0, 0.5, 1000)
        }
        mainScreenAudioRef.current?.setVolume(1)
    }
  },

  walkingSoundRef,

  playWalkingSound: () => {
    if (!get().isMuted && !get().walkingSoundRef.current?.playing()) {
        get().walkingSoundRef.current?.play()
    }
  },

  stopWalkingSound: () => {
      if (get().walkingSoundRef.current?.playing()) {
        get().walkingSoundRef.current?.stop()
      }
  },

  shineSoundRef,
  playShineSound: () => {
    if (!get().isMuted && !get().shineSoundRef.current?.playing()) {
        get().shineSoundRef.current?.play()
        get().shineSoundRef.current?.fade(0, 0.6, 1000)
    }
  },
  stopShineSound: () => {
    if (get().shineSoundRef.current?.playing()) {
      get().shineSoundRef.current?.fade(0.6, 0, 1000)
      setTimeout(() => {
        get().shineSoundRef.current?.stop()
      }, 1000)
    }
  },

  clickSoundRef,
  playClickSoundOnce: () => {
    if (!get().isMuted) {
        get().clickSoundRef.current?.play()
    }
  },

  jumpSoundRef,
  jumpTimeout: null,
  playJumpSoundOnce: () => {
    if (get().isMuted || get().jumpTimeout !== null) {
        return
    }
    get().jumpSoundRef.current?.play()
    
    if (get().jumpTimeout == null) {
      get().jumpTimeout = setTimeout(() => {
        clearTimeout(get().jumpTimeout as NodeJS.Timeout)
        get().jumpTimeout = null
      }, 1000)
    }
  },
  mainScreenDetailedRef,
  mainScreenVideoRef,
  mainScreenAudioRef,

}))

const Sounds = () => {

  useEffect(() => {
    const handleTabFocus = () => {
      // Play music only if it was previously initialized and is not already playing.
      const backgroundSound = SoundsStore.getState().backgroundSoundRef.current
      const isMainScreenVisible = mainScreenDetailedRef.current?.getCurrentLevel() === 0
      const isInsideStore = genericStore.getState().insideStore !== null
      if (
        backgroundSound !== null &&
        !backgroundSound.playing() &&
        SoundsStore.getState().isMuted === false &&
        !HUDStore.getState().isShowcaseMode &&
        ((mainScreenDetailedRef.current?.getCurrentLevel() === 0 &&
          isInsideStore) ||
          mainScreenDetailedRef.current?.getCurrentLevel() === 1) &&
        genericStore.getState().isAparupaVideoEnabled &&
        !genericStore.getState().isAparupaVideoPopupVisible
      ) {
        backgroundSound.play()
        backgroundSound.fade(0, 0.5, 1000)
      }

      const mainScreenAudio = SoundsStore.getState().mainScreenAudioRef.current
      const mainScreenVideo = SoundsStore.getState().mainScreenVideoRef.current
      if (
        mainScreenAudio !== null &&
        !mainScreenAudio.isPlaying &&
        mainScreenVideo !== null &&
        mainScreenVideo.paused &&
        !isInsideStore &&
        isMainScreenVisible
      ) {
        mainScreenAudio.play();
        mainScreenVideo.play();
      }

      const shineSound = SoundsStore.getState().shineSoundRef.current
      if (
        shineSound !== null && 
        !shineSound.playing() &&
        HUDStore.getState().isShowcaseMode
      ) {
        shineSound.play();
      }
    };
  
    const handleTabBlur = () => {
      // Pause the music when the tab loses focus.
      const backgroundSound = SoundsStore.getState().backgroundSoundRef.current
      if (
        backgroundSound !== null &&
        backgroundSound.playing()
      ) {
        backgroundSound.pause();
      }

      const mainScreenAudio = SoundsStore.getState().mainScreenAudioRef.current
      const mainScreenVideo = SoundsStore.getState().mainScreenVideoRef.current
      if (mainScreenAudio !== null && mainScreenAudio.isPlaying) {
        mainScreenAudio.pause()
      }

      if (mainScreenVideo !== null && !mainScreenVideo.paused) {
        mainScreenVideo.pause()
      }

      const shineSound = SoundsStore.getState().shineSoundRef.current
      if (
        shineSound !== null &&
        shineSound.playing()
      ) {
        shineSound.pause();
      }
    };
  
    // Add event listeners when the component mounts
    window.addEventListener('focus', handleTabFocus);
    window.addEventListener('blur', handleTabBlur);
  
    // Remove event listeners when the component unmounts
    return () => {
      window.removeEventListener('focus', handleTabFocus);
      window.removeEventListener('blur', handleTabBlur);
    };
  }, []);

  useEffect(() => {
    if (SoundsStore.getState().walkingSoundRef.current == null) {
      SoundsStore.getState().walkingSoundRef.current = new Howl({
        src: walkingSoundSource,
        loop: true,
        volume: 0.6
      })
    }

    if (SoundsStore.getState().shineSoundRef.current == null) {
      SoundsStore.getState().shineSoundRef.current = new Howl({
        src: shineSoundSource,
        loop: true,
        volume: 0.5
      })
    }

    if (SoundsStore.getState().clickSoundRef.current == null) {
      SoundsStore.getState().clickSoundRef.current = new Howl({
        src: clickSoundSource,
        volume: 0.5
      })
    }

    if (SoundsStore.getState().jumpSoundRef.current == null) {
      SoundsStore.getState().jumpSoundRef.current = new Howl({
        src: jumpSoundSource,
        volume: 0.5
      })
    }
  }, [])

  return <></>
}

export default Sounds