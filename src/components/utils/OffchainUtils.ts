import { IpfsData, Activity } from '../types';
import axios from 'axios';
import { getEnv } from './utils';

const createUrl = (varName: string, defaultUrl: string = 'http://localhost:3001') => (getEnv(varName) || defaultUrl) + '/v1';

export const offchainUrl = createUrl('OFFCHAIN_URL');
export const ipfsUrl = createUrl('IPFS_URL', getEnv('OFFCHAIN_URL'));

export async function addJsonToIpfs (ipfsData: IpfsData): Promise<string> {
  const res = await axios.post(`${ipfsUrl}/ipfs/add`, ipfsData);
  const { data } = res;
  return data as string;
}

export async function removeFromIpfs (hash: string) {
  await axios.post(`${ipfsUrl}/ipfs/remove/${hash}`);
}

export async function getJsonFromIpfs<T extends IpfsData> (hash: string): Promise<T> {
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
