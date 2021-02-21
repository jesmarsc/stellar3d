import React, { useRef, useEffect, useContext } from 'react';
import { reaction } from 'mobx';
import ForceGraph3D from '3d-force-graph';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import * as THREE from 'three';

import { getNodes, getLinks } from '@utils/validators';
import { UIStateStoreContext } from '@stores';

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

let graph = null;

const Three = () => {
  const canvasRef = useRef();
  const uiContext = useContext(UIStateStoreContext);

  useEffect(() => {
    uiContext.setLoading(true);

    // REACTION TO UPDATE THE HIGHLIGHTED LINKS
    const linkReactionCleanup = reaction(
      () => uiContext.selectedNode,
      (selectedNode, previousSelectedNode) => {
        previousSelectedNode?.links.forEach(
          (link) => (link.__lineObj.material = regularLinkMaterial)
        );
        selectedNode?.links.forEach(
          (link) => (link.__lineObj.material = highlightLinkMaterial)
        );
      }
    );

    getNodes().then((nodes) => {
      const nodesMap = nodes.reduce(
        (map, node) => map.set(node.publicKey, node),
        new Map()
      );
      const links = getLinks(nodes, nodesMap);
      graph = ForceGraph3D({ antialias: false, controlType: 'orbit' })(
        canvasRef.current
      )
        .nodeId('publicKey')
        .nodeLabel((node) => node.name || node.publicKey)
        .nodeAutoColorBy((node) => node.organizationId)
        .nodeOpacity(1)
        .nodeRelSize(10)
        .linkDirectionalParticles(1)
        .linkDirectionalParticleWidth(2)
        .linkDirectionalParticleSpeed(0.003)
        .linkOpacity(0.04)
        .linkResolution(1)
        .onBackgroundClick(() => {
          uiContext.setSelectedNode(null);
        })
        .onNodeClick((node) => {
          uiContext.setSelectedNode(node);
        })
        .cameraPosition({ x: 0, y: 0, z: 4000 })
        .enableNodeDrag(false)
        .warmupTicks(100)
        .cooldownTime(0)
        .onEngineStop(() => uiContext.setLoading(false));

      /*
      graph.scene().background = new THREE.CubeTextureLoader()
        .setPath(process.env.PUBLIC_URL + '/images/')
        .load(['px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png']);
      */

      graph.graphData({ nodes, links });

      graph.d3Force('link').distance(1048);
      graph.d3Force('charge').strength(-2048);
      graph.controls().enableDamping = true;

      graph.postProcessingComposer().addPass(bloomPass);
    });

    return () => {
      graph._destructor();
      linkReactionCleanup();
    };
  }, [uiContext]);

  return <div ref={canvasRef} style={{ width: '100vw', height: '100vh' }} />;
};

export default Three;
