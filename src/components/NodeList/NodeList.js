import { useContext, useMemo, useState } from 'react';
import { StellarStoreContext } from '@stores/StellarStore';
import { observer } from 'mobx-react';

import NodeEntry from './NodeEntry/NodeEntry';
import classes from './NodeList.module.css';

const nodesPerPage = 8;

const NodeList = observer(({ className }) => {
  const [currentPage, setPage] = useState(0);
  const [search, setSearch] = useState('');

  const {
    graphData: { nodes },
  } = useContext(StellarStoreContext);

  const prevPage = () => {
    setPage(Math.max(currentPage - 1, 0));
  };

  const nextPage = () => {
    setPage(Math.min(currentPage + 1, lastPage));
  };

  const nodeList = useMemo(() => {
    setPage(0);
    const unfilteredNodes = nodes;
    if (search.length) {
      const lowercaseSearch = search.toLowerCase();
      return nodes.filter(
        (node) =>
          node.publicKey.toLowerCase().includes(lowercaseSearch) ||
          node.name?.toLowerCase().includes(lowercaseSearch)
      );
    }

    return unfilteredNodes;
  }, [nodes, search]);

  const index = currentPage * nodesPerPage;
  const lastPage = Math.floor(nodeList.length / nodesPerPage);
  const slicedData = nodeList.slice(index, index + nodesPerPage);

  return (
    <div className={`${classes.NodeList} ${className}`}>
      <input
        onChange={(event) => setSearch(event.target.value)}
        type="text"
        placeholder="Search by public key or name..."
        className={classes.NodeList_search}
      />

      <div className={classes.NodeList_container}>
        {slicedData.map((node) => {
          return <NodeEntry node={node} key={node.publicKey} />;
        })}
      </div>

      <div className={classes.NodeList_controls}>
        <button className={classes.NodeList_controlsButton} onClick={prevPage}>
          Prev
        </button>
        <label className={classes.controls__currentPage}>
          <input
            type="number"
            value={currentPage.toString()}
            onChange={(event) => {
              setPage(Math.min(Math.max(event.target.value, 0), lastPage));
            }}
            max={nodes.length}
            className={classes.controls__currentPageSelector}
          />
          /<span>{lastPage}</span>
        </label>
        <button className={classes.NodeList_controlsButton} onClick={nextPage}>
          Next
        </button>
      </div>
    </div>
  );
});

export default NodeList;
