import React from "react";
import { act } from "react-dom/test-utils";

type Input = Object;
type Key<T extends Input> =
  | undefined
  | keyof T
  | Partial<Record<keyof Input, boolean>>
  | Array<keyof T>;
type SingleKey<T extends Input> = keyof T;

type Setter<T> = T | ((prev: T) => T);
type SetState<T extends Input, K extends SingleKey<T> = SingleKey<T>> = (
  key: K,
  set: Setter<T[K]>
) => void;
type SetStates<T extends Input, K extends Key<T>> = (
  key: K,
  set: Setter<T>
) => void;

type GetState<T, K extends SingleKey<T> = SingleKey<T>> = (key: K) => T[K];

export function createStore<
  T extends Input,
  K extends SingleKey<T> = SingleKey<T>
>(input: (set: SetState<T>, get: GetState<T>) => T) {
  const subscriptionMap = new Map<K, Set<() => void>>();
  const state = input(setState, getState);

  for (const key of Object.keys(state) as K[]) {
    subscriptionMap.set(key, new Set());
  }

  function setState(
    key: K,
    set: Setter<T[SingleKey<T>]>,
    isEqual?: (oldValue: any, newValue: any) => boolean
  ) {
    const oldState = state[key];
    const newState = isCallback(set) ? set(oldState) : set;

    const equals = isEqual ?? Object.is;

    if (equals(oldState, newState) || true) {
      for (const listener of subscriptionMap.get(key)) {
        listener();
      }
    }
  }

  function getState(key?: K) {
    if (key === undefined) {
      return state;
    } else {
      return () => state[key];
    }
  }

  function subscribeToKey(key: K) {
    const subscriptions = subscriptionMap.get(key) ?? new Set<() => void>();
    function subscribe(listener: () => void) {
      subscriptions.add(listener);
      return () => {
        subscriptions.delete(listener);
      };
    }
    return subscribe;
  }

  function useStore(): T;
  function useStore(key: K): T[K];
  function useStore(key: Record<K, any>): Pick<T, K>;
  function useStore(key: Array<K>): Array<T[K]>;
  function useStore(key?: K | Array<K> | Record<K, any>) {
    if (Array.isArray(key)) {
      const result: Array<T[K]> = [];
      for (const k of key) {
        result.push(React.useSyncExternalStore(subscribeToKey(k), getState(k)));
      }
      return result;
    } else if (key === undefined) {
      const result = {} as T;
      for (const k of Object.keys(state)) {
        result[k] = React.useSyncExternalStore(subscribeToKey(k), getState(k));
      }
      return result;
    } else if (typeof key === "object") {
      const result = {} as T;
      for (const k of Object.keys(key)) {
        result[k] = React.useSyncExternalStore(subscribeToKey(k), getState(k));
      }
      return result;
    } else {
      return React.useSyncExternalStore(subscribeToKey(key), getState(key));
    }
  }

  return useStore;
}

const isCallback = (
  maybeFunction: any | ((...args: any[]) => void)
): maybeFunction is (...args: any[]) => void =>
  typeof maybeFunction === "function";

interface Actions{
    [key: string]: (...args: any[]) => any
}
type SetState2<T> = (
  set: T | ((prev: T) => T),
  isEqual?: (oldValue: any, newValue: any) => boolean
) => void;

export function createStore2<T, A extends Actions = Actions>(
  initialState: T,
  actions: (set: SetState2<T>, get: () => () => T) => A
) {
  const subscriptions = new Set<() => void>();
  let state = initialState;
  const mutations = Object.assign(actions(setState,getState),{setState, getState})
  
  function setState(
    set: React.SetStateAction<T>,
    isEqual?: (oldValue: any, newValue: any) => boolean
  ) {
    const oldState = state;
    const newState = isCallback(set) ? set(oldState) : set;

    const equals = isEqual ?? Object.is;

    if (!equals(oldState, newState)) {
      state = newState;

      for (const listener of subscriptions) {
        listener();
      }
    }
  };

  function getState() {
    return () => state;
  }

  function subscribe(listener: () => void) {
    subscriptions.add(listener);
    return () => {
      subscriptions.delete(listener);
    };
  }

  function useStore() {
    return React.useSyncExternalStore<T>(subscribe, getState());
  }

  return Object.assign(useStore, mutations)
}


