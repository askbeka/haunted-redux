import { HauntedReduxContext } from '../components/Context.js';
import { useStore as useDefaultStore, createStoreHook } from './useStore.js';

/**
 * Hook factory, which creates a `useDispatch` hook bound to a given context.
 *
 * @param {Function} [context=HauntedReduxContext] Context passed to your `<store-provider>`.
 * @returns {Function} A `useDispatch` hook bound to the specified context.
 */
export function createDispatchHook(context = HauntedReduxContext) {
  const useStore = context === HauntedReduxContext ? useDefaultStore : createStoreHook(context);
  return function useDispatch() {
    const store = useStore();
    return store.dispatch;
  };
}

/**
 * A hook to access the redux `dispatch` function.
 *
 * @returns {any|function} redux store's `dispatch` function
 *
 * @example
 *
 * import { useCallback, html } from 'haunted';
 * import { useDispatch } from 'haunted-redux';
 *
 * export const CounterComponent = ({ value }) => {
 *   const dispatch = useDispatch()
 *   const increaseCounter = useCallback(() => dispatch({ type: 'increase-counter' }), [])
 *   return html`
 *     <div>
 *       <span>${value}</span>
 *       <button @click=${increaseCounter}>Increase counter</button>
 *     </div>
 *   `;
 * }
 */
export const useDispatch = createDispatchHook();
