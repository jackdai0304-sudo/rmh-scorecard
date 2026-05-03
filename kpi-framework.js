/**
 * RMH Supplier KPI Scorecard — Rationalised edition (16 KPIs).
 * Sourced from: RMH_Supplier_KPI_Scorecard_Rationalised.xlsx (sheet "KPI Reference"),
 * MH24.CM.001 · aligned to HSV KPI & Supplier Performance Scorecard Tool.
 * Pillars and weights match the workbook; each KPI includes HSV traceability in summary text.
 * Each leaf KPI repeats the pillar weightPercent (same as the workbook column); the app normalises
 * within each pillar so leaf weights sum to that pillar’s share (100% across all pillars).
 */
var CONTRACT_KPI_FRAMEWORK = {
  title: "RMH Supplier KPI & Performance Scorecard (Rationalised)",
  sourceNote:
    "16 KPIs (reduced from 34). Banding: ≥90 Superior | ≥75 Good | ≥60 Acceptable | ≥40 Marginal | <40 Unsatisfactory. " +
    "Data sources and tier notes follow the rationalised KPI Reference (CMS, FMIS, AP, Procurement Integrity Register, etc.).",
  operationalMetrics: [
    { name: "Procurement Integrity Register", note: "Automated issue / resolution tracking at contract level (KPI 5)." },
    { name: "CMS contract management", note: "Primary system for attestations, checklists, meeting logs, and compliance events." },
    { name: "FMIS + Complaint Register", note: "Automated quality, fill rate, and on-time signals where data quality prerequisites are met." },
  ],
  spendFields: [
    { name: "Contract value", note: "As captured on the scorecard header." },
    { name: "Spend this period", note: "Draw in the assessment period." },
    { name: "Tier (1–4)", note: "Supplier tier; some KPIs apply T1–T2 only — see KPI Reference." },
  ],
  scorecardHeaderFields: [
    "Supplier name",
    "Contract reference",
    "Assessment period",
    "Tier (1–4)",
    "Contract value",
    "Spend this period",
  ],
  areas: [
    {
      id: "capability",
      weightPercent: 5,
      label: "Capability (5%)",
      summary:
        "Workforce and relationship capability under the contract. HSV trace: primarily Customer service. T1–T2 where noted; annual cadence for some measures.",
      kpis: [
        {
          id: "supplier_workforce_compliance",
          weightPercent: 5,
          name: "Supplier workforce compliance",
          target:
            "Workforce-related compliance obligations met and evidenced in CMS; annual review for T1–T2 (not quarterly).",
          counterMetric: "CMS / manual evidence; non-conformance or missing documentation counts.",
          rationale:
            "Merged former KPIs 1 & 2. Applied T1–T2 only; annual cadence not quarterly.",
        },
        {
          id: "supplier_representative_responsiveness",
          weightPercent: 5,
          name: "Supplier representative responsiveness",
          target:
            "Representative responsiveness logged against CMP commitments (measurable, simple threshold agreed in contract).",
          counterMetric: "CMS / manual log of response breaches or delays vs agreed standard.",
          rationale:
            "Replaces removed KPIs 3 & 4 with a simpler, loggable measure tied to CMP commitments.",
        },
      ],
    },
    {
      id: "innovation",
      weightPercent: 10,
      label: "Innovation (10%)",
      summary: "Innovation pipeline and delivery. HSV trace: Innovation. Auto-count in CMS where configured.",
      kpis: [
        {
          id: "innovation_proposals_implementation",
          weightPercent: 10,
          name: "Innovation proposals and implementation",
          target:
            "Agreed number or quality of innovation proposals and implemented improvements recorded in CMS (T1–T2).",
          counterMetric: "CMS auto-count of proposals / implementations per contract rules.",
          rationale:
            "Merged KPIs 5, 6 & 7. Removed digital health binary (KPI 6) and value attribution (KPI 8).",
        },
      ],
    },
    {
      id: "collaboration",
      weightPercent: 5,
      label: "Collaboration (5%)",
      summary:
        "Meetings and contract-level issue resolution. HSV trace: Customer service; KPI 5 uses Procurement Integrity Register.",
      kpis: [
        {
          id: "scheduled_meeting_participation",
          weightPercent: 5,
          name: "Scheduled meeting participation",
          target:
            "Participation against agreed CMP attendance list (dates / roles as per contract).",
          counterMetric: "CMS / manual attendance record vs scheduled CMP meetings.",
          rationale:
            "Simplified KPI 10: based on agreed CMP attendance list. KPI 11 (cross-precinct) removed — outcome largely RMH-driven.",
        },
        {
          id: "issue_resolution_contract_level",
          weightPercent: 5,
          name: "Issue resolution at contract level",
          target:
            "Issues raised and resolved within agreed timeframes; register kept current.",
          counterMetric: "Procurement Integrity Register — open vs resolved issues, breaches of SLA.",
          rationale:
            "Retained KPI 12 unchanged. Directly automatable from Procurement Integrity Register.",
        },
      ],
    },
    {
      id: "sustainability",
      weightPercent: 30,
      label: "Sustainability (30%)",
      summary:
        "CSR, environment, VIPP, and related compliance. HSV trace: Social/environmental responsibility and Cost (VIPP). T1–T2 or all tiers as per KPI.",
      kpis: [
        {
          id: "sustainability_compliance_modern_slavery_csr_env",
          weightPercent: 30,
          name: "Sustainability compliance (modern slavery, CSR, environment)",
          target:
            "Structured three-check binary completed annually in CMS (modern slavery, CSR, environment) where applicable.",
          counterMetric: "CMS binary checklist outcome; failed checks or missing annual completion.",
          rationale:
            "Merged KPIs 13, 15 & 16. KPI 18 (subcontractor SOPA) and unverifiable carbon (KPI 16) removed.",
        },
        {
          id: "environmental_incident_regulatory_compliance",
          weightPercent: 30,
          name: "Environmental incident and regulatory compliance",
          target:
            "No reportable environmental incidents / regulatory breaches for in-scope services; goods-only suppliers marked N/A.",
          counterMetric: "CMS event log — incidents and regulatory events (event-driven binary).",
          rationale:
            "KPI 14: applies to services/site-presence contracts; goods-only N/A. Event-driven binary scoring.",
        },
        {
          id: "victorian_local_jobs_first_vipp",
          weightPercent: 30,
          name: "Victorian Local Jobs First compliance (VIPP)",
          target:
            "Binary met / not met where VIPP applies; N/A where contract below VIPP threshold.",
          counterMetric: "CMS binary / annual attestation; breach or non-compliance flags.",
          rationale:
            "Simplified KPI 17: binary replaces unverifiable %. KPI 18 (SOPA) removed — no reliable observation mechanism.",
        },
      ],
    },
    {
      id: "user_experience",
      weightPercent: 20,
      label: "User experience (20%)",
      summary:
        "Quality, delivery, and financial accuracy from the user perspective. HSV trace: Quality, Delivery, Customer service (invoice). FMIS/AP automated where noted.",
      kpis: [
        {
          id: "product_service_quality_fit_for_purpose",
          weightPercent: 20,
          name: "Product and service quality (fit for purpose)",
          target:
            "Quality exceptions rate within agreed threshold using FMIS + Complaint Register (single merged measure).",
          counterMetric: "Exception / complaint rate vs volume or orders (automated feed).",
          rationale:
            "Merged KPIs 20, 21 & 24 into one quality exceptions rate; removes double-counting from overlapping measures.",
        },
        {
          id: "order_fill_rate_in_full",
          weightPercent: 20,
          name: "Order fill rate (in full)",
          target: "Orders supplied in full vs agreed quantity — within contracted fill-rate threshold.",
          counterMetric: "FMIS automated — incomplete order lines or short-ship counts.",
          rationale: "KPI 22 retained; fully automatable.",
        },
        {
          id: "on_time_delivery",
          weightPercent: 20,
          name: "On-time delivery",
          target: "Deliveries on time vs required date/time within agreed threshold (data-quality prerequisites per HSV guide).",
          counterMetric: "FMIS automated late-delivery counts vs prerequisites.",
          rationale: "KPI 23 retained with explicit data quality prerequisite.",
        },
        {
          id: "invoice_pricing_compliance",
          weightPercent: 20,
          name: "Invoice and pricing compliance",
          target: "Invoices match contract pricing and pass AP validation; rejections within tolerance.",
          counterMetric: "Accounts Payable — invoice rejections (pricing / accuracy).",
          rationale:
            "Merged KPIs 25 & 31 (same AP data). KPI 32 (industry benchmark) removed — not a periodic scored metric.",
        },
      ],
    },
    {
      id: "risk_compliance",
      weightPercent: 30,
      label: "Risk & compliance (30%)",
      summary:
        "Risk, regulatory, Code of Conduct, and insurance currency. HSV trace: Risk and Social/environmental (CoC). All tiers unless noted.",
      kpis: [
        {
          id: "risk_management_currency",
          weightPercent: 30,
          name: "Risk management currency",
          target:
            "Risk register and plan current; three objective binary sub-checks completed in CMS (no subjective evidence grading).",
          counterMetric: "CMS binary checklist — failed sub-checks or overdue updates.",
          rationale:
            "Merged KPIs 27 & 28 into objective binary sub-checks; removes inconsistent subjective assessment.",
        },
        {
          id: "regulatory_compliance_zero_notice",
          weightPercent: 30,
          name: "Regulatory compliance (zero notice)",
          target: "Zero regulatory non-compliance events attributable to supplier in period (event-driven).",
          counterMetric: "CMS event log — regulatory notices or breaches.",
          rationale:
            "KPI 29: event-driven scoring; removed infeasible quarterly portal check.",
        },
        {
          id: "supplier_code_of_conduct_attestation",
          weightPercent: 30,
          name: "Supplier Code of Conduct attestation",
          target: "Annual attestation date current in CMS within agreed window.",
          counterMetric: "CMS date field — overdue attestation.",
          rationale: "KPI 30 retained; automatable via CMS date field.",
        },
        {
          id: "insurance_currency",
          weightPercent: 30,
          name: "Insurance currency",
          target: "Required insurances in force with valid expiry dates per contract.",
          counterMetric: "CMS automated date alert — lapsed or soon-to-lapse cover.",
          rationale: "KPI 33 retained; strong automation example.",
        },
      ],
    },
  ],
};
