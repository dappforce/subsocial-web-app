import config from '@polkadot/dev-react/config/jest';

const internalModules = findPackages().reduce((modules, { dir, name }) => {
  modules[`${name}(.*)$`] = `<rootDir>/packages/${dir}/src/$1`;

  return modules;
}, {});

export default Object.assign({}, config, {
  moduleNameMapper: {
    ...internalModules,
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': 'empty/object',
    '\\.(css|less)$': 'empty/object'
  }
});
