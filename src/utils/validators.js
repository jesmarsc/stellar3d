import axios from 'axios';

const apiURL = 'https://api.stellarbeat.io/v1/node';

const getNodes = async () => {
  try {
    const response = await axios.get(apiURL);
    const nodes = response.data;
    return nodes;
  } catch (error) {
    throw error;
  }
};

const getLinks = (nodes, nodesMap) => {
  const links = [];
  for (const node of nodes) {
    node.links = [];
    getLinksRecursively(node, node.quorumSet, links, nodesMap);
  }
  return links;
};

const getLinksRecursively = (node, quorumSet, links, nodesMap) => {
  const { validators, innerQuorumSets } = quorumSet;
  for (const validator of validators) {
    if (validator !== node.publicKey && nodesMap.has(validator)) {
      const link = { source: node.publicKey, target: validator };
      links.push(link);
      node.links.push(link);
    }
  }
  if (innerQuorumSets.length > 0) {
    for (const quorumSet of innerQuorumSets) {
      getLinksRecursively(node, quorumSet, links, nodesMap);
    }
  }
};

export { getNodes, getLinks };
