import React from 'react';
import { Three, Layout } from '@components';
import { withUIStore } from '@stores/UIStore';
import { withStellarStore } from '@stores/StellarStore';

import './App.css';

function App() {
  return (
    <Layout>
      <Three />
    </Layout>
  );
}

export default withStellarStore(withUIStore(App));
