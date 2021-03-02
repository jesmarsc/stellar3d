import React, { useState } from 'react';
import axios from 'axios';
import { makeObservable, observable, runInAction } from 'mobx';

class StellarStore {
  graphData = { nodes: [], links: [] };
  nodesMap = new Map();
  nodesEndpoint = axios.create({
    baseURL: 'https://api.stellarbeat.io/v1',
  });
  isLoading = true;
  error = null;

  constructor() {
    makeObservable(this, {
      isLoading: observable,
      error: observable,
    });

    this.fetchNodes();
  }

  fetchNodes = () => {
    runInAction(() => (this.isLoading = true));
    this.nodesEndpoint
      .get('/node')
      .then(({ data }) => {
        const nodesMap = this.loadNodes(data);
        const links = this.loadLinks(data, nodesMap);

        this.nodesMap = nodesMap;
        this.graphData = { nodes: data, links };
      })
      .catch((error) => (this.error = error))
      .finally(() => runInAction(() => (this.isLoading = false)));
  };

  loadNodes = (data) => {
    return data.reduce((map, node) => map.set(node.publicKey, node), new Map());
  };

  loadLinks = (nodes, nodesMap) => {
    const links = [];
    for (const node of nodes) {
      node.links = [];
      this.loadLinksRecursively(node, node.quorumSet, links, nodesMap);
    }
    return links;
  };

  loadLinksRecursively = (node, quorumSet, links, nodesMap) => {
    const { validators, innerQuorumSets } = quorumSet;
    for (const validator of validators) {
      if (validator !== node.publicKey && nodesMap.has(validator)) {
        const link = { source: node.publicKey, target: validator };
        links.push(link);
        node.links.push(link);
      }
    }
    if (innerQuorumSets.length > 0) {
      for (const quorumSet of innerQuorumSets) {
        this.loadLinksRecursively(node, quorumSet, links, nodesMap);
      }
    }
  };
}

const StellarStoreContext = React.createContext(null);

const withStellarStore = (Component) => (props) => {
  const [stellarStore] = useState(() => new StellarStore());
  return (
    <StellarStoreContext.Provider value={stellarStore}>
      <Component {...props} />
    </StellarStoreContext.Provider>
  );
};

export default StellarStore;
export { StellarStoreContext, withStellarStore };
