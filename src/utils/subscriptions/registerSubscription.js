import platform from "../../store/selectors/platform";
import platformReducer from "../../store/reducers/platform";

export const registerSubscription = (
  subscriptionType,
  onRegister,
  { dispatch, getState },
  subscriptionsGroup
) => {
  if (
    !platform.isSubscriptionRegistered(getState(), {
      subscriptionsGroup,
      subscriptionType
    })
  ) {
    onRegister();
    dispatch(
      platformReducer.actions.registerSubscriptionByTypeAndGroup(
        subscriptionsGroup,
        subscriptionType
      )
    );
    return true;
  } else {
    console.error(`onErrorRegister => ${subscriptionsGroup} ${subscriptionType}`);
    return false;
  }
};
