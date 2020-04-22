import { random } from 'lodash';

const CONFIRMATIONS_REQUIRED_MIN = 2;
const CONFIRMATIONS_REQUIRED_MAX = 5;

const OWNERS_MIN = 2;
const OWNERS_MAX = 5;

const CHANGES_MIN = 5;
const CHANGES_MAX = 15;

const substrateAddress = [
  'EEWyMLHgwtemr48spFNnS3U2XjaYswqAYAbadx2jr9ppp4X',
  'HkSMAkF2mBVTpGDY5vGim6peV2CThMX8rY4yaPWKPQZMJsX',
  'FrQ4W8Bo6wgXzkaGHLzVFSsfbWWHvqGGNP1YkRmTPSkN17J',
  'HUksmaPXHfNiWYPKT544anApCt8cfTY4X7KtUhKbj2vkT9y'
]

const changesFilters = [ 'approved', 'confirmed' ]

const generateOwnersList = (n) =>
  new Array(n)
    .fill(0)
    .map((number, index) => ({
      key: index.toString(),
      account: {
        address: substrateAddress[random(0, substrateAddress.length - 1)],
        img: 'https://svgshare.com/i/KDr.svg'
      }
    }))

const generateChagnge = (response, index) => ({
  key: index.toString(),
  confirmationsRequired: response === 'approved' ? index : random(5, index),
  confirmations: response === 'approved' ? index : random(1, 4),
  id: index.toString(),
  time: new Date(Date.now()).toDateString(),
  note: 'Adding a new owners',
  response
});

export const generateChangesList = (n) =>
  new Array(n).fill(0).map((number, index) =>
    generateChagnge(changesFilters[random(0, changesFilters.length - 1)], index));

export const data = {
  confirmationsRequired: random(CONFIRMATIONS_REQUIRED_MIN, CONFIRMATIONS_REQUIRED_MAX),
  owners: generateOwnersList(random(OWNERS_MIN, OWNERS_MAX)),
  changes: [
    ...generateChangesList(random(CHANGES_MIN, CHANGES_MAX)),
    generateChagnge('waiting', CHANGES_MAX + 1)
  ]
};
