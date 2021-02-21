import React, { useContext } from 'react';
import { observer } from 'mobx-react';
import { useTransition, animated, config } from 'react-spring';

import { UIStateStoreContext } from '@stores';
import classes from './LoadingStatus.module.css';

const LoadingStatus = observer(() => {
  const { isLoading } = useContext(UIStateStoreContext);

  const transition = useTransition(isLoading, {
    from: { opacity: 1 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    config: config.stiff,
  });

  return transition(
    (style, item) =>
      item && (
        <animated.div className={classes.loadingStatus} style={style}>
          Traveling to the Stellar Galaxy...
        </animated.div>
      )
  );
});

export default LoadingStatus;
