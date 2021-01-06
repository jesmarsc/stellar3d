import React from 'react';
import { makeAutoObservable, observable } from 'mobx';

const UIStateStoreContext = React.createContext({ selectedNode: null });

class UIStateStore {
  selectedNode = null;
  isLoading = false;

  constructor() {
    makeAutoObservable(this, { selectedNode: observable.ref });
  }

  setSelectedNode(node) {
    this.selectedNode = node;
  }

  setLoading(isLoading) {
    this.isLoading = isLoading;
  }
}

export default UIStateStore;
export { UIStateStoreContext };
