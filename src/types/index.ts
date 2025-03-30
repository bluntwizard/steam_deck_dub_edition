/**
 * Index file exporting all types
 */

// App types
export * from './app';

// Component types
export * from './components';

// API types
export * from './api';

// State management types
export * from './state';

// Utility types
export interface Dictionary<T> {
  [key: string]: T;
}

export type Nullable<T> = T | null;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[P] extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepPartial<U>>
    : DeepPartial<T[P]>;
};

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = 
  Pick<T, Exclude<keyof T, Keys>> 
  & {
      [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>
    }[Keys];

export type RequireOnlyOne<T, Keys extends keyof T = keyof T> = 
  Pick<T, Exclude<keyof T, Keys>> 
  & {
      [K in Keys]-?: Required<Pick<T, K>> & {
        [K2 in Exclude<Keys, K>]?: never
      }
    }[Keys];

export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

export type Brand<K, T> = K & { __brand: T };

export type AsyncState<T> = {
  data: T | null;
  isLoading: boolean;
  error: string | null;
};

export type ValueOf<T> = T[keyof T]; 