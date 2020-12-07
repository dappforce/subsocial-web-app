import { CommonContent } from '@subsocial/types'
import { Dispatch } from 'react'
import { useDispatch } from 'react-redux'
import { useFetchEntity } from 'src/rtk/app/hooksCommon'
import { RootState } from 'src/rtk/app/rootReducer'
import { useAppSelector } from 'src/rtk/app/store'
import { HasId, PostId, PostStruct } from 'src/types'
import { upsertContent } from '../contents/contentsSlice'
import { removePost, upsertPosts } from '../posts/postsSlice'
import { selectReplyIds, upsertReplyIdsByPostId, fetchPostReplyIds, SelectOnePostRepliesArgs, ReplyIdsByPostId, selectManyReplyIds } from './repliesSlice'

type CommonDispatchCallbackProps<T> = { dispatch: Dispatch<any>, args: T }

type CommonDispatchCallbackFn<T> = (props: CommonDispatchCallbackProps<T>) => void 

export const useFetchReplyIdsByPostId = (args: SelectOnePostRepliesArgs) => {
  return useFetchEntity(selectManyReplyIds, fetchPostReplyIds, args)
}

// ? Change cb on actions[]. And use actions.forEach(action => dispatch(action))
export const useActions = <T>(cb: CommonDispatchCallbackFn<T>) => {
  const dispatch = useDispatch()

  return (args: T) => cb({ dispatch, args })
}

type UpsertReplyIdByPostIdProps = {
  parentId: PostId,
  replyId: PostId
}

const removeReplyIdByPostId = (state: RootState, { parentId, replyId: replyIdToRemove }: UpsertReplyIdByPostIdProps) => {
  const res = selectReplyIds(state, parentId)

  if (!res) return
  const { id, replyIds } = res

  return upsertReplyIdsByPostId({
    replyIds: replyIds.filter(replyId => replyId !== replyIdToRemove),
    id
  })
}

export const useRemoveReply = () => {
  const state = useAppSelector((state) => state)

  return useActions<UpsertReplyIdByPostIdProps>(({ dispatch, args }) => {
    dispatch(removePost(args.replyId))
    dispatch(removeReplyIdByPostId(state, args))
  })
}

type UpsertReplies = {
  replyIds: ReplyIdsByPostId,
  replies: PostStruct[]
}

export const useUpsertReplies = () => useActions<UpsertReplies>(({ 
  dispatch,
  args: { replies, replyIds }
}) => {
  dispatch(upsertPosts(replies))
  dispatch(upsertReplyIdsByPostId(replyIds))
})

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
  removableId: PostId
}

export const useChangeReplies = () => {
  const upsertReplies = useUpsertReplies()
  const removeReply = useRemoveReply()

  return ({ removableId, ...args }: ChangeRepliesArgs) => {
    const { parentId } = args

    if (!parentId) return 
    
    removeReply({ replyId: removableId, parentId })
    upsertReplies(setUpsertOneArgs(args))
  }
}

const useUpsertContent = () => useActions<CommonContent & HasId>(({ dispatch, args }) => {
    dispatch(upsertContent(args))
})

type UpsertReplyWithContentArgs = Omit<CommonReplyArgs, 'parentId'> & {
  content: CommonContent,
  parentId?: PostId
}

export const useUpsertReplyWithContent = () => {
  const upsertReplies = useUpsertReplies()
  const upsertContent = useUpsertContent()

  return ({ parentId, ...args }: UpsertReplyWithContentArgs) => {
    parentId && upsertReplies(setUpsertOneArgs({ ...args, parentId }))
    upsertContent({ id: args.reply.id, ...args.content })
  }
}
