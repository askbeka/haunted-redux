import { useContext } from 'haunted';
import invariant from '../invariant.js';
import { HauntedReduxContext } from '../components/Context.js';

/**
 * A hook to access the value of the `HauntedReduxContext`. This is a low-level
 * hook that you should usually not need to call directly.
 *
 * @returns {any} the value of the `HauntedReduxContext`
 *
 * @example
 *
 * import { html } from 'haunted'
 * import { useReduxContext } from 'haunted-redux'
 *
 * export const CounterComponent = ({ value }) => {
 *   const { store } = useReduxContext()
 *   return html`<div>${store.getState()}</div>`
 * }
 */
export function useReduxContext() {
  const contextValue = useContext(HauntedReduxContext);

  invariant(
    contextValue,
    'could not find haunted-redux context value; please ensure the component is wrapped in a <Provider>',
  );

  return contextValue;
}
