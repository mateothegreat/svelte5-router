# Router Architecture Diagrams

This document contains Mermaid diagrams that illustrate the architecture and flow of the Svelte 5 Router. These diagrams are designed to help you understand how the router works internally.

## 1. Router Architecture

Shows the high-level architecture of the router, including how URL changes flow through the system to component rendering.

<div align="center">

```mermaid
%%{init: {
  'theme': 'base',
  'themeVariables': {
    'primaryColor': '#2563eb',
    'primaryTextColor': '#fff',
    'primaryBorderColor': '#1e40af',
    'lineColor': '#64748b',
    'secondaryColor': '#4ade80',
    'tertiaryColor': '#f472b6'
  }
}}%%
graph TB
    A[Browser URL Change] -->|Triggers| B[RouterInstance]
    B -->|Registers| C[Registry]
    B -->|Evaluates| D[Route Matching]
    D -->|Checks| E[Path Matching]
    D -->|Checks| F[Query Matching]
    E --> G[Route Resolution]
    F --> G
    G -->|Pre Hooks| H[Route Guards]
    H -->|Success| I[Component Rendering]
    H -->|Failure| J[Redirect/Deny]
    I -->|Post Hooks| K[Final Render]
    
    style A fill:#3b82f6,stroke:#1d4ed8
    style B fill:#4ade80,stroke:#16a34a
    style C fill:#f472b6,stroke:#db2777
    style D fill:#4ade80,stroke:#16a34a
    style G fill:#f472b6,stroke:#db2777
    style H fill:#3b82f6,stroke:#1d4ed8
    style I fill:#4ade80,stroke:#16a34a 
```

</div>

## 2. Routing Lifecycle

A sequence diagram showing the temporal flow of routing operations from URL change to final render.

<div align="center">

```mermaid
%%{init: {
  'theme': 'base',
  'themeVariables': {
    'primaryColor': '#2563eb',
    'primaryTextColor': '#fff',
    'primaryBorderColor': '#1e40af',
    'lineColor': '#64748b',
    'secondaryColor': '#4ade80',
    'tertiaryColor': '#f472b6'
  }
}}%%
sequenceDiagram
    participant U as User/Browser
    participant R as Router
    participant RI as RouterInstance
    participant RG as Registry
    participant H as Hooks
    participant C as Component

    U->>R: URL Change
    R->>RG: Check Registration
    RG-->>R: Return Instance
    R->>RI: Handle State Change
    RI->>RI: Evaluate Route
    RI->>H: Execute Pre-Hooks
    alt Hook Success
        H-->>RI: Continue
        RI->>C: Render Component
        RI->>H: Execute Post-Hooks
        H-->>RI: Complete
    else Hook Failure
        H-->>RI: Abort/Redirect
        RI->>U: Navigate Away
    end 
```

</div>

## 3. Route Evaluation

A detailed flowchart showing how routes are evaluated, including path matching, query parameter checking, and hook execution.

<div align="center">

```mermaid
%%{init: {
  'theme': 'base',
  'themeVariables': {
    'primaryColor': '#2563eb',
    'primaryTextColor': '#fff',
    'primaryBorderColor': '#1e40af',
    'lineColor': '#64748b',
    'secondaryColor': '#4ade80',
    'tertiaryColor': '#f472b6'
  }
}}%%
flowchart TD
    A[Route Evaluation Start] --> B{Check Path Type}
    B -->|String| C[Direct Match]
    B -->|RegExp| D[Pattern Match]
    B -->|Function| E[Custom Match]
    
    C --> F{Path Matches?}
    D --> F
    E --> F
    
    F -->|Yes| G[Check Query Parameters]
    F -->|No| H[Try Next Route]
    
    G --> I{Query Matches?}
    I -->|Yes| J[Create Route Result]
    I -->|No| H
    
    H --> K{More Routes?}
    K -->|Yes| B
    K -->|No| L[Use Default Route]
    
    J --> M[Execute Pre Hooks]
    L --> M
    
    style A fill:#3b82f6,stroke:#1d4ed8
    style B fill:#4ade80,stroke:#16a34a
    style F fill:#f472b6,stroke:#db2777
    style I fill:#f472b6,stroke:#db2777
    style J fill:#4ade80,stroke:#16a34a
    style M fill:#3b82f6,stroke:#1d4ed8 
```

</div>

## 4. Component Hierarchy

Shows the relationship between different components in the router system.

<div align="center">

```mermaid
%%{init: {
  'theme': 'base',
  'themeVariables': {
    'primaryColor': '#2563eb',
    'primaryTextColor': '#fff',
    'primaryBorderColor': '#1e40af',
    'lineColor': '#64748b',
    'secondaryColor': '#4ade80',
    'tertiaryColor': '#f472b6'
  }
}}%%
graph TD
    A[Router Component] -->|Creates| B[RouterInstance]
    B -->|Registers with| C[Registry]
    B -->|Manages| D[Route Collection]
    D -->|Contains| E[Route Configurations]
    E -->|Has| F[Path Patterns]
    E -->|Has| G[Query Patterns]
    E -->|Has| H[Hooks]
    E -->|Renders| I[Route Components]
    
    style A fill:#3b82f6,stroke:#1d4ed8
    style B fill:#4ade80,stroke:#16a34a
    style C fill:#f472b6,stroke:#db2777
    style D fill:#4ade80,stroke:#16a34a
    style E fill:#f472b6,stroke:#db2777 
```

</div>
