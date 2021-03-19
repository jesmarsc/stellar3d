import React from 'react';
import { Canvas, Layout } from '@components';
import { withUIStore } from '@stores/UIStore';
import { withStellarStore } from '@stores/StellarStore';
import { withLedgerStore } from '@stores/LedgerStore';

import './App.css';

function App() {
  return (
    <Layout>
      <Canvas />
    </Layout>
  );
}

export default withLedgerStore(withStellarStore(withUIStore(App)));
