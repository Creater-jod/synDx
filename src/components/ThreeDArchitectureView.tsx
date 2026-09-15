import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Layers, RotateCcw, Maximize2, Sparkles, Cpu, ShieldCheck, Activity, Eye, Box, Database, Network, Stethoscope, X, CheckCircle2, Zap, Lock, Terminal, BarChart2, AlertTriangle, RefreshCw, Radio, ShieldAlert } from 'lucide-react';

export type HealthState = 'Operational' | 'Sync Lag' | 'Critical Alert';

export interface LayerHealthInfo {
  layerId: number;
  status: HealthState;
  latencyMs: number;
  packetLoss: string;
  lastPing: string;
}

interface ComponentStat {
  label: string;
  value: string;
  statusText?: string;
  isGood?: boolean;
}

interface LayerMeta {
  id: number;
  name: string;
  nodeName: string;
  color: number;
  hex: string;
  glowHex: string;
  tech: string;
  desc: string;
  modules: string[];
  stats: ComponentStat[];
  status: string;
  codeSnippet: string;
}

const LAYER_METADATA: LayerMeta[] = [
  {
    id: 1,
    name: 'Layer 1: Offline Point-of-Care Intake',
    nodeName: 'Offline Encrypted Storage Engine',
    color: 0x10b981, // Emerald
    hex: '#10b981',
    glowHex: 'rgba(16, 185, 129, 0.4)',
    tech: 'React Native / PWA • Encrypted IndexedDB',
    desc: 'Captures vitals, lab markers, and symptoms at rural PHC clinics during low-connectivity sessions.',
    modules: ['IntakeScreen.tsx', 'FollowUpCheckScreen.tsx', 'syncService.ts'],
    status: 'Operational (Offline First)',
    stats: [
      { label: 'Local Encrypted Records', value: '1,280 Cases' },
      { label: 'Read/Write Latency', value: '12 ms', isGood: true },
      { label: 'Encryption Protocol', value: 'AES-256 GCM' },
      { label: 'Sync State', value: 'Auto-Sync On Reconnect', statusText: 'Online' }
    ],
    codeSnippet: `// syncService.ts
export async function persistLocalIntake(payload: PatientRecord) {
  const encrypted = await encryptAES256(payload, SESSION_KEY);
  await db.records.put({ id: payload.id, data: encrypted, status: 'PENDING_SYNC' });
  triggerBackgroundSyncQueue();
}`
  },
  {
    id: 2,
    name: 'Layer 2: On-Device Edge AI Models',
    nodeName: 'TensorFlow Lite Edge Classifier',
    color: 0xff6321, // Orange/Amber
    hex: '#FF6321',
    glowHex: 'rgba(255, 99, 33, 0.4)',
    tech: 'rare_disease_classifier.tflite • adr_signal_model.tflite',
    desc: 'Executes sub-200ms TFLite model inference on mobile/edge devices without cloud dependencies.',
    modules: ['rare_disease_classifier.tflite', 'adr_signal_model.tflite', 'inferenceService.ts'],
    status: 'Active (<200ms Execution)',
    stats: [
      { label: 'Model Memory Size', value: '14.2 MB INT8' },
      { label: 'Inference Latency', value: '148 ms', isGood: true },
      { label: 'Rare Disease Accuracy', value: '94.2% Top-3' },
      { label: 'Hardware Acceleration', value: 'NNAPI / Metal GPU' }
    ],
    codeSnippet: `// inferenceService.ts
const interpreter = await tflite.loadModel('rare_disease_classifier.tflite');
const outputTensor = interpreter.run(normalizedVitalsTensor);
const predictions = decodeTopCandidates(outputTensor, 3);`
  },
  {
    id: 3,
    name: 'Layer 3: Explainable AI (XAI Engine)',
    nodeName: 'SHAP & LIME XAI Attribution Engine',
    color: 0x2a5c82, // Steel Blue
    hex: '#2A5C82',
    glowHex: 'rgba(42, 92, 130, 0.4)',
    tech: 'SHAP & LIME Feature Importance Attributions',
    desc: 'Generates mathematical Shapley values and local surrogates for both rare disease and ADR alerts.',
    modules: ['shap_explainer.py', 'lime_explainer.py', 'ReasonList.tsx'],
    status: 'Ready (Deterministic Attributions)',
    stats: [
      { label: 'Attribution Time', value: '85 ms', isGood: true },
      { label: 'LIME R² Score', value: '0.96' },
      { label: 'Top Risk Driver', value: 'ALT Transaminase Spike' },
      { label: 'SHAP Sampling Points', value: '500 Background Sets' }
    ],
    codeSnippet: `// shap_explainer.py
explainer = shap.TreeExplainer(model)
shap_values = explainer.shap_values(patient_features)
lime_exp = lime_tabular.LimeTabularExplainer(training_data)`
  },
  {
    id: 4,
    name: 'Layer 4: Decision Router & Triage Logic',
    nodeName: 'Decision Router & ADR Triage Node',
    color: 0x8b5cf6, // Violet
    hex: '#8b5cf6',
    glowHex: 'rgba(139, 92, 246, 0.4)',
    tech: 'Confidence Tiers + Emergency Vitals Override',
    desc: 'Routes high-confidence cases directly to specialists and triages ADR signals with adr_router_extension.py.',
    modules: ['adr_router_extension.py', 'RouterInspectionView.tsx', 'QueueDashboard.tsx'],
    status: 'Active Routing',
    stats: [
      { label: 'Throughput Capacity', value: '12,000 req/sec', isGood: true },
      { label: 'Emergency Override', value: 'SpO2 < 92% | HR > 120' },
      { label: 'Physician Override Rate', value: '3.4% Low' },
      { label: 'Routing Decision Time', value: '8 ms' }
    ],
    codeSnippet: `// adr_router_extension.py
if vitals.spO2 < 90 or vitals.heartRate > 130:
    return TriageAction.EMERGENCY_OVERRIDE_SPECIALIST
return evaluate_confidence_tier(confidence_score)`
  },
  {
    id: 5,
    name: 'Layer 5: Referral & Polygon Audit Ledger',
    nodeName: 'Polygon Amoy Blockchain Audit Node',
    color: 0x06b6d4, // Cyan
    hex: '#06b6d4',
    glowHex: 'rgba(6, 182, 212, 0.4)',
    tech: 'FastAPI / Node.js • Polygon Amoy Testnet Smart Contract',
    desc: 'Zero-knowledge SHA-256 payload commits and hospital specialist matching.',
    modules: ['SynDxAudit.sol', 'BlockchainLedgerView.tsx', 'adr_signal_service.py'],
    status: 'Verified on Polygon Amoy',
    stats: [
      { label: 'Contract Address', value: '0x71C...4f92' },
      { label: 'Immutable Audit Logs', value: '4,219 Commits', isGood: true },
      { label: 'Avg Gas Cost', value: '0.00012 MATIC' },
      { label: 'ZK Commitment', value: 'SHA-256 Payload Hash' }
    ],
    codeSnippet: `// SynDxAudit.sol
function recordAuditEntry(bytes32 payloadHash, uint8 tier) external returns (uint256) {
    uint256 id = auditCount++;
    audits[id] = AuditRecord(payloadHash, tier, block.timestamp, msg.sender);
    emit AuditCommitted(id, payloadHash);
}`
  },
  {
    id: 6,
    name: 'Layer 6: Continuous Federated Learning Loop',
    nodeName: 'Flower FedAvg Global Aggregator',
    color: 0xec4899, // Pink
    hex: '#ec4899',
    glowHex: 'rgba(236, 72, 153, 0.4)',
    tech: 'Flower FedAvg Framework • Differential Privacy (ε)',
    desc: 'Aggregates encrypted local weight gradients across rural clinic nodes without centralized patient data.',
    modules: ['server.py (FedAvg)', 'client.py (Flower)', 'FederatedLearningView.tsx'],
    status: 'Training Round #14 Active',
    stats: [
      { label: 'Participating PHCs', value: '18 Rural Nodes' },
      { label: 'Differential Privacy', value: 'ε = 1.2, δ = 1e-5', isGood: true },
      { label: 'Convergence Loss', value: '0.041' },
      { label: 'Communication Overhead', value: '1.4 MB / Round' }
    ],
    codeSnippet: `// server.py (Flower FedAvg)
strategy = fl.server.strategy.FedAvg(
    fraction_fit=0.8,
    min_fit_clients=3,
    fit_metrics_aggregation_fn=evaluate_metrics
)`
  }
];

