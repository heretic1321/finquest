import React, { useState, useEffect } from 'react';
import { GesturesAndDeviceStore } from "@client/contexts/GesturesAndDeviceContext";
import { HUDStore } from "@client/contexts/HUDContext";
import Button from "../shared/Button";
import { getLeaderboard } from "@client/utils/meteorAPI";
import { MeteorManagerStore, RewardMachineMode } from '../MeteorMining/MeteorManager';

type HeightClass = 'h-small' | 'h-medium' | 'h-large';

interface LeaderboardEntry {
  rank: number;
  name: string;
  value: number;
}

interface LeaderboardData {
  topMiners: LeaderboardEntry[];
  mostRewardsRedeemed: LeaderboardEntry[];
}

const LeaderboardUI: React.FC = () => {
  const [viewportHeight, setViewportHeight] = useState<number>(window.innerHeight);
  const [viewportWidth, setViewportWidth] = useState<number>(window.innerWidth);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const breakpoint = GesturesAndDeviceStore((state) => state.breakpoint);

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        setIsLoading(true);
        const data = await getLeaderboard();
        setLeaderboardData(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch leaderboard data:", err);
        setError("Failed to load leaderboard data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboardData();

    const handleResize = () => {
      setViewportHeight(window.innerHeight);
      setViewportWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getHeightClass = (): HeightClass => {
    if (viewportHeight < 800) return 'h-small';
    if (viewportHeight < 1200) return 'h-medium';
    return 'h-large';
  };

  const heightClass = getHeightClass();
  const isLandscape = viewportWidth > viewportHeight;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center text-white absolute z-hud mx-auto left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 bg-gray-900 bg-opacity-[0]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mb-4"></div>
          <p className="text-purple-400 text-xl font-bold">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='absolute left-1/2 top-1/2 z-hud flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-xl bg-gray-800 bg-opacity-75 p-6'>
        <div className='mb-6 text-center text-red-500'>
          <p className='text-xl font-bold'>{error}</p>
        </div>
        <Button
          onClick={() => {
            MeteorManagerStore.setState({
              leaderboardMachineMode:
                RewardMachineMode.TRAVELLING_INSIDE_TO_OUTSIDE,
            })
            HUDStore.setState({ isLeaderboardMachineScreenUIVisible: false })
          }}
          className='group inline-flex items-center justify-center overflow-hidden rounded-lg border-2 bg-gradient-to-br from-purple-600 to-blue-500 p-0.5 text-sm font-medium text-gray-900 hover:text-white focus:outline-none focus:ring-4 focus:ring-blue-300 group-hover:from-purple-600 group-hover:to-blue-500 dark:text-white dark:focus:ring-blue-800'
        >
          <span className='relative rounded-md bg-white px-5 py-2.5 transition-all duration-75 ease-in group-hover:bg-opacity-0 dark:bg-gray-900'>
            Exit
          </span>
        </Button>
      </div>
    )
  }

  return (
    <div 
      className={`flex items-center justify-center text-white px-4 absolute z-hud mx-auto left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 ${
        (breakpoint === "md" || breakpoint === "sm" || breakpoint === "xs") ? 'w-[85%]' : 'w-[70%]'
      }`}
    >
      <div 
        className={`w-full bg-transparent backdrop-blur-sm rounded-xl flex flex-col items-center justify-center ${
          heightClass === 'h-small' ? 'space-y-2 p-2' : heightClass === 'h-medium' ? 'space-y-4 p-4' : 'space-y-6 p-6'
        }`}
      >
        <h1 className={`font-bold text-center text-purple-400 uppercase font-rajdhaniBold ${
          heightClass === 'h-small' ? 'text-xl py-1' : heightClass === 'h-medium' ? 'text-3xl py-2' : 'text-5xl py-4'
        }`}>Leaderboard</h1>

        {leaderboardData && (
          <div className={`w-full flex ${isLandscape ? 'flex-row' : 'flex-col'} gap-4`}>
            <LeaderboardSection 
              title="Top Miners" 
              data={leaderboardData.topMiners} 
              heightClass={heightClass}
              valueLabel="Total Mined"
            />

            {isLandscape ? (
              <div className="w-px bg-purple-300 self-stretch mx-2"></div>
            ) : (
              <div className="h-px bg-purple-300 w-full my-2"></div>
            )}

            <LeaderboardSection 
              title="Most Rewards Redeemed" 
              data={leaderboardData.mostRewardsRedeemed} 
              heightClass={heightClass}
              valueLabel="Rewards Redeemed"
            />
          </div>
        )}

        {/* Exit button */}
        <Button 
          onClick={() => {
            MeteorManagerStore.setState({ leaderboardMachineMode: RewardMachineMode.TRAVELLING_INSIDE_TO_OUTSIDE });
            HUDStore.setState({ isLeaderboardMachineScreenUIVisible: false })
          }} 
          className="inline-flex items-center self-end justify-center p-0.5 md:mr-10 mb-2 mt-[13px] md:mt-0 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 border-2"
        >
          <span className="relative px-2 md:px-5 py-1 md:py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
            Exit
          </span>
        </Button>
      </div>
    </div>
  );
};

interface LeaderboardSectionProps {
  title: string;
  data: LeaderboardEntry[];
  heightClass: HeightClass;
  valueLabel: string;
}

const LeaderboardSection: React.FC<LeaderboardSectionProps> = ({ title, data, heightClass, valueLabel }) => {
  return (
    <div className="flex-1">
      <h2 className={`font-rajdhaniBold text-purple-400 text-center ${
        heightClass === 'h-small' ? 'text-lg mb-1' : heightClass === 'h-medium' ? 'text-2xl mb-2' : 'text-3xl mb-3'
      }`}>{title}</h2>
      <div className={`bg-gray-800 rounded-lg overflow-hidden ${
        heightClass === 'h-small' ? 'p-2' : heightClass === 'h-medium' ? 'p-3' : 'p-4'
      }`}>
        {data.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className={`text-purple-300 ${
                heightClass === 'h-small' ? 'text-xs' : heightClass === 'h-medium' ? 'text-sm' : 'text-base'
              }`}>
                <th className="text-left p-1">Rank</th>
                <th className="text-left p-1">Name</th>
                <th className="text-right p-1">{valueLabel}</th>
              </tr>
            </thead>
            <tbody>
              {data.map((entry) => (
                <tr key={entry.rank} className={`text-gray-300 ${
                  heightClass === 'h-small' ? 'text-xs' : heightClass === 'h-medium' ? 'text-sm' : 'text-base'
                }`}>
                  <td className="p-1">{entry.rank}</td>
                  <td className="p-1">{entry.name}</td>
                  <td className="text-right p-1">{entry.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className={`text-center text-gray-400 ${
            heightClass === 'h-small' ? 'text-xs' : heightClass === 'h-medium' ? 'text-sm' : 'text-base'
          }`}>
            No data available yet. Be the first to make it to the leaderboard!
          </p>
        )}
      </div>
    </div>
  );
};

export default LeaderboardUI;
