import { IpfsData, Activity } from '../types';
import axios from 'axios';

export const baseUrl = (process.env.OFFCHAIN_URL || 'http://localbaseUrl:3001') + '/v1';

export async function addJsonToIpfs (ipfsData: IpfsData): Promise<string> {
  const res = await axios.post(`${baseUrl}/ipfs/add`, ipfsData);
  const { data } = res;
  return data as string;
}

export async function removeFromIpfs (hash: string) {
  await axios.post(`${baseUrl}/ipfs/remove/${hash}`);
}

export async function getJsonFromIpfs<T extends IpfsData> (hash: string): Promise<T> {
  const res = await axios.get(`${baseUrl}/ipfs/get/${hash}`);
  const { data } = res;
  return data as T;
}

export const getNewsFeed = async (myAddress: string, offset: number, limit: number): Promise<Activity[]> => {
  const res = await axios.get(`${baseUrl}/offchain/feed/${myAddress}?offset=${offset}&limit=${limit}`);
  const { data } = res;
  return data;
};

export const getNotifications = async (myAddress: string, offset: number, limit: number): Promise<Activity[]> => {
  const res = await axios.get(`${baseUrl}/offchain/notifications/${myAddress}?offset=${offset}&limit=${limit}`);
  const { data } = res;
  return data;
};
