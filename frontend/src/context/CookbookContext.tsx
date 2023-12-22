import React, {useContext, createContext, ReactNode} from 'react';


export type CookbookContext = {};

const CookbookContext = createContext<CookbookContext | null>(null);

export const useCookbook = (): CookbookContext => {
	return useContext(CookbookContext) as CookbookContext;
}

export const CookbookProvider = ({children}: { children: ReactNode }) => {
	return <CookbookContext.Provider value={{}}>
		{children}
	</CookbookContext.Provider>;
};
