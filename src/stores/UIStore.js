import React, { useState } from 'react';
import { makeAutoObservable, observable } from 'mobx';

class UIStore {
  selectedNode = null;
  isLoading = true;

  constructor() {
    makeAutoObservable(this, {
      selectedNode: observable.ref,
      isLoading: observable,
    });
  }

  setSelectedNode(node) {
    this.selectedNode = node;
  }

  setLoading(isLoading) {
    this.isLoading = isLoading;
  }
}

const UIStoreContext = React.createContext(null);

const withUIStore = (Component) => (props) => {
  const [uiStore] = useState(() => new UIStore());

  return (
    <UIStoreContext.Provider value={uiStore}>
      <Component {...props} />
    </UIStoreContext.Provider>
  );
};

export default UIStore;
export { UIStoreContext, withUIStore };
