import { IpfsData, Activity } from '../types';
import axios from 'axios';
import { IpfsHash } from '@subsocial/types/interfaces/runtime';
import { getEnv } from './utils';

const createUrl = (url: string) => (getEnv(url) || 'http://localhost:3001') + '/v1';

export const offchainUrl = createUrl('OFFCHAIN_URL');
export const ipfsUrl = createUrl('IPFS_URL');

export async function addJsonToIpfs (ipfsData: IpfsData): Promise<string> {
  const res = await axios.post(`${ipfsUrl}/ipfs/add`, ipfsData);
  const { data } = res;
  return data as string;
}

export async function removeFromIpfs (hash: string) {
  await axios.post(`${ipfsUrl}/ipfs/remove/${hash}`);
}

export async function getJsonFromIpfs<T extends IpfsData> (hash: string | IpfsHash): Promise<T> {
  const res = await axios.get(`${ipfsUrl}/ipfs/get/${hash}`);
  const { data } = res;
  return data as T;
}

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