// Initial Health Map for 6 Layers
const DEFAULT_HEALTH_MAP: Record<number, LayerHealthInfo> = {
  1: { layerId: 1, status: 'Operational', latencyMs: 12, packetLoss: '0.0%', lastPing: 'Just now' },
  2: { layerId: 2, status: 'Operational', latencyMs: 148, packetLoss: '0.0%', lastPing: 'Just now' },
  3: { layerId: 3, status: 'Operational', latencyMs: 85, packetLoss: '0.0%', lastPing: 'Just now' },
  4: { layerId: 4, status: 'Operational', latencyMs: 8, packetLoss: '0.0%', lastPing: 'Just now' },
  5: { layerId: 5, status: 'Operational', latencyMs: 240, packetLoss: '0.01%', lastPing: 'Just now' },
  6: { layerId: 6, status: 'Operational', latencyMs: 1420, packetLoss: '0.0%', lastPing: 'Just now' }
};

export const ThreeDArchitectureView: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedLayer, setSelectedLayer] = useState<LayerMeta>(LAYER_METADATA[0]);
  const [modalLayer, setModalLayer] = useState<LayerMeta | null>(null);
  const [isExploded, setIsExploded] = useState<boolean>(true);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);

  // System Health Diagnostics State
  const [healthMap, setHealthMap] = useState<Record<number, LayerHealthInfo>>(DEFAULT_HEALTH_MAP);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [showDiagnosticPanel, setShowDiagnosticPanel] = useState<boolean>(true);

  // Helper to resolve color by health status
  const getHealthColor = (status: HealthState, defaultColor: number): number => {
    if (status === 'Sync Lag') return 0xf59e0b; // Vibrant Amber
    if (status === 'Critical Alert') return 0xef4444; // Vibrant Red
    return defaultColor; // Original layer color (Green / Cyan / Violet)
  };

  const runDiagnosticScan = () => {
    setIsScanning(true);
    let step = 1;
    const interval = setInterval(() => {
      setHealthMap((prev) => {
        const updated = { ...prev };
        if (step <= 6) {
          updated[step] = {
            ...updated[step],
            latencyMs: Math.floor(Math.random() * 30) + (step === 1 ? 10 : step === 6 ? 1200 : 100),
            lastPing: 'Verified just now'
          };
        }
        return updated;
      });
      step++;
      if (step > 6) {
        clearInterval(interval);
        setIsScanning(false);
      }
    }, 280);
  };

  const simulateSyncLag = (layerId: number) => {
    setHealthMap((prev) => ({
      ...prev,
      [layerId]: {
        layerId,
        status: prev[layerId].status === 'Sync Lag' ? 'Operational' : 'Sync Lag',
        latencyMs: prev[layerId].status === 'Sync Lag' ? 14 : 940,
        packetLoss: prev[layerId].status === 'Sync Lag' ? '0.0%' : '4.2%',
        lastPing: 'Sync delayed'
      }
    }));
  };

  const simulateCriticalAlert = (layerId: number) => {
    setHealthMap((prev) => ({
      ...prev,
      [layerId]: {
        layerId,
        status: prev[layerId].status === 'Critical Alert' ? 'Operational' : 'Critical Alert',
        latencyMs: prev[layerId].status === 'Critical Alert' ? 8 : 4800,
        packetLoss: prev[layerId].status === 'Critical Alert' ? '0.0%' : '18.5%',
        lastPing: 'Timeout alert'
      }
    }));
  };

  const resetHealthState = () => {
    setHealthMap(DEFAULT_HEALTH_MAP);
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = 520;

    // 1. Scene Setup - Gradient Backdrop atmosphere
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0e131f);

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(26, 22, 30);
    camera.lookAt(0, 0, 0);

    // 3. Renderer Setup with High Precision & Shadow Mapping
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }
    containerRef.current.appendChild(renderer.domElement);

    // 4. Lighting Configuration - Dynamic Neon Points
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
    dirLight.position.set(20, 35, 25);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Orange Glow Light
    const neonOrange = new THREE.PointLight(0xff6321, 3, 60);
    neonOrange.position.set(-10, 10, 10);
    scene.add(neonOrange);

    // Cyan Glow Light
    const neonCyan = new THREE.PointLight(0x06b6d4, 3, 60);
    neonCyan.position.set(12, -8, -10);
    scene.add(neonCyan);

    // 5. Holographic Floor Grid
    const gridHelper = new THREE.GridHelper(40, 20, 0x06b6d4, 0x1e293b);
    gridHelper.position.y = -10;
    scene.add(gridHelper);

    // 6. Build Glassmorphic 3D Architecture Slabs & Nodes
    const architectureGroup = new THREE.Group();
    const clickableMeshes: THREE.Object3D[] = [];
    const layerMeshesMap: Record<number, { mesh: THREE.Mesh; line: THREE.LineSegments; nodeSphere: THREE.Mesh }> = {};

    LAYER_METADATA.forEach((layer, idx) => {
      const currentHealth = healthMap[layer.id] || { status: 'Operational' };
      const layerColor = getHealthColor(currentHealth.status, layer.color);

      // Glass slab geometry
      const geometry = new THREE.BoxGeometry(15, 0.9, 11);

      // Glassmorphic Physical Material with color override based on health
      const glassMaterial = new THREE.MeshPhysicalMaterial({
        color: layerColor,
        transmission: 0.82,
        opacity: 0.9,
        transparent: true,
        roughness: 0.12,
        metalness: 0.2,
        clearcoat: 1.0,
        clearcoatRoughness: 0.08,
        ior: 1.45,
        thickness: 1.4,
        reflectivity: 0.9
      });

      const mesh = new THREE.Mesh(geometry, glassMaterial);
      const yPos = (idx - 2.5) * (isExploded ? 3.4 : 1.8);
      mesh.position.set(0, yPos, 0);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = { layerData: layer };

      // Glowing Glass Edge Borders
      const edges = new THREE.EdgesGeometry(geometry);
      const lineMaterial = new THREE.LineBasicMaterial({ color: layerColor, linewidth: 2 });
      const line = new THREE.LineSegments(edges, lineMaterial);
      mesh.add(line);

      // Core Glass Node Sphere (Clickable Node)
      const nodeGeo = new THREE.SphereGeometry(0.85, 32, 32);
      const nodeMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: layerColor,
        emissiveIntensity: currentHealth.status === 'Operational' ? 0.9 : 1.8,
        roughness: 0.1
      });
      const nodeSphere = new THREE.Mesh(nodeGeo, nodeMat);
      nodeSphere.position.set(-6, 0, 4.2);
      nodeSphere.userData = { layerData: layer, isSphereNode: true };
      mesh.add(nodeSphere);

      clickableMeshes.push(mesh);
      clickableMeshes.push(nodeSphere);
      architectureGroup.add(mesh);

      layerMeshesMap[layer.id] = { mesh, line, nodeSphere };
    });

    // 7. Glowing Data Flow Particles Stream
    const particleCount = 180;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 9;

      const isOrange = Math.random() > 0.5;
      colors[i * 3] = isOrange ? 1.0 : 0.02;
      colors[i * 3 + 1] = isOrange ? 0.38 : 0.71;
      colors[i * 3 + 2] = isOrange ? 0.12 : 0.83;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.4,
      vertexColors: true,
      transparent: true,
      opacity: 0.85
    });

    const particleSystem = new THREE.Points(particleGeo, particleMat);
    architectureGroup.add(particleSystem);

    // 8. Orbiting Federated Clinic Node Spheres around Layer 6
    const clinicNodesGroup = new THREE.Group();
    const nodeColors = [0x10b981, 0x06b6d4, 0x8b5cf6, 0xff6321];
    nodeColors.forEach((col, i) => {
      const nodeGeo = new THREE.SphereGeometry(0.85, 32, 32);
      const nodeMat = new THREE.MeshPhysicalMaterial({
        color: col,
        transmission: 0.6,
        roughness: 0.1,
        metalness: 0.3,
        emissive: col,
        emissiveIntensity: 0.3
      });
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      const angle = (i / 4) * Math.PI * 2;
      nodeMesh.position.set(Math.cos(angle) * 10, (5 - 2.5) * (isExploded ? 3.4 : 1.8), Math.sin(angle) * 10);
      nodeMesh.userData = { layerData: LAYER_METADATA[5], isFederatedNode: true };
      clinicNodesGroup.add(nodeMesh);
      clickableMeshes.push(nodeMesh);
    });
    architectureGroup.add(clinicNodesGroup);

    scene.add(architectureGroup);

    // 9. Mouse Raycaster Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(clickableMeshes, true);

      if (intersects.length > 0) {
        const hitObject = intersects[0].object;
        if (hitObject.userData && hitObject.userData.layerData) {
          const targetLayer = hitObject.userData.layerData;
          setSelectedLayer(targetLayer);
          setModalLayer(targetLayer);
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);

    // 10. Animation Loop with Pulsing Emissive Health Textures
    let animationFrameId: number;
    let rotationAngle = 0;
    let pulseClock = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      pulseClock += 0.05;

      if (autoRotate) {
        rotationAngle += 0.004;
        architectureGroup.rotation.y = rotationAngle;
      }

      // Animate particle flow
      const posAttr = particleGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < particleCount; i++) {
        let y = posAttr.getY(i);
        y += 0.09;
        if (y > 8) y = -8;
        posAttr.setY(i, y);
      }
      posAttr.needsUpdate = true;

      // Pulse emissive effects for nodes in Sync Lag or Critical Alert
      LAYER_METADATA.forEach((layer) => {
        const hInfo = healthMap[layer.id];
        const layerRef = layerMeshesMap[layer.id];
        if (!layerRef) return;

        if (hInfo && hInfo.status !== 'Operational') {
          // Dynamic pulsing pulse for alerting nodes
          const pulseIntensity = 0.8 + Math.sin(pulseClock * (hInfo.status === 'Critical Alert' ? 4 : 2)) * 0.6;
          const nodeMat = layerRef.nodeSphere.material as THREE.MeshStandardMaterial;
          nodeMat.emissiveIntensity = pulseIntensity;
        }
      });

      clinicNodesGroup.rotation.y -= 0.015;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const newWidth = containerRef.current.clientWidth;
      camera.aspect = newWidth / height;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isExploded, autoRotate, healthMap]);

  // Overall system health summary calculation
  const totalLayers = 6;
  const operationalCount = Object.values(healthMap).filter((h) => h.status === 'Operational').length;
  const lagCount = Object.values(healthMap).filter((h) => h.status === 'Sync Lag').length;
  const alertCount = Object.values(healthMap).filter((h) => h.status === 'Critical Alert').length;

  return (
    <div className="relative rounded-3xl p-6 bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden backdrop-blur-xl space-y-5">

      {/* Top Header Controls Bar - Glassmorphic */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg text-cyan-400">
            <Sparkles className="w-5 h-5 text-[#FF6321] animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/30">
                Glassmorphic 3D Diagnostics
              </span>
              <span className="text-[10px] font-mono text-slate-400">WebGL 2.0 • Three.js</span>
            </div>
            <h3 className="text-lg font-black uppercase tracking-tight text-white mt-0.5">
              SynDx 3D Spatial Pipeline & Real-Time Health Diagnostics
            </h3>
          </div>
        </div>

        {/* View Mode & Orbit Actions */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <button
            onClick={() => setShowDiagnosticPanel(!showDiagnosticPanel)}
            className={`px-3.5 py-2 rounded-xl font-bold uppercase tracking-wider transition-all border flex items-center gap-1.5 backdrop-blur-md shadow-lg ${
              showDiagnosticPanel
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400/50 shadow-emerald-500/20'
                : 'bg-white/10 text-slate-200 border-white/15 hover:bg-white/20'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{showDiagnosticPanel ? 'Hide Health Panel' : 'Health Diagnostics'}</span>
          </button>

          <button
            onClick={() => setIsExploded(!isExploded)}
            className={`px-3.5 py-2 rounded-xl font-bold uppercase tracking-wider transition-all border flex items-center gap-1.5 backdrop-blur-md shadow-lg ${
              isExploded
                ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white border-orange-400/50 shadow-orange-500/20'
                : 'bg-white/10 text-slate-200 border-white/15 hover:bg-white/20'
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>{isExploded ? 'Compact View' : 'Exploded View'}</span>
          </button>

          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`px-3.5 py-2 rounded-xl font-bold uppercase tracking-wider transition-all border flex items-center gap-1.5 backdrop-blur-md shadow-lg ${
              autoRotate
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-cyan-400/50 shadow-cyan-500/20'
                : 'bg-white/10 text-slate-200 border-white/15 hover:bg-white/20'
            }`}
          >
            <RotateCcw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
            <span>{autoRotate ? 'Orbit On' : 'Orbit Paused'}</span>
          </button>
        </div>
      </div>

      {/* Real-Time System Health Diagnostic Toolbar */}
      {showDiagnosticPanel && (
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/15 backdrop-blur-xl shadow-2xl space-y-3 font-mono text-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="font-bold text-white uppercase tracking-wider text-xs">
                  Node Diagnostic Monitor
                </span>
              </div>

              {/* Status summary pill */}
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {operationalCount}/{totalLayers} Healthy
                </span>
                {lagCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {lagCount} Sync Lag
                  </span>
                )}
                {alertCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    {alertCount} Critical Alert
                  </span>
                )}
              </div>
            </div>

            {/* Diagnostic Action Controls */}
            <div className="flex items-center gap-2 text-[11px]">
              <button
                onClick={runDiagnosticScan}
                disabled={isScanning}
                className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md shadow-cyan-600/30 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                <span>{isScanning ? 'Scanning Mesh...' : 'Run Diagnostics Scan'}</span>
              </button>

              <button
                onClick={resetHealthState}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 font-bold uppercase tracking-wider border border-white/15 transition-all"
              >
                Reset All Healthy
              </button>
            </div>
          </div>

          {/* Quick Node Health Status Badges & Simulated Incident Triggers */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {LAYER_METADATA.map((layer) => {
              const hInfo = healthMap[layer.id] || { status: 'Operational', latencyMs: 0 };
              const isLag = hInfo.status === 'Sync Lag';
              const isAlert = hInfo.status === 'Critical Alert';

              return (
                <div
                  key={layer.id}
                  className={`p-2.5 rounded-xl border backdrop-blur-md transition-all space-y-1.5 ${
                    isAlert
                      ? 'bg-rose-950/60 border-rose-500/50 text-rose-200'
                      : isLag
                      ? 'bg-amber-950/60 border-amber-500/50 text-amber-200'
                      : 'bg-white/5 border-white/10 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-slate-400">L0{layer.id}</span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isAlert ? 'bg-rose-500 animate-ping' : isLag ? 'bg-amber-500 animate-pulse' : 'bg-emerald-400'
                      }`}
                    />
                  </div>

                  <div className="text-xs font-bold truncate">{layer.nodeName.split(' ')[0]} {layer.nodeName.split(' ')[1] || ''}</div>

                  <div className="flex items-center justify-between text-[10px] pt-1 border-t border-white/10">
                    <span className="font-semibold">{hInfo.latencyMs} ms</span>
                    <span
                      className={`font-bold ${
                        isAlert ? 'text-rose-400' : isLag ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      {hInfo.status}
                    </span>
                  </div>

                  {/* Incident Injection Buttons */}
                  <div className="flex items-center gap-1 pt-1 text-[9px]">
                    <button
                      onClick={() => simulateSyncLag(layer.id)}
                      className={`flex-1 py-0.5 rounded border text-center font-bold ${
                        isLag ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-white/5 hover:bg-white/10 text-slate-400 border-white/10'
                      }`}
                      title="Toggle Sync Lag"
                    >
                      Lag
                    </button>
                    <button
                      onClick={() => simulateCriticalAlert(layer.id)}
                      className={`flex-1 py-0.5 rounded border text-center font-bold ${
                        isAlert ? 'bg-rose-500 text-white border-rose-400' : 'bg-white/5 hover:bg-white/10 text-slate-400 border-white/10'
                      }`}
                      title="Toggle Critical Alert"
                    >
                      Alert
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main 3D Stage with Frosted Glass Overlay Cards */}
      <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-slate-950/80 shadow-inner">
        {/* Three.js Container */}
        <div ref={containerRef} className="w-full h-[520px] cursor-grab active:cursor-grabbing" />

        {/* Top Left Glass HUD - Controls & Navigation */}
        <div className="absolute top-4 left-4 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 max-w-xs text-xs font-mono text-slate-200 shadow-2xl space-y-2 pointer-events-none">
          <div className="flex items-center gap-2 font-bold text-cyan-300">
            <Box className="w-4 h-4" />
            <span>3D Spatial Controls</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            • Click any glass layer slab or node sphere to trigger interactive component statistics modal.
          </p>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            • Emissive color textures on 3D meshes dynamically indicate live system health: Green (Healthy), Amber (Sync Lag), Red (Alert).
          </p>
        </div>

        {/* Active Layer Glass Inspector Card - Bottom Right Overlay */}
        <div className="absolute bottom-4 right-4 left-4 sm:left-auto p-5 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-white/20 max-w-md text-white shadow-2xl space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full animate-ping"
                style={{
                  backgroundColor:
                    healthMap[selectedLayer.id]?.status === 'Critical Alert'
                      ? '#ef4444'
                      : healthMap[selectedLayer.id]?.status === 'Sync Lag'
                      ? '#f59e0b'
                      : selectedLayer.hex
                }}
              />
              <span
                className="font-mono font-bold text-sm tracking-wide"
                style={{
                  color:
                    healthMap[selectedLayer.id]?.status === 'Critical Alert'
                      ? '#ef4444'
                      : healthMap[selectedLayer.id]?.status === 'Sync Lag'
                      ? '#f59e0b'
                      : selectedLayer.hex
                }}
              >
                {selectedLayer.name}
              </span>
            </div>
            <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-white/10 border border-white/20 text-slate-200 font-bold">
              Layer #{selectedLayer.id}
            </span>
          </div>

          <p className="text-xs font-serif italic text-slate-300 leading-relaxed">
            {selectedLayer.desc}
          </p>

          <div>
            <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block mb-1.5">
              Tech Stack & Key Components:
            </span>
            <span className="text-xs font-mono text-cyan-300 block mb-2 font-semibold">
              {selectedLayer.tech}
            </span>
            <div className="flex flex-wrap gap-1.5 font-mono text-[10px] mb-3">
              {selectedLayer.modules.map((mod, idx) => (
                <span key={idx} className="bg-white/10 text-white px-2.5 py-1 rounded-lg border border-white/15 backdrop-blur-sm font-semibold">
                  {mod}
                </span>
              ))}
            </div>

            <button
              onClick={() => setModalLayer(selectedLayer)}
              className="w-full py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2"
            >
              <BarChart2 className="w-4 h-4" />
              <span>Inspect Detailed Node Telemetry & Stats</span>
            </button>
          </div>
        </div>
      </div>

      {/* Layer Selection Chips Grid - Glassmorphism styled */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {LAYER_METADATA.map((layer) => {
          const isSelected = selectedLayer.id === layer.id;
          const hState = healthMap[layer.id]?.status || 'Operational';
          const isAlert = hState === 'Critical Alert';
          const isLag = hState === 'Sync Lag';

          return (
            <button
              key={layer.id}
              onClick={() => setSelectedLayer(layer)}
              className={`p-3 rounded-2xl text-left border transition-all backdrop-blur-md ${
                isSelected
                  ? 'bg-white/20 border-white/40 text-white shadow-xl scale-[1.02]'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-slate-200'
              }`}
              style={{
                boxShadow: isSelected ? `0 10px 25px -5px ${layer.glowHex}` : undefined
              }}
            >
              <div className="flex items-center justify-between text-[9px] font-mono uppercase tracking-wider text-slate-400">
                <span>Layer 0{layer.id}</span>
                <span className={isAlert ? 'text-rose-400 font-bold' : isLag ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
                  ● {hState}
                </span>
              </div>
              <div className="text-xs font-bold font-sans truncate mt-0.5">{layer.name.split(':')[1] || layer.name}</div>
            </button>
          );
        })}
      </div>

      {/* Interactive Glassmorphic Node Statistics Modal */}
      {modalLayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-2xl animate-fade-in">
          <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900/90 border border-white/20 p-6 shadow-2xl text-white space-y-6 overflow-hidden">
            {/* Ambient Background Glow */}
            <div
              className="absolute -top-20 -right-20 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-30"
              style={{ backgroundColor: modalLayer.hex }}
            />

            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className="text-[10px] font-mono font-black uppercase px-2.5 py-1 rounded-full border border-white/20"
                    style={{ backgroundColor: `${modalLayer.hex}22`, color: modalLayer.hex, borderColor: modalLayer.hex }}
                  >
                    Layer #{modalLayer.id} • Node Component Inspector
                  </span>
                  <span className="text-xs font-mono text-emerald-400 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {healthMap[modalLayer.id]?.status || modalLayer.status}
                  </span>
                </div>
                <h2 className="text-2xl font-black tracking-tight text-white mt-1">
                  {modalLayer.nodeName}
                </h2>
                <p className="text-xs font-mono text-slate-400">
                  {modalLayer.tech}
                </p>
              </div>

              <button
                onClick={() => setModalLayer(null)}
                className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-slate-300 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Component Description */}
            <p className="text-sm font-serif italic text-slate-200 leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/10">
              "{modalLayer.desc}"
            </p>

            {/* Live Telemetry & Statistics Grid */}
            <div className="space-y-2">
              <h3 className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span>Live Component Statistics & Telemetry Metrics</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col justify-between space-y-1">
                  <span className="text-[11px] font-mono text-slate-400">Diagnostic Health Status</span>
                  <span className="text-base font-black font-mono text-emerald-300">
                    {healthMap[modalLayer.id]?.status || 'Operational'}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col justify-between space-y-1">
                  <span className="text-[11px] font-mono text-slate-400">Real-Time Latency Ping</span>
                  <span className="text-base font-black font-mono text-white">
                    {healthMap[modalLayer.id]?.latencyMs || 12} ms
                  </span>
                </div>

                {modalLayer.stats.map((stat, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col justify-between space-y-1"
                  >
                    <span className="text-[11px] font-mono text-slate-400">{stat.label}</span>
                    <div className="flex items-center justify-between">
                      <span className="text-base font-black font-mono text-white">{stat.value}</span>
                      {stat.isGood && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Optimal
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Code / Implementation Excerpt */}
            <div className="space-y-2">
              <h3 className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider flex items-center gap-2">
                <Terminal className="w-4 h-4 text-orange-400" />
                <span>Core Implementation & Payload Snippet</span>
              </h3>

              <pre className="p-4 rounded-2xl bg-slate-950 border border-white/15 text-xs font-mono text-cyan-300 overflow-x-auto leading-relaxed">
                {modalLayer.codeSnippet}
              </pre>
            </div>

            {/* Footer Modal Actions */}
            <div className="flex items-center justify-between border-t border-white/10 pt-4 font-mono text-xs">
              <span className="text-slate-400 text-[11px]">
                SynDx Architecture Node ID: <span className="text-white font-bold">syndx-node-0{modalLayer.id}</span>
              </span>

              <button
                onClick={() => setModalLayer(null)}
                className="px-5 py-2.5 rounded-xl bg-white text-slate-950 font-bold uppercase tracking-wider hover:bg-slate-200 transition-all shadow-lg"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


