import { CommonContent } from '@subsocial/types'
import { Dispatch } from 'react'
import { useDispatch } from 'react-redux'
import { useFetchEntity } from 'src/rtk/app/hooksCommon'
import { RootState } from 'src/rtk/app/rootReducer'
import { useAppSelector } from 'src/rtk/app/store'
import { HasId, PostId, PostStruct } from 'src/types'
import { upsetContent } from '../contents/contentsSlice'
import { useFetchPosts } from '../posts/postsHooks'
import { removePost, upsertPosts } from '../posts/postsSlice'
import { selectReplyIds, upsertReplyIdsByPostId, fetchManyReplyIds, SelectOneReplyIdsArgs, ReplyIdsByPostId, selectManyReplyIds } from './repliesSlice'

type CommonDispatchCallbackProps<T> = { dispatch: Dispatch<any>, args: T }

type CommonDispatchCallbackFn<T> = (props: CommonDispatchCallbackProps<T>) => void 

export const useFetchReplyIdsByPostId = (args: SelectOneReplyIdsArgs) => {
  return useFetchEntity(selectManyReplyIds, fetchManyReplyIds, args)
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

const setUpsetOneArgs = ({ parentId, reply }: CommonReplyArgs) => ({
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

export const useFetchRepliesByParentId = (parentId: PostId) => {
  const { entity, error: error1, loading: loading1 } = useFetchReplyIdsByPostId({ id: parentId })
  const ids = entity ? [ ...entity.replyIds ] : []
  console.log('ReplyIds', ids)
  const { entities: replies, error: error2, loading: loading2 } = useFetchPosts({ ids }) 

  return {
    replies: replies,
    loading: loading2 || loading1,
    error: error2 || error1
   }
}