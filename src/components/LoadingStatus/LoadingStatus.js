import React, { useContext } from 'react';
import { observer } from 'mobx-react';
import { useTransition, animated } from 'react-spring';

import { UIStateStoreContext } from '@stores';
import classes from './LoadingStatus.module.css';

const LoadingStatus = observer(() => {
  const { isLoading } = useContext(UIStateStoreContext);

  const transition = useTransition(isLoading, null, {
    from: { opacity: 1 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    config: { duration: 64 },
  });

  return transition.map(
    ({ item, key, props }) =>
      item && (
        <animated.div className={classes.loadingStatus} style={props} key={key}>
          Traveling to the Stellar Galaxy...
        </animated.div>
      )
  );
});

export default LoadingStatus;
