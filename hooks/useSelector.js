import { useReducer, useRef, useEffect, useMemo, useContext } from 'haunted';
import invariant from '../invariant.js';
import { useReduxContext as useDefaultReduxContext } from './useReduxContext.js';
import Subscription from '../utils/Subscription.js';
import { HauntedReduxContext } from '../components/Context.js';

// for the time being
const useLayoutEffect = useEffect;

const refEquality = (a, b) => a === b;

function useSelectorWithStoreAndSubscription(selector, equalityFn, store, contextSub) {
  const [, forceRender] = useReducer(s => s + 1, 0);

  const subscription = useMemo(() => new Subscription(store, contextSub), [store, contextSub]);

  const latestSubscriptionCallbackError = useRef();
  const latestSelector = useRef();
  const latestSelectedState = useRef();

  let selectedState;

  try {
    if (selector !== latestSelector.current || latestSubscriptionCallbackError.current) {
      selectedState = selector(store.getState());
    } else {
      selectedState = latestSelectedState.current;
    }
  } catch (err) {
    let errorMessage = `An error occured while selecting the store state: ${err.message}.`;

    if (latestSubscriptionCallbackError.current) {
      errorMessage += `\nThe error may be correlated with this previous error:\n${latestSubscriptionCallbackError.current.stack}\n\nOriginal stack trace:`;
    }

    throw new Error(errorMessage);
  }

  useLayoutEffect(() => {
    latestSelector.current = selector;
    latestSelectedState.current = selectedState;
    latestSubscriptionCallbackError.current = undefined;
  });

  useLayoutEffect(() => {
    function checkForUpdates() {
      try {
        const newSelectedState = latestSelector.current(store.getState());

        if (equalityFn(newSelectedState, latestSelectedState.current)) {
          return;
        }

        latestSelectedState.current = newSelectedState;
      } catch (err) {
        // we ignore all errors here, since when the component
        // is re-rendered, the selectors are called again, and
        // will throw again, if neither props nor store state
        // changed
        latestSubscriptionCallbackError.current = err;
      }

      forceRender({});
    }

    subscription.onStateChange = checkForUpdates;
    subscription.trySubscribe();

    checkForUpdates();

    return () => subscription.tryUnsubscribe();
  }, [store, subscription]);

  return selectedState;
}

/**
 * Hook factory, which creates a `useSelector` hook bound to a given context.
 *
 * @param {Function} [context=HauntedReduxContext] Context passed to your `<Provider>`.
 * @returns {Function} A `useSelector` hook bound to the specified context.
 */
export function createSelectorHook(context = HauntedReduxContext) {
  const useReduxContext =
    context === HauntedReduxContext ? useDefaultReduxContext : () => useContext(context);
  return function useSelector(selector, equalityFn = refEquality) {
    invariant(selector, `You must pass a selector to useSelectors`);

    const { store, subscription: contextSub } = useReduxContext();

    return useSelectorWithStoreAndSubscription(selector, equalityFn, store, contextSub);
  };
}

/**
 * A hook to access the redux store's state. This hook takes a selector function
 * as an argument. The selector is called with the store state.
 *
 * This hook takes an optional equality comparison function as the second parameter
 * that allows you to customize the way the selected state is compared to determine
 * whether the component needs to be re-rendered.
 *
 * @param {Function} selector the selector function
 * @param {Function=} equalityFn the function that will be used to determine equality
 *
 * @returns {any} the selected state
 *
 * @example
 *
 * import { html } from 'haunted'
 * import { useSelector } from 'haunted-redux'
 *
 * export const CounterComponent = () => {
 *   const counter = useSelector(state => state.counter)
 *   return html`<div>${counter}</div>`;
 * }
 */
export const useSelector = createSelectorHook();
