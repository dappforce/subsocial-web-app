import axios from 'axios';
import { offchainUrl } from './env';
import { Activity } from '@subsocial/types/offchain';
import { newLogger } from '@subsocial/utils';

const log = newLogger('OffchainRequests')

function getOffchainUrl (subUrl: string): string {
  return `${offchainUrl}/v1/offchain${subUrl}`
}

const createActivitiesUrlByAddress = (address: string, entity: 'feed' | 'notifications') =>
  getOffchainUrl(`/${entity}/${address}`)

const createNotificationsUrlByAddress = (address: string) => createActivitiesUrlByAddress(address, 'notifications')
const createFeedUrlByAddress = (address: string) => createActivitiesUrlByAddress(address, 'feed')

const axiosRequest = async (url: string) => {
  try {
    const res = await axios.get(url);
    if (res.status !== 200) {
      log.error('Failed request to offchain with status', res.status)
    }

    return res;
  } catch (err) {
      log.error('Failed request to offchain with error', err)
      return err
  }
}

const getActivity = async (url: string): Promise<Activity[]> => {
  try {
    const res = await axiosRequest(url)
    const { data } = res
    return data
  } catch (err) {
    log.error('Failed get activities from offchain with error', err)
    return []
  }
}

const getCount = async (url: string): Promise<number> => {
  try {
    const res = await axiosRequest(url)
    const { data } = res
    return data
  } catch (err) {
    log.error('Failed get count of activities from offchain with error', err)
    return 0
  }
}

export const getNewsFeed = async (myAddress: string, offset: number, limit: number): Promise<Activity[]> =>
  getActivity(`${createFeedUrlByAddress(myAddress)}?offset=${offset}&limit=${limit}`)

export const getNotifications = async (myAddress: string, offset: number, limit: number): Promise<Activity[]> =>
  getActivity(`${createNotificationsUrlByAddress(myAddress)}?offset=${offset}&limit=${limit}`)

export const getFeedCount = async (myAddress: string) =>
  getCount(`${createFeedUrlByAddress(myAddress)}/count`)

export const getNotificationsCount = async (myAddress: string) =>
  getCount(`${createNotificationsUrlByAddress(myAddress)}/count`)


// TODO require refactor
export const clearNotifications = async (myAddress: string): Promise<void> =>{
  try {
    const res = await axios.post(getOffchainUrl(`/notifications/${myAddress}/readAll`));
    if (res.status !== 200) {
      console.warn('Failed to mark all notifications as read for account:', myAddress, 'res.status:', res.status)
    }
  } catch (err) {
    console.log(`Failed to mark all notifications as read for account: ${myAddress}`, err)
  }
};
