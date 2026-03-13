import { staticResourcePaths } from "@client/config/staticResourcePaths";
import { AuthAPIStore } from "@client/contexts/AuthContext";
import { GesturesAndDeviceStore } from "@client/contexts/GesturesAndDeviceContext";
import { HUDStore } from "@client/contexts/HUDContext";
import { getMeteorRewards, MeteorResource, MeteorReward, redeemReward } from "@client/utils/meteorAPI";
import React, { useEffect, useState } from 'react';
import { FaCheck } from 'react-icons/fa6';
import { IoClose } from 'react-icons/io5';
import { MeteorManagerStore, RewardMachineMode } from "../MeteorMining/MeteorManager";
import Button from "../shared/Button";
import { InventoryItem } from "./MeteorInventoryOnScreen";
import { trackEvent } from "@client/utils/api";
import { getUserID } from "@client/utils/helperFunctions";

type HeightClass = 'h-small' | 'h-medium' | 'h-large';
type ResourceType = 'gold' | 'silver' | 'diamond';

interface UserResources {
  gold: number;
  silver: number;
  diamond: number;
}

interface ResourceCardProps {
  type: ResourceType;
  amount: number;
  userAmount: number;
  heightClass: HeightClass;
}

const RedeemingMachineScreenUI: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [items, setItems] = useState<MeteorReward[]>([]);
  const [currentItemIndex, setCurrentItemIndex] = useState<number>(0);
  const [viewportHeight, setViewportHeight] = useState<number>(window.innerHeight);
  
  const [isRedeeming, setIsRedeeming] = useState<boolean>(false);
  const [redeemError, setRedeemError] = useState<string | null>(null);
  const [redeemSuccess, setRedeemSuccess] = useState<boolean>(false);
  const [progressBarWidth, setProgressBarWidth] = useState<number>(0);
  
  const breakpoint = GesturesAndDeviceStore((state) => state.breakpoint);
  const rewardsData = MeteorManagerStore((state) => state.rewardsData);
  const isLoggedIn = AuthAPIStore((state) => state.isLoggedIn);
  const [rewardFetchError, setRewardFetchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRewards = async () => {
      try {
        const rewards = await getMeteorRewards(AuthAPIStore.getState().mobileNumberForMining);
        setItems(rewards);
        setIsLoading(false);
        setRewardFetchError(null);
      } catch (error) {
        console.error("Failed to fetch rewards:", error);
        setIsLoading(false);
        setRewardFetchError("Failed to load rewards. Please try again later.");
      }
    };

    fetchRewards();

    const handleResize = () => {
      setViewportHeight(window.innerHeight);
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

  const canRedeem = (cost: UserResources, userResources: UserResources): boolean => {
    return Object.entries(cost).every(
      ([resource, amount]) => userResources[resource as ResourceType] >= amount
    );
  };

  useEffect(() => {
    // Reset redeem states when changing items
    setIsRedeeming(false);
    setRedeemError(null);
    setRedeemSuccess(false);
    setProgressBarWidth(0);
  }, [currentItemIndex]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (redeemSuccess || redeemError) {
      timer = setInterval(() => {
        setProgressBarWidth((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            setRedeemSuccess(false);
            setRedeemError(null);
            setProgressBarWidth(0);
            return 0;
          }
          return prev + 2; // Increase by 2% every 100ms for a total of 5 seconds
        });
      }, 100);
    }
    return () => clearInterval(timer);
  }, [redeemSuccess, redeemError]);

  const handleRedeem = async (rewardId: string) => {
    setIsRedeeming(true);
    setRedeemError(null);
    setRedeemSuccess(false);
    setProgressBarWidth(0);

    try {
      const result = await redeemReward(AuthAPIStore.getState().mobileNumberForMining, rewardId);
      if (result.success) {
        setRedeemSuccess(true);
        if (result.newBalance) {
          MeteorManagerStore.setState({
            rewardsData: {
              ...rewardsData,
              ...result.newBalance
            }
          });
          if (currentItem.name.includes('500 Loyalty Points')) {
            const updatedItems = [...items];
            updatedItems[currentItemIndex] = {
              ...currentItem,
              is_redeemable: false
            };
            setItems(updatedItems);
          }
        }
      } else {
        setRedeemError(result.message);
      }
    } catch (error) {
      console.error('Error redeeming reward:', error);
      setRedeemError('An unexpected error occurred. Please try again.');
    } finally {
      setIsRedeeming(false);
    }
  };

  const getButtonText = () => {
    if (currentItem.name.includes('Gold Bean')) return 'Not Redeemable';
    if (!isLoggedIn) return 'Login or Register to redeem';
    if (isRedeeming) return 'Redeeming...';
    if (redeemSuccess) return 'Redeem successful! We will update you on your mobile number.';
    if (redeemError) return 'Something went wrong. Please try again.';
    if (!currentItem.is_redeemable) return 'Already redeemed';
    return canRedeem(currentItem.cost, rewardsData) ? 'Redeem' : 'Insufficient Resources';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center text-white absolute z-hud mx-auto left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 bg-gray-900 bg-opacity-[0]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mb-4"></div>
          <p className="text-purple-400 text-xl font-bold">Loading rewards...</p>
        </div>
      </div>
    );
  }

  if (rewardFetchError) {
    return (
      <div className='absolute left-1/2 top-1/2 z-hud flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-xl bg-gray-800 bg-opacity-75 p-6'>
        <div className='mb-6 text-center text-red-500'>
          <p className='text-xl font-bold'>{rewardFetchError}</p>
        </div>
        <button
          onClick={() => {
            MeteorManagerStore.setState({
              rewardMachineMode: RewardMachineMode.TRAVELLING_INSIDE_TO_OUTSIDE,
            })
            HUDStore.setState({ isRedeemMachineScreenUIVisible: false })
          }}
          className='group mb-2 mt-[13px] inline-flex items-center justify-center self-end overflow-hidden rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 p-0.5 text-sm font-medium text-gray-900 hover:text-white focus:outline-none focus:ring-4 focus:ring-blue-300 group-hover:from-purple-600 group-hover:to-blue-500 md:mr-10 md:mt-0 dark:text-white dark:focus:ring-blue-800'
        >
          <span className='relative rounded-md bg-white px-2 py-1 transition-all duration-75 ease-in group-hover:bg-opacity-0 md:px-5 md:py-2.5 dark:bg-gray-900'>
            Exit
          </span>
        </button>
      </div>
    )
  }

  const currentItem = items[currentItemIndex];

  return (
    <div 
      className={`flex items-center justify-center text-white px-4 absolute z-hud mx-auto left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 ${
        (breakpoint === "md" || breakpoint === "sm" || breakpoint === "xs") ? 'w-[85%]' : 'w-[70%]'
      }`}
    >
      <div 
        className={`w-full bg-transparent backdrop-blur-sm rounded-xl flex flex-col items-center justify-center ${
          heightClass === 'h-small' ? 'space-y-1' : heightClass === 'h-medium' ? 'space-y-2' : 'space-y-4'
        }`}
      >
        <h1 className={`font-bold text-center text-purple-400 uppercase font-rajdhaniBold ${
          heightClass === 'h-small' ? 'text-xl py-1' : heightClass === 'h-medium' ? 'text-3xl py-2' : 'text-5xl py-4'
        }`}>Redeeming Machine</h1>

        {/* Item display */}
        <div className="flex items-center justify-center w-full gap-4">
          <button 
            onClick={() => setCurrentItemIndex((prevIndex) => (prevIndex - 1 + items.length) % items.length)} 
            className="px-4 py-2 bg-purple-600 rounded-lg border-2 bg-transparent"
          >
            &lt;
          </button>
          <div className={`relative ${
            heightClass === 'h-small' ? 'w-32' : heightClass === 'h-medium' ? 'w-40' : 'w-52'
          }`}>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg blur"></div>
            <div className="relative bg-gray-800 rounded-lg p-2">
              <img
                src={currentItem.image}
                alt={currentItem.name}
                className={`object-contain ${
                  heightClass === 'h-small' ? 'w-28 h-28' : heightClass === 'h-medium' ? 'w-36 h-36' : 'w-48 h-48'
                }`}
              />
            </div>
          </div>
          <button 
            onClick={() => setCurrentItemIndex((prevIndex) => (prevIndex + 1) % items.length)} 
            className="px-4 py-2 bg-purple-600 rounded-lg border-2 bg-transparent"
          >
            &gt;
          </button>
        </div>

        {/* Item description */}
        <div className="space-y-2 text-center flex flex-col justify-center items-center">
          <h2 className={`font-rajdhaniSemiBold text-purple-300 ${
            heightClass === 'h-small' ? 'text-lg' : heightClass === 'h-medium' ? 'text-2xl' : 'text-4xl'
          }`}>{currentItem.name}</h2>
          <p className={`w-full md:w-1/2 text-gray-400 ${
            heightClass === 'h-small' ? 'text-xs' : heightClass === 'h-medium' ? 'text-sm' : 'text-base'
          }`}>{currentItem.description}</p>
        </div>

        {/* Cost display */}
        {!currentItem.name.includes('Gold Bean') && (
          <div className="w-full">
            <div className={`space-y-1 ${heightClass === 'h-small' ? 'space-y-2' : heightClass === 'h-medium' ? 'space-y-3' : 'space-y-4'}`}>
              <h3 className={`font-rajdhaniBold text-purple-400 text-center ${
                heightClass === 'h-small' ? 'text-xl' : heightClass === 'h-medium' ? 'text-2xl' : 'text-4xl'
              }`}>Cost</h3>
              <div className="grid grid-cols-3 gap-2 md:gap-4">
                {(["gold", "silver", "diamond"] as ResourceType[]).map((type) => (
                  <ResourceCard 
                    key={type}
                    type={type}
                    amount={currentItem.cost[type]}
                    userAmount={rewardsData[type]}
                    heightClass={heightClass}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="w-1/2 self-center relative">
          <Button
            className={`w-full font-bold rounded transition duration-300 ease-in-out transform ${
              (!isLoggedIn || (canRedeem(currentItem.cost, rewardsData) && currentItem.is_redeemable && !currentItem.name.includes('Gold Bean') && !isRedeeming && !redeemSuccess && !redeemError))
                ? 'bg-purple-600 hover:bg-purple-700 hover:scale-105'
                : 'bg-gray-600 cursor-not-allowed'
            } ${
              heightClass === 'h-small' ? 'py-1 px-2' : heightClass === 'h-medium' ? 'py-2 px-3' : 'py-4 px-4'
            }`}
            disabled={isLoggedIn && (!currentItem.is_redeemable || currentItem.name.includes('Gold Bean') || !canRedeem(currentItem.cost, rewardsData) || isRedeeming || redeemSuccess || (redeemError !== null))}
            onClick={() => {
              if (!isLoggedIn) {
                HUDStore.getState().setShowMeteorLoginRegister(true)
              } else {
                let resourceBeforeAction: MeteorResource = {
                  gold: MeteorManagerStore.getState().rewardsData.gold,
                  silver: MeteorManagerStore.getState().rewardsData.silver,
                  diamond: MeteorManagerStore.getState().rewardsData.diamond,
                }
                trackEvent(
                  'Redeeming_Reward',
                  {
                    current_resources: resourceBeforeAction,
                    reward: currentItem.name,
                    reward_cost: currentItem.cost,
                  },
                  getUserID(),
                )
                handleRedeem(currentItem._id);
              }
            }}
          >
            <p className={`font-rajdhaniBold ${
              heightClass === 'h-small' ? 'text-sm' : heightClass === 'h-medium' ? 'text-lg' : 'text-2xl'
            }`}>
              {getButtonText()}
            </p>
          </Button>
          {(redeemSuccess || redeemError) && (
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-300">
              <div 
                className={`h-full ${redeemSuccess ? 'bg-green-500' : 'bg-red-500'}`}
                style={{ width: `${progressBarWidth}%` }}
              ></div>
            </div>
          )}
        </div>

        {/* User's current resources */}
        <div className="flex z-hud gap-1 md:-mr-2 sm:gap-2">
          {(["gold", "silver", "diamond"] as ResourceType[]).map((type) => (
            <InventoryItem 
              key={type}
              item={{ 
                count: rewardsData[type], 
                image: staticResourcePaths[`${type}TwoDImage`], 
                alt: type 
              }} 
              isMinWidthNeeded={false} 
            />
          ))}
        </div>

        {/* Exit button */}
        <button 
          onClick={() => {
            MeteorManagerStore.setState({ rewardMachineMode: RewardMachineMode.TRAVELLING_INSIDE_TO_OUTSIDE })
            HUDStore.setState({ isRedeemMachineScreenUIVisible: false })
          }} 
          className="inline-flex items-center self-end justify-center p-0.5 md:mr-10 mb-2 mt-[13px] md:mt-0 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800"
        >
          <span className="relative px-2 md:px-5 py-1 md:py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
            Exit
          </span>
        </button>
      </div>
    </div>
  );
};

const ResourceCard: React.FC<ResourceCardProps> = ({ type, amount, userAmount, heightClass }) => {
  const isInsufficient = userAmount < amount;

  // Format number with commas
  const formatNumber = (num: number): string => {
    return num.toLocaleString('en-US');
  };

  return (
      <div className={`
        relative flex flex-col items-center p-1 sm:p-2 md:p-3 rounded-lg
        ${isInsufficient ? 'bg-red-900/50' : 'bg-gray-700'}
        ${heightClass === 'h-small' ? 'space-y-0' : heightClass === 'h-medium' ? 'space-y-0' : 'space-y-0'}
      `}>
        {/* Indicator icon */}
        <div className={`absolute top-1 right-1 ${heightClass === 'h-small' ? 'text-xs' : heightClass === 'h-medium' ? 'text-sm' : 'text-base'}`}>
          {isInsufficient 
            ? <IoClose className="text-red-500" />
            : <FaCheck className="text-green-500" />
          }
        </div>
        
        <img
          src={staticResourcePaths[`${type}TwoDImage`]}
          alt={type}
          className={`object-contain ${
            heightClass === 'h-small' ? 'w-6 h-6' : heightClass === 'h-medium' ? 'w-10 h-10' : 'w-16 h-16'
          }`}
        />
        <span className={`font-rajdhaniSemiBold text-gray-300 capitalize ${
          heightClass === 'h-small' ? 'text-sm' : heightClass === 'h-medium' ? 'text-xl' : 'text-3xl'
        }`}>{type}</span>
        <span className={`
          font-rajdhaniBold ${
            isInsufficient 
            ? 'text-red-400' 
            : type === 'gold' 
            ? 'text-yellow-400' 
            : type === 'silver' 
            ? 'text-gray-300' 
            : 'text-blue-300'
          }
          ${heightClass === 'h-small' ? 'text-sm' : heightClass === 'h-medium' ? 'text-xl' : 'text-3xl'}
        `}>
          {formatNumber(amount)}
        </span>
      </div>
    );
};

export default RedeemingMachineScreenUI;
