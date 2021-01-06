import React from 'react';
import { InfoCard, LoadingStatus } from '@components';

import classes from './Layout.module.css';

const Layout = ({ children }) => {
  return (
    <div className={classes.Layout}>
      {children}
      <InfoCard className={classes.InfoCardPosition} />
      <LoadingStatus />
    </div>
  );
};

export default Layout;
