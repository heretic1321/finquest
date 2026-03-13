import React, { useMemo, useState, useEffect, useRef } from "react";
import { staticResourcePaths } from "@client/config/staticResourcePaths";
import { MeteorManagerStore } from "../MeteorMining/MeteorManager";

interface RewardsData {
  gold: number;
  silver: number;
  diamond: number;
}

interface InventoryItem {
  count: number;
  image: string;
  alt: string;
}

const useAnimatedCount = (targetValue: number, duration: number = 1000): number => {
  const [count, setCount] = useState<number>(targetValue);
  const previousValueRef = useRef<number>(targetValue);

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrame: number;

    const startValue = previousValueRef.current;
    const valueToAnimate = targetValue - startValue;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);

      // Easing function to create the acceleration and deceleration effect
      const easeInOutQuad = (t: number): number => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

      const currentCount = Math.round(startValue + easeInOutQuad(progress) * valueToAnimate);
      setCount(currentCount);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        previousValueRef.current = targetValue;
      }
    };

    if (startValue !== targetValue) {
      animationFrame = requestAnimationFrame(animate);
    }

    return () => cancelAnimationFrame(animationFrame);
  }, [targetValue, duration]);

  return count;
};

const MeteorInventoryOnScreen: React.FC = () => {
  const rewardsData = MeteorManagerStore((state) => state.rewardsData as RewardsData);

  const inventoryItems = useMemo<InventoryItem[]>(() => {
    return [
      { count: rewardsData.gold, image: staticResourcePaths.goldTwoDImage, alt: "gold" },
      { count: rewardsData.silver, image: staticResourcePaths.silverTwoDImage, alt: "silver" },
      { count: rewardsData.diamond, image: staticResourcePaths.diamondTwoDImage, alt: "diamond" },
    ];
  }, [rewardsData]);

  return (
    <div className="flex flex-col z-hud self-end md:-mr-2 sm:gap-2">
      {inventoryItems.map((item, index) => (
        <InventoryItem key={index} item={item} />
      ))}
    </div>
  );
};

interface InventoryItemProps {
  item: InventoryItem;
  isMinWidthNeeded?: boolean;
}

export const InventoryItem: React.FC<InventoryItemProps> = ({ item, isMinWidthNeeded = true }) => {
  const animatedCount = useAnimatedCount(item.count);

  return (
    <div className="flex items-center justify-end">
      <div className={`rounded-l-xl flex items-center justify-end py-1 sm:py-2 px-2 sm:px-4 border-l-2 sm:border-l-4 border-t-2 sm:border-t-4 border-b-2 sm:border-b-4 border-[#C599FFCF] bg-[#17082FB2] -mr-[5px] sm:-mr-[10px] ${isMinWidthNeeded ? 'min-w-[60px] sm:min-w-[100px]' : ""}`}>
        <p className="font-rajdhaniBold text-sm sm:text-lg md:text-xl lg:text-2xl text-white text-right">
          {animatedCount.toLocaleString()}
        </p>
      </div>
      <div className="rounded-full w-12 h-12 sm:w-16 sm:h-16 md:w-18 md:h-18 lg:w-20 lg:h-20 border-2 sm:border-4 border-[#C599FFCF] bg-[#17082f] flex items-center justify-center overflow-hidden flex-shrink-0">
        <img 
          src={item.image} 
          alt={item.alt} 
          className={`w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 object-contain ${item.alt === "diamond" ? "scale-[0.8]" : ""}`}
        />
      </div>
    </div>
  );
};

export default MeteorInventoryOnScreen;