# StudioOS Technical Documentation

## Overview
StudioOS is a national health intelligence grid designed for real-time patient monitoring, alert management, and predictive care workflows. The architecture is built on the WRS-OS (World Runtime System) stack, providing a semantic and operational layer for healthcare systems.

## The WRS-OS Stack
The WRS-OS stack consists of five distinct layers that transform raw reality into actionable interventions:

### 1. Event Reality Stream (Input Layer)
Everything in the physical world is treated as an event. This layer ingests high-velocity data from diverse sources:
- **Clinical Data:** Clinic visits, BP readings, laboratory results.
- **Logistics:** Ambulance tracking, stock levels, transport delays.
- **Field Networks:** SMS from CHVs (Community Health Volunteers), USSD, WhatsApp bots.
- **IoT:** Wearable devices and remote monitoring sensors.

### 2. Semantic Graph Engine
The core representation layer that moves beyond text-based graphs to a dynamic, multi-layer world graph.
- **Entities:** Patients, Facilities, Resources, Conditions.
- **Semantic Edges:** `CAUSES`, `CORRELATES_WITH`, `INCREASES_RISK`, `RESOLVES`, `BLOCKS`, `DEPENDENT_ON`.

### 3. Belief Engine
A probabilistic reasoning layer that computes "belief about reality" rather than just clustering data.
- **Probabilistic State:** Every node maintains a `P(Risk | Evidence)` state.
- **Uncertainty Quantification:** Uses `Measured<T>` wrappers for all values to maintain UQ throughout the pipeline.

### 4. Pattern Detection Layer
Automated detection of emergent structures within the live system:
- **Risk Clusters:** Identifying "Maternal Danger Zones" or outbreak signals.
- **Opportunity Clusters:** Detecting unused clinic capacity or efficient referral routes.
- **Bottleneck Clusters:** Identifying transport delays, staffing gaps, or stockouts.

### 5. Insight & Action Layer (StudioOS Insight Graph - SIG)
The intelligence kernel that closes the loop between understanding and intervention.
- **Meaning Stream:** Continuous log of semantic interpretations (e.g., "Maternal risk cluster is intensifying due to combined physiological and system delays").
- **Action Layer:** High-confidence recommendations with predicted outcomes (e.g., "Dispatch CHV", "Escalate Case", "Reroute Ambulance").

## StudioOS Insight Canvas (SIG)
The Insight Canvas is the primary interface for interacting with the SIG Kernel. It provides:
- **Live Graph Viewer:** Real-time visualization of entities and their semantic connections.
- **Emerging Clusters Panel:** Automated detection and monitoring of critical system states.
- **Meaning Stream:** A narrative feed of the system's evolving beliefs.
- **Action Layer UI:** Direct interface for approving and triggering system-recommended interventions.

## Architecture Standards
- **Adapters:** All external integrations must implement the `Adapter` interface (`connect`, `read`, `forecast`, `write`, `health`).
- **Safety Gate:** All actions in the `write()` path must pass through the approval gate and dry-run guard.
- **No Raw Scalars:** All state fields must use `Measured<T>` to preserve the Willcox UQ contract.
