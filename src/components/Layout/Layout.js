import React from 'react';
import { InfoCard, LoadingStatus, NodeList } from '@components';

import classes from './Layout.module.css';

const Layout = ({ children }) => {
  return (
    <div className={classes.Layout}>
      {children}
      <NodeList className={classes.NodeListPosition} />
      <InfoCard className={classes.InfoCardPosition} />
      <LoadingStatus />
    </div>
  );
};

export default Layout;
