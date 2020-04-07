import axios from 'axios'

import $ from 'jquery'

import { nonEmptyStr } from './index'

type ParsedSite = {
  ok: boolean,
  url?: string,
  siteMeta?: Meta,
  error?: string
}

export const tempParser = async (url: string) => {

  const data = await axios.get(url)

  console.log('data parseSiteWithRequest instance:', data)
  return data
}

export function parseSiteWithRequest (url: string): Promise<ParsedSite> {
  return new Promise(() => {
    console.log(`\nRequest site at URL: ${url}`);

  });
}

type Meta = {
  title?: string,
  description?: string,
  author?: string,
  fb?: Fb,
  og: Og,
  twitter?: Twitter,
  keywords?: string[]
}

type Fb = {
  appId?: string
}

type Og = {
  title?: string,
  description?: string,
  image?: string,
  url?: string,
  type?: string,
  updated_time?: string
}

type Twitter = {
  title?: string,
  description?: string,
  image?: string,
  creator?: string
}

function parseSiteHtml (url: string, html: string) {
  console.log(url)

  const meta: Meta = {
    fb: {},
    og: {},
    twitter: {}
  };

  setPrettyString(meta, 'title', () => $('title').text());
  setPrettyString(meta, 'description', () => $('meta[name="description"]').attr('content'));
  setPrettyString(meta, 'author', () => $('meta[name="author"]').attr('content'));

  setPrettyString(meta.og, 'title', () => $('meta[property="og:title"]').attr('content'));
  setPrettyString(meta.og, 'description', () => $('meta[property="og:description"]').attr('content'));
  setPrettyString(meta.og, 'image', () => $('meta[property="og:image"]').attr('content'));
  setPrettyString(meta.og, 'type', () => $('meta[property="og:type"]').attr('content'));
  setPrettyString(meta.og, 'url', () => $('meta[property="og:url"]').attr('content'));
  setPrettyString(meta.og, 'updated_time', () => $('meta[property="og:updated_time"]').attr('content'));

  setPrettyString(meta.fb as Fb, 'appId', () => $('meta[property="fb:app_id"]').attr('content'));

  setPrettyString(meta.twitter as Twitter, 'title', () => $('meta[property="twitter:title"]').attr('content'));
  setPrettyString(meta.twitter as Twitter, 'description', () => $('meta[property="twitter:description"]').attr('content'));
  setPrettyString(meta.twitter as Twitter, 'image', () => $('meta[property="twitter:image"]').attr('content'));
  setPrettyString(meta.twitter as Twitter, 'creator', () => $('meta[property="twitter:creator"]').attr('content'));

  const kws = getPrettyString(() => $('meta[name="keywords"]').attr('content'));
  if (typeof kws !== 'undefined' && kws.length > 0) {
    meta.keywords = kws.split(',').map((kw: string) => getPrettyString(() => kw)) as string[];
  }

  deleteEmptyKeys(meta);

  return meta;
}

function deleteEmptyKeys (obj: Meta) {
  Object.keys(obj).forEach(k => {
    const v = obj[k];
    if (typeof v === 'object' && Object.keys(v).length === 0) {
      delete obj[k];
    }
  });
}

function getPrettyString (getStringFn: () => string | undefined) {
  let prettyVal;
  try {
    const value = getStringFn();
    if (value && nonEmptyStr(value)) {
      prettyVal = value
        .replace(/(\n|\r|\r\n)+/, ' ')
        .replace(/[ ]+/, ' ')
        .trim()
      ;
      if (prettyVal === '') {
        prettyVal = undefined;
      }
    }
  } catch (e) {}
  return prettyVal;
}

function setPrettyString (obj: Og | Fb | Twitter, propName: string, getValueFn: () => string | undefined) {
  const value = getPrettyString(getValueFn);
  if (typeof value !== 'undefined') {
    obj[propName] = value;
  }
}

type PressMeta = {
  generated: boolean,
  url: string,
  title: string,
  desc: string,
  image: string,
  date: string,
  author: string
}

export default function parse (siteUrls: string[]) {

  const parseSitePromises: ParsedSite[] = []
  siteUrls = siteUrls.map(x => nonEmptyStr(x) ? x.trim() : x)
  siteUrls.forEach(async (pressUrl: string) => {
    if (nonEmptyStr(pressUrl)) {
      parseSitePromises.push(await parseSiteWithRequest(pressUrl));
    }
  });

  return Promise.all(parseSitePromises)
    .then(results => {
      // console.log(`Press mentions parser: Promise results`, results);

      const urlToMetaMap = new Map();
      results.forEach(({ url, siteMeta }) => {
        urlToMetaMap.set(url, siteMeta);
      });

      const parsedPress: PressMeta[] = [];
      siteUrls.forEach(pressUrl => {
        if (typeof pressUrl === 'object') {
          parsedPress.push(pressUrl);
          return;
        }
        const pressMeta = {
          generated: true,
          url: pressUrl,
          title: '',
          desc: '',
          image: '',
          date: '',
          author: ''
        };
        if (urlToMetaMap.has(pressUrl)) {
          const sm = urlToMetaMap.get(pressUrl);

          if (sm.og && sm.og.title) {
            pressMeta.title = sm.og.title;
          } else if (sm.twitter && sm.twitter.title) {
            pressMeta.title = sm.twitter.title;
          } else if (sm.title) {
            pressMeta.title = sm.title;
          }

          if (sm.og && sm.og.description) {
            pressMeta.desc = sm.og.description;
          } else if (sm.twitter && sm.twitter.description) {
            pressMeta.desc = sm.twitter.description;
          } else if (sm.description) {
            pressMeta.desc = sm.description;
          }

          if (sm.og && sm.og.image) {
            pressMeta.image = sm.og.image;
          } else if (sm.twitter && sm.twitter.image) {
            pressMeta.image = sm.twitter.image;
          }

          if (sm.og && sm.og.updated_time) {
            pressMeta.date = sm.og.updated_time;
          }

          if (sm.author) {
            pressMeta.author = sm.author;
          } else if (sm.twitter && sm.twitter.creator) {
            pressMeta.author = sm.twitter.creator;
          }
        }
        parsedPress.push(pressMeta);
      });

      return { result: parsedPress };
    })
    .catch(err => {
      const betterError = `Failed to parsePressMentions: ${err}`;
      console.log(betterError);
      return { error: betterError };
    });
}
