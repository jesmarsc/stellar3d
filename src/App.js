import React from 'react';
import { Three, Layout } from '@components';
import { UIStateStore, UIStateStoreContext } from '@stores';

import './App.css';

function App() {
  return (
    <UIStateStoreContext.Provider value={new UIStateStore()}>
      <Layout>
        <Three />
      </Layout>
    </UIStateStoreContext.Provider>
  );
}

export default App;
