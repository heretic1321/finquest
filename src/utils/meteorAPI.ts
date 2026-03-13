import axios from 'axios';
import { BackendClient } from './axios';
import { api } from './api';

export type UserMeteorState = {
  mobile: string;
  name: string;
  gold: number;
  silver: number;
  diamond: number;
}
export type MeteorResource =
{
  silver: number;
  gold: number;
  diamond: number;
}


export type MeteorReward = {
  _id: string;
  name: string;
  image: string;
  description: string;
  cost: {
    gold: number;
    silver: number;
    diamond: number;
  };
  is_redeemable: boolean;
}

export const getMeteorDataForThisUser = async (mobileNumber: string, name: string): Promise<UserMeteorState> => {
  try {
    const response = await BackendClient.get<UserMeteorState>(api.meteor.getUserData, {
      params: { mobile: mobileNumber, name: name }
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        console.warn(`User with mobile number ${mobileNumber} and name ${name} not found. A new entry will be created.`);
        // The backend will create a new entry, so we can just return the response data
        return error.response.data;
      }
      console.error('Error fetching meteor data:', error.response?.data);
    } else {
      console.error('Unexpected error:', error);
    }
    throw error;
  }
}


export const sendRewardsData = async (encryptedData: string): Promise<{ data: string }> => {
  try {
    const response = await BackendClient.post<{ data: string }>(api.meteor.pushUserData, { data: encryptedData });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error sending rewards data:', error.response?.data);
    } else {
      console.error('Unexpected error sending rewards data:', error);
    }
    throw error;
  }
}

export const redeemReward = async (mobileNumber: string, rewardId: string): Promise<{ success: boolean; message: string; newBalance?: { gold: number; silver: number; diamond: number } }> => {
  try {
    const response = await BackendClient.post(api.meteor.redeem, { mobileNumber, rewardId });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error redeeming reward:', error.response?.data);
      return { success: false, message: error.response?.data.message || 'An error occurred while redeeming the reward.' };
    } else {
      console.error('Unexpected error redeeming reward:', error);
      return { success: false, message: 'An unexpected error occurred.' };
    }
  }
}

export const getMeteorRewards = async (mobileNumber: string): Promise<MeteorReward[]> => {
  try {
    const response = await BackendClient.get<{ rewards: MeteorReward[] }>(api.meteor.getAllRewards, {
      params: { mobile: mobileNumber }
    });
    return response.data.rewards;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error fetching meteor rewards:', error.response?.data);
    } else {
      console.error('Unexpected error fetching meteor rewards:', error);
    }
    throw error;
  }
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  value: number;
}

export interface LeaderboardData {
  topMiners: LeaderboardEntry[];
  mostRewardsRedeemed: LeaderboardEntry[];
}

export const getLeaderboard = async (): Promise<LeaderboardData> => {
  try {
    const response = await BackendClient.get<LeaderboardData>(api.meteor.getLeaderboard);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error fetching leaderboard data:', error.response?.data);
    } else {
      console.error('Unexpected error fetching leaderboard data:', error);
    }
    throw error;
  }
}
