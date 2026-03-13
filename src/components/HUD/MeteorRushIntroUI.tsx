import { IoCloseSharp } from "react-icons/io5";
import { GesturesAndDeviceStore } from '@client/contexts/GesturesAndDeviceContext';
import { useState, useEffect } from 'react';
import { PlayerConfigStore } from "../Character";
import { genericStore } from "@client/contexts/GlobalStateContext";

interface MeteorRushIntroProps {
  onClose: () => void;
}

const MeteorRushIntro: React.FC<MeteorRushIntroProps> = ({ onClose }) => {
  const [, setViewportHeight] = useState(window.innerHeight);
  const breakpoint = GesturesAndDeviceStore((state) => state.breakpoint);
  
  useEffect(() => {
    PlayerConfigStore.getState().isPlayerParalysedRef.current = true
    genericStore.getState().hideJoystickAndJumpButton()
    const handleResize = () => setViewportHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = breakpoint === "xs" || breakpoint === "sm" || breakpoint === "md";

  return (
    <div className="fixed inset-0 z-[2147483647] flex items-center justify-center bg-black/50 p-4">
      <div className={`relative grid grid-rows-[20%_70%_10%] h-[90vh] w-full ${isMobile ? 'max-w-[90%]' : 'max-w-3xl'} rounded-xl border border-[#C599FFCF] bg-[#17082FB2] p-4 md:p-6 backdrop-blur-md`}>
        {/* Close Button */}
        <button
          className="absolute right-4 top-4 text-white hover:text-[#C599FF]"
          onClick={onClose}
        >
          <IoCloseSharp size={24} />
        </button>

        {/* Header - 20% */}
        <div className="grid grid-rows-[auto_auto] gap-1 place-content-center text-center">
          <h1 className="font-rajdhaniBold text-xl md:text-3xl text-[#C599FF]">
            Senco Meteor Rush Event
          </h1>
          <p className="text-sm md:text-base text-white/80">
            Join Senco Gold & Diamonds' exclusive mining event!
          </p>
        </div>

        {/* Content Sections - 60% */}
        <div className="overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-[#C599FFCF] [&::-webkit-scrollbar-track]:bg-[#17082F80]">
          <div className="flex flex-col gap-2 md:gap-3">
            {/* Meteor Types Section */}
            <div className="rounded-lg border border-[#C599FFCF] bg-[#17082F80] p-2 md:p-3">
              <h2 className="mb-1 md:mb-2 font-rajdhaniBold text-base md:text-lg text-[#C599FF]">
                💫 Meteor Types
              </h2>
              <p className="text-sm md:text-base text-white/90">
                Hunt for three precious meteors across Sencoverse:
                <br />
                • Gold Meteor 🥇
                <br />
                • Silver Meteor 🪙
                <br />
                • Diamond Meteor 💎
              </p>
            </div>

            {/* Mining Process */}
            <div className="rounded-lg border border-[#C599FFCF] bg-[#17082F80] p-2 md:p-3">
              <h2 className="mb-1 md:mb-2 font-rajdhaniBold text-base md:text-lg text-[#C599FF]">
                ⛏️ Mining & Collection
              </h2>
              <p className="text-sm md:text-base text-white/90">
                Find fallen meteors and start mining. Feel free to explore while your mining is in progress. Return to collect your precious gems once mining is complete!
              </p>
            </div>

            {/* Redeem Machine */}
            <div className="rounded-lg border border-[#C599FFCF] bg-[#17082F80] p-2 md:p-3">
              <h2 className="mb-1 md:mb-2 font-rajdhaniBold text-base md:text-lg text-[#C599FF]">
                🎁 Redeem Machine
              </h2>
              <p className="text-sm md:text-base text-white/90">
                Visit the Redeem Machine near the stage to exchange your mined gems for exclusive Senco rewards. The grand prize is a{' '}
                <span className="font-rajdhaniBold text-[#FFD700] drop-shadow-[0_0_8px_rgba(255,215,0,0.6)] text-lg">
                  1gm 24K gold bean
                </span>!
              </p>
            </div>

            {/* Leaderboard */}
            <div className="rounded-lg border border-[#C599FFCF] bg-[#17082F80] p-2 md:p-3">
              <h2 className="mb-1 md:mb-2 font-rajdhaniBold text-base md:text-lg text-[#C599FF]">
                🏆 Leaderboard
              </h2>
              <p className="text-sm md:text-base text-white/90">
                Compete with other miners! Check the leaderboard to see who's collected the most gems and redeemed the most rewards at Senco Gold & Diamonds.
              </p>
            </div>
          </div>
        </div>

        {/* Start Button - 20% */}
        <div className="grid place-content-center">
          <button
            onClick={onClose}
            className="skewed cursor-pointer rounded-md border border-[#C599FFCF] bg-radialGradient px-6 md:px-8 py-2 md:py-3 font-rajdhaniBold text-sm md:text-base text-white transition-all hover:scale-105"
          >
            Start Mining!
          </button>
        </div>
      </div>
    </div>
  );
};

export default MeteorRushIntro;
