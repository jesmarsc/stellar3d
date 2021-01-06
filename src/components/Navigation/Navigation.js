import React, { useContext } from 'react';
import { observer } from 'mobx-react';

import { UIStateStoreContext } from '@stores';
import classes from './Navigation.module.css';

const Navigation = observer(({ className }) => {
  const { selectedNode } = useContext(UIStateStoreContext);

  let statusLineColor = 'rgba(255, 255, 255, 0.75)';

  if (selectedNode) {
    statusLineColor = selectedNode.active ? 'lime' : 'red';
  }

  return (
    <div
      className={`${classes.navigation} ${className}`}
      style={{
        boxShadow: `0px 3px ${statusLineColor}`,
      }}
    >
      Testing
    </div>
  );
});

export default Navigation;
