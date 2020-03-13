import React, { useContext, createContext } from 'react';

type Storybook = {
  isStorybook: boolean
}

export const StorybookContext = createContext<Storybook>({ isStorybook: false });

export const useStorybookContext = () =>
  useContext(StorybookContext)

export const StorybookProvider = (props: React.PropsWithChildren<{}>) => {
  return <StorybookContext.Provider value={{ isStorybook: true }}>
    {props.children}
  </StorybookContext.Provider>
}
