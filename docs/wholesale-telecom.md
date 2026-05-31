# Wholesale Telecom Infrastructure

This is the later-stage telecom architecture. It is not the MVP. Build the CPaaS aggregator first, then add SIP/voice wholesale once the business, compliance, fraud controls, and support model are ready.

```mermaid
flowchart LR
    Client["Customer PBX / App / SIP Client"] --> Sbc["SBC Cluster"]
    Sbc --> SipProxy["SIP Proxy - Kamailio / OpenSIPS"]
    SipProxy --> Routing["Call Routing Engine"]

    Routing --> Fraud["Fraud Detection Engine"]
    Fraud --> Balance["Balance / Credit Check"]
    Balance --> Media["Media Layer"]

    Media --> FreeSwitch["FreeSWITCH / Asterisk"]
    Media --> Rtp["RTPengine"]

    Routing --> CarrierA["Wholesale Carrier A"]
    Routing --> CarrierB["Wholesale Carrier B"]
    Routing --> CarrierC["Wholesale Carrier C"]
    CarrierA --> Pstn["PSTN / Mobile Networks"]
    CarrierB --> Pstn
    CarrierC --> Pstn

    Pstn --> Inbound["Inbound Calls"]
    Inbound --> Sbc

    SipProxy --> Homer["Homer SIP Capture"]
    Homer --> Monitoring["Grafana / Prometheus / Alerting"]

    Routing --> NumberMgmt["Number Inventory / DID Management"]
    NumberMgmt --> Porting["Number Porting Workflow"]
    NumberMgmt --> Kyc["Regulatory / KYC Records"]

    Media --> Cdr["CDR Collector"]
    SipProxy --> Cdr
    Cdr --> Rating["Rating & Billing Engine"]
    Rating --> CdrDb[("PostgreSQL / TimescaleDB")]
```

## Core Components

| Component | Purpose |
| --- | --- |
| SBC | Security boundary for SIP traffic |
| SIP proxy | Routes calls between customers and carriers |
| Media server | IVR, recording, conferencing, transcoding |
| RTP engine | Handles voice media packets |
| CDR collector | Stores call detail records for billing |
| Rating engine | Calculates cost by route, destination, prefix, and duration |
| Fraud engine | Detects high-cost abuse, Wangiri, call pumping, route anomalies |
| Number management | DID inventory, assignment, porting, release |
| Monitoring/NOC | Uptime, latency, packet loss, route failures |

## Common Open-Source Building Blocks

| Need | Tools |
| --- | --- |
| SIP proxy | Kamailio, OpenSIPS |
| Media server | FreeSWITCH, Asterisk |
| RTP handling | RTPengine, RTPEProxy |
| SIP tracing | Homer SIPCapture |
| Config/CDR/billing DB | PostgreSQL, TimescaleDB |
| Routing cache | Redis |
| Monitoring | Prometheus, Grafana |

## Reality Check

Software is only one part of wholesale telecom. The hard parts are carrier contracts, telecom licensing, emergency calling, lawful compliance, KYC, spam/fraud controls, billing settlement, route quality monitoring, and 24/7 support.
