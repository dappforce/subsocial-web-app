// Works with request '^2.88.0'
import request from 'request'

// Works with cheerio '^1.0.0-rc.2'
import cheerio from 'cheerio'

import { nonEmptyStr } from '../../utils'

function $loadHtml (html: string) {
  // 'decodeEntities = true' is to convert HTML entities like '&amp' to '&', etc.
  return cheerio.load(html, { decodeEntities: true });
}

function parseSiteWithRequest (url: string) {
  return new Promise((resolve) => {
    console.log(`\nRequest site at URL: ${url}`);
    request(
      {
        url: url,
        encoding: 'UTF-8',
        gzip: true,
        headers: {
          pragma: 'no-cache',
          'accept-encoding': 'gzip, deflate',
          'accept-language': 'en-US,en;q=0.8',
          'upgrade-insecure-requests': '1',
          'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36',
          accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'cache-control': 'no-cache',
          authority: 'www.affirm.com',
          cookie: ''
        }
      },
      (error, res, body) => {

        let errorMessage = null;
        if (error) {
          errorMessage = `Error at URL [${url}]: ${error}`;
        } else if (res.statusCode === 200) {
          try {
            const siteMeta = parseSiteHtml(url, body);
            console.log(`\nParsed HTML meta of site ${url}:\n`, siteMeta);
            resolve({ ok: true, url, siteMeta });
            return;

          } catch (ex) {
            errorMessage = ex;
          }
        } else if (res.statusCode === 404) {
          errorMessage = `Page not found at URL [${url}]. HTTP error: ${res.statusCode}`;
        } else if (res.statusCode === 503) {
          errorMessage = `Server error at URL [${url}]. HTTP error: ${res.statusCode}`;
        } else {
          errorMessage = `Unexpected HTTP status code at URL [${url}]. HTTP error: ${res.statusCode}`;
        }

        console.error(errorMessage);

        // TODO Use reject() here? yes
        resolve({ ok: false, error: errorMessage });
      }
    );
  });
}

function parseSiteHtml (url: string, html: string) {
  const $ = $loadHtml(html);
  const meta: {
    fb: any,
    og: any,
    twitter: any,
    keywords?: any
  } = {
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

  setPrettyString(meta.fb, 'appId', () => $('meta[property="fb:app_id"]').attr('content'));

  setPrettyString(meta.twitter, 'title', () => $('meta[property="twitter:title"]').attr('content'));
  setPrettyString(meta.twitter, 'description', () => $('meta[property="twitter:description"]').attr('content'));
  setPrettyString(meta.twitter, 'image', () => $('meta[property="twitter:image"]').attr('content'));
  setPrettyString(meta.twitter, 'creator', () => $('meta[property="twitter:creator"]').attr('content'));

  const kws = getPrettyString(() => $('meta[name="keywords"]').attr('content'));
  if (typeof kws !== 'undefined' && kws.length > 0) {
    meta.keywords = kws.split(',').map((kw: string) => getPrettyString(() => kw));
  }

  deleteEmptyKeys(meta);

  return meta;
}

function deleteEmptyKeys (obj: any) {
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

function setPrettyString (obj: any, propName: string, getValueFn: () => string | undefined) {
  const value = getPrettyString(getValueFn);
  if (typeof value !== 'undefined') {
    obj[propName] = value;
  }
}

export default function parse (siteUrls: string[]) {

  const parseSitePromises: any[] = []
  siteUrls = siteUrls.map(x => nonEmptyStr(x) ? x.trim() : x)
  siteUrls.forEach((pressUrl: string) => {
    if (nonEmptyStr(pressUrl)) {
      parseSitePromises.push(parseSiteWithRequest(pressUrl));
    }
  });

  return Promise.all(parseSitePromises)
    .then(results => {
      // console.log(`Press mentions parser: Promise results`, results);

      const urlToMetaMap = new Map();
      results.forEach(({ url, siteMeta }) => {
        urlToMetaMap.set(url, siteMeta);
      });

      const parsedPress: any[] = [];
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
