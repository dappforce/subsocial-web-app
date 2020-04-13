import axios from 'axios';
import { getEnv } from './utils';
import { Activity } from '@subsocial/types/offchain';

export const offchainUrl = getEnv('OFFCHAIN_URL') || 'http://localhost:3001';
export const ipfsUrl = getEnv('IPFS_URL') || '/ip4/127.0.0.1/tcp/5001/http';
export const offchainWs = getEnv('OFFCHAIN_WS')

function getOffchainUrl (subUrl: string): string {
  return `${offchainUrl}/v1/offchain${subUrl}`
}

export const getNewsFeed = async (myAddress: string, offset: number, limit: number): Promise<Activity[]> => {
  const res = await axios.get(getOffchainUrl(`/feed/${myAddress}?offset=${offset}&limit=${limit}`));
  const { data } = res;
  return data;
};

export const getNotifications = async (myAddress: string, offset: number, limit: number): Promise<Activity[]> => {
  const res = await axios.get(getOffchainUrl(`/notifications/${myAddress}?offset=${offset}&limit=${limit}`));
  const { data } = res;
  return data;
};

export const clearNotifications = async (myAddress: string): Promise<void> => {
  try {
    const res = await axios.post(getOffchainUrl(`/notifications/${myAddress}/readAll`));

    if (res.status !== 200) {
      console.warn('Failed to mark all notifications as read for account:', myAddress, 'res.status:', res.status)
    }
  } catch (err) {
    console.log(`Failed to mark all notifications as read for account: ${myAddress}`, err)
  }
};
