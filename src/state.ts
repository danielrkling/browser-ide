import { useQuery, useQueryClient } from "@tanstack/react-query";

interface SetGlobalState<T> {
  (newState: T): void;
}

const GLOBAL_STATE_KEY_PREFIX = "globalState";

export function useGlobalState<T = undefined>(key: string): [T, SetGlobalState<T>];
export function useGlobalState<T>(key: string, initialState: T): [T, SetGlobalState<T>];
export function useGlobalState<T>(key: string, initialState?: T): [T | undefined, SetGlobalState<T>] {
  const queryClient = useQueryClient();

  const stateKey = [GLOBAL_STATE_KEY_PREFIX, key];
  const { data } = useQuery(stateKey, () => initialState, {
    initialData: initialState,
    staleTime: Infinity,
    cacheTime: Infinity
  });

  const setData = (newState: T) => {
    queryClient.setQueryData(stateKey, newState);
  };

  return [data, setData];
}