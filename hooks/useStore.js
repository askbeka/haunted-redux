import { useContext } from 'haunted';
import { HauntedReduxContext } from '../components/Context.js';
import { useReduxContext as useDefaultReduxContext } from './useReduxContext.js';

/**
 * Hook factory, which creates a `useStore` hook bound to a given context.
 *
 * @param {Function} [context=HauntedReduxContext] Context passed to your `<store-provider>`.
 * @returns {Function} A `useStore` hook bound to the specified context.
 */
export function createStoreHook(context = HauntedReduxContext) {
  const useReduxContext =
    context === HauntedReduxContext ? useDefaultReduxContext : () => useContext(context);
  return function useStore() {
    const { store } = useReduxContext();
    return store;
  };
}

/**
 * A hook to access the redux store.
 *
 * @returns {any} the redux store
 *
 * @example
 *
 * import { html } from 'haunted'
 * import { useStore } from 'haunted-redux'
 *
 * export const ExampleComponent = () => {
 *   const store = useStore()
 *   return html`<div>${store.getState()}</div>`
 * }
 */
export const useStore = createStoreHook();
