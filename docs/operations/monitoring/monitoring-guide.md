# Decentralized Network Monitoring

## 🔍 Monitoring Beam's P2P Network

Monitoring a decentralized peer-to-peer network requires fundamentally different approaches than traditional centralized systems. This guide covers observability strategies specifically designed for distributed networks.

## Table of Contents

- [Decentralized Monitoring Challenges](#decentralized-monitoring-challenges)
- [Peer Health Monitoring](#peer-health-monitoring)
- [Network Topology Observability](#network-topology-observability)
- [Distributed Metrics Collection](#distributed-metrics-collection)
- [Alerting Strategies](#alerting-strategies)
- [Performance Monitoring](#performance-monitoring)
- [Security Monitoring](#security-monitoring)
- [Operational Dashboards](#operational-dashboards)

## Decentralized Monitoring Challenges

### Unique Challenges of P2P Monitoring

#### 1. **No Central Authority**
```typescript
// Traditional monitoring (centralized)
const monitor = new CentralMonitor();
monitor.watch('api-server');
monitor.alertWhen('cpu > 80%');

// Decentralized monitoring (distributed)
const peerMonitor = new PeerMonitor(peerId);
peerMonitor.watchNeighbors();
peerMonitor.reportToNetwork();
// No single "source of truth"
```

#### 2. **Dynamic Network Topology**
```typescript
// Traditional: Static infrastructure
const servers = ['web-1', 'web-2', 'db-1'];
monitor.watchServers(servers);

// Decentralized: Dynamic peer network
const peers = await discoverPeers(); // Changes constantly
monitor.watchPeers(peers); // Must adapt to network changes
```

#### 3. **Partial Observability**
```typescript
// Traditional: Full visibility
monitor.getSystemMetrics(); // Knows everything

// Decentralized: Limited local visibility
monitor.getLocalMetrics(); // Only knows about self and neighbors
monitor.gossipMetrics(); // Shares info through network
```

#### 4. **Eventual Consistency**
```typescript
// Traditional: Immediate alerts
if (server.down) alert('Server down!');

// Decentralized: Eventual detection
if (peer.unreachable) {
  waitForConfirmation(); // Multiple peers must agree
  if (consensusReached) alert('Peer likely down');
}
```

## Peer Health Monitoring

### Individual Peer Health Checks

#### Local Health Monitoring
```typescript
interface PeerHealth {
  peerId: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: {
    cpu: HealthCheck;
    memory: HealthCheck;
    network: HealthCheck;
    storage: HealthCheck;
    p2p: HealthCheck;
  };
  lastUpdated: Date;
  version: string;
}

class PeerHealthMonitor {
  private health: PeerHealth;

  async performHealthChecks(): Promise<PeerHealth> {
    const checks = await Promise.all([
      this.checkCPU(),
      this.checkMemory(),
      this.checkNetwork(),
      this.checkStorage(),
      this.checkP2PConnectivity()
    ]);

    this.health = {
      peerId: this.peerId,
      status: this.calculateStatus(checks),
      checks: {
        cpu: checks[0],
        memory: checks[1],
        network: checks[2],
        storage: checks[3],
        p2p: checks[4]
      },
      lastUpdated: new Date(),
      version: process.env.BEAM_VERSION
    };

    return this.health;
  }

  private async checkP2PConnectivity(): Promise<HealthCheck> {
    const neighbors = await this.getNeighbors();
    const reachable = await this.testReachability(neighbors);

    return {
      name: 'p2p-connectivity',
      status: reachable.length > 0 ? 'healthy' : 'unhealthy',
      value: reachable.length / neighbors.length,
      message: `Connected to ${reachable.length}/${neighbors.length} neighbors`
    };
  }
}
```

#### Peer Health Propagation
```typescript
class HealthPropagator {
  private healthHistory: Map<string, PeerHealth[]> = new Map();

  async propagateHealth(health: PeerHealth): Promise<void> {
    // Store local health history
    this.storeHealth(health);

    // Share with neighbors
    await this.shareWithNeighbors(health);

    // Gossip to network (limited flooding)
    await this.gossipHealth(health);
  }

  private async shareWithNeighbors(health: PeerHealth): Promise<void> {
    const neighbors = await this.getNeighbors();

    await Promise.allSettled(
      neighbors.map(neighbor =>
        this.sendHealthToPeer(neighbor, health)
      )
    );
  }

  private async gossipHealth(health: PeerHealth): Promise<void> {
    // Select random peers to gossip with
    const gossipPeers = await this.selectGossipPeers(3);

    // Send health with TTL to prevent infinite propagation
    const gossipMessage = {
      type: 'health-gossip',
      health,
      ttl: 5, // Decrement on each hop
      origin: this.peerId,
      timestamp: Date.now()
    };

    await Promise.allSettled(
      gossipPeers.map(peer => this.sendGossip(peer, gossipMessage))
    );
  }
}
```

### Network-Wide Health Aggregation

#### Distributed Health Aggregation
```typescript
class NetworkHealthAggregator {
  private healthReports: Map<string, PeerHealth> = new Map();
  private aggregation: NetworkHealth;

  async aggregateHealth(): Promise<NetworkHealth> {
    // Collect health reports from known peers
    const peers = await this.getKnownPeers();
    const reports = await Promise.allSettled(
      peers.map(peer => this.requestHealthFromPeer(peer))
    );

    // Update local health report cache
    reports.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        this.healthReports.set(peers[index], result.value);
      }
    });

    // Calculate network health
    this.aggregation = {
      totalPeers: peers.length,
      healthyPeers: this.countHealthyPeers(),
      degradedPeers: this.countDegradedPeers(),
      unhealthyPeers: this.countUnhealthyPeers(),
      averageLatency: await this.calculateAverageLatency(),
      networkConnectivity: await this.assessConnectivity(),
      lastUpdated: new Date()
    };

    return this.aggregation;
  }

  private countHealthyPeers(): number {
    return Array.from(this.healthReports.values())
      .filter(health => health.status === 'healthy')
      .length;
  }

  private async calculateAverageLatency(): Promise<number> {
    const latencies = [];

    for (const [peerId, health] of this.healthReports) {
      try {
        const latency = await this.measureLatencyToPeer(peerId);
        latencies.push(latency);
      } catch (error) {
        // Peer unreachable
      }
    }

    if (latencies.length === 0) return 0;

    return latencies.reduce((sum, lat) => sum + lat, 0) / latencies.length;
  }
}
```

## Network Topology Observability

### Dynamic Topology Mapping

#### Real-Time Topology Discovery
```typescript
interface NetworkTopology {
  peers: Map<string, PeerInfo>;
  connections: Connection[];
  regions: Map<string, string[]>; // Region -> Peer IDs
  lastUpdated: Date;
}

class TopologyMapper {
  private topology: NetworkTopology;

  async mapNetwork(): Promise<NetworkTopology> {
    // Discover all reachable peers
    const peers = await this.discoverPeers();

    // Map peer information
    const peerMap = new Map();
    for (const peer of peers) {
      peerMap.set(peer.id, await this.getPeerInfo(peer));
    }

    // Discover connections between peers
    const connections = await this.discoverConnections(peerMap);

    // Group by geographic regions
    const regions = await this.groupByRegion(peerMap);

    this.topology = {
      peers: peerMap,
      connections,
      regions,
      lastUpdated: new Date()
    };

    return this.topology;
  }

  private async discoverPeers(): Promise<Peer[]> {
    // Start from bootstrap peers
    const bootstrapPeers = await this.getBootstrapPeers();
    const discovered = new Set();

    // Breadth-first discovery
    const queue = [...bootstrapPeers];
    while (queue.length > 0) {
      const peer = queue.shift();
      if (discovered.has(peer.id)) continue;

      discovered.add(peer.id);

      // Find this peer's neighbors
      const neighbors = await this.getPeerNeighbors(peer);
      queue.push(...neighbors.filter(n => !discovered.has(n.id)));
    }

    return Array.from(discovered).map(id => ({ id }));
  }
}
```

#### Topology Visualization
```typescript
class TopologyVisualizer {
  async generateVisualization(topology: NetworkTopology): Promise<string> {
    // Generate Graphviz DOT format
    let dot = 'digraph BeamNetwork {\n';
    dot += '  rankdir=LR;\n';
    dot += '  node [shape=circle, style=filled];\n\n';

    // Add peers
    for (const [peerId, peerInfo] of topology.peers) {
      const color = this.getPeerColor(peerInfo);
      const label = `${peerId}\\n${peerInfo.region}`;
      dot += `  "${peerId}" [fillcolor="${color}", label="${label}"];\n`;
    }

    dot += '\n';

    // Add connections
    for (const connection of topology.connections) {
      const style = this.getConnectionStyle(connection);
      dot += `  "${connection.from}" -> "${connection.to}" ${style};\n`;
    }

    dot += '}\n';

    return dot;
  }

  private getPeerColor(peerInfo: PeerInfo): string {
    switch (peerInfo.status) {
      case 'healthy': return 'green';
      case 'degraded': return 'yellow';
      case 'unhealthy': return 'red';
      default: return 'gray';
    }
  }

  private getConnectionStyle(connection: Connection): string {
    const latency = connection.latency;
    let color = 'black';
    let penwidth = '1';

    if (latency < 50) {
      color = 'green';
      penwidth = '3';
    } else if (latency < 200) {
      color = 'orange';
      penwidth = '2';
    } else {
      color = 'red';
      penwidth = '1';
    }

    return `[color="${color}", penwidth=${penwidth}]`;
  }
}
```

### Geographic Distribution Monitoring

#### Regional Health Assessment
```typescript
class GeographicMonitor {
  private regions: Map<string, RegionHealth> = new Map();

  async monitorRegions(): Promise<Map<string, RegionHealth>> {
    const topology = await this.getTopology();

    // Group peers by region
    const regionPeers = new Map<string, PeerInfo[]>();
    for (const [peerId, peerInfo] of topology.peers) {
      const region = peerInfo.region;
      if (!regionPeers.has(region)) {
        regionPeers.set(region, []);
      }
      regionPeers.get(region)!.push(peerInfo);
    }

    // Assess health of each region
    for (const [region, peers] of regionPeers) {
      const health = await this.assessRegionHealth(region, peers);
      this.regions.set(region, health);
    }

    return this.regions;
  }

  private async assessRegionHealth(region: string, peers: PeerInfo[]): Promise<RegionHealth> {
    const healthyPeers = peers.filter(p => p.status === 'healthy').length;
    const totalPeers = peers.length;
    const healthRatio = healthyPeers / totalPeers;

    // Calculate regional connectivity
    const connectivity = await this.measureRegionalConnectivity(peers);

    // Assess cross-region connectivity
    const crossRegionHealth = await this.assessCrossRegionConnectivity(region);

    let status: 'healthy' | 'degraded' | 'critical';
    if (healthRatio >= 0.8 && connectivity >= 0.9) {
      status = 'healthy';
    } else if (healthRatio >= 0.5 || connectivity >= 0.7) {
      status = 'degraded';
    } else {
      status = 'critical';
    }

    return {
      region,
      status,
      totalPeers,
      healthyPeers,
      healthRatio,
      connectivity,
      crossRegionHealth,
      lastAssessed: new Date()
    };
  }
}
```

## Distributed Metrics Collection

### Peer Metrics Collection

#### Local Metrics Gathering
```typescript
interface PeerMetrics {
  peerId: string;
  timestamp: Date;
  system: {
    cpu: number;        // Percentage
    memory: number;     // Bytes used
    disk: number;       // Bytes used
    network: {
      bytesIn: number;
      bytesOut: number;
      connections: number;
    };
  };
  beam: {
    tunnels: number;
    activeConnections: number;
    messagesProcessed: number;
    p2pPeers: number;
    dhtLookups: number;
  };
  performance: {
    averageLatency: number;
    errorRate: number;
    throughput: number;
  };
}

class MetricsCollector {
  async collectMetrics(): Promise<PeerMetrics> {
    const [systemMetrics, beamMetrics, perfMetrics] = await Promise.all([
      this.collectSystemMetrics(),
      this.collectBeamMetrics(),
      this.collectPerformanceMetrics()
    ]);

    return {
      peerId: this.peerId,
      timestamp: new Date(),
      system: systemMetrics,
      beam: beamMetrics,
      performance: perfMetrics
    };
  }

  private async collectSystemMetrics() {
    // Use system APIs to gather metrics
    const cpu = await this.getCPUUsage();
    const memory = await this.getMemoryUsage();
    const disk = await this.getDiskUsage();
    const network = await this.getNetworkStats();

    return { cpu, memory, disk, network };
  }

  private async collectBeamMetrics() {
    // Gather Beam-specific metrics
    const tunnels = await this.getTunnelCount();
    const connections = await this.getActiveConnections();
    const messages = await this.getMessagesProcessed();
    const peers = await this.getP2PPeerCount();
    const lookups = await this.getDHTLookupCount();

    return {
      tunnels,
      activeConnections: connections,
      messagesProcessed: messages,
      p2pPeers: peers,
      dhtLookups: lookups
    };
  }
}
```

#### Metrics Aggregation and Analysis
```typescript
class MetricsAggregator {
  private metricsHistory: Map<string, PeerMetrics[]> = new Map();
  private aggregation: AggregatedMetrics;

  async aggregateMetrics(): Promise<AggregatedMetrics> {
    // Collect metrics from all known peers
    const peers = await this.getKnownPeers();
    const metrics = await Promise.allSettled(
      peers.map(peer => this.requestMetricsFromPeer(peer))
    );

    // Store in history
    metrics.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        this.storePeerMetrics(peers[index], result.value);
      }
    });

    // Calculate aggregates
    this.aggregation = {
      totalPeers: peers.length,
      activePeers: this.countActivePeers(),
      system: await this.aggregateSystemMetrics(),
      beam: await this.aggregateBeamMetrics(),
      performance: await this.aggregatePerformanceMetrics(),
      trends: await this.calculateTrends(),
      lastUpdated: new Date()
    };

    return this.aggregation;
  }

  private async aggregateSystemMetrics(): Promise<SystemAggregates> {
    const allMetrics = Array.from(this.metricsHistory.values())
      .flat()
      .filter(m => m.timestamp > Date.now() - 300000); // Last 5 minutes

    const cpuUsage = allMetrics.map(m => m.system.cpu);
    const memoryUsage = allMetrics.map(m => m.system.memory);

    return {
      averageCPU: cpuUsage.reduce((a, b) => a + b, 0) / cpuUsage.length,
      averageMemory: memoryUsage.reduce((a, b) => a + b, 0) / memoryUsage.length,
      peakCPU: Math.max(...cpuUsage),
      peakMemory: Math.max(...memoryUsage),
      totalNetworkIn: allMetrics.reduce((sum, m) => sum + m.system.network.bytesIn, 0),
      totalNetworkOut: allMetrics.reduce((sum, m) => sum + m.system.network.bytesOut, 0)
    };
  }

  private async calculateTrends(): Promise<MetricTrends> {
    const now = Date.now();
    const oneHourAgo = now - 3600000;
    const oneDayAgo = now - 86400000;

    const recentMetrics = Array.from(this.metricsHistory.values())
      .flat()
      .filter(m => m.timestamp > oneHourAgo);

    const historicalMetrics = Array.from(this.metricsHistory.values())
      .flat()
      .filter(m => m.timestamp > oneDayAgo && m.timestamp <= oneHourAgo);

    return {
      peerCount: this.calculateTrend(
        historicalMetrics.length,
        recentMetrics.length
      ),
      averageLatency: this.calculateTrend(
        this.averageOf(historicalMetrics.map(m => m.performance.averageLatency)),
        this.averageOf(recentMetrics.map(m => m.performance.averageLatency))
      ),
      errorRate: this.calculateTrend(
        this.averageOf(historicalMetrics.map(m => m.performance.errorRate)),
        this.averageOf(recentMetrics.map(m => m.performance.errorRate))
      )
    };
  }

  private calculateTrend(oldValue: number, newValue: number): 'up' | 'down' | 'stable' {
    const change = (newValue - oldValue) / oldValue;
    if (change > 0.05) return 'up';
    if (change < -0.05) return 'down';
    return 'stable';
  }
}
```

## Alerting Strategies

### Decentralized Alert Generation

#### Local Alert Detection
```typescript
interface Alert {
  id: string;
  type: AlertType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  peerId: string;
  timestamp: Date;
  metadata: Record<string, any>;
}

type AlertType =
  | 'peer-down'
  | 'high-latency'
  | 'network-partition'
  | 'resource-exhaustion'
  | 'security-threat'
  | 'performance-degradation';

class AlertGenerator {
  private activeAlerts: Map<string, Alert> = new Map();

  async checkForAlerts(metrics: PeerMetrics, topology: NetworkTopology): Promise<Alert[]> {
    const alerts: Alert[] = [];

    // Check peer health
    const healthAlerts = await this.checkPeerHealth(metrics);
    alerts.push(...healthAlerts);

    // Check network connectivity
    const connectivityAlerts = await this.checkConnectivity(metrics, topology);
    alerts.push(...connectivityAlerts);

    // Check performance
    const performanceAlerts = await this.checkPerformance(metrics);
    alerts.push(...performanceAlerts);

    // Check security
    const securityAlerts = await this.checkSecurity(metrics);
    alerts.push(...securityAlerts);

    // Update active alerts
    this.updateActiveAlerts(alerts);

    return alerts;
  }

  private async checkPeerHealth(metrics: PeerMetrics): Promise<Alert[]> {
    const alerts: Alert[] = [];

    if (metrics.system.cpu > 90) {
      alerts.push({
        id: `cpu-high-${metrics.peerId}`,
        type: 'resource-exhaustion',
        severity: 'high',
        title: 'High CPU Usage',
        description: `Peer ${metrics.peerId} CPU usage at ${metrics.system.cpu}%`,
        peerId: metrics.peerId,
        timestamp: new Date(),
        metadata: { cpuUsage: metrics.system.cpu }
      });
    }

    if (metrics.system.memory > 0.9 * this.getTotalMemory()) {
      alerts.push({
        id: `memory-high-${metrics.peerId}`,
        type: 'resource-exhaustion',
        severity: 'high',
        title: 'High Memory Usage',
        description: `Peer ${metrics.peerId} memory usage critically high`,
        peerId: metrics.peerId,
        timestamp: new Date(),
        metadata: { memoryUsage: metrics.system.memory }
      });
    }

    return alerts;
  }

  private async checkConnectivity(metrics: PeerMetrics, topology: NetworkTopology): Promise<Alert[]> {
    const alerts: Alert[] = [];

    const connectedPeers = topology.connections.filter(c =>
      c.from === metrics.peerId || c.to === metrics.peerId
    ).length;

    if (connectedPeers < 3) {
      alerts.push({
        id: `low-connectivity-${metrics.peerId}`,
        type: 'network-partition',
        severity: 'medium',
        title: 'Low Network Connectivity',
        description: `Peer ${metrics.peerId} only connected to ${connectedPeers} peers`,
        peerId: metrics.peerId,
        timestamp: new Date(),
        metadata: { connectedPeers }
      });
    }

    return alerts;
  }
}
```

#### Distributed Alert Propagation
```typescript
class AlertPropagator {
  async propagateAlert(alert: Alert): Promise<void> {
    // Store locally
    await this.storeAlert(alert);

    // Share with immediate neighbors
    await this.shareWithNeighbors(alert);

    // Propagate to alert aggregation points
    if (alert.severity === 'high' || alert.severity === 'critical') {
      await this.propagateToAggregators(alert);
    }

    // Escalate if needed
    if (alert.severity === 'critical') {
      await this.escalateAlert(alert);
    }
  }

  private async shareWithNeighbors(alert: Alert): Promise<void> {
    const neighbors = await this.getNeighbors();

    await Promise.allSettled(
      neighbors.map(neighbor =>
        this.sendAlertToPeer(neighbor, alert)
      )
    );
  }

  private async propagateToAggregators(alert: Alert): Promise<void> {
    const aggregators = await this.findAlertAggregators();

    const propagationMessage = {
      type: 'alert-propagation',
      alert,
      ttl: 10, // Limit propagation hops
      path: [this.peerId]
    };

    await Promise.allSettled(
      aggregators.map(aggregator =>
        this.sendPropagationMessage(aggregator, propagationMessage)
      )
    );
  }
}
```

### Alert Correlation and Analysis

#### Cross-Peer Alert Correlation
```typescript
class AlertCorrelator {
  private alerts: Alert[] = [];
  private correlations: AlertCorrelation[] = [];

  async correlateAlerts(newAlerts: Alert[]): Promise<AlertCorrelation[]> {
    // Add new alerts
    this.alerts.push(...newAlerts);

    // Remove old alerts (keep last 24 hours)
    const oneDayAgo = Date.now() - 86400000;
    this.alerts = this.alerts.filter(alert => alert.timestamp.getTime() > oneDayAgo);

    // Find correlations
    const correlations = await this.findCorrelations();

    // Update correlations
    this.correlations = correlations;

    return correlations;
  }

  private async findCorrelations(): Promise<AlertCorrelation[]> {
    const correlations: AlertCorrelation[] = [];

    // Group alerts by time window (5-minute windows)
    const timeWindows = this.groupAlertsByTimeWindow(5 * 60 * 1000);

    for (const [window, alerts] of timeWindows) {
      // Look for patterns
      const patternCorrelations = await this.findPatternCorrelations(alerts);
      correlations.push(...patternCorrelations);

      // Look for peer clusters
      const peerCorrelations = await this.findPeerCorrelations(alerts);
      correlations.push(...peerCorrelations);

      // Look for cascading failures
      const cascadeCorrelations = await this.findCascadeCorrelations(alerts);
      correlations.push(...cascadeCorrelations);
    }

    return correlations;
  }

  private async findPatternCorrelations(alerts: Alert[]): Promise<AlertCorrelation[]> {
    const correlations: AlertCorrelation[] = [];

    // Group by alert type
    const byType = new Map<AlertType, Alert[]>();
    alerts.forEach(alert => {
      if (!byType.has(alert.type)) byType.set(alert.type, []);
      byType.get(alert.type)!.push(alert);
    });

    // Check for high concentrations of same alert type
    for (const [type, typeAlerts] of byType) {
      if (typeAlerts.length >= 5) { // 5 or more similar alerts
        correlations.push({
          id: `pattern-${type}-${Date.now()}`,
          type: 'pattern',
          description: `Multiple ${type} alerts detected`,
          alerts: typeAlerts.map(a => a.id),
          severity: this.calculateCorrelationSeverity(typeAlerts),
          timestamp: new Date()
        });
      }
    }

    return correlations;
  }

  private async findPeerCorrelations(alerts: Alert[]): Promise<AlertCorrelation[]> {
    const correlations: AlertCorrelation[] = [];

    // Group by peer
    const byPeer = new Map<string, Alert[]>();
    alerts.forEach(alert => {
      if (!byPeer.has(alert.peerId)) byPeer.set(alert.peerId, []);
      byPeer.get(alert.peerId)!.push(alert);
    });

    // Check for peers with multiple alerts
    for (const [peerId, peerAlerts] of byPeer) {
      if (peerAlerts.length >= 3) {
        correlations.push({
          id: `peer-cluster-${peerId}-${Date.now()}`,
          type: 'peer-cluster',
          description: `Peer ${peerId} experiencing multiple issues`,
          alerts: peerAlerts.map(a => a.id),
          severity: 'high',
          timestamp: new Date()
        });
      }
    }

    return correlations;
  }
}
```

## Performance Monitoring

### End-to-End Performance Tracking

#### Message Latency Monitoring
```typescript
class LatencyMonitor {
  private latencies: Map<string, number[]> = new Map();
  private messageTraces: Map<string, MessageTrace> = new Map();

  async trackMessageLatency(messageId: string, startTime: Date): Promise<void> {
    // Store message trace
    this.messageTraces.set(messageId, {
      id: messageId,
      startTime,
      hops: [{
        peerId: this.peerId,
        timestamp: new Date(),
        type: 'sent'
      }]
    });
  }

  async recordHop(messageId: string, peerId: string, hopType: 'received' | 'forwarded' | 'delivered'): Promise<void> {
    const trace = this.messageTraces.get(messageId);
    if (!trace) return;

    trace.hops.push({
      peerId,
      timestamp: new Date(),
      type: hopType
    });

    // If message delivered, calculate latency
    if (hopType === 'delivered') {
      const latency = trace.hops[trace.hops.length - 1].timestamp.getTime() -
                     trace.startTime.getTime();

      // Store latency by route
      const routeKey = this.getRouteKey(trace.hops);
      if (!this.latencies.has(routeKey)) {
        this.latencies.set(routeKey, []);
      }
      this.latencies.get(routeKey)!.push(latency);

      // Clean up old traces
      this.messageTraces.delete(messageId);
    }
  }

  getAverageLatency(routeKey: string): number {
    const routeLatencies = this.latencies.get(routeKey) || [];
    if (routeLatencies.length === 0) return 0;

    return routeLatencies.reduce((a, b) => a + b, 0) / routeLatencies.length;
  }

  getLatencyPercentiles(routeKey: string): { p50: number; p95: number; p99: number } {
    const latencies = [...(this.latencies.get(routeKey) || [])].sort((a, b) => a - b);

    return {
      p50: this.percentile(latencies, 50),
      p95: this.percentile(latencies, 95),
      p99: this.percentile(latencies, 99)
    };
  }

  private percentile(sortedArray: number[], percentile: number): number {
    const index = (percentile / 100) * (sortedArray.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index % 1;

    if (upper >= sortedArray.length) return sortedArray[sortedArray.length - 1];
    return sortedArray[lower] * (1 - weight) + sortedArray[upper] * weight;
  }
}
```

#### Throughput Monitoring
```typescript
class ThroughputMonitor {
  private throughputSamples: ThroughputSample[] = [];
  private windowSize = 60000; // 1 minute windows

  recordMessage(size: number): void {
    this.throughputSamples.push({
      timestamp: Date.now(),
      size
    });

    // Clean old samples (keep last 5 minutes)
    const cutoff = Date.now() - 5 * 60 * 1000;
    this.throughputSamples = this.throughputSamples.filter(
      sample => sample.timestamp > cutoff
    );
  }

  getCurrentThroughput(): number {
    const now = Date.now();
    const windowStart = now - this.windowSize;

    const windowSamples = this.throughputSamples.filter(
      sample => sample.timestamp > windowStart
    );

    const totalBytes = windowSamples.reduce((sum, sample) => sum + sample.size, 0);
    const windowSeconds = this.windowSize / 1000;

    return totalBytes / windowSeconds; // Bytes per second
  }

  getThroughputHistory(): ThroughputHistory {
    const now = Date.now();
    const intervals = [];

    // Calculate throughput for each 1-minute interval in last hour
    for (let i = 59; i >= 0; i--) {
      const intervalEnd = now - (i * 60 * 1000);
      const intervalStart = intervalEnd - 60000;

      const intervalSamples = this.throughputSamples.filter(
        sample => sample.timestamp >= intervalStart && sample.timestamp < intervalEnd
      );

      const totalBytes = intervalSamples.reduce((sum, sample) => sum + sample.size, 0);

      intervals.push({
        timestamp: intervalStart,
        throughput: totalBytes / 60 // Bytes per second
      });
    }

    return { intervals };
  }
}
```

## Security Monitoring

### Threat Detection in P2P Networks

#### Anomaly Detection
```typescript
class AnomalyDetector {
  private normalPatterns: Map<string, PatternStats> = new Map();

  async detectAnomalies(metrics: PeerMetrics, network: NetworkTopology): Promise<SecurityAlert[]> {
    const alerts: SecurityAlert[] = [];

    // Check for unusual connection patterns
    const connectionAnomalies = await this.detectConnectionAnomalies(metrics, network);
    alerts.push(...connectionAnomalies);

    // Check for traffic anomalies
    const trafficAnomalies = await this.detectTrafficAnomalies(metrics);
    alerts.push(...trafficAnomalies);

    // Check for DHT abuse
    const dhtAnomalies = await this.detectDHTAnomalies(metrics);
    alerts.push(...dhtAnomalies);

    // Check for Sybil attacks
    const sybilAlerts = await this.detectSybilAttacks(network);
    alerts.push(...sybilAlerts);

    return alerts;
  }

  private async detectConnectionAnomalies(metrics: PeerMetrics, network: NetworkTopology): Promise<SecurityAlert[]> {
    const alerts: SecurityAlert[] = [];

    const peerConnections = network.connections.filter(c =>
      c.from === metrics.peerId || c.to === metrics.peerId
    );

    // Check for rapid connection churn
    const recentConnections = peerConnections.filter(c =>
      c.timestamp > Date.now() - 300000 // Last 5 minutes
    );

    if (recentConnections.length > 50) { // More than 50 connections in 5 minutes
      alerts.push({
        type: 'connection-churn',
        severity: 'medium',
        description: `Peer ${metrics.peerId} showing unusual connection churn`,
        evidence: { connectionCount: recentConnections.length, timeWindow: '5m' }
      });
    }

    // Check for connections to known bad peers
    const badPeers = await this.getKnownBadPeers();
    const badConnections = peerConnections.filter(c =>
      badPeers.has(c.from) || badPeers.has(c.to)
    );

    if (badConnections.length > 0) {
      alerts.push({
        type: 'bad-peer-connection',
        severity: 'high',
        description: `Peer ${metrics.peerId} connected to known malicious peers`,
        evidence: { badConnections: badConnections.length }
      });
    }

    return alerts;
  }

  private async detectTrafficAnomalies(metrics: PeerMetrics): Promise<SecurityAlert[]> {
    const alerts: SecurityAlert[] = [];

    // Check for unusual message sizes
    const averageMessageSize = await this.getAverageMessageSize(metrics.peerId);
    const currentMessageSize = metrics.beam.messagesProcessed > 0 ?
      metrics.performance.throughput / metrics.beam.messagesProcessed : 0;

    if (currentMessageSize > averageMessageSize * 3) {
      alerts.push({
        type: 'large-message-anomaly',
        severity: 'low',
        description: `Peer ${metrics.peerId} sending unusually large messages`,
        evidence: {
          currentSize: currentMessageSize,
          averageSize: averageMessageSize,
          ratio: currentMessageSize / averageMessageSize
        }
      });
    }

    // Check for traffic spikes
    const historicalThroughput = await this.getHistoricalThroughput(metrics.peerId);
    const currentThroughput = metrics.performance.throughput;

    if (currentThroughput > historicalThroughput.average * 5) {
      alerts.push({
        type: 'traffic-spike',
        severity: 'medium',
        description: `Peer ${metrics.peerId} experiencing unusual traffic spike`,
        evidence: {
          currentThroughput,
          averageThroughput: historicalThroughput.average,
          ratio: currentThroughput / historicalThroughput.average
        }
      });
    }

    return alerts;
  }
}
```

#### Intrusion Detection
```typescript
class IntrusionDetector {
  private signatures: SecuritySignature[] = [];

  async loadSignatures(): Promise<void> {
    // Load known attack signatures
    this.signatures = [
      {
        id: 'dht-flood',
        pattern: 'excessive_dht_puts',
        threshold: 1000, // 1000 DHT puts per minute
        severity: 'high'
      },
      {
        id: 'connection-flood',
        pattern: 'rapid_connections',
        threshold: 100, // 100 new connections per minute
        severity: 'high'
      },
      {
        id: 'data-poisoning',
        pattern: 'inconsistent_dht_values',
        threshold: 0.8, // 80% of DHT lookups return inconsistent data
        severity: 'critical'
      }
    ];
  }

  async scanForIntrusions(metrics: PeerMetrics, logs: PeerLog[]): Promise<IntrusionAlert[]> {
    const alerts: IntrusionAlert[] = [];

    for (const signature of this.signatures) {
      const match = await this.checkSignature(signature, metrics, logs);

      if (match.detected) {
        alerts.push({
          signatureId: signature.id,
          severity: signature.severity,
          description: `Detected ${signature.pattern} attack pattern`,
          confidence: match.confidence,
          evidence: match.evidence,
          timestamp: new Date()
        });
      }
    }

    return alerts;
  }

  private async checkSignature(
    signature: SecuritySignature,
    metrics: PeerMetrics,
    logs: PeerLog[]
  ): Promise<SignatureMatch> {
    switch (signature.pattern) {
      case 'excessive_dht_puts':
        return this.checkDHTFlood(signature, metrics);

      case 'rapid_connections':
        return this.checkConnectionFlood(signature, logs);

      case 'inconsistent_dht_values':
        return this.checkDataPoisoning(signature, logs);

      default:
        return { detected: false, confidence: 0, evidence: {} };
    }
  }

  private checkDHTFlood(signature: SecuritySignature, metrics: PeerMetrics): SignatureMatch {
    const dhtPutsPerMinute = metrics.beam.dhtLookups; // Assuming this includes puts

    if (dhtPutsPerMinute > signature.threshold) {
      return {
        detected: true,
        confidence: Math.min(dhtPutsPerMinute / signature.threshold, 1),
        evidence: { dhtPutsPerMinute, threshold: signature.threshold }
      };
    }

    return { detected: false, confidence: 0, evidence: {} };
  }
}
```

## Operational Dashboards

### Real-Time Network Dashboard

#### Dashboard Architecture
```typescript
class NetworkDashboard {
  private dataSources: DataSource[];
  private widgets: Widget[];
  private updateInterval: number = 5000; // 5 seconds

  constructor() {
    this.dataSources = [
      new PeerMetricsSource(),
      new TopologySource(),
      new AlertSource(),
      new PerformanceSource()
    ];

    this.widgets = [
      new PeerCountWidget(),
      new NetworkTopologyWidget(),
      new AlertSummaryWidget(),
      new LatencyHeatmapWidget(),
      new ThroughputChartWidget()
    ];
  }

  async startDashboard(): Promise<void> {
    // Initialize data sources
    await Promise.all(this.dataSources.map(ds => ds.initialize()));

    // Start periodic updates
    setInterval(() => this.updateDashboard(), this.updateInterval);

    // Start web server
    await this.startWebServer();
  }

  private async updateDashboard(): Promise<void> {
    try {
      // Collect data from all sources
      const data = await Promise.all(
        this.dataSources.map(ds => ds.collectData())
      );

      // Update widgets with new data
      await Promise.all(
        this.widgets.map(widget => widget.update(data))
      );

      // Broadcast updates to connected clients
      await this.broadcastUpdates(data);

    } catch (error) {
      console.error('Dashboard update failed:', error);
    }
  }

  private async broadcastUpdates(data: any[]): Promise<void> {
    const update = {
      timestamp: new Date(),
      data: this.aggregateData(data)
    };

    // Send to WebSocket clients
    this.webSocketClients.forEach(client => {
      client.send(JSON.stringify(update));
    });
  }
}
```

#### Web Dashboard Frontend
```typescript
// dashboard.ts
interface DashboardData {
  peerCount: number;
  activePeers: number;
  alerts: Alert[];
  topology: NetworkTopology;
  performance: PerformanceMetrics;
}

class DashboardRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
  }

  render(data: DashboardData): void {
    this.clear();

    // Render network topology
    this.renderTopology(data.topology);

    // Render peer status
    this.renderPeerStatus(data);

    // Render alerts
    this.renderAlerts(data.alerts);

    // Render performance metrics
    this.renderPerformance(data.performance);
  }

  private renderTopology(topology: NetworkTopology): void {
    // Draw peer nodes
    topology.peers.forEach((peer, peerId) => {
      const x = this.getPeerX(peerId);
      const y = this.getPeerY(peerId);

      this.ctx.beginPath();
      this.ctx.arc(x, y, 5, 0, 2 * Math.PI);
      this.ctx.fillStyle = this.getPeerColor(peer);
      this.ctx.fill();

      // Draw connections
      topology.connections
        .filter(conn => conn.from === peerId)
        .forEach(conn => {
          const toX = this.getPeerX(conn.to);
          const toY = this.getPeerY(conn.to);

          this.ctx.beginPath();
          this.ctx.moveTo(x, y);
          this.ctx.lineTo(toX, toY);
          this.ctx.strokeStyle = this.getConnectionColor(conn);
          this.ctx.stroke();
        });
    });
  }

  private renderPeerStatus(data: DashboardData): void {
    this.ctx.fillStyle = 'black';
    this.ctx.font = '16px Arial';
    this.ctx.fillText(`Peers: ${data.peerCount}`, 10, 30);
    this.ctx.fillText(`Active: ${data.activePeers}`, 10, 50);
  }

  private renderAlerts(alerts: Alert[]): void {
    const criticalAlerts = alerts.filter(a => a.severity === 'critical');

    if (criticalAlerts.length > 0) {
      this.ctx.fillStyle = 'red';
      this.ctx.font = '20px Arial';
      this.ctx.fillText(`🚨 ${criticalAlerts.length} Critical Alerts`, 10, 80);
    }
  }

  private getPeerColor(peer: PeerInfo): string {
    switch (peer.status) {
      case 'healthy': return 'green';
      case 'degraded': return 'yellow';
      case 'unhealthy': return 'red';
      default: return 'gray';
    }
  }

  private getConnectionColor(connection: Connection): string {
    if (connection.latency < 50) return 'green';
    if (connection.latency < 200) return 'orange';
    return 'red';
  }
}

// WebSocket connection for real-time updates
class DashboardWebSocket {
  private ws: WebSocket;
  private renderer: DashboardRenderer;

  constructor(renderer: DashboardRenderer) {
    this.renderer = renderer;
    this.connect();
  }

  private connect(): void {
    this.ws = new WebSocket('ws://localhost:8080/dashboard');

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.renderer.render(data);
    };

    this.ws.onclose = () => {
      setTimeout(() => this.connect(), 1000);
    };
  }
}
```

This comprehensive monitoring system provides decentralized observability for Beam's P2P network, ensuring operators can maintain network health, detect issues early, and respond to incidents effectively across the distributed infrastructure.


