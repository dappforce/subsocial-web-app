import React, { useState } from 'react'
import { MutedSpan } from '../utils/MutedText'
import { PostVoters, ActiveVoters } from '../voting/ListVoters'
import { Pluralize } from '../utils/Plularize'
import { nonEmptyStr } from '@subsocial/utils'
import { idToBn, PostStruct } from 'src/types'

type StatsProps = {
  post: PostStruct
  goToCommentsId?: string
};

export const StatsPanel = (props: StatsProps) => {
  const { post, goToCommentsId } = props

  const [ commentsSection, setCommentsSection ] = useState(false)
  const [ postVotersOpen, setPostVotersOpen ] = useState(false)

  const { upvotesCount, downvotesCount, repliesCount, sharesCount, score, id } = post
  const reactionsCount = upvotesCount - downvotesCount
  const showReactionsModal = () => reactionsCount && setPostVotersOpen(true)

  const toggleCommentsSection = goToCommentsId ? undefined : () => setCommentsSection(!commentsSection)
  const comments = <Pluralize count={repliesCount} singularText='Comment' />

  return <>
    <div className='DfCountsPreview'>
      <MutedSpan className={reactionsCount ? '' : 'disable'}>
        <span className='DfBlackLink' onClick={showReactionsModal}>
          <Pluralize count={reactionsCount} singularText='Reaction' />
        </span>
      </MutedSpan>
      <MutedSpan>
        {nonEmptyStr(goToCommentsId)
          ? <a className='DfBlackLink' href={'#' + goToCommentsId}>{comments}</a>
          : <span onClick={toggleCommentsSection}>{comments}</span>
        }
      </MutedSpan>
      <MutedSpan><Pluralize count={sharesCount} singularText='Share' /></MutedSpan>
      <MutedSpan><Pluralize count={score} singularText='Point' /></MutedSpan>
    </div>
    <PostVoters
      id={idToBn(id)}
      active={ActiveVoters.All}
      open={postVotersOpen}
      close={() => setPostVotersOpen(false)}
    />
  </>
}

