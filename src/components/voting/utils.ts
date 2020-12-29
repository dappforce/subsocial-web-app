import { Reaction } from 'src/rtk/features/reactions/myPostReactionsSlice'
import { PostStruct, ReactionType } from 'src/types'

type Props = {
  post: PostStruct,
  oldReaction?: Reaction,
  newKind: ReactionType
}

export const getPostStructWithUpdatedCounts = ({ post, newKind, oldReaction }: Props) => {
  let { upvotesCount, downvotesCount } = post
  const { reactionId, kind: oldKind } = oldReaction || {} as Reaction

  const noOldReaction = !reactionId
  const isNewKindUpvote = newKind === 'Upvote'

  if (noOldReaction) {
    isNewKindUpvote
      ? upvotesCount++
      : downvotesCount++
  } else if (oldKind === newKind) {
    isNewKindUpvote
      ? upvotesCount--
      : downvotesCount--
  } else {
    if (isNewKindUpvote) {
      upvotesCount++
      downvotesCount--
    } else {
      upvotesCount--
      downvotesCount++
    }
  }

  return { ...post, upvotesCount, downvotesCount }
}