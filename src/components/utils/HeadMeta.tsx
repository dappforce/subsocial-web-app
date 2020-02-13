import React from 'react';
import Head from 'next/head';
import { isEmptyStr } from '.';

type HeadMetaProps = {
  title: string,
  desc?: string,
  image?: string
};

// Google typically displays the first 50–60 characters of a title tag.
// If you keep your titles under 60 characters, our research suggests
// that you can expect about 90% of your titles to display properly.
const MAX_TITLE_LEN = 45;

const SITE_NAME = 'Subsocial Network';

const DEFAULT_TITLE = 'Subsocial - Protocol for decentralized social networks';

const DEFAULT_DESC = ''; // TODO create default description

export const createTitle = (title: string) => {
  if (isEmptyStr(title)) {
    return DEFAULT_TITLE;
  }

  return `${title.length <= MAX_TITLE_LEN ? title : title.substr(0, MAX_TITLE_LEN)} - Subsocial`;
};

export function HeadMeta (props: HeadMetaProps) {
  const { title, desc = DEFAULT_DESC, image = 'public/subsocial-logo.png' } = props;
  return <div>
    <Head>
      <title>{createTitle(title)}</title>
      <meta property='og:site_name' content={SITE_NAME} />
      <meta property='og:image' content={image} />
      <meta property='og:title' content={title} />
      <meta property='og:description' content={desc} />
      <meta name='twitter:site' content={SITE_NAME} />
      <meta name='twitter:image' content={image} />
      <meta name='twitter:title' content={title} />
      <meta name='twitter:description' content={desc} />
    </Head>
  </div>;
}

export default HeadMeta;
