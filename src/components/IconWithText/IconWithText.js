import React from 'react';
import classes from './IconWithText.module.css';

const IconWithText = ({ icon, children }) => {
  const Icon = icon;
  return <span className={classes.container}></span>;
};

export default IconWithText;
