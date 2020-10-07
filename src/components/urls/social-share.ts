const SUBSOCIAL_TAG = 'subsocial'

const subsocialUrl = (url: string) => `${window.location.origin}${url}`

export const twitterShareUrl =
  (
    url: string,
    text?: string
  ) => {
    const textVal = text ? `text=${text}` : ''

    return `https://twitter.com/intent/tweet?${textVal}&url=${subsocialUrl(url)}&hashtags=${SUBSOCIAL_TAG}&original_referer=${url}`
  }

export const linkedInShareUrl =
  (
    url: string,
    title?: string,
    summary?: string
  ) => {
    const titleVal = title ? `title=${title}` : ''
    const summaryVal = summary ? `summary=${summary}` : ''

    return `https://www.linkedin.com/shareArticle?mini=true&url=${subsocialUrl(url)}&${titleVal}&${summaryVal}`
  }

export const facebookShareUrl = (url: string) => `https://www.facebook.com/sharer/sharer.php?u=${subsocialUrl(url)}`

export const redditShareUrl =
  (
    url: string,
    title?: string
  ) => {
    const titleVal = title ? `title=${title}` : ''

    return `http://www.reddit.com/submit?url=${subsocialUrl(url)}&${titleVal}`
  }

export const copyUrl = (url: string) => subsocialUrl(url)
