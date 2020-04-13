import Router, { Router as RouterClass } from 'next/router';
import { UrlObject } from 'url';

type Url = UrlObject | string

type PrefetchOptions = {
  priority?: boolean;
}

const newPromise = <T extends any> (res: T): Promise<T> =>
  new Promise<T>(resolve => resolve(res))

export const mockNextRouter: RouterClass = {
  push: (url: Url, as?: Url, options?: {}) => newPromise(false),
  replace: (url: Url, as?: Url, options?: {}) => newPromise(false),
  prefetch: (url: string, asPath?: string, options?: PrefetchOptions) => newPromise(void (0)),
  query: {}
} as RouterClass

Router.router = mockNextRouter
