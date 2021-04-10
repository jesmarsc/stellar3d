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

const rocketScale = 30;
const curveScaleMultiplier = 700;
const spawnDistance = 20000;
const velocity = 40;

class LedgerStore extends EventTarget {
  server = new StellarSdk.Server('https://horizon.stellar.org/');
  rocketModel = new THREE.Object3D();
  rockets = [];
  departingRockets = new Set();

  constructor() {
    super();
    this.__init__();
  }

  __init__ = () => {
    loader
      .loadAsync(`${process.env.PUBLIC_URL}/assets/thrusterRocket.glb`)
      .then((gltf) => {
        const rocketModel = gltf.scene.getObjectByName('Rocket');
        rocketModel.scale.multiplyScalar(rocketScale);
        this.rocketModel = rocketModel;
        this.server
          .ledgers()
          .cursor('now')
          .stream({ onmessage: (ledger) => this.prepareRocket(ledger) });
      });
  };

  prepareRocket = (ledger) => {
    const rocket = this.rocketModel.clone();
    const curve = this.generateCurve(ledger.sequence);
    const [startPos, startDir] = this.generateSpawn(
      curve,
      spawnDistance,
      curveScaleMultiplier
    );

    rocket.position.copy(startPos);
    rocket.lookAt(startDir);

    Object.assign(rocket, { curve, curveScaleMultiplier, ledger });

    rocket.arrived = (time) => {
      rocket.arrivalTime = time;
      rocket.animation = this.flyAnimation;
    };

    rocket.animation = this.arriveAnimation;
    this.addRocket(rocket);
  };

  addRocket = (rocket) => {
    this.dispatchEvent(new CustomEvent('spawnRocket', { detail: rocket }));

    if (this.rockets.length >= 7) {
      const removedRocket = this.rockets.shift();
      removedRocket.animation = this.departAnimation;
      this.departingRockets.add(removedRocket);

      setTimeout(() => {
        this.departingRockets.delete(removedRocket);
        const scene = removedRocket.parent;
        scene.remove(removedRocket);
      }, 2000);
    }

    this.rockets.push(rocket);
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

  arriveAnimation = (rocket, time) => {
    const { curve } = rocket;
    const worldDirection = new THREE.Vector3();
    rocket.position.add(
      rocket.getWorldDirection(worldDirection).multiplyScalar(velocity * 20)
    );

    if (rocket.position.angleTo(curve.getPointAt(0)) < 0.01) {
      rocket.arrived(time);
      rocket.animation = this.flyAnimation;
    }
  };

  flyAnimation = (rocket, time) => {
    const { curve, curveScaleMultiplier, arrivalTime } = rocket;
    const elapsedTime = (time - arrivalTime) * 0.001;

    const loopTime = velocity;
    const arcLength1 = (elapsedTime % loopTime) / loopTime;
    const arcLength2 = ((elapsedTime + 0.1) % loopTime) / loopTime;

    const position = curve
      .getPointAt(arcLength1)
      .multiplyScalar(curveScaleMultiplier);
    const lookAtPosition = curve
      .getPointAt(arcLength2)
      .multiplyScalar(curveScaleMultiplier);

    rocket.position.copy(position);
    rocket.lookAt(lookAtPosition);
  };

  departAnimation = (rocket) => {
    const worldDirection = new THREE.Vector3();
    rocket.position.add(
      rocket.getWorldDirection(worldDirection).multiplyScalar(velocity * 20)
    );
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
