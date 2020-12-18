import { useFetchEntity } from 'src/rtk/app/hooksCommon'
import { useAppSelector } from 'src/rtk/app/store'
import { CommonContent, HasId, PostId, PostStruct } from 'src/types'
import { upsertContent } from '../contents/contentsSlice'
import { removePost } from '../posts/postsSlice'
import { upsertReplyIdsByPostId, fetchPostReplyIds, SelectOnePostRepliesArgs, ReplyIdsByPostId, selectManyReplyIds, selectReplyIdsEntities } from './repliesSlice'
import { useActions } from 'src/rtk/app/helpers'
import { useCreateReloadPosts } from '../posts/postsHooks'

export const useFetchReplyIdsByPostId = (args: SelectOnePostRepliesArgs) => {
  return useFetchEntity(selectManyReplyIds, fetchPostReplyIds, args)
}

type UpsertReplyIdByPostIdProps = {
  parentId: PostId,
  replyId: PostId
}

export const useRemoveReply = () => {
  const replyIdsByParentId = useAppSelector(state => selectReplyIdsEntities(state))

  return useActions<UpsertReplyIdByPostIdProps>(({ dispatch, args: { replyId: idToRemove, parentId } }) => {
    const oldReplyIds = replyIdsByParentId[parentId]?.replyIds || []
    dispatch(removePost(idToRemove))
    upsertReplyIdsByPostId({
      replyIds: oldReplyIds.filter(replyId => replyId !== idToRemove),
      id: parentId
    })
  })
}

type UpsertReplies = {
  replyIds: ReplyIdsByPostId,
  rootPostId?: PostId
}

export const useUpsertReplies = () => {
  const replyIdsByParentId = useAppSelector(state => selectReplyIdsEntities(state))
  const reloadPosts = useCreateReloadPosts()

  return useActions<UpsertReplies>(async ({ 
    dispatch,
    args: { replyIds: { replyIds: newIds, id }, rootPostId }
  }) => {
    const oldReplyIds = replyIdsByParentId[id]?.replyIds || []
    const replyIds = Array.from(new Set(oldReplyIds.concat(newIds)))

    await reloadPosts({ ids: rootPostId ? [ ...newIds, rootPostId ] : newIds })
    dispatch(upsertReplyIdsByPostId({ replyIds, id }))
  })
}

type CommonReplyArgs = {
  parentId: PostId,
  reply: PostStruct
}

const setUpsertOneArgs = ({ parentId, reply }: CommonReplyArgs) => ({
  replies: [ reply ],
  replyIds: {
    id: parentId,
    replyIds: [ reply.id ]
  }
})

type ChangeRepliesArgs = CommonReplyArgs & {
  removableId: PostId,
  rootPostId: PostId
}

export const useChangeReplies = () => {
  const upsertReplies = useUpsertReplies()
  const removeReply = useRemoveReply()

  return ({ removableId, ...args }: ChangeRepliesArgs) => {
    const { parentId, rootPostId } = args

    if (!parentId) return 
    
    removeReply({ replyId: removableId, parentId })
    upsertReplies({ ...setUpsertOneArgs(args), rootPostId })
  }
}

const useUpsertContent = () => useActions<CommonContent & HasId>(({ dispatch, args }) => {
    dispatch(upsertContent(args))
})

type UpsertReplyWithContentArgs = Omit<CommonReplyArgs, 'parentId'> & {
  content?: CommonContent,
  parentId?: PostId
}

export const useUpsertReplyWithContent = () => {
  const upsertReplies = useUpsertReplies()
  const upsertContent = useUpsertContent()

  return ({ parentId, content, ...args }: UpsertReplyWithContentArgs) => {
    parentId && upsertReplies(setUpsertOneArgs({ ...args, parentId }))
    content && upsertContent({ id: args.reply.contentId!, ...content })
  }
}
