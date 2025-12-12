# Testing Strategy for Decentralized Systems

## 🌐 Testing Beam's Decentralized Architecture

Testing a decentralized peer-to-peer system like Beam requires fundamentally different approaches than traditional client-server applications. This guide covers comprehensive testing strategies specifically designed for decentralized systems.

## Table of Contents

- [Testing Challenges in Decentralized Systems](#testing-challenges-in-decentralized-systems)
- [Unit Testing](#unit-testing)
- [Integration Testing](#integration-testing)
- [Network Testing](#network-testing)
- [Chaos Engineering](#chaos-engineering)
- [Performance Testing](#performance-testing)
- [Security Testing](#security-testing)
- [Continuous Integration](#continuous-integration)

## Testing Challenges in Decentralized Systems

### Unique Challenges of P2P Testing

#### 1. **Network Partitioning**
```typescript
// Traditional testing assumes stable connections
test('API call succeeds', async () => {
  const response = await api.call('/endpoint');
  expect(response.status).toBe(200);
});

// Decentralized testing must handle network partitions
test('P2P routing handles network splits', async () => {
  // Simulate network partition
  await networkPartition.create();

  // Test that routing adapts
  const route = await findRoute(peerA, peerB);
  expect(route).toHandlePartitions();

  // Verify eventual consistency
  await networkPartition.heal();
  await waitForConsistency();
});
```

#### 2. **Eventual Consistency**
```typescript
// Traditional: Immediate consistency expected
test('Database update reflects immediately', async () => {
  await db.update(record);
  const result = await db.get(record.id);
  expect(result.version).toBe(2);
});

// Decentralized: Eventual consistency is normal
test('DHT updates propagate eventually', async () => {
  await dht.put(key, value);

  // Wait for propagation (not immediate)
  await waitForPropagation(key, value, { timeout: 5000 });

  // Verify all peers eventually see the update
  const peers = await getAllPeers();
  for (const peer of peers) {
    const peerValue = await peer.dht.get(key);
    expect(peerValue).toBe(value);
  }
});
```

#### 3. **Non-Deterministic Behavior**
```typescript
// Traditional: Predictable execution
test('Function returns expected value', () => {
  expect(add(2, 3)).toBe(5);
});

// Decentralized: Network conditions affect outcomes
test('Message routing under varying conditions', async () => {
  const scenarios = [
    { latency: 'low', peers: 10, expectSuccess: true },
    { latency: 'high', peers: 2, expectSuccess: false },
    { latency: 'variable', peers: 50, expectSuccess: true }
  ];

  for (const scenario of scenarios) {
    await simulateNetwork(scenario);
    const result = await sendMessage();
    expect(result.success).toBe(scenario.expectSuccess);
  }
});
```

#### 4. **Peer Diversity**
```typescript
// Traditional: Single environment
test('Works on Node.js 18', () => {
  // Single test environment
});

// Decentralized: Multiple peer environments
test('Works across diverse peer environments', async () => {
  const environments = [
    { os: 'linux', nodeVersion: '18', network: 'fast' },
    { os: 'macOS', nodeVersion: '20', network: 'slow' },
    { os: 'windows', nodeVersion: '18', network: 'unstable' },
    { os: 'raspberry-pi', nodeVersion: '16', network: 'edge' }
  ];

  for (const env of environments) {
    await testInEnvironment(env);
  }
});
```

## Unit Testing

### Core Component Testing

#### P2P Node Testing
```typescript
import { P2PNode } from '../src/p2p/node';
import { MockNetwork } from '../test/mocks/network';

describe('P2PNode', () => {
  let node: P2PNode;
  let mockNetwork: MockNetwork;

  beforeEach(() => {
    mockNetwork = new MockNetwork();
    node = new P2PNode({ network: mockNetwork });
  });

  test('connects to bootstrap peers', async () => {
    const bootstrapPeers = ['peer1', 'peer2', 'peer3'];
    await node.connectToBootstrap(bootstrapPeers);

    expect(mockNetwork.connectedPeers).toHaveLength(3);
    expect(node.getPeerCount()).toBe(3);
  });

  test('handles peer disconnection gracefully', async () => {
    await node.connect('peer1');
    expect(node.isConnected('peer1')).toBe(true);

    await mockNetwork.disconnect('peer1');
    await waitForEvent(node, 'peerDisconnected');

    expect(node.isConnected('peer1')).toBe(false);
    expect(node.getPeerCount()).toBe(0);
  });

  test('routes messages through network', async () => {
    // Set up network topology: A -> B -> C
    await node.connect('peerA');
    await mockNetwork.connectPeers('peerA', 'peerB');
    await mockNetwork.connectPeers('peerB', 'peerC');

    const message = { type: 'test', payload: 'hello' };
    await node.sendMessage('peerC', message);

    // Verify message routing through intermediate peer
    expect(mockNetwork.messageLog).toContainEqual({
      from: node.id,
      to: 'peerC',
      via: 'peerB',
      message
    });
  });
});
```

#### DHT Testing
```typescript
import { DHT } from '../src/p2p/dht';
import { KademliaTable } from '../src/p2p/kademlia';

describe('DHT Operations', () => {
  let dht: DHT;
  let kademlia: KademliaTable;

  beforeEach(() => {
    kademlia = new KademliaTable();
    dht = new DHT({ kademlia });
  });

  test('stores and retrieves values', async () => {
    const key = 'service:web-app';
    const value = { url: 'http://localhost:3000', peerId: 'peer123' };

    await dht.put(key, value);
    const retrieved = await dht.get(key);

    expect(retrieved).toEqual(value);
  });

  test('handles replication across peers', async () => {
    const key = 'domain:example.local';
    const value = { torAddress: 'abc123.onion' };

    // Simulate multiple peers storing the same key
    await Promise.all([
      dht.put(key, value),
      dht.simulatePeerPut('peerA', key, value),
      dht.simulatePeerPut('peerB', key, value)
    ]);

    // Verify replication
    const replicas = await dht.getReplicas(key);
    expect(replicas).toHaveLength(3);

    // Test data survives peer failure
    await dht.simulatePeerFailure('peerA');
    const survivingReplicas = await dht.getReplicas(key);
    expect(survivingReplicas).toHaveLength(2);
  });

  test('expires old records', async () => {
    const key = 'temp:key';
    const value = { data: 'temporary' };

    // Store with short TTL
    await dht.put(key, value, { ttl: 1000 }); // 1 second

    // Verify exists immediately
    expect(await dht.get(key)).toEqual(value);

    // Wait for expiration
    await sleep(1100);

    // Verify expired
    expect(await dht.get(key)).toBeNull();
  });
});
```

#### Tor Integration Testing
```typescript
import { TorManager } from '../src/tor/manager';
import { HiddenService } from '../src/tor/hidden-service';

describe('Tor Integration', () => {
  let torManager: TorManager;
  let hiddenService: HiddenService;

  beforeEach(async () => {
    torManager = new TorManager();
    hiddenService = new HiddenService({ torManager });
    await torManager.start();
  });

  afterEach(async () => {
    await torManager.stop();
  });

  test('creates hidden service', async () => {
    const service = await hiddenService.create({
      ports: [{ virtual: 80, target: 3000 }],
      privateKey: 'auto'
    });

    expect(service.onionAddress).toMatch(/^[a-z2-7]{56}\.onion$/);
    expect(service.ports).toContainEqual({ virtual: 80, target: 3000 });
  });

  test('handles Tor bootstrap failures', async () => {
    // Simulate Tor bootstrap failure
    torManager.simulateFailure('bootstrap');

    await expect(
      hiddenService.create({ ports: [{ virtual: 80, target: 3000 }] })
    ).rejects.toThrow('Tor bootstrap failed');

    // Verify fallback behavior
    expect(hiddenService.fallbackUsed).toBe(true);
  });

  test('routes traffic through hidden service', async () => {
    const service = await hiddenService.create({
      ports: [{ virtual: 80, target: 3000 }]
    });

    // Simulate incoming connection
    const mockRequest = { method: 'GET', path: '/' };
    const response = await hiddenService.handleRequest(mockRequest);

    expect(response.status).toBe(200);
    expect(hiddenService.requestLog).toContain(mockRequest);
  });
});
```

## Integration Testing

### End-to-End Tunnel Testing

#### Complete Tunnel Lifecycle
```typescript
import { BeamTunnel } from '../src/tunnel';
import { P2PNetwork } from '../src/p2p/network';
import { TorNetwork } from '../src/tor/network';

describe('End-to-End Tunnel', () => {
  let tunnel: BeamTunnel;
  let p2pNetwork: P2PNetwork;
  let torNetwork: TorNetwork;

  beforeEach(async () => {
    p2pNetwork = await P2PNetwork.createTestNetwork();
    torNetwork = await TorNetwork.createTestNetwork();
    tunnel = new BeamTunnel({ p2pNetwork, torNetwork });
  });

  test('complete tunnel lifecycle', async () => {
    // 1. Start tunnel
    const tunnelInfo = await tunnel.start({
      port: 3000,
      name: 'test-app',
      domain: 'test.local'
    });

    expect(tunnelInfo.status).toBe('starting');
    expect(tunnelInfo.urls.tor).toMatch(/\.onion$/);

    // 2. Wait for ready
    await waitForStatus(tunnel, 'active');

    // 3. Test local access
    const localResponse = await fetch('http://localhost:3000');
    expect(localResponse.ok).toBe(true);

    // 4. Test Tor access
    const torResponse = await fetch(tunnelInfo.urls.tor);
    expect(torResponse.ok).toBe(true);

    // 5. Test P2P domain resolution
    const resolved = await p2pNetwork.resolve('test.local');
    expect(resolved.torAddress).toBe(tunnelInfo.urls.tor);

    // 6. Stop tunnel
    await tunnel.stop();
    expect(tunnel.status).toBe('stopped');
  });

  test('handles network partitions', async () => {
    await tunnel.start({ port: 3000 });

    // Simulate network partition
    await p2pNetwork.partition();

    // Tunnel should continue working locally
    const localResponse = await fetch('http://localhost:3000');
    expect(localResponse.ok).toBe(true);

    // But remote access should fail gracefully
    await expect(fetch(tunnel.urls.tor)).rejects.toThrow();

    // Restore network
    await p2pNetwork.heal();

    // Remote access should work again
    const restoredResponse = await fetch(tunnel.urls.tor);
    expect(restoredResponse.ok).toBe(true);
  });
});
```

### Multi-Peer Testing

#### Peer Interaction Scenarios
```typescript
describe('Multi-Peer Interactions', () => {
  let peers: P2PNode[];

  beforeEach(async () => {
    peers = await createTestPeers(5); // Create 5 test peers
    await connectPeersInMesh(peers); // Connect in mesh topology
  });

  test('service discovery across peers', async () => {
    // Peer 1 registers a service
    await peers[0].registerService({
      id: 'web-service',
      type: 'http',
      endpoint: 'localhost:3000'
    });

    // Wait for propagation
    await waitForPropagation('web-service', peers.length);

    // All peers should discover the service
    for (const peer of peers) {
      const services = await peer.discoverServices();
      expect(services).toContainEqual(
        expect.objectContaining({ id: 'web-service' })
      );
    }
  });

  test('load balancing across peers', async () => {
    // Register same service on multiple peers
    const serviceId = 'load-balanced-service';

    await Promise.all([
      peers[0].registerService({ id: serviceId, endpoint: 'peer0:3000' }),
      peers[1].registerService({ id: serviceId, endpoint: 'peer1:3000' }),
      peers[2].registerService({ id: serviceId, endpoint: 'peer2:3000' })
    ]);

    // Simulate multiple requests
    const requests = Array(10).fill().map(() =>
      p2pNetwork.requestService(serviceId)
    );

    const responses = await Promise.all(requests);

    // Verify load balancing
    const endpoints = responses.map(r => r.endpoint);
    const uniqueEndpoints = [...new Set(endpoints)];

    expect(uniqueEndpoints).toHaveLength(3); // All peers used
    expect(endpoints.filter(e => e.includes('peer0')).length).toBeGreaterThan(0);
    expect(endpoints.filter(e => e.includes('peer1')).length).toBeGreaterThan(0);
    expect(endpoints.filter(e => e.includes('peer2')).length).toBeGreaterThan(0);
  });

  test('peer failure recovery', async () => {
    // Set up service on peer 0
    await peers[0].registerService({
      id: 'resilient-service',
      endpoint: 'peer0:3000'
    });

    // Verify service is discoverable
    for (const peer of peers.slice(1)) {
      const service = await peer.discoverService('resilient-service');
      expect(service).toBeTruthy();
    }

    // Simulate peer 0 failure
    await peers[0].fail();

    // Service should become unavailable
    for (const peer of peers.slice(1)) {
      await expect(peer.discoverService('resilient-service'))
        .rejects.toThrow('Service not found');
    }

    // Register service on peer 1 as backup
    await peers[1].registerService({
      id: 'resilient-service',
      endpoint: 'peer1:3000'
    });

    // Service should become available again
    for (const peer of peers.slice(2)) {
      const service = await peer.discoverService('resilient-service');
      expect(service.endpoint).toBe('peer1:3000');
    }
  });
});
```

## Network Testing

### P2P Network Simulation

#### Network Topology Testing
```typescript
import { NetworkSimulator } from '../test/network-simulator';

describe('Network Topologies', () => {
  let simulator: NetworkSimulator;

  beforeEach(() => {
    simulator = new NetworkSimulator();
  });

  test('star topology routing', async () => {
    const topology = await simulator.createStarTopology(5); // 1 center, 4 edges

    // Send message from edge to edge
    const route = await topology.routeMessage('edge1', 'edge4');

    // Should route through center
    expect(route.hops).toEqual(['edge1', 'center', 'edge4']);
    expect(route.totalLatency).toBeLessThan(100);
  });

  test('mesh topology resilience', async () => {
    const topology = await simulator.createMeshTopology(10);

    // Remove some connections
    await topology.removeConnections(5);

    // Test that routing still works
    const route = await topology.routeMessage('node1', 'node10');
    expect(route.success).toBe(true);
    expect(route.hops.length).toBeGreaterThan(2); // Multiple paths available
  });

  test('geographic routing optimization', async () => {
    const topology = await simulator.createGeographicTopology([
      { id: 'nyc', lat: 40.7, lon: -74.0 },
      { id: 'london', lat: 51.5, lon: -0.1 },
      { id: 'tokyo', lat: 35.7, lon: 139.7 },
      { id: 'sydney', lat: -33.9, lon: 151.2 }
    ]);

    // Route from NYC to Sydney
    const route = await topology.routeMessage('nyc', 'sydney');

    // Should prefer shorter geographic paths
    expect(route.totalDistance).toBeLessThan(25000); // km
  });
});
```

### Chaos Engineering

#### Network Failure Simulation
```typescript
import { ChaosEngine } from '../test/chaos-engine';

describe('Chaos Engineering Tests', () => {
  let chaos: ChaosEngine;
  let network: P2PNetwork;

  beforeEach(async () => {
    chaos = new ChaosEngine();
    network = await createTestNetwork(20); // 20 peers
  });

  test('survives peer crashes', async () => {
    // Register services across network
    await network.registerServicesRandomly(50);

    // Start chaos: randomly crash peers
    const chaosConfig = {
      peerCrashRate: 0.1, // 10% of peers crash per minute
      duration: 5 * 60 * 1000, // 5 minutes
      recovery: true // Peers can recover
    };

    await chaos.runPeerCrashScenario(network, chaosConfig);

    // Verify network remains functional
    const finalServices = await network.countDiscoverableServices();
    expect(finalServices).toBeGreaterThan(25); // At least 50% services still available

    const avgLatency = await network.measureAverageLatency();
    expect(avgLatency).toBeLessThan(200); // Performance acceptable
  });

  test('handles network partitions', async () => {
    // Create two network partitions
    const partition1 = network.peers.slice(0, 10);
    const partition2 = network.peers.slice(10);

    await chaos.createNetworkPartition(partition1, partition2);

    // Test intra-partition communication still works
    await testPartitionConnectivity(partition1, true);
    await testPartitionConnectivity(partition2, true);

    // Test inter-partition communication fails
    await testInterPartitionConnectivity(partition1, partition2, false);

    // Heal partition
    await chaos.healNetworkPartition();

    // Verify full connectivity restored
    await testInterPartitionConnectivity(partition1, partition2, true);
  });

  test('resists DDoS attacks', async () => {
    // Simulate DDoS attack on random peers
    const ddosConfig = {
      attackRate: 1000, // 1000 requests/second
      duration: 2 * 60 * 1000, // 2 minutes
      targets: 'random', // Attack random peers
      attackType: 'flood' // Connection flooding
    };

    await chaos.simulateDDoS(network, ddosConfig);

    // Verify network degrades gracefully
    const degradedServices = await network.countDiscoverableServices();
    expect(degradedServices).toBeGreaterThan(10); // Some services still work

    // Verify attacked peers recover
    await chaos.stopDDoS();
    await waitForRecovery(network, 30000); // 30 second recovery

    const recoveredServices = await network.countDiscoverableServices();
    expect(recoveredServices).toBeGreaterThan(40); // Most services recovered
  });
});
```

### Byzantine Fault Testing

#### Malicious Peer Simulation
```typescript
describe('Byzantine Fault Tolerance', () => {
  test('resists malicious routing', async () => {
    const network = await createTestNetwork(10);

    // Add malicious peers that drop or alter messages
    const maliciousPeers = await network.addMaliciousPeers(2, {
      behavior: 'dropMessages',
      dropRate: 0.8
    });

    // Send messages through network
    const successRate = await network.testMessageDelivery(100);

    // Network should still achieve reasonable success rate
    expect(successRate).toBeGreaterThan(0.6); // >60% success despite 20% malicious peers

    // Verify malicious peers are eventually identified
    for (const peer of maliciousPeers) {
      expect(await network.isPeerTrusted(peer.id)).toBe(false);
    }
  });

  test('detects data tampering', async () => {
    const network = await createTestNetwork(8);

    // Add peer that alters DHT data
    await network.addMaliciousPeer({
      behavior: 'tamperData',
      tamperRate: 0.3
    });

    // Store and retrieve data
    const originalData = { service: 'web', port: 3000 };
    await network.dht.put('test:key', originalData);

    // Multiple retrievals should detect tampering
    const results = await Promise.all(
      Array(5).fill().map(() => network.dht.get('test:key'))
    );

    // Most results should be correct
    const correctResults = results.filter(r =>
      r.service === 'web' && r.port === 3000
    );
    expect(correctResults.length).toBeGreaterThan(3);

    // Verify consensus mechanism rejects tampered data
    const consensusResult = await network.dht.getWithConsensus('test:key');
    expect(consensusResult).toEqual(originalData);
  });
});
```

## Performance Testing

### Decentralized Load Testing

#### P2P Load Generation
```typescript
import { LoadGenerator } from '../test/load-generator';

describe('Decentralized Load Testing', () => {
  let loadGen: LoadGenerator;

  beforeEach(() => {
    loadGen = new LoadGenerator();
  });

  test('scales with network size', async () => {
    const scenarios = [
      { peers: 10, load: 100 },
      { peers: 50, load: 500 },
      { peers: 100, load: 1000 }
    ];

    for (const scenario of scenarios) {
      const network = await createTestNetwork(scenario.peers);
      const results = await loadGen.runLoadTest(network, {
        requestsPerSecond: scenario.load,
        duration: 60 // 1 minute
      });

      // Performance should scale roughly with network size
      const expectedLatency = 50 + (scenario.peers * 2); // Base 50ms + 2ms per peer
      expect(results.averageLatency).toBeLessThan(expectedLatency);

      const expectedSuccessRate = Math.max(0.8, 1 - (scenario.load / scenario.peers / 10));
      expect(results.successRate).toBeGreaterThan(expectedSuccessRate);
    }
  });

  test('geographic distribution impact', async () => {
    // Test with peers in different geographic regions
    const geoNetwork = await createGeographicNetwork([
      { region: 'us-east', peers: 20 },
      { region: 'eu-west', peers: 15 },
      { region: 'asia-east', peers: 10 }
    ]);

    const results = await loadGen.runGeographicLoadTest(geoNetwork, {
      crossRegionRequests: 0.3, // 30% requests cross regions
      totalLoad: 1000
    });

    // Cross-region requests should have higher latency
    expect(results.crossRegionLatency).toBeGreaterThan(results.sameRegionLatency);

    // But overall success rate should remain high
    expect(results.overallSuccessRate).toBeGreaterThan(0.95);
  });
});
```

### Memory and Resource Testing

#### Decentralized Resource Monitoring
```typescript
describe('Resource Usage Testing', () => {
  test('memory usage scales with network size', async () => {
    const memoryTests = [
      { peers: 5, expectedMemory: 50 },   // MB
      { peers: 50, expectedMemory: 200 },  // MB
      { peers: 200, expectedMemory: 800 }  // MB
    ];

    for (const test of memoryTests) {
      const network = await createTestNetwork(test.peers);

      // Generate load
      await network.generateLoad({ duration: 30000 });

      const memoryUsage = await network.measureMemoryUsage();

      // Allow some variance but verify scaling
      expect(memoryUsage.average).toBeLessThan(test.expectedMemory * 1.5);
      expect(memoryUsage.average).toBeGreaterThan(test.expectedMemory * 0.5);
    }
  });

  test('garbage collection under load', async () => {
    const network = await createTestNetwork(20);

    // Monitor memory before load
    const initialMemory = await network.getMemoryUsage();

    // Generate sustained load
    const loadTest = network.generateLoad({
      requestsPerSecond: 100,
      duration: 120000 // 2 minutes
    });

    // Monitor memory during load
    const memorySamples = [];
    const monitor = setInterval(async () => {
      memorySamples.push(await network.getMemoryUsage());
    }, 5000);

    await loadTest;
    clearInterval(monitor);

    // Verify memory doesn't grow unbounded
    const finalMemory = memorySamples[memorySamples.length - 1];
    const memoryGrowth = finalMemory - initialMemory;

    expect(memoryGrowth).toBeLessThan(100); // Less than 100MB growth
    expect(finalMemory).toBeLessThan(initialMemory * 2); // Less than double

    // Verify garbage collection works
    await network.forceGarbageCollection();
    const afterGC = await network.getMemoryUsage();
    expect(afterGC).toBeLessThan(finalMemory);
  });
});
```

## Security Testing

### Decentralized Security Validation

#### Privacy Testing
```typescript
describe('Privacy and Anonymity Testing', () => {
  test('traffic analysis resistance', async () => {
    const network = await createTestNetwork(10);

    // Generate traffic patterns
    const traffic = await network.generateTrafficPatterns({
      patterns: ['web-browsing', 'api-calls', 'file-transfers'],
      duration: 60000 // 1 minute
    });

    // Analyze traffic for patterns
    const analysis = await analyzeTrafficPatterns(traffic);

    // Verify traffic analysis resistance
    expect(analysis.patternsDetected).toBeLessThan(0.3); // <30% pattern detection
    expect(analysis.identifiableFlows).toBeLessThan(0.1); // <10% identifiable flows
  });

  test('metadata leakage prevention', async () => {
    const network = await createTestNetwork(5);

    // Send messages with sensitive metadata
    const messages = [
      { content: 'secret data', metadata: { userId: '123', ip: '192.168.1.1' } },
      { content: 'private info', metadata: { sessionId: 'abc', location: 'NYC' } }
    ];

    for (const message of messages) {
      await network.sendMessage(message);
    }

    // Verify metadata is not leaked to intermediate peers
    for (const peer of network.peers) {
      const logs = await peer.getMessageLogs();

      for (const log of logs) {
        // Logs should not contain sensitive metadata
        expect(log).not.toContain('userId');
        expect(log).not.toContain('192.168.1.1');
        expect(log).not.toContain('sessionId');
        expect(log).not.toContain('NYC');
      }
    }
  });
});
```

### Cryptographic Testing

#### End-to-End Encryption Validation
```typescript
describe('Cryptographic Security Testing', () => {
  test('end-to-end encryption integrity', async () => {
    const alice = await createTestPeer('alice');
    const bob = await createTestPeer('bob');

    // Establish encrypted connection
    const connection = await alice.connect(bob, { encrypted: true });

    // Send message through encrypted channel
    const originalMessage = 'This is a secret message';
    await connection.send(originalMessage);

    // Verify message integrity
    const receivedMessage = await bob.receive();
    expect(receivedMessage).toBe(originalMessage);

    // Verify encryption is actually working
    const intercepted = await connection.getInterceptedData();
    expect(intercepted).not.toContain(originalMessage); // Should be encrypted
    expect(intercepted.length).toBeGreaterThan(originalMessage.length); // Ciphertext longer
  });

  test('forward secrecy validation', async () => {
    const peer1 = await createTestPeer('peer1');
    const peer2 = await createTestPeer('peer2');

    // Establish connection and exchange some data
    const connection = await peer1.connect(peer2);
    await connection.send('initial message');

    // Capture session keys
    const initialKeys = await connection.getSessionKeys();

    // Force key rotation
    await connection.rotateKeys();

    // Send message with new keys
    await connection.send('message after rotation');

    // Verify new keys are different
    const newKeys = await connection.getSessionKeys();
    expect(newKeys).not.toEqual(initialKeys);

    // Verify old intercepted data cannot be decrypted with new keys
    const interceptedOld = await connection.getOldInterceptedData();
    expect(async () => {
      await decryptWithKeys(interceptedOld, newKeys);
    }).toThrow();
  });
});
```

## Continuous Integration

### Decentralized CI/CD Pipeline

#### Multi-Environment Testing
```yaml
# .github/workflows/decentralized-testing.yml
name: Decentralized Testing

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [16, 18, 20]
        network-config: [fast, slow, unreliable]

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm test -- --network=${{ matrix.network-config }}

      - name: Upload coverage
        uses: codecov/codecov-action@v3

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres: latest
      redis: latest

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Start test network
        run: npm run test:network

      - name: Run integration tests
        run: npm run test:integration

  chaos-tests:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Run chaos engineering tests
        run: npm run test:chaos

      - name: Generate chaos report
        run: npm run test:chaos:report

  performance-tests:
    runs-on: ubuntu-latest
    if: github.event_name == 'schedule' # Run weekly

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Run performance benchmarks
        run: npm run bench

      - name: Compare with baseline
        run: npm run bench:compare

      - name: Upload performance report
        uses: actions/upload-artifact@v3
        with:
          name: performance-report
          path: reports/performance/
```

### Automated Test Generation

#### Property-Based Testing for P2P
```typescript
import { fc } from 'fast-check';
import { P2PNetwork } from '../src/p2p/network';

// Generate random network topologies
const networkArb = fc.record({
  peerCount: fc.integer({ min: 3, max: 20 }),
  connectionProbability: fc.float({ min: 0.1, max: 1.0 }),
  latencyDistribution: fc.constantFrom('uniform', 'normal', 'exponential')
});

// Generate random message patterns
const messageArb = fc.record({
  size: fc.integer({ min: 1, max: 1000000 }), // 1B to 1MB
  type: fc.constantFrom('data', 'control', 'heartbeat'),
  priority: fc.constantFrom('low', 'normal', 'high'),
  ttl: fc.integer({ min: 1, max: 100 })
});

describe('Property-Based P2P Testing', () => {
  test('network always eventually delivers messages', async () => {
    await fc.assert(
      fc.asyncProperty(networkArb, messageArb, async (networkConfig, messageConfig) => {
        const network = await createNetworkFromConfig(networkConfig);
        const message = generateMessage(messageConfig);

        // Send message
        const sendResult = await network.send(message);

        // Eventually message should be delivered or timeout
        const deliveryResult = await waitForDeliveryOrTimeout(message.id, 30000);

        // Property: Either delivered or network acknowledged failure
        return deliveryResult.delivered || deliveryResult.failedGracefully;
      }),
      { numRuns: 100 }
    );
  });

  test('network remains connected despite failures', async () => {
    await fc.assert(
      fc.asyncProperty(networkArb, fc.integer({ min: 1, max: 5 }), async (networkConfig, failureCount) => {
        const network = await createNetworkFromConfig(networkConfig);

        // Remove some peers (simulate failures)
        for (let i = 0; i < failureCount; i++) {
          await network.removeRandomPeer();
        }

        // Property: Remaining network should stay connected if enough peers remain
        const remainingPeers = network.getConnectedPeers().length;
        if (remainingPeers >= 2) {
          return network.isFullyConnected();
        }
        return true; // Can't be connected with < 2 peers
      }),
      { numRuns: 50 }
    );
  });
});
```

### Test Result Analysis

#### Decentralized Test Analytics
```typescript
import { TestAnalytics } from '../src/test/analytics';

describe('Test Result Analysis', () => {
  let analytics: TestAnalytics;

  beforeEach(() => {
    analytics = new TestAnalytics();
  });

  test('identifies network-related test failures', async () => {
    const testResults = await loadTestResults('integration-tests.json');

    const analysis = await analytics.analyzeResults(testResults);

    // Network-related failures should be categorized
    const networkFailures = analysis.failures.filter(f =>
      f.category === 'network'
    );

    expect(networkFailures.length).toBeGreaterThan(0);

    // Each network failure should have remediation suggestions
    for (const failure of networkFailures) {
      expect(failure.remediation).toBeDefined();
      expect(failure.confidence).toBeGreaterThan(0.5);
    }
  });

  test('tracks test reliability over time', async () => {
    const historicalResults = await loadHistoricalTestResults(30); // 30 days

    const reliability = await analytics.calculateReliability(historicalResults);

    // Overall reliability should be tracked
    expect(reliability.overall).toBeDefined();
    expect(reliability.byCategory).toBeDefined();

    // Network tests should have reliability metrics
    expect(reliability.byCategory.network).toBeDefined();
    expect(reliability.byCategory.network.meanTimeBetweenFailures).toBeDefined();
  });

  test('generates test optimization recommendations', async () => {
    const testSuite = await loadTestSuite('p2p-tests');
    const results = await runTestSuite(testSuite);

    const recommendations = await analytics.generateRecommendations(results);

    // Should identify slow tests
    expect(recommendations.slowTests).toBeDefined();

    // Should identify flaky tests
    expect(recommendations.flakyTests).toBeDefined();

    // Should suggest parallelization opportunities
    expect(recommendations.parallelizationCandidates).toBeDefined();
  });
});
```

This comprehensive testing strategy ensures Beam's decentralized architecture is thoroughly validated across all dimensions - from unit tests to chaos engineering, ensuring reliability and performance in real-world decentralized scenarios. The focus on network-specific testing challenges makes this approach uniquely suited for P2P systems like Beam.


