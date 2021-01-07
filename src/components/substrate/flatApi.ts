import {
  ProfileData,
  SpaceData,
  PostData,
  PostWithAllDetails,
  PostWithSomeDetails,
  AnyId,
  idToBn,
  idsToBns,
  convertToNewPostDataArray,
  convertToNewPostWithAllDetails,
  convertToNewPostWithAllDetailsArray,
  convertToNewSpaceData,
  convertToNewSpaceDataArray,
  convertToNewProfileData,
  convertToNewPostData,
  convertToNewPostWithSomeDetails,
  convertToNewPostWithSomeDetailsArray,
  convertToNewProfileDataArray,
} from 'src/types'
import { SubsocialApi } from '@subsocial/api/subsocial'
import { FindPostQuery, FindPostsQuery, FindPostsWithDetailsQuery, FindSpaceQuery } from '@subsocial/api/utils/types'
import { AnyAccountId } from '@subsocial/types'

export type FlatSubsocialApi = {
  findProfile: (id: AnyAccountId) => Promise<ProfileData | undefined>
  findProfiles: (ids: AnyAccountId[]) => Promise<ProfileData[]>

  findSpace: (query: FindSpaceQuery) => Promise<SpaceData | undefined>
  findPublicSpaces: (ids: AnyId[]) => Promise<SpaceData[]>
  findUnlistedSpaces: (ids: AnyId[]) => Promise<SpaceData[]>

  findPost: (query: FindPostQuery) => Promise<PostData | undefined>
  findPublicPosts: (ids: AnyId[]) => Promise<PostData[]>
  findPostWithSomeDetails: (query: FindPostQuery) => Promise<PostWithSomeDetails | undefined>
  findPostWithAllDetails: (id: AnyId) => Promise<PostWithAllDetails | undefined>
  findPostsWithAllDetails: (query: FindPostsQuery) => Promise<PostWithAllDetails[]>
  findPublicPostsWithSomeDetails: (query: FindPostsWithDetailsQuery) => Promise<PostWithSomeDetails[]>
  findPublicPostsWithAllDetails: (ids: AnyId[]) => Promise<PostWithAllDetails[]>
  findUnlistedPostsWithAllDetails: (ids: AnyId[]) => Promise<PostWithAllDetails[]>
}

export function newFlatApi (subsocial: SubsocialApi): FlatSubsocialApi {
  return {

    findProfile: async (id) => {
      const old = await subsocial.findProfile(id)
      return !old ? old : convertToNewProfileData(old)
    },

    findProfiles: async (ids) => {
      return convertToNewProfileDataArray(
        await subsocial.findProfiles(ids)
      )
    },

    findSpace: async (query) => {
      const old = await subsocial.findSpace(query)
      return !old ? old: convertToNewSpaceData(old)
    },

    findPublicSpaces: async (ids) => {
      return convertToNewSpaceDataArray(
        await subsocial.findPublicSpaces(idsToBns(ids))
      )
    },

    findUnlistedSpaces: async (ids) => {
      return convertToNewSpaceDataArray(
        await subsocial.findUnlistedSpaces(idsToBns(ids))
      )
    },

    findPost: async (query) => {
      const old = await subsocial.findPost(query)
      return !old ? old: convertToNewPostData(old)
    },

    findPublicPosts: async (ids) => {
      return convertToNewPostDataArray(
        await subsocial.findPublicPosts(idsToBns(ids))
      )
    },

    findPostWithSomeDetails: async (query) => {
      return convertToNewPostWithSomeDetails(
        await subsocial.findPostWithSomeDetails(query)
      )
    },

    findPostWithAllDetails: async (id) => {
      return convertToNewPostWithAllDetails(
        await subsocial.findPostWithAllDetails(idToBn(id))
      )
    },

    findPostsWithAllDetails: async (query) => {
      return convertToNewPostWithAllDetailsArray(
        await subsocial.findPostsWithAllDetails(query)
      )
    },

    findPublicPostsWithSomeDetails: async (query) => {
      return convertToNewPostWithSomeDetailsArray(
        await subsocial.findPublicPostsWithSomeDetails(query)
      )
    },

    findPublicPostsWithAllDetails: async (ids) => {
      return convertToNewPostWithAllDetailsArray(
        await subsocial.findPublicPostsWithAllDetails(idsToBns(ids))
      )
    },

    findUnlistedPostsWithAllDetails: async (ids) => {
      return convertToNewPostWithAllDetailsArray(
        await subsocial.findUnlistedPostsWithAllDetails(idsToBns(ids))
      )
    },
  }
}