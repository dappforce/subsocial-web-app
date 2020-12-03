import { CommonContent } from '@subsocial/types'
import { Dispatch } from 'react'
import { useDispatch } from 'react-redux'
import { RootState } from 'src/rtk/app/rootReducer'
import { useAppSelector } from 'src/rtk/app/store'
import { HasId, PostId, PostStruct, ReplyIdsByPostId } from 'src/types'
import { upsetContent } from '../contents/contentsSlice'
import { useFetchPosts } from '../posts/postsHooks'
import { removePost, upsertPosts } from '../posts/postsSlice'
import { selectReplyIdsByParentId, upsertReplyIdsByPostId } from './repliesSlice'

type CommonDispatchCallbackProps<T> = { dispatch: Dispatch<any>, args: T }

type CommonDispatchCallbackFn<T> = (props: CommonDispatchCallbackProps<T>) => void 


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
  const replyIdsByPostId = selectReplyIdsByParentId(state, parentId)

  if (!replyIdsByPostId) return
  const { id, replyIds } = replyIdsByPostId

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
  replyIdsByPostId: ReplyIdsByPostId,
  replies: PostStruct[]
}

export const useUpsertReplies = () => useActions<UpsertReplies>(({ 
  dispatch,
  args: { replies, replyIdsByPostId }
}) => {
  dispatch(upsertPosts(replies))
  dispatch(upsertReplyIdsByPostId(replyIdsByPostId))
})

type CommonReplyArgs = {
  parentId: PostId,
  reply: PostStruct
}

const setUpsetOneArgs = ({ parentId, reply }: CommonReplyArgs) => ({
  replies: [ reply ],
  replyIdsByPostId: {
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
    upsertReplies(setUpsetOneArgs(args))
  }
}

const useUpsetContent = () => useActions<CommonContent & HasId>(({ dispatch, args }) => {
    dispatch(upsetContent(args))
})

type UpsetReplyWithContentArgs = Omit<CommonReplyArgs, 'parentId'> & {
  content: CommonContent,
  parentId?: PostId
}

export const useUpsetReplyWithContent = () => {
  const upsertReplies = useUpsertReplies()
  const upsetContent = useUpsetContent()

  return ({ parentId, ...args }: UpsetReplyWithContentArgs) => {
    parentId && upsertReplies(setUpsetOneArgs({ ...args, parentId }))
    upsetContent({ id: args.reply.id, ...args.content })
  }
}

export const useGetRepliesByParentId = (parentId: PostId) => {
  const replyIdsStruct = useAppSelector((state) => selectReplyIdsByParentId(state, parentId))
  const ids = replyIdsStruct?.replyIds || []
  return useFetchPosts({ ids })  
}