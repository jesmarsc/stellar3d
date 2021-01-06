import React, { useRef, useEffect, useContext } from 'react';
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

let graph = null;
let highlightLinks = new Set();

const updateHighlight = () => {
  graph.linkWidth(graph.linkWidth());
};

const Three = () => {
  const canvasRef = useRef();
  const uiContext = useContext(UIStateStoreContext);

  useEffect(() => {
    uiContext.setLoading(true);
    getNodes().then((nodes) => {
      const links = getLinks(nodes);
      graph = ForceGraph3D({ antialias: false, controlType: 'orbit' })(
        canvasRef.current
      )
        .nodeId('publicKey')
        .nodeLabel((node) => node.name || node.publicKey)
        .nodeAutoColorBy((node) => node.organizationId)
        .nodeOpacity(1)
        .nodeRelSize(10)
        .linkWidth((link) => (highlightLinks.has(link) ? 20 : 0))
        .linkColor((link) =>
          highlightLinks.has(link) ? 'rgba(255,255,255,1)' : 'white'
        )
        .linkDirectionalParticles(1)
        .linkDirectionalParticleWidth(2)
        .linkDirectionalParticleSpeed(0.003)
        .linkOpacity(0.04)
        .onBackgroundClick(() => {
          uiContext.setSelectedNode(null);
          highlightLinks.clear();
          updateHighlight();
        })
        .onNodeClick((node) => {
          if (node !== uiContext.selectedNode) highlightLinks.clear();
          uiContext.setSelectedNode(node);
          for (const link of node.links) {
            highlightLinks.add(link);
          }
          updateHighlight();
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
      graph.graphData({ nodes: [], links: [] });
    };
  }, [uiContext]);

  return <div ref={canvasRef} style={{ width: '100vw', height: '100vh' }} />;
};

export default Three;
