import axios from 'axios';
import { offchainUrl } from './env';
import { Activity } from '@subsocial/types/offchain';
import { newLogger, nonEmptyStr } from '@subsocial/utils';

const log = newLogger('OffchainRequests')

function getOffchainUrl (subUrl: string): string {
  return `${offchainUrl}/v1/offchain${subUrl}`
}

const createActivitiesUrlByAddress = (address: string, entity: 'feed' | 'notifications' | 'activity') =>
  getOffchainUrl(`/${entity}/${address}`)

type ActivityType = 'follows' | 'posts' | 'comments' | 'reactions' | 'spaces'

const createNotificationsUrlByAddress = (address: string) => createActivitiesUrlByAddress(address, 'notifications')
const createFeedUrlByAddress = (address: string) => createActivitiesUrlByAddress(address, 'feed')
const createActivityUrlByAddress = (address: string, activityType?: ActivityType) => {
  const type = nonEmptyStr(activityType) ? `/${activityType}` : ''
  return `${createActivitiesUrlByAddress(address, 'activity')}${type}`
}

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

const getActivity = async (url: string, offset: number, limit: number): Promise<Activity[]> => {
  try {
    const res = await axiosRequest(`${url}?offset=${offset}&limit=${limit}`)
    const { data } = res
    return data
  } catch (err) {
    log.error('Failed get activities from offchain with error', err)
    return []
  }
}

const getCount = async (url: string): Promise<number> => {
  try {
    const res = await axiosRequest(`${url}/count`)
    const { data } = res
    return data
  } catch (err) {
    log.error('Failed get count of activities from offchain with error', err)
    return 0
  }
}

export const getNewsFeed = async (myAddress: string, offset: number, limit: number): Promise<Activity[]> =>
  getActivity(createFeedUrlByAddress(myAddress), offset, limit)
export const getFeedCount = async (myAddress: string) =>
  getCount(createFeedUrlByAddress(myAddress))

export const getNotifications = async (myAddress: string, offset: number, limit: number): Promise<Activity[]> =>
  getActivity(createNotificationsUrlByAddress(myAddress), offset, limit)
export const getNotificationsCount = async (myAddress: string) =>
  getCount(createNotificationsUrlByAddress(myAddress))

export const getActivities = async (myAddress: string, offset: number, limit: number): Promise<Activity[]> =>
  getActivity(createActivityUrlByAddress(myAddress), offset, limit)
export const getActivitiesCount = async (myAddress: string) =>
  getCount(createActivityUrlByAddress(myAddress))

export const getCommentActivities = async (myAddress: string, offset: number, limit: number): Promise<Activity[]> =>
  getActivity(createActivityUrlByAddress(myAddress, 'comments'), offset, limit)
export const getCommentActivitiesCount = async (myAddress: string) =>
  getCount(createActivityUrlByAddress(myAddress, 'comments'))

export const getPostActivities = async (myAddress: string, offset: number, limit: number): Promise<Activity[]> =>
  getActivity(createActivityUrlByAddress(myAddress, 'posts'), offset, limit)
export const getPostActivitiesCount = async (myAddress: string) =>
  getCount(createActivityUrlByAddress(myAddress, 'posts'))

export const getReactionActivities = async (myAddress: string, offset: number, limit: number): Promise<Activity[]> =>
  getActivity(createActivityUrlByAddress(myAddress, 'reactions'), offset, limit)
export const getReactionActivitiesCount = async (myAddress: string) =>
  getCount(createActivityUrlByAddress(myAddress, 'reactions'))

export const getFollowActivities = async (myAddress: string, offset: number, limit: number): Promise<Activity[]> =>
  getActivity(createActivityUrlByAddress(myAddress, 'follows'), offset, limit)
export const getFollowActivitiesCount = async (myAddress: string) =>
  getCount(createActivityUrlByAddress(myAddress, 'follows'))

export const getSpaceActivities = async (myAddress: string, offset: number, limit: number): Promise<Activity[]> =>
  getActivity(createActivityUrlByAddress(myAddress, 'spaces'), offset, limit)
export const getSpaceActivitiesCount = async (myAddress: string) =>
  getCount(createActivityUrlByAddress(myAddress, 'spaces'))

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
