import React from 'react';
import classes from './KeyValueList.module.css';

const KeyValueList = ({ entries }) => {
  const listItems = [];

  for (const [key, value] of entries) {
    listItems.push(
      <li className={classes.list__item} key={key}>
        <span className={classes.list__itemKey}>{key}: </span>
        <span className={classes.list__itemValue}>{value}</span>
      </li>
    );
  }

  return <ul className={classes.list}>{listItems}</ul>;
};

export default KeyValueList;
