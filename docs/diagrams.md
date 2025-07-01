# Router Architecture Diagrams

This document contains Mermaid diagrams that illustrate the architecture and flow of the Svelte 5 Router. These diagrams are designed to help you understand how the router works internally.

## 1. Router Architecture

Shows the high-level architecture of the router, including how URL changes flow through the system to component rendering.

<div align="center">
  <img src="./diagrams/router-architecture.png" alt="Router Architecture" />
</div>

## 2. Routing Lifecycle

A sequence diagram showing the temporal flow of routing operations from URL change to final render.

<div align="center">
  <img src="./diagrams/routing-lifecycle.png" alt="Routing Lifecycle" />
</div>

## 3. Route Evaluation

A detailed flowchart showing how routes are evaluated, including path matching, query parameter checking, and hook execution.

<div align="center">
  <img src="./diagrams/route-evaluations.png" alt="Route Evaluations" />
</div>

## 4. Component Hierarchy

Shows the relationship between different components in the router system.

<div align="center">
  <img src="./diagrams/component-hierarchy.png" alt="Component Hierarchy" />
</div>
