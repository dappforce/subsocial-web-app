import axios from 'axios';
import { getEnv } from './utils';
import { SubsocialIpfsApi } from '@subsocial/api/ipfs';
import { Activity } from '@subsocial/types/offchain';

export const offchainUrl = getEnv('OFFCHAIN_URL') || 'http://localhost:3001';
export const ipfsUrl = getEnv('IPFS_URL') || '/ip4/127.0.0.1/tcp/5002/http';
export const ipfs = new SubsocialIpfsApi(ipfsUrl);

export const getNewsFeed = async (myAddress: string, offset: number, limit: number): Promise<Activity[]> => {
  const res = await axios.get(`${offchainUrl}/offchain/feed/${myAddress}?offset=${offset}&limit=${limit}`);
  const { data } = res;
  return data;
};

export const getNotifications = async (myAddress: string, offset: number, limit: number): Promise<Activity[]> => {
  const res = await axios.get(`${offchainUrl}/offchain/notifications/${myAddress}?offset=${offset}&limit=${limit}`);
  const { data } = res;
  return data;
};
