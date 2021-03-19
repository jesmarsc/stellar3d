import { useContext } from 'react';
import classes from './NodeEntry.module.css';

import { UIStoreContext } from '@stores/UIStore';

const NodeEntry = ({ node }) => {
  const uiStore = useContext(UIStoreContext);
  const statusColor = node.active ? 'lime' : 'red';

  return (
    <button
      className={classes.NodeEntry}
      onClick={() => {
        uiStore.setSelectedNode(node);
      }}
    >
      <div
        className={classes.NodeEntry_statusIndicator}
        style={{
          backgroundColor: statusColor,
          boxShadow: `0px 0px 10px ${statusColor}`,
        }}
      />
      <div className={classes.NodeEntry_name}>
        {node.name || node.publicKey}
      </div>
    </button>
  );
};

export default NodeEntry;
