import axios from 'axios';
import { offchainUrl } from './env';
import { Activity } from '@subsocial/types/offchain';

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

export const saveFile = async (file: File | Blob) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await axios.post(`${offchainUrl}/v1/ipfs/addFile`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  const { data } = res
  return data
}
