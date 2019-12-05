import React, { useReducer, createContext, useContext } from 'react';

type SideBarCollapsedState = {
  collapsed: boolean
};

type SideBarCollapsedAction = {
  type: 'hide' | 'show' | 'toggle'
};

function reducer (state: SideBarCollapsedState, action: SideBarCollapsedAction): SideBarCollapsedState {

  switch (action.type) {

    case 'hide':
      return { collapsed: false };

    case 'show':
      return { collapsed: true };

    case 'toggle':
      return { collapsed: !state.collapsed };

    default:
      throw new Error('No action type provided');
  }
}

function functionStub () {
  throw new Error('Function needs to be hide in SideBarCollapsedProvider');
}

const initialState = {
  collapsed: true
};

export type SideBarCollapsedContextProps = {
  state: SideBarCollapsedState,
  dispatch: React.Dispatch<SideBarCollapsedAction>,
  hideSideBar: () => void,
  showSideBar: () => void,
  toggleCollapsed: () => void
};

const contextStub: SideBarCollapsedContextProps = {
  state: initialState,
  dispatch: functionStub,
  hideSideBar: functionStub,
  showSideBar: functionStub,
  toggleCollapsed: functionStub
};

export const SideBarCollapsedContext = createContext<SideBarCollapsedContextProps>(contextStub);

export function SideBarCollapsedProvider (props: React.PropsWithChildren<{}>) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const contextValue = {
    state,
    dispatch,
    hideSideBar: () => dispatch({ type: 'hide' }),
    showSideBar: () => dispatch({ type: 'show' }),
    toggleCollapsed: () => dispatch({ type: 'toggle' })
  };
  return (
    <SideBarCollapsedContext.Provider value={contextValue}>
      {props.children}
    </SideBarCollapsedContext.Provider>
  );
}

export function useSideBarCollapsed () {
  return useContext(SideBarCollapsedContext);
}

export default SideBarCollapsedProvider;
