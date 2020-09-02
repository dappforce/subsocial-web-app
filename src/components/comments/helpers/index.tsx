import React from 'react';
import { HiddenPostAlert } from 'src/components/posts/view-post';
import { DfMd } from 'src/components/utils/DfMd';
import { CommentData } from '@subsocial/types/dto'
import styles from './index.module.sass'
import { HasPostId } from 'src/components/utils/urls';

type CommentBodyProps = {
  comment: CommentData
}

export const CommentBody = ({ comment: { struct, content } }: CommentBodyProps) => {
  return <div className={styles.BumbleContent}>
    <HiddenPostAlert post={struct} className={styles.DfCommentAlert} preview />
    <DfMd source={content?.body} />
  </div>
}

const FAKE = 'fake'

export const isFakeId = (comment: HasPostId) => comment.id.toString().startsWith(FAKE)
