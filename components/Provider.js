import { useMemo, useEffect, component } from 'haunted';
import { HauntedReduxContext } from './Context.js';
import Subscription from '../utils/Subscription.js';

function Provider({ store, context }) {
  const contextValue = useMemo(() => {
    const subscription = new Subscription(store);
    subscription.onStateChange = subscription.notifyNestedSubs;
    return {
      store,
      subscription,
    };
  }, [store]);

  const previousState = useMemo(() => store.getState(), [store]);

  useEffect(() => {
    const { subscription } = contextValue;
    subscription.trySubscribe();

    if (previousState !== store.getState()) {
      subscription.notifyNestedSubs();
    }

    return () => {
      subscription.tryUnsubscribe();
      subscription.onStateChange = null;
    };
  }, [contextValue, previousState]);

  const providerElement = useMemo(() => {
    const Context = context || HauntedReduxContext;

    return new Context.Provider();
  }, [context]);

  useEffect(() => {
    this.appendChild(providerElement);
  }, [providerElement]);

  return null;
}

export default component(Provider, { useShadow: false });
