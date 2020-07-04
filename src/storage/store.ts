import localForage from 'localforage'

export const newStore = (storeName: string) =>
  localForage.createInstance({
    name: 'SubsocialDB',
    storeName
  })
