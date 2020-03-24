// Works with request '^2.88.0'
import request from 'request'

// Works with googleapis '^19.0.0'
import { google } from 'googleapis'

import moment from 'moment'

import { nonEmptyStr } from '../../utils'

// Get from https://console.developers.google.com/apis/credentials?project=shodee-com
const API_KEY = 'AIzaSyC_1AraUnUfpNcaTxEhpyKljShJ3-Cj-Po';

google.options({ auth: API_KEY });

const youtube = google.youtube('v3');

// -----------------------------------------------------------
// Vimeo

const VIMEO_REGEX = /https?:\/\/(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/([^/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/;

function extractVimeoVideoId (url: string) {
  const match = url.match(VIMEO_REGEX);
  if (match && match[3]) {
    return match[3];
  } else {
    return null;
  }
}

function isVimeoVideoUrl (url: string) {
  return extractVimeoVideoId(url) !== null;
}

function findVimeoVideoByUrl (videoUrl: string) {

  const videoId = extractVimeoVideoId(videoUrl);
  // let url = `https://api.vimeo.com/videos/${videoId}`; // This API endpoint requires OAuth.
  const url = `http://vimeo.com/api/v2/video/${videoId}.json`;

  return new Promise((resolve) => {
    console.log(`\nRequest site at URL: ${url}`);
    request(
      {
        url: url,
        encoding: 'UTF-8',
        gzip: true
      },
      (error, res, body) => {

        let errorMessage = null;
        if (error) {
          errorMessage = `Error at URL [${url}]: ${error}`;
        } else if (res.statusCode === 200) {
          try {

            const videos = JSON.parse(body);
            console.log(`\nFound Vimeo videos by URL (${url}):\n`, videos);
            if (videos && videos.length > 0) {
              const v = videos[0];

              const ratio = v.width / v.height;
              const largeThumbHeight = parseInt((640 / ratio).toString());

              const video = {
                generated: true,
                isVimeo: true,
                id: v.id,
                url: v.url,
                title: v.title,
                desc: v.description,
                date: moment(v.upload_date).format(),
                image: {
                  url: v.thumbnail_large,
                  width: 640,
                  height: largeThumbHeight
                },
                author: {
                  id: v.user_id,
                  url: v.user_url,
                  name: v.user_name
                }
              };
              resolve({ url: video.url, video });
              // resolve({ url: v.url, video: v });
              return;

            } else {
              errorMessage = `Vimeo video was not found by URL: ${videoUrl}`;
            }

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
        resolve({ err: errorMessage });
      }
    );
  });
}

// -----------------------------------------------------------
// YouTube

function findYouTubeVideoByUrl (url: string, onVideoFoundFn: (a: any, b: any) => void) {
  const id = extractYouTubeVideoId(url);
  console.log(`findYouTubeVideoById id (${id}) url (${url})`);
  return findYouTubeVideoById(id, onVideoFoundFn);
}

const YOUTUBE_REGEXP = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;

function extractYouTubeVideoId (url: string) {
  const match = url.match(YOUTUBE_REGEXP);
  if (match && match[2]) {
    return match[2];
  } else {
    return undefined;
  }
}

function isYouTubeUrl (url: string) {
  return extractYouTubeVideoId(url) !== null;
}

function findYouTubeVideoById (id: string | undefined, onVideoFoundFn: (a: any, b?: any) => void) {
  youtube.videos.list({ id, part: 'snippet' }, function (err: any, res: any) {
    if (err || res.items.length === 0) {
      onVideoFoundFn(err);
      return;
    }
    const v = res.items[0];
    const video = {
      generated: true,
      isYouTube: true,

      id: v.id,
      // urlShort: `https://youtu.be/${v.id}`,
      url: `https://www.youtube.com/watch?v=${v.id}`,

      title: v.snippet.title || '',
      desc: v.snippet.description || '',
      date: v.snippet.publishedAt,
      image: v.snippet.thumbnails.standard,

      author: {
        id: v.snippet.channelId,
        url: `https://www.youtube.com/channel/${v.snippet.channelId}`,
        name: v.snippet.channelTitle
      }
    };
    console.log(`Video:`, video);
    onVideoFoundFn(null, video);
  });
}

function findYouTubeVideoPromise (url: string) {
  return new Promise((resolve) => {
    findYouTubeVideoByUrl(url, (err, video) => {
      if (err) resolve({ err });
      else resolve({ url, video });
    });
  });
}

// General code --------------------------------------------------------------

export default function parse (videoUrls: string[]) {

  const findVidPromises: any = []
  videoUrls = videoUrls.map(x => nonEmptyStr(x) ? x.trim() : x)
  videoUrls.forEach(vidUrlOrVideo => {
    console.log(`videos.forEach(vidUrlOrVideo => `, vidUrlOrVideo);

    if (nonEmptyStr(vidUrlOrVideo)) {
      if (isYouTubeUrl(vidUrlOrVideo)) {
        findVidPromises.push(findYouTubeVideoPromise(vidUrlOrVideo));
      } else if (isVimeoVideoUrl(vidUrlOrVideo)) {
        findVidPromises.push(findVimeoVideoByUrl(vidUrlOrVideo));
      }
    }
  });

  return Promise.all(findVidPromises)
    .then(results => {
      console.log(`Video parser: Promise results`, results);

      const urlToVideoMap = new Map();
      results.forEach((res: any) => {
        const { url, video } = res;
        if (video) {
          urlToVideoMap.set(url, video);
        }
      });

      const parsedVideos: string[] = [];
      videoUrls.forEach(vidUrlOrVideo => {
        if (nonEmptyStr(vidUrlOrVideo) && urlToVideoMap.has(vidUrlOrVideo)) {
          vidUrlOrVideo = urlToVideoMap.get(vidUrlOrVideo);
        }
        parsedVideos.push(vidUrlOrVideo);
      });

      return { result: parsedVideos };
    })
    .catch(err => {
      const betterError = `Failed to parse videos: ${err}`;
      console.log(betterError);
      return { error: betterError };
    });
}
