import React from 'react';
import classes from './KeyValueList.module.css';

const KeyValueList = ({ entries }) => {
  return (
    <ul className={classes.list}>
      {entries.map(([key, value]) => (
        <li className={classes.list__item} key={key}>
          <span className={classes.list__itemKey}>{key}: </span>
          <span className={classes.list__itemValue}>{value}</span>
        </li>
      ))}
    </ul>
  );
};

export default KeyValueList;
