import React, { useRef, useEffect, useContext } from 'react';
import { reaction, when } from 'mobx';
import ForceGraph3D from '3d-force-graph';
import * as THREE from 'three';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { UIStoreContext } from '@stores/UIStore';
import { StellarStoreContext } from '@stores/StellarStore';
import { LedgerStoreContext } from '@stores/LedgerStore';

const bloomParams = {
  strength: 8,
  radius: 1,
  threshold: 0.2,
};

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  bloomParams.strength,
  bloomParams.radius,
  bloomParams.threshold
);

const highlightLinkMaterial = new THREE.LineBasicMaterial({
  linecap: 'round',
  linejoin: 'round',
  color: new THREE.Color(1, 0, 0),
  opacity: 0.8,
  transparent: true,
});

const regularLinkMaterial = new THREE.LineBasicMaterial({
  linecap: 'round',
  linejoin: 'round',
  color: new THREE.Color(1, 1, 1),
  opacity: 0.04,
  transparent: true,
});

let graph = ForceGraph3D({ antialias: false, controlType: 'orbit' })
  .nodeId('publicKey')
  .nodeLabel((node) => node.name || node.publicKey)
  .nodeAutoColorBy((node) => node.organizationId)
  .nodeOpacity(1)
  .nodeRelSize(40)
  .nodeResolution(4)
  .linkOpacity(0.04)
  .linkResolution(1)
  .enableNodeDrag(false)
  .warmupTicks(100)
  .cooldownTicks(0)
  .cooldownTime(0);

const Canvas = () => {
  const canvasRef = useRef();
  const uiStore = useContext(UIStoreContext);
  const stellarStore = useContext(StellarStoreContext);
  const ledgerStore = useContext(LedgerStoreContext);

  useEffect(() => {
    uiStore.setLoading(false);

    graph = graph(canvasRef.current)
      .onBackgroundClick(() => {
        uiStore.setSelectedNode(null);
      })
      .onNodeClick((node) => {
        uiStore.setSelectedNode(node);
      });

    graph.d3Force('link').distance(8000);
    graph.d3Force('charge').strength(-18000);
    graph.controls().enableDamping = true;
    graph.postProcessingComposer().addPass(bloomPass);

    when(
      () => !stellarStore.isLoading,
      () => {
        graph.graphData(stellarStore.graphData);

        graph.onEngineStop(() => {
          uiStore.setLoading(false);
          graph.cameraPosition({ x: 0, y: 0, z: 50000 }, { x: 0, y: 0, z: 0 });

          graph.cameraPosition(
            { x: 0, y: 0, z: 25000 },
            { x: 0, y: 0, z: 0 },
            1000
          );
        });
      }
    );

    const linkHighlightCleanup = reaction(
      () => uiStore.selectedNode,
      (selectedNode, previousSelectedNode) => {
        previousSelectedNode?.links.forEach(
          (link) => (link.__lineObj.material = regularLinkMaterial)
        );
        selectedNode?.links.forEach(
          (link) => (link.__lineObj.material = highlightLinkMaterial)
        );
      }
    );

    ledgerStore.addEventListener('spawnRocket', ({ detail: rocket }) => {
      graph.scene().add(rocket);
      const { curve } = rocket;

      const arriveAnimation = (time) => {
        const worldDirection = new THREE.Vector3();
        rocket.position.add(
          rocket.getWorldDirection(worldDirection).multiplyScalar(400)
        );

        if (rocket.position.angleTo(curve.getPointAt(0)) < 0.01) {
          rocket.arrived(time);
          return;
        }
        requestAnimationFrame(arriveAnimation);
      };
      requestAnimationFrame(arriveAnimation);
    });

    ledgerStore.addEventListener('removeRocket', ({ detail: rocket }) => {
      let cleanUp = false;
      const departAnimation = () => {
        const worldDirection = new THREE.Vector3();
        rocket.position.add(
          rocket.getWorldDirection(worldDirection).multiplyScalar(400)
        );

        if (cleanUp) {
          graph.scene().remove(rocket);
          return;
        }
        requestAnimationFrame(departAnimation);
      };
      requestAnimationFrame(departAnimation);
      setTimeout(() => (cleanUp = true), 1000);
    });

    const flyingAnimation = (time) => {
      for (const rocket of ledgerStore.ledgers) {
        const { curve, curveScaleMultiplier, arrivalTime } = rocket;
        const elapsedTime = (time - arrivalTime) * 0.001;

        const loopTime = 50;
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
      }

      requestAnimationFrame(flyingAnimation);
    };

    requestAnimationFrame(flyingAnimation);

    /*
    graph.scene().background = new THREE.CubeTextureLoader()
      .setPath(process.env.PUBLIC_URL + '/images/')
      .load(['px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png']);
    */

    return () => {
      graph._destructor();
      linkHighlightCleanup();
    };
  }, [uiStore, stellarStore, ledgerStore]);

  return <div ref={canvasRef} style={{ width: '100vw', height: '100vh' }} />;
};

export default Canvas;
