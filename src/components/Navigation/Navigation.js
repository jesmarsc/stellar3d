import React, { useContext } from 'react';
import { observer } from 'mobx-react';

import { StellarStoreContext } from '@stores/StellarStore';
import classes from './Navigation.module.css';

const Navigation = observer(({ className }) => {
  const { selectedNode } = useContext(StellarStoreContext);

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
