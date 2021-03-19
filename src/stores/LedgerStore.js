import React, { useState } from 'react';
import * as StellarSdk from 'stellar-sdk';

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Curves } from 'three/examples/jsm/curves/CurveExtras';

const loader = new GLTFLoader();

const curves = [
  new Curves.GrannyKnot(),
  new Curves.DecoratedTorusKnot4b(),
  new Curves.TrefoilKnot(),
  new Curves.CinquefoilKnot(),
  new Curves.KnotCurve(),
  new Curves.TorusKnot(),
  new Curves.VivianiCurve(),
];

const rocketScale = 20;
const curveScaleMultiplier = 400;
const spawnDistance = 20000;

class LedgerStore extends EventTarget {
  server = new StellarSdk.Server('https://horizon.stellar.org/');
  rocket = new THREE.Object3D();
  ledgers = [];

  constructor() {
    super();
    this.__init__();
  }

  __init__ = () => {
    loader
      .loadAsync(`${process.env.PUBLIC_URL}/assets/thrusterRocket.glb`)
      .then((gltf) => {
        const rocket = gltf.scene.getObjectByName('Rocket');
        rocket.scale.multiplyScalar(rocketScale);
        this.rocket = rocket;
        this.server
          .ledgers()
          .cursor('now')
          .stream({ onmessage: (ledger) => this.prepareRocket(ledger) });
      });
  };

  prepareRocket = (ledger) => {
    const rocket = this.rocket.clone();
    const curve = this.generateCurve(ledger.sequence);
    const [startPos, startDir] = this.generateSpawn(
      curve,
      spawnDistance,
      curveScaleMultiplier
    );

    rocket.position.copy(startPos);
    rocket.lookAt(startDir);
    rocket.curve = curve;
    rocket.curveScaleMultiplier = curveScaleMultiplier;
    rocket.ledger = ledger;
    rocket.arrived = (time) => {
      rocket.arrivalTime = time;
      this.addRocket(rocket);
    };

    this.dispatchEvent(new CustomEvent('spawnRocket', { detail: rocket }));
  };

  addRocket = (rocket) => {
    if (this.ledgers.length >= 10) {
      const removedRocket = this.ledgers.shift();
      this.dispatchEvent(
        new CustomEvent('removeRocket', { detail: removedRocket })
      );
    }
    this.ledgers.push(rocket);
  };

  generateCurve = (num) => {
    return curves[num % curves.length];
  };

  generateSpawn = (curve, distance, multiplier) => {
    const endPos = curve.getPointAt(0).multiplyScalar(multiplier);
    const endPos2 = curve.getPointAt(0.001).multiplyScalar(multiplier);

    const direction = endPos2.clone().sub(endPos).normalize();
    const startPos = endPos.add(direction.negate().multiplyScalar(distance));

    return [startPos, endPos2];
  };
}

const LedgerStoreContext = React.createContext(null);

const withLedgerStore = (Component) => (props) => {
  const [ledgerStore] = useState(() => new LedgerStore());

  return (
    <LedgerStoreContext.Provider value={ledgerStore}>
      <Component {...props} />
    </LedgerStoreContext.Provider>
  );
};

export { LedgerStoreContext, withLedgerStore };
export default LedgerStore;
