/**
 * RMH Procurement — Supplier Scorecard (demo)
 * Local-only persistence; each leaf KPI 1–5; pillar weights (sum 100%) give a window score 0–100; exceptions lower only tagged KPIs (others stay 5).
 */

const STORAGE_KEY = "rmh-scorecard-v1";

/** Post-contract pulse feedback window: days from start date to end date (inclusive period). */
const FEEDBACK_WINDOW_DAYS = 60;

/**
 * Fictional RMH-style contracts & windows (all synthetic for UX demo).
 * Dates are anchored to “today” so open windows always show remaining days.
 * Pack is intentionally diverse: 8 supplier categories, 3 open + many closed windows,
 * all six pillars exercised, mix of integer / fractional KPI scores (weighted 0–100 model).
 */
function fictionalDemoState() {
  const T = todayISO();
  const spec = getScorecardSpec();
  const mapAllFive = () => {
    const o = {};
    for (const k of spec.keys) o[k] = 5;
    return o;
  };
  const mapOneLower = (areaId, kpiId, v) => {
    const o = mapAllFive();
    const key = `${areaId}:${kpiId}`;
    if (spec.keys.includes(key)) o[key] = clampKpi1to5(v);
    return o;
  };

  /** Demo-only: derive a plausible legacy 1–5 headline from a fractional KPI score. */
  const headlineFromKpi = (v) => clampKpi1to5(v);

  const suppliers = [
    { id: "s1", name: "MedSupply Australia Pty Ltd", category: "PPE & consumables" },
    { id: "s2", name: "Clinical Diagnostics Co.", category: "Lab reagents & pathology" },
    { id: "s3", name: "SterileTech Solutions", category: "Surgical instruments & CSSD" },
    { id: "s4", name: "Victorian Linen Services Ltd", category: "Linen & healthcare textiles" },
    { id: "s5", name: "BioCold Logistics Pty Ltd", category: "Vaccine cold chain & 2–8 °C" },
    { id: "s6", name: "Northside Health Integration Pty Ltd", category: "Digital health & EPR interfaces" },
    { id: "s7", name: "GreenPlate Catering Collective", category: "Patient meals & retail F&B" },
    { id: "s8", name: "Metro FacilityCare Pty Ltd", category: "Hard FM, waste & site services" },
  ];

  const startOpenA = addDays(T, -6);
  const startOpenB = addDays(T, -3);
  const startOpenC = addDays(T, -1);

  const windows = [
    {
      id: "win_dem_open_ppe",
      supplierId: "s1",
      contractRef: "C-RMH-PPE-2025-0142",
      contractTitle: "N95 / level 3 surgical masks — 24 mo panel",
      startDate: startOpenA,
      endDate: addDays(startOpenA, FEEDBACK_WINDOW_DAYS),
      status: "open",
    },
    {
      id: "win_dem_open_lab",
      supplierId: "s2",
      contractRef: "PO-2026-7719 · SCH-CHEM-003",
      contractTitle: "Clinical chemistry reagents & calibrators",
      startDate: startOpenB,
      endDate: addDays(startOpenB, FEEDBACK_WINDOW_DAYS),
      status: "open",
    },
    {
      id: "win_dem_open_epr",
      supplierId: "s6",
      contractRef: "MOU-DH-2026-014 · ADT + results feed",
      contractTitle: "EPR ADT / pathology results interface — sprint window",
      startDate: startOpenC,
      endDate: addDays(startOpenC, FEEDBACK_WINDOW_DAYS),
      status: "open",
    },
    {
      id: "win_dem_closed_clean",
      supplierId: "s4",
      contractRef: "C-RMH-LIN-2023-0901",
      contractTitle: "Theatre & ward linen rental + pickup",
      startDate: addDays(T, -38),
      endDate: addDays(T, -24),
      status: "closed",
    },
    {
      id: "win_dem_closed_mask",
      supplierId: "s1",
      contractRef: "PO-2025-44102",
      contractTitle: "Emergency PPE top-up (masks, gowns)",
      startDate: addDays(T, -62),
      endDate: addDays(T, -48),
      status: "closed",
    },
    {
      id: "win_dem_closed_coldchain",
      supplierId: "s5",
      contractRef: "C-RMH-COLD-2024-2207",
      contractTitle: "Vaccine storage & monitored delivery",
      startDate: addDays(T, -36),
      endDate: addDays(T, -22),
      status: "closed",
    },
    {
      id: "win_dem_closed_instruments",
      supplierId: "s3",
      contractRef: "PO-2026-2104 · SSI-TRAY-A",
      contractTitle: "Sterile instrument trays — CSSD supply",
      startDate: addDays(T, -30),
      endDate: addDays(T, -16),
      status: "closed",
    },
    {
      id: "win_dem_closed_lab_hist",
      supplierId: "s2",
      contractRef: "PO-2024-8891 · HIST-REAG",
      contractTitle: "Prior chemistry panel — stock-outs & CMP friction (archived window)",
      startDate: addDays(T, -420),
      endDate: addDays(T, -406),
      status: "closed",
    },
    {
      id: "win_dem_closed_linen_snag",
      supplierId: "s4",
      contractRef: "C-RMH-LIN-2022-0401",
      contractTitle: "Legacy linen agreement — Q3 CMP no-show + delayed issue closure",
      startDate: addDays(T, -200),
      endDate: addDays(T, -186),
      status: "closed",
    },
    {
      id: "win_dem_closed_facility_sus",
      supplierId: "s8",
      contractRef: "C-RMH-FM-2024-5510",
      contractTitle: "Clinical waste manifest + VIPP reporting — metro sites",
      startDate: addDays(T, -88),
      endDate: addDays(T, -74),
      status: "closed",
    },
    {
      id: "win_dem_closed_catering",
      supplierId: "s7",
      contractRef: "PO-2025-99221 · NUT-MENU-V3",
      contractTitle: "Therapeutic menus + ward bulk chilled — quarterly review",
      startDate: addDays(T, -118),
      endDate: addDays(T, -104),
      status: "closed",
    },
    {
      id: "win_dem_closed_ict_legacy",
      supplierId: "s6",
      contractRef: "C-RMH-ICT-2023-8804",
      contractTitle: "Legacy HL7 VPN links — decommission tranche B",
      startDate: addDays(T, -310),
      endDate: addDays(T, -296),
      status: "closed",
    },
    {
      id: "win_dem_closed_pharm_nearperf",
      supplierId: "s2",
      contractRef: "PO-2026-3308 · CYTO-STAT",
      contractTitle: "Cytotoxic pharmacy stat courier — after-hours lane",
      startDate: addDays(T, -52),
      endDate: addDays(T, -38),
      status: "closed",
    },
  ];

  const pulses = [
    {
      id: "pul_dem_mask_clinical",
      windowId: "win_dem_closed_mask",
      role: "clinical",
      reportedIssue: true,
      detail: "N95 lot RMH-8841: strap breakage on 4 units; usability concern in ED.",
      score: headlineFromKpi(3.07),
      kpiScores: mapOneLower("user_experience", "product_service_quality_fit_for_purpose", 3.07),
      submittedAt: addDays(T, -50),
      kpiAreaId: "user_experience",
      kpiId: "product_service_quality_fit_for_purpose",
    },
    {
      id: "pul_dem_mask_proc",
      windowId: "win_dem_closed_mask",
      role: "procurement",
      reportedIssue: true,
      detail: "AP rejected three invoices in one month — wrong UOM vs contract schedule B.",
      score: headlineFromKpi(2.4),
      kpiScores: mapOneLower("user_experience", "invoice_pricing_compliance", 2.4),
      submittedAt: addDays(T, -49),
      kpiAreaId: "user_experience",
      kpiId: "invoice_pricing_compliance",
    },
    {
      id: "pul_dem_mask_proc2",
      windowId: "win_dem_closed_mask",
      role: "procurement",
      reportedIssue: false,
      detail: "",
      score: 5,
      kpiScores: mapAllFive(),
      submittedAt: addDays(T, -48),
    },
    {
      id: "pul_dem_cold_proc",
      windowId: "win_dem_closed_coldchain",
      role: "procurement",
      reportedIssue: true,
      detail: "Delivery arrived within SLA but data logger gap 22 min; corrective action letter sent.",
      score: headlineFromKpi(4.13),
      kpiScores: mapOneLower("risk_compliance", "risk_management_currency", 4.13),
      submittedAt: addDays(T, -24),
      kpiAreaId: "risk_compliance",
      kpiId: "risk_management_currency",
    },
    {
      id: "pul_dem_cold_clinical",
      windowId: "win_dem_closed_coldchain",
      role: "clinical",
      reportedIssue: true,
      detail: "TGA recall notice cross-check: supplier acknowledged late; zero patient impact but process gap logged.",
      score: headlineFromKpi(1.33),
      kpiScores: mapOneLower("risk_compliance", "regulatory_compliance_zero_notice", 1.33),
      submittedAt: addDays(T, -23),
      kpiAreaId: "risk_compliance",
      kpiId: "regulatory_compliance_zero_notice",
    },
    {
      id: "pul_dem_inst_clinical",
      windowId: "win_dem_closed_instruments",
      role: "clinical",
      reportedIssue: false,
      detail: "",
      score: 5,
      kpiScores: mapAllFive(),
      submittedAt: addDays(T, -18),
    },
    {
      id: "pul_dem_inst_proc",
      windowId: "win_dem_closed_instruments",
      role: "procurement",
      reportedIssue: false,
      detail: "",
      score: 5,
      kpiScores: mapAllFive(),
      submittedAt: addDays(T, -17),
    },
    {
      id: "pul_dem_lab_hist_a",
      windowId: "win_dem_closed_lab_hist",
      role: "clinical",
      reportedIssue: true,
      detail: "Two catalogue lines on back-order >14 d; theatres had to borrow stock.",
      score: headlineFromKpi(2),
      kpiScores: mapOneLower("user_experience", "order_fill_rate_in_full", 2),
      submittedAt: addDays(T, -412),
      kpiAreaId: "user_experience",
      kpiId: "order_fill_rate_in_full",
    },
    {
      id: "pul_dem_lab_hist_b",
      windowId: "win_dem_closed_lab_hist",
      role: "procurement",
      reportedIssue: true,
      detail: "Innovation forum: no new proposal this half; CMP escalation note filed.",
      score: headlineFromKpi(2),
      kpiScores: mapOneLower("innovation", "innovation_proposals_implementation", 2),
      submittedAt: addDays(T, -411),
      kpiAreaId: "innovation",
      kpiId: "innovation_proposals_implementation",
    },
    {
      id: "pul_dem_lab_hist_c",
      windowId: "win_dem_closed_lab_hist",
      role: "procurement",
      reportedIssue: true,
      detail: "Open integrity register item #441 exceeded 30 d; eventually closed after second chase.",
      score: headlineFromKpi(3),
      kpiScores: mapOneLower("collaboration", "issue_resolution_contract_level", 3),
      submittedAt: addDays(T, -410),
      kpiAreaId: "collaboration",
      kpiId: "issue_resolution_contract_level",
    },
    {
      id: "pul_dem_lab_hist_d",
      windowId: "win_dem_closed_lab_hist",
      role: "clinical",
      reportedIssue: true,
      detail: "Annual modern slavery attestation uploaded 11 days after CMS deadline (eventually accepted).",
      score: headlineFromKpi(3.67),
      kpiScores: mapOneLower(
        "sustainability",
        "sustainability_compliance_modern_slavery_csr_env",
        3.67
      ),
      submittedAt: addDays(T, -409),
      kpiAreaId: "sustainability",
      kpiId: "sustainability_compliance_modern_slavery_csr_env",
    },
    {
      id: "pul_dem_linen_snag",
      windowId: "win_dem_closed_linen_snag",
      role: "procurement",
      reportedIssue: true,
      detail: "Account manager missed scheduled CMP without 48 h notice; stand-in attended late.",
      score: headlineFromKpi(2),
      kpiScores: mapOneLower("collaboration", "scheduled_meeting_participation", 2),
      submittedAt: addDays(T, -192),
      kpiAreaId: "collaboration",
      kpiId: "scheduled_meeting_participation",
    },
    {
      id: "pul_dem_facility_sus_a",
      windowId: "win_dem_closed_facility_sus",
      role: "procurement",
      reportedIssue: true,
      detail: "VIPP Local Jobs First evidence pack incomplete at QBR; remediated within 10 business days.",
      score: headlineFromKpi(3.2),
      kpiScores: mapOneLower("sustainability", "victorian_local_jobs_first_vipp", 3.2),
      submittedAt: addDays(T, -80),
      kpiAreaId: "sustainability",
      kpiId: "victorian_local_jobs_first_vipp",
    },
    {
      id: "pul_dem_facility_sus_b",
      windowId: "win_dem_closed_facility_sus",
      role: "clinical",
      reportedIssue: true,
      detail: "Minor clinical waste segregation breach on one ward round; no EPA notification; retraining logged.",
      score: headlineFromKpi(4.27),
      kpiScores: mapOneLower(
        "sustainability",
        "environmental_incident_regulatory_compliance",
        4.27
      ),
      submittedAt: addDays(T, -79),
      kpiAreaId: "sustainability",
      kpiId: "environmental_incident_regulatory_compliance",
    },
    {
      id: "pul_dem_catering_a",
      windowId: "win_dem_closed_catering",
      role: "clinical",
      reportedIssue: true,
      detail: "Texture-modified tray run short on 2 wards; replacements within 90 min.",
      score: headlineFromKpi(2.73),
      kpiScores: mapOneLower("user_experience", "order_fill_rate_in_full", 2.73),
      submittedAt: addDays(T, -110),
      kpiAreaId: "user_experience",
      kpiId: "order_fill_rate_in_full",
    },
    {
      id: "pul_dem_catering_b",
      windowId: "win_dem_closed_catering",
      role: "procurement",
      reportedIssue: true,
      detail: "Workforce compliance evidence for new kitchen lead submitted one pay-cycle late.",
      score: headlineFromKpi(4.2),
      kpiScores: mapOneLower("capability", "supplier_workforce_compliance", 4.2),
      submittedAt: addDays(T, -109),
      kpiAreaId: "capability",
      kpiId: "supplier_workforce_compliance",
    },
    {
      id: "pul_dem_ict_legacy_a",
      windowId: "win_dem_closed_ict_legacy",
      role: "procurement",
      reportedIssue: true,
      detail: "No approved interface change proposal in period despite agreed bi-annual innovation target.",
      score: headlineFromKpi(1.53),
      kpiScores: mapOneLower("innovation", "innovation_proposals_implementation", 1.53),
      submittedAt: addDays(T, -302),
      kpiAreaId: "innovation",
      kpiId: "innovation_proposals_implementation",
    },
    {
      id: "pul_dem_ict_legacy_b",
      windowId: "win_dem_closed_ict_legacy",
      role: "procurement",
      reportedIssue: true,
      detail: "Public liability certificate lapsed 6 days before renewal file updated in CMS.",
      score: headlineFromKpi(2.87),
      kpiScores: mapOneLower("risk_compliance", "insurance_currency", 2.87),
      submittedAt: addDays(T, -301),
      kpiAreaId: "risk_compliance",
      kpiId: "insurance_currency",
    },
    {
      id: "pul_dem_pharm_soft",
      windowId: "win_dem_closed_pharm_nearperf",
      role: "clinical",
      reportedIssue: true,
      detail: "Single stat run arrived 14 min outside contracted window; patient care not compromised.",
      score: headlineFromKpi(4.6),
      kpiScores: mapOneLower("user_experience", "on_time_delivery", 4.6),
      submittedAt: addDays(T, -44),
      kpiAreaId: "user_experience",
      kpiId: "on_time_delivery",
    },
    {
      id: "pul_dem_open_ppe_clin",
      windowId: "win_dem_open_ppe",
      role: "clinical",
      reportedIssue: false,
      detail: "",
      score: 5,
      kpiScores: mapAllFive(),
      submittedAt: addDays(T, -5),
    },
    {
      id: "pul_dem_open_ppe_proc",
      windowId: "win_dem_open_ppe",
      role: "procurement",
      reportedIssue: true,
      detail: "Key account contact slow on email this week (>72 h) on urgent sizing query.",
      score: headlineFromKpi(3.27),
      kpiScores: mapOneLower("capability", "supplier_representative_responsiveness", 3.27),
      submittedAt: addDays(T, -4),
      kpiAreaId: "capability",
      kpiId: "supplier_representative_responsiveness",
    },
    {
      id: "pul_dem_open_ppe_sus",
      windowId: "win_dem_open_ppe",
      role: "procurement",
      reportedIssue: true,
      detail: "PPE supplier CSR questionnaire still marked ‘in progress’ 8 days after window opened.",
      score: headlineFromKpi(4.07),
      kpiScores: mapOneLower(
        "sustainability",
        "sustainability_compliance_modern_slavery_csr_env",
        4.07
      ),
      submittedAt: addDays(T, -3),
      kpiAreaId: "sustainability",
      kpiId: "sustainability_compliance_modern_slavery_csr_env",
    },
    {
      id: "pul_dem_open_lab_clin",
      windowId: "win_dem_open_lab",
      role: "clinical",
      reportedIssue: true,
      detail: "Calibrator batch COA uploaded one day late; run deferred half shift.",
      score: headlineFromKpi(4),
      kpiScores: mapOneLower("user_experience", "on_time_delivery", 4),
      submittedAt: addDays(T, -2),
      kpiAreaId: "user_experience",
      kpiId: "on_time_delivery",
    },
    {
      id: "pul_dem_open_lab_coc",
      windowId: "win_dem_open_lab",
      role: "procurement",
      reportedIssue: true,
      detail: "Supplier Code of Conduct annual tick-box completed 4 days past CMP due date.",
      score: headlineFromKpi(3.8),
      kpiScores: mapOneLower("risk_compliance", "supplier_code_of_conduct_attestation", 3.8),
      submittedAt: addDays(T, -1),
      kpiAreaId: "risk_compliance",
      kpiId: "supplier_code_of_conduct_attestation",
    },
    {
      id: "pul_dem_open_epr_innov",
      windowId: "win_dem_open_epr",
      role: "clinical",
      reportedIssue: true,
      detail: "ADT feed uptime good; proposed FHIR read API still in vendor backlog — no delivery this sprint.",
      score: headlineFromKpi(3.4),
      kpiScores: mapOneLower("innovation", "innovation_proposals_implementation", 3.4),
      submittedAt: T,
      kpiAreaId: "innovation",
      kpiId: "innovation_proposals_implementation",
    },
  ];

  return { suppliers, windows, pulses };
}

const defaultState = () => {
  const st = fictionalDemoState();
  migrateFinalScores(st);
  return st;
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    const st = {
      suppliers: parsed.suppliers?.length ? parsed.suppliers : defaultState().suppliers,
      windows: Array.isArray(parsed.windows) ? parsed.windows : [],
      pulses: Array.isArray(parsed.pulses) ? parsed.pulses : [],
    };
    migrateFinalScores(st);
    return st;
  } catch {
    return defaultState();
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function uid(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function addDays(isoDate, days) {
  const d = new Date(isoDate + "T12:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function daysRemaining(endDate) {
  const end = new Date(endDate + "T23:59:59");
  const now = new Date();
  return Math.ceil((end - now) / (1000 * 60 * 60 * 24));
}

function supplierById(state, id) {
  return state.suppliers.find((s) => s.id === id);
}

/** Pulses for a window */
function pulsesForWindow(state, windowId) {
  return state.pulses.filter((p) => p.windowId === windowId);
}

// --- Contract import (JSON / CSV) ---

function stripStr(v) {
  if (v === undefined || v === null) return "";
  return String(v).trim();
}

function isValidISODate(s) {
  const str = stripStr(s);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return false;
  const d = new Date(str + "T12:00:00");
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === str;
}

function normalizeImportRow(raw) {
  if (!raw || typeof raw !== "object") return null;
  const lc = {};
  for (const [k, v] of Object.entries(raw)) {
    const key = String(k).toLowerCase().replace(/\s+/g, "_");
    if (typeof v === "boolean") lc[key] = v;
    else if (v === null || v === undefined) lc[key] = "";
    else if (typeof v === "number" && !Number.isNaN(v)) lc[key] = v;
    else lc[key] = String(v).trim();
  }
  const str = (keys) => {
    for (const k of keys) {
      const val = lc[k];
      if (val === undefined || val === null || val === "") continue;
      return String(val).trim();
    }
    return "";
  };
  const boolTrue = (keys) =>
    keys.some((k) => ["true", "1", "yes", "y"].includes(String(lc[k] ?? "").toLowerCase()));

  const fsRaw =
    lc.final_score !== undefined && lc.final_score !== "" ? lc.final_score : lc.score !== undefined ? lc.score : "";

  return {
    supplierId: str(["supplier_id", "supplierid"]),
    supplierName: str(["supplier_name", "supplier", "vendor", "vendor_name", "vendorname"]),
    supplierCategory: str(["supplier_category", "category", "supplier_type"]),
    contractRef: str([
      "contract_ref",
      "contractref",
      "reference",
      "contract_reference",
      "contractreference",
      "po",
      "po_number",
      "ponumber",
    ]),
    contractTitle: str(["contract_title", "contracttitle", "title", "description", "scope"]),
    status: str(["status", "state"]),
    startDate: str(["start_date", "startdate", "window_start", "delivery_date"]),
    endDate: str(["end_date", "enddate", "window_end"]),
    finalScore: fsRaw,
    openFromToday:
      raw.openFromToday === true ||
      raw.openFromToday === "true" ||
      lc.openfromtoday === true ||
      boolTrue(["open_from_today", "openfromtoday"]) ||
      str(["feedback_window", "feedbackwindow"]) === "from_today",
  };
}

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (!lines.length) return [];
  const parseLine = (line) => {
    const out = [];
    let cur = "";
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        inQ = !inQ;
        continue;
      }
      if (!inQ && c === ",") {
        out.push(cur.trim());
        cur = "";
        continue;
      }
      cur += c;
    }
    out.push(cur.trim());
    return out.map((cell) => cell.replace(/^"|"$/g, "").trim());
  };
  const headers = parseLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const vals = parseLine(lines[i]);
    const row = {};
    headers.forEach((h, j) => {
      row[h] = vals[j] ?? "";
    });
    rows.push(row);
  }
  return rows;
}

function mergeSuppliersFromPayload(st, arr) {
  if (!Array.isArray(arr)) return;
  for (const raw of arr) {
    if (!raw || typeof raw !== "object") continue;
    const id = stripStr(raw.id ?? raw.supplier_id ?? raw.supplierId);
    const name = stripStr(raw.name ?? raw.supplierName ?? raw.supplier_name ?? raw.supplier);
    const cat = stripStr(raw.category ?? raw.supplierCategory ?? raw.supplier_category) || "Imported";
    if (!name && !id) continue;
    if (id && st.suppliers.some((x) => x.id === id)) continue;
    if (id) {
      st.suppliers.push({ id, name: name || id, category: cat });
      continue;
    }
    if (st.suppliers.some((x) => x.name.trim().toLowerCase() === name.toLowerCase())) continue;
    st.suppliers.push({ id: uid("sup"), name, category: cat });
  }
}

function resolveSupplierForImport(st, norm, lineLabel, errors) {
  const sid = stripStr(norm.supplierId);
  const sname = stripStr(norm.supplierName);
  const cat = stripStr(norm.supplierCategory) || "Imported";

  if (sid) {
    const existing = st.suppliers.find((x) => x.id === sid);
    if (existing) return existing.id;
    if (!sname) {
      errors.push(`${lineLabel}: unknown supplierId "${sid}" — add supplierName or include this id in the "suppliers" array.`);
      return null;
    }
    st.suppliers.push({ id: sid, name: sname, category: cat });
    return sid;
  }
  if (!sname) {
    errors.push(`${lineLabel}: provide supplierName or supplierId.`);
    return null;
  }
  const found = st.suppliers.find((x) => x.name.trim().toLowerCase() === sname.toLowerCase());
  if (found) return found.id;
  st.suppliers.push({ id: uid("sup"), name: sname, category: cat });
  return st.suppliers[st.suppliers.length - 1].id;
}

function importWindowFromRow(st, norm, lineLabel, errors) {
  if (!norm || !norm.contractRef) {
    errors.push(`${lineLabel}: missing contract reference (contractRef / reference / po).`);
    return false;
  }

  const supId = resolveSupplierForImport(st, norm, lineLabel, errors);
  if (!supId) return false;

  let status = (norm.status || "open").toLowerCase();
  if (status === "active") status = "open";
  if (status !== "closed") status = "open";

  let startDate = norm.startDate;
  let endDate = norm.endDate;

  if (norm.openFromToday) {
    startDate = todayISO();
    endDate = addDays(startDate, FEEDBACK_WINDOW_DAYS);
    status = "open";
  }

  if (!startDate || !isValidISODate(startDate)) {
    if (status === "open") {
      startDate = todayISO();
      endDate = addDays(startDate, FEEDBACK_WINDOW_DAYS);
    } else {
      errors.push(`${lineLabel}: closed records need valid startDate (YYYY-MM-DD).`);
      return false;
    }
  }

  if (!endDate || !isValidISODate(endDate)) {
    endDate = addDays(startDate, FEEDBACK_WINDOW_DAYS);
  }

  const win = {
    id: uid("win"),
    supplierId: supId,
    contractRef: norm.contractRef,
    startDate,
    endDate,
    status: status === "closed" ? "closed" : "open",
  };
  if (norm.contractTitle) win.contractTitle = norm.contractTitle;

  if (win.status === "closed") {
    const fs = norm.finalScore;
    if (fs !== undefined && fs !== "" && !Number.isNaN(Number(fs))) {
      win.finalScore = Math.min(5, Math.max(1, Number(fs)));
    } else {
      win.finalScore = 5;
    }
    const maxS = safeScorecardMax(getScorecardSpec());
    win.finalScoreMax = maxS;
    win.finalScoreTotal = Math.round((win.finalScore / 5) * maxS * 100) / 100;
  }

  st.windows.push(win);
  return true;
}

function collectContractRowsFromPayload(payload) {
  const rows = [];
  for (const key of ["contracts", "windows", "feedbackWindows", "deliveries"]) {
    if (Array.isArray(payload[key])) rows.push(...payload[key]);
  }
  return rows;
}

function runJSONContractImport(st, payload) {
  const errors = [];
  const messages = [];
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return { ok: false, errors: ["JSON root must be an object."], messages: [], added: 0 };
  }

  mergeSuppliersFromPayload(st, payload.suppliers);

  const rows = collectContractRowsFromPayload(payload);
  if (!rows.length) {
    if (Array.isArray(payload.suppliers) && payload.suppliers.length) {
      messages.push(`Updated supplier list (${payload.suppliers.length} row(s)); no contract / window rows in file.`);
      return { ok: true, errors: [], messages, added: 0 };
    }
    return {
      ok: false,
      errors: [
        'No array named "contracts", "windows", "feedbackWindows", or "deliveries" found. See Import page for the template.',
      ],
      messages: [],
      added: 0,
    };
  }

  let added = 0;
  rows.forEach((raw, i) => {
    const norm = normalizeImportRow(raw);
    if (importWindowFromRow(st, norm, `JSON row ${i + 1}`, errors)) added++;
  });

  messages.push(`Imported ${added} contract / feedback window(s).`);
  return { ok: errors.length === 0, errors, messages, added };
}

function runCSVContractImport(st, text) {
  const errors = [];
  const messages = [];
  const table = parseCSV(text);
  if (!table.length) {
    return { ok: false, errors: ["CSV has no data rows."], messages: [], added: 0 };
  }
  let added = 0;
  table.forEach((raw, i) => {
    const norm = normalizeImportRow(raw);
    if (importWindowFromRow(st, norm, `CSV row ${i + 2}`, errors)) added++;
  });
  messages.push(`Imported ${added} CSV row(s).`);
  return { ok: errors.length === 0, errors, messages, added };
}

function importTemplateJSON() {
  return JSON.stringify(
    {
      version: 1,
      description: "RMH Scorecard — import template (fictional example). suppliers optional; use contracts or windows array.",
      suppliers: [{ id: "imp_demo_sup", name: "Imported Demo Supplier Ltd", category: "General" }],
      contracts: [
        {
          supplierId: "imp_demo_sup",
          supplierName: "Imported Demo Supplier Ltd",
          contractRef: "C-IMPORT-DEMO-001",
          contractTitle: `Open ${FEEDBACK_WINDOW_DAYS}-day feedback from today`,
          openFromToday: true,
          status: "open",
        },
        {
          supplierName: "Imported Demo Supplier Ltd",
          contractRef: "C-IMPORT-DEMO-002",
          contractTitle: "Closed historical window (optional finalScore)",
          status: "closed",
          startDate: "2025-11-01",
          endDate: "2025-11-15",
          finalScore: 5,
        },
      ],
    },
    null,
    2
  );
}

// --- KPI helpers (kpi-framework.js) ---

function getFramework() {
  if (typeof CONTRACT_KPI_FRAMEWORK !== "undefined") return CONTRACT_KPI_FRAMEWORK;
  return {
    title: "Contract performance KPIs",
    sourceNote: "",
    areas: [],
    operationalMetrics: [],
    spendFields: [],
    scorecardHeaderFields: [],
  };
}

function kpiLabelForIds(areaId, kpiId) {
  if (!areaId) return "";
  const fw = getFramework();
  const area = fw.areas.find((a) => a.id === areaId);
  if (!area) return areaId;
  const kpi = kpiId ? area.kpis.find((k) => k.id === kpiId) : null;
  if (kpi) return `${area.label} — ${kpi.name}`;
  return area.label;
}

/**
 * Flat KPI keys + scoring weights. Each leaf KPI scored 1–5; window score = Σ (score/5)×effectiveWeight% → max 100.
 * Framework rows repeat the pillar weightPercent on each leaf (workbook style); within each pillar we scale so
 * leaf weights sum to that pillar’s share (if all leaves use the same raw %, that is equal split).
 */
function getScorecardSpec() {
  const fw = getFramework();
  const areas = fw.areas || [];
  let kpiCount = 0;
  for (const area of areas) kpiCount += (area.kpis || []).length;
  const uniform = kpiCount ? 100 / kpiCount : 0;
  const meta = [];
  for (const area of areas) {
    const kpis = area.kpis || [];
    const n = kpis.length;
    if (!n) continue;
    const wArea = Number(area.weightPercent);
    const hasAreaW = Number.isFinite(wArea) && wArea > 0;

    if (!hasAreaW) {
      for (const k of kpis) {
        meta.push({
          key: `${area.id}:${k.id}`,
          areaId: area.id,
          kpiId: k.id,
          shortLabel: k.name,
          areaLabel: area.label,
          weightPercent: uniform,
        });
      }
      continue;
    }

    const raws = kpis.map((k) => {
      if (k.weightPercent != null) {
        const w = Number(k.weightPercent);
        if (Number.isFinite(w) && w > 0) return w;
      }
      return wArea;
    });
    const rawSum = raws.reduce((a, b) => a + b, 0);
    const perKpis =
      rawSum > 0 ? raws.map((rw) => (wArea * rw) / rawSum) : raws.map(() => wArea / n);

    for (let i = 0; i < kpis.length; i++) {
      const k = kpis[i];
      meta.push({
        key: `${area.id}:${k.id}`,
        areaId: area.id,
        kpiId: k.id,
        shortLabel: k.name,
        areaLabel: area.label,
        weightPercent: Math.round(perKpis[i] * 10000) / 10000,
      });
    }
  }
  const keys = meta.map((m) => m.key);
  return { keys, meta, maxTotal: 100 };
}

function safeScorecardMax(spec) {
  return spec.maxTotal > 0 ? spec.maxTotal : 100;
}

function clampKpi1to5(n) {
  const x = Number(n);
  if (Number.isNaN(x)) return 5;
  return Math.min(5, Math.max(1, Math.round(x * 100) / 100));
}

/** Pillar weight % for Pulse / UI (from kpi-framework area). */
function pillarWeightPercentForAreaId(areaId) {
  if (!areaId) return 0;
  const a = getFramework().areas.find((ar) => ar.id === areaId);
  const w = Number(a?.weightPercent);
  return Number.isFinite(w) && w > 0 ? w : 0;
}

/** Pulse exception slider 0…W (W = pillar %) maps linearly to tagged KPI score 1…5. */
function pulsePillarSliderToKpi1to5(sliderVal, pillarW) {
  if (!(pillarW > 0)) return 5;
  const v = Number(sliderVal);
  if (Number.isNaN(v)) return 5;
  const clamped = Math.min(pillarW, Math.max(0, v));
  const k = 1 + (clamped / pillarW) * 4;
  return clampKpi1to5(k);
}

function kpi1to5ToPillarSlider(kpiScore, pillarW) {
  if (!(pillarW > 0)) return 0;
  const c = clampKpi1to5(kpiScore);
  return Math.min(pillarW, Math.max(0, Math.round(((c - 1) / 4) * pillarW)));
}

/** Full map for one pulse: all 5s, or one KPI lowered when reporting an exception. */
function buildPulseKpiScores(reported, areaId, kpiId, score) {
  const spec = getScorecardSpec();
  const m = {};
  for (const k of spec.keys) m[k] = 5;
  if (reported && areaId && kpiId) {
    const key = `${areaId}:${kpiId}`;
    if (spec.keys.includes(key)) m[key] = clampKpi1to5(score);
  }
  return m;
}

function pulseLegacyScore(p) {
  return clampKpi1to5(p.score != null ? p.score : 5);
}

function pulseToFullMap(p, spec) {
  const m = {};
  if (!spec.keys.length) return m;
  if (p.kpiScores && typeof p.kpiScores === "object" && Object.keys(p.kpiScores).length > 0) {
    for (const key of spec.keys) {
      const v = p.kpiScores[key];
      m[key] = v !== undefined && v !== null ? clampKpi1to5(v) : 5;
    }
    return m;
  }
  if (p.reportedIssue && p.kpiAreaId && p.kpiId) {
    const targetKey = `${p.kpiAreaId}:${p.kpiId}`;
    if (spec.keys.includes(targetKey)) {
      const sv = clampKpi1to5(p.score != null ? p.score : 5);
      for (const key of spec.keys) m[key] = key === targetKey ? sv : 5;
      return m;
    }
  }
  const s = pulseLegacyScore(p);
  for (const key of spec.keys) m[key] = s;
  return m;
}

function pulseTotalFromMap(map, spec) {
  if (!spec.meta?.length) {
    let sum = 0;
    for (const k of spec.keys) sum += map[k] ?? 5;
    return sum;
  }
  let weighted = 0;
  for (const m of spec.meta) {
    const w = m.weightPercent ?? 0;
    const s = clampKpi1to5(map[m.key] ?? 5);
    weighted += (s / 5) * w;
  }
  return Math.round(weighted * 100) / 100;
}

function pulseKpiTotals(p) {
  const spec = getScorecardSpec();
  const maxS = safeScorecardMax(spec);
  const tot = pulseTotalFromMap(pulseToFullMap(p, spec), spec);
  return { total: tot, max: maxS };
}

function pulseCountsAsException(p) {
  if (p.reportedIssue) return true;
  const spec = getScorecardSpec();
  const maxS = safeScorecardMax(spec);
  if (!spec.keys.length) return pulseLegacyScore(p) < 5;
  const tot = pulseTotalFromMap(pulseToFullMap(p, spec), spec);
  return tot < maxS - 0.02;
}

/**
 * Per KPI: minimum score across pulses; window total = Σ (min/5)×pillar weight% (max 100).
 */
function computeWindowAggregate(state, w) {
  const spec = getScorecardSpec();
  const maxS = safeScorecardMax(spec);
  const list = pulsesForWindow(state, w.id);
  if (!list.length) {
    return { total: maxS, max: maxS };
  }
  if (!list.some((p) => pulseCountsAsException(p))) {
    return { total: maxS, max: maxS };
  }
  if (!spec.keys.length) {
    const t = Math.min(...list.map((p) => pulseLegacyScore(p)));
    return { total: Math.round((t / 5) * maxS), max: maxS };
  }
  const maps = list.map((p) => pulseToFullMap(p, spec));
  const merged = {};
  for (const key of spec.keys) {
    merged[key] = Math.min(...maps.map((mm) => mm[key] ?? 5));
  }
  let total = 0;
  for (const m of spec.meta) {
    const wgt = m.weightPercent ?? 0;
    const s = clampKpi1to5(merged[m.key] ?? 5);
    total += (s / 5) * wgt;
  }
  return { total: Math.round(total * 100) / 100, max: maxS };
}

function migrateFinalScores(st) {
  const maxS = safeScorecardMax(getScorecardSpec());
  for (const w of st.windows) {
    if (w.status !== "closed") continue;
    const list = pulsesForWindow(st, w.id);
    const agg = computeWindowAggregate(st, w);
    if (list.length > 0) {
      w.finalScoreTotal = agg.total;
      w.finalScoreMax = agg.max;
      w.finalScore = agg.max ? Math.min(5, Math.max(1, Math.round((agg.total / agg.max) * 5 * 10) / 10)) : 5;
    } else {
      if (w.finalScore == null || w.finalScore === "") w.finalScore = 5;
      w.finalScoreMax = maxS;
      w.finalScoreTotal = Math.round((Number(w.finalScore) / 5) * maxS * 100) / 100;
    }
  }
}

function rollingSupplierScore(state, supplierId) {
  const closed = state.windows.filter((w) => w.supplierId === supplierId && w.status === "closed");
  if (!closed.length) return null;
  const maxS = safeScorecardMax(getScorecardSpec());
  let sumRatio = 0;
  for (const w of closed) {
    const t = w.finalScoreTotal != null ? w.finalScoreTotal : computeWindowAggregate(state, w).total;
    const m = w.finalScoreMax != null ? w.finalScoreMax : maxS;
    sumRatio += m ? t / m : 1;
  }
  const ratio = sumRatio / closed.length;
  return {
    ratio,
    avgTotal: ratio * maxS,
    max: maxS,
    equiv5: Math.min(5, Math.max(1, Math.round(ratio * 5 * 10) / 10)),
  };
}

function closeExpiredWindows(state) {
  const t = todayISO();
  let changed = false;
  for (const w of state.windows) {
    if (w.status === "open" && w.endDate < t) {
      w.status = "closed";
      const agg = computeWindowAggregate(state, w);
      w.finalScoreTotal = agg.total;
      w.finalScoreMax = agg.max;
      w.finalScore = agg.max ? Math.min(5, Math.max(1, Math.round((agg.total / agg.max) * 5 * 10) / 10)) : 5;
      changed = true;
    }
  }
  return changed;
}

// --- UI ---

const navItems = [
  { id: "dashboard", label: "Dashboard" },
  { id: "windows", label: `${FEEDBACK_WINDOW_DAYS}-day windows` },
  { id: "import", label: "Import contracts" },
  { id: "pulse", label: "Pulse check" },
  { id: "kpis", label: "Contract KPIs" },
  { id: "suppliers", label: "Suppliers & SRM" },
];

let state = loadState();
let route = "dashboard";

/** Shown again after refresh on Import tab */
let lastImportReportText = "";
let lastImportHadErrors = false;

/** Suppliers & SRM: "contract" = each feedback window (FEEDBACK_WINDOW_DAYS); "supplier" = rolled up by supplier */
let suppliersPageView = "supplier";

/** Supplier view drill-down: when set, show that supplier's contract windows */
let suppliersDrilldownSupplierId = null;

/** When set, show contract-level staff feedback overview for this window id */
let suppliersFeedbackOverviewWindowId = null;

const el = (id) => document.getElementById(id);

function escapeHtml(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Shared cells for a feedback window row (contract / drill-down tables). */
function contractWindowRowCells(state, w, maxS) {
  const s = supplierById(state, w.supplierId);
  const refHtml = w.contractTitle
    ? `<span style="font-family:var(--mono);font-size:0.8rem;">${escapeHtml(w.contractRef)}</span><br><span style="font-size:0.72rem;color:var(--muted);line-height:1.35;">${escapeHtml(w.contractTitle)}</span>`
    : `<span style="font-family:var(--mono);font-size:0.8rem;">${escapeHtml(w.contractRef)}</span>`;
  let scoreCell;
  if (w.status === "closed") {
    const t = w.finalScoreTotal ?? computeWindowAggregate(state, w).total;
    const m = w.finalScoreMax ?? maxS;
    const ratio = m ? t / m : 1;
    scoreCell = `<span class="${scoreClassKpiTotalRatio(ratio)}">${t}/${m}</span> <span style="font-size:0.72rem;color:var(--muted)">(${kpiScoreSecondaryLine(t, m)})</span>`;
  } else {
    const rem = daysRemaining(w.endDate);
    const d = typeof rem === "number" ? Math.max(0, rem) : "—";
    scoreCell = `<span style="color:var(--muted)">Pending</span> <span style="font-size:0.72rem;color:var(--muted)">${d} d left</span>`;
  }
  const statusBadge = `<span class="badge ${w.status === "open" ? "badge--open" : "badge--closed"}">${w.status}</span>`;
  const period = `${w.startDate} → ${w.endDate}`;
  return { refHtml, scoreCell, statusBadge, period, supplier: s };
}

function contractWindowsTableBodyHtml(state, windows, maxS, columns, withFeedbackColumn) {
  const baseCols = columns === "full" ? 6 : 4;
  const colspan = baseCols + (withFeedbackColumn ? 1 : 0);
  const sorted = [...windows].sort((a, b) => b.startDate.localeCompare(a.startDate));
  if (!sorted.length) {
    const msg =
      columns === "full"
        ? `No contract windows yet — open one under <strong>${FEEDBACK_WINDOW_DAYS}-day windows</strong>.`
        : `No ${FEEDBACK_WINDOW_DAYS}-day windows for this supplier yet.`;
    return `<tr><td colspan="${colspan}" class="empty">${msg}</td></tr>`;
  }
  const feedbackCell = (w) =>
    withFeedbackColumn
      ? `<td><button type="button" class="btn btn--ghost srm-feedback-overview-btn" data-window-id="${w.id}">Staff feedback</button></td>`
      : "";
  return sorted
    .map((w) => {
      const c = contractWindowRowCells(state, w, maxS);
      const periodTd = `<td style="font-size:0.75rem;font-family:var(--mono);color:var(--muted);">${c.period}</td>`;
      if (columns === "full") {
        return `<tr>
              <td>${c.refHtml}</td>
              <td>${c.supplier?.name ?? "—"}</td>
              <td>${c.supplier?.category ?? "—"}</td>
              <td>${c.statusBadge}</td>
              ${periodTd}
              <td>${c.scoreCell}</td>
              ${feedbackCell(w)}
            </tr>`;
      }
      return `<tr>
              <td>${c.refHtml}</td>
              <td>${c.statusBadge}</td>
              ${periodTd}
              <td>${c.scoreCell}</td>
              ${feedbackCell(w)}
            </tr>`;
    })
    .join("");
}

/** HTML for one contract’s aggregated staff feedback (pulses) — used on Suppliers & SRM. */
function contractStaffFeedbackOverviewHTML(state, w) {
  const maxS = safeScorecardMax(getScorecardSpec());
  const sup = supplierById(state, w.supplierId);
  const pulses = pulsesForWindow(state, w.id)
    .slice()
    .sort((a, b) => (b.submittedAt || "").localeCompare(a.submittedAt || ""));
  const excN = pulses.filter((p) => pulseCountsAsException(p)).length;
  const nClinical = pulses.filter((p) => p.role === "clinical").length;
  const nProc = pulses.filter((p) => p.role === "procurement").length;

  let windowScoreLine = "";
  if (w.status === "closed") {
    const t = w.finalScoreTotal ?? computeWindowAggregate(state, w).total;
    const m = w.finalScoreMax ?? maxS;
    const ratio = m ? t / m : 1;
    windowScoreLine = `<li><strong>Window score (closed):</strong> <span class="${scoreClassKpiTotalRatio(ratio)}">${t}/${m}</span> (${kpiScoreSecondaryLine(t, m)})</li>`;
  } else {
    windowScoreLine = `<li><strong>Window status:</strong> open — final KPI total is set when the window closes.</li>`;
  }

  const pulseRows =
    pulses.length === 0
      ? `<tr><td colspan="6" class="empty">No pulse submissions yet — use <strong>Pulse check</strong> while this window is open.</td></tr>`
      : pulses
          .map((p) => {
            const pk = pulseKpiTotals(p);
            const exc = pulseCountsAsException(p);
            const roleBadge =
              p.role === "clinical"
                ? "badge--clinical"
                : p.role === "procurement"
                  ? "badge--procurement"
                  : "";
            const kpi =
              p.kpiAreaId || p.kpiId
                ? kpiLabelForIds(p.kpiAreaId, p.kpiId) || "—"
                : "—";
            const detail = (p.detail || "").trim();
            const detailShort =
              detail.length > 120 ? `${escapeHtml(detail.slice(0, 117))}…` : escapeHtml(detail) || "—";
            return `<tr>
            <td>${p.submittedAt ?? "—"}</td>
            <td><span class="badge ${roleBadge}">${p.role || "—"}</span></td>
            <td>${exc ? `<span class="badge" style="background:rgba(185,28,28,0.1);color:var(--danger);">Exception</span>` : "No issue"}</td>
            <td><span class="${scoreClassKpiTotalRatio(pk.total / pk.max)}">${pk.total}/${pk.max}</span> <span style="font-size:0.65rem;color:var(--muted)">(${kpiScoreSecondaryLine(pk.total, pk.max)})</span></td>
            <td style="font-size:0.75rem;color:var(--muted);">${escapeHtml(kpi)}</td>
            <td style="font-size:0.75rem;max-width:14rem;">${detailShort}</td>
          </tr>`;
          })
          .join("");

  const refBlock = w.contractTitle
    ? `<strong style="font-family:var(--mono);font-size:0.9rem;">${escapeHtml(w.contractRef)}</strong><br><span style="color:var(--muted);font-size:0.875rem;">${escapeHtml(w.contractTitle)}</span>`
    : `<strong style="font-family:var(--mono);font-size:0.9rem;">${escapeHtml(w.contractRef)}</strong>`;

  return `
    <div class="srm-feedback-overview">
      <div class="srm-drilldown__head">
        <button type="button" class="btn btn--ghost" id="srm-feedback-overview-back">← Back</button>
        <div class="srm-drilldown__head-text">
          <h2 class="srm-drilldown__title">Contract feedback overview</h2>
          <p class="kpi-intro srm-drilldown__meta" style="margin-top:0.35rem !important;">All staff pulse submissions for this ${FEEDBACK_WINDOW_DAYS}-day feedback window.</p>
        </div>
      </div>
      <div class="card" style="margin-bottom:1rem;">
        <h3 style="margin-top:0;">Contract &amp; supplier</h3>
        <p style="margin:0.35rem 0 0.5rem;">${refBlock}</p>
        <ul class="check" style="margin:0.5rem 0 0;font-size:0.875rem;">
          <li><strong>Supplier:</strong> ${escapeHtml(sup?.name ?? "—")} · ${escapeHtml(sup?.category ?? "—")}</li>
          <li><strong>Period:</strong> <span style="font-family:var(--mono);font-size:0.8rem;">${w.startDate} → ${w.endDate}</span> · <span class="badge ${w.status === "open" ? "badge--open" : "badge--closed"}">${w.status}</span></li>
          ${windowScoreLine}
        </ul>
      </div>
      <div class="grid grid--2" style="margin-bottom:1rem;">
        <div class="card">
          <h3 style="margin-top:0;">Staff participation</h3>
          <ul class="check" style="margin:0;font-size:0.875rem;">
            <li><strong>Total pulses:</strong> ${pulses.length}</li>
            <li><strong>Exceptions reported:</strong> ${excN}</li>
            <li><strong>Clinical:</strong> ${nClinical} · <strong>Procurement:</strong> ${nProc}</li>
          </ul>
        </div>
        <div class="card">
          <h3 style="margin-top:0;">How to read this</h3>
          <p style="margin:0;font-size:0.8125rem;color:var(--muted);line-height:1.5;">Each row is one person’s submission. <strong>Pulse score</strong> is the weighted 0–100 total for that pulse (only tagged KPIs drop when they report an issue). The closed window score uses the <strong>lowest</strong> score per KPI across everyone, then the same weighting — see Dashboard <em>How scoring works</em>.</p>
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Submitted</th><th>Role</th><th>Type</th><th>Pulse score</th><th>Linked KPI</th><th>Detail</th></tr></thead>
          <tbody>${pulseRows}</tbody>
        </table>
      </div>
    </div>
  `;
}

function formatImportReport(res) {
  const lines = [...(res.messages || [])];
  if (res.errors?.length) {
    lines.push("");
    lines.push("Issues:");
    res.errors.forEach((e) => lines.push(`- ${e}`));
  }
  return lines.join("\n");
}

function toast(msg) {
  const t = el("toast");
  t.textContent = msg;
  t.classList.add("is-visible");
  clearTimeout(toast._tid);
  toast._tid = setTimeout(() => t.classList.remove("is-visible"), 3200);
}

function persist() {
  saveState(state);
}

function refresh() {
  migrateFinalScores(state);
  if (closeExpiredWindows(state)) persist();
  if (!navItems.some((n) => n.id === route)) route = "dashboard";
  renderNav();
  renderMain();
}

function renderNav() {
  const nav = el("nav");
  nav.innerHTML = navItems
    .map(
      (n) =>
        `<button type="button" data-route="${n.id}" class="${n.id === route ? "is-active" : ""}">${n.label}</button>`
    )
    .join("");
  nav.querySelectorAll("button").forEach((b) => {
    b.addEventListener("click", () => {
      const next = b.dataset.route;
      if (next !== "suppliers") suppliersFeedbackOverviewWindowId = null;
      route = next;
      refresh();
    });
  });
}

function scoreClass(score) {
  if (score >= 4.5) return "score-pill score-pill--full";
  if (score >= 3.5) return "score-pill score-pill--mid";
  return "score-pill score-pill--low";
}

/** Supplier rolling average & coarse tiers: “good enough” band (portfolio view). */
function scoreClassRatio(ratio) {
  if (ratio >= 0.9) return "score-pill score-pill--full";
  if (ratio >= 0.7) return "score-pill score-pill--mid";
  return "score-pill score-pill--low";
}

/**
 * Single contract / window / pulse line vs scorecard max: green only when every KPI point is earned
 * (ratio === 1). Avoids e.g. 94/100 looking “fully green” when not actually full marks.
 */
function scoreClassKpiTotalRatio(ratio) {
  if (ratio >= 1 - 1e-9) return "score-pill score-pill--full";
  if (ratio >= 0.75) return "score-pill score-pill--mid";
  return "score-pill score-pill--low";
}

/** Index 0–100: (total/max)×100; max is normally 100 (weighted scorecard). */
function kpiIndexOutOf100(total, max) {
  if (!max) return 100;
  return Math.round((total / max) * 1000) / 10;
}

/** Muted suffix for score cells: when max≈100, skip duplicate “/100 index”. */
function kpiScoreSecondaryLine(total, max) {
  const m = Number(max);
  const eq5 = m ? Math.round((total / m) * 5 * 10) / 10 : 5;
  if (m >= 99.5 && m <= 100.5) {
    return `~${eq5}/5 equiv.`;
  }
  const idx100 = kpiIndexOutOf100(total, m);
  return `${idx100}/100 · ~${eq5}/5`;
}

let dashboardChartInstances = [];

function destroyDashboardCharts() {
  for (const c of dashboardChartInstances) {
    try {
      c.destroy();
    } catch (_) {
      /* ignore */
    }
  }
  dashboardChartInstances = [];
}

function dashboardAnalyticsMarkup(hasClosed, scorecardMaxPoints) {
  const maxPts = scorecardMaxPoints ?? 100;
  if (!hasClosed) {
    return `
    <div class="card dashboard-analytics" style="margin-top:1rem;">
      <h2>Performance charts</h2>
      <p style="color:var(--muted);margin:0;">No <strong>closed</strong> windows yet — load the demo or close a ${FEEDBACK_WINDOW_DAYS}-day window. You’ll see two simple charts: scores <strong>by contract</strong> and <strong>by supplier</strong> (same numbers as the rest of the app, shown as % of <strong>${maxPts}</strong> weighted points).</p>
    </div>`;
  }
  return `
    <div class="card dashboard-analytics" style="margin-top:1rem;">
      <h2>Performance charts</h2>
      <p class="chart-intro chart-intro--tight">Closed windows only. Each leaf KPI is 1–5; framework <strong>pillar weights</strong> (Capability 5%, Innovation 10%, … — total 100%) are applied so each pillar’s KPIs share that % (leaf rows repeat the pillar % in data; equal raw % → equal split). Window score <strong>0–${maxPts}</strong>. Bar = <strong>% of max</strong>. Weaker first. Colours: <strong>green = exactly max</strong>; amber / red = below full marks.</p>
      <div class="grid grid--2 chart-grid">
        <div class="chart-panel">
          <h3>By contract (each closed window)</h3>
          <div class="chart-canvas-wrap" id="dash-wrap-contracts"><canvas id="dash-chart-contracts" aria-label="Score percent by contract reference"></canvas></div>
        </div>
        <div class="chart-panel">
          <h3>By supplier (average of that supplier’s closed windows)</h3>
          <div class="chart-canvas-wrap chart-canvas-wrap--tall" id="dash-wrap-suppliers"><canvas id="dash-chart-suppliers" aria-label="Rolling score percent by supplier"></canvas></div>
        </div>
      </div>
    </div>`;
}

function mountDashboardCharts() {
  destroyDashboardCharts();
  const ChartLib = typeof Chart !== "undefined" ? Chart : null;
  if (!ChartLib) return;

  const closed = state.windows.filter((w) => w.status === "closed");
  if (!closed.length) return;

  const maxS = safeScorecardMax(getScorecardSpec());
  const contractRows = closed
    .map((w) => {
      const s = supplierById(state, w.supplierId);
      const t = w.finalScoreTotal ?? computeWindowAggregate(state, w).total;
      const m = w.finalScoreMax ?? maxS;
      const ratio = m ? t / m : 1;
      const ref = w.contractRef || w.id;
      const label = ref.length > 26 ? `${ref.slice(0, 24)}…` : ref;
      return {
        label,
        full: ref,
        ratio,
        category: s?.category || "Uncategorised",
        supplier: s?.name || "—",
      };
    })
    .sort((a, b) => a.ratio - b.ratio);

  const pct = (r) => Math.round(r * 1000) / 10;
  const barColor = (r) => {
    if (r >= 1 - 1e-9) return "rgba(21, 128, 61, 0.88)";
    if (r >= 0.75) return "rgba(217, 119, 6, 0.88)";
    return "rgba(220, 38, 38, 0.85)";
  };

  const tickColor = "#64748b";
  const gridColor = "#e2e8f0";

  const elC = document.getElementById("dash-chart-contracts");
  const wrapC = document.getElementById("dash-wrap-contracts");
  if (elC && wrapC) {
    wrapC.style.height = `${Math.min(440, Math.max(160, 48 + contractRows.length * 34))}px`;
    const ratios = contractRows.map((r) => r.ratio);
    const c1 = new ChartLib(elC, {
      type: "bar",
      data: {
        labels: contractRows.map((r) => r.label),
        datasets: [
          {
            label: "% of KPI max",
            data: contractRows.map((r) => pct(r.ratio)),
            backgroundColor: ratios.map(barColor),
            borderWidth: 0,
            borderRadius: 4,
          },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title(items) {
                const i = items[0].dataIndex;
                return contractRows[i].full;
              },
              label(item) {
                const i = item.dataIndex;
                const r = contractRows[i];
                return [`${item.raw}%`, r.supplier, r.category];
              },
            },
          },
        },
        scales: {
          x: {
            min: 0,
            max: 100,
            grid: { color: gridColor },
            ticks: { color: tickColor },
            title: { display: true, text: "% of full score", color: tickColor, font: { size: 11 } },
          },
          y: {
            grid: { display: false },
            ticks: { color: tickColor, font: { size: 11 } },
          },
        },
      },
    });
    dashboardChartInstances.push(c1);
  }

  const supRows = state.suppliers
    .map((s) => {
      const roll = rollingSupplierScore(state, s.id);
      if (!roll) return null;
      const nClosed = state.windows.filter((w) => w.supplierId === s.id && w.status === "closed").length;
      const name = s.name.length > 34 ? `${s.name.slice(0, 32)}…` : s.name;
      return {
        name,
        full: s.name,
        ratio: roll.ratio,
        pct: pct(roll.ratio),
        n: nClosed,
        category: s.category,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.ratio - b.ratio);

  const elS = document.getElementById("dash-chart-suppliers");
  const wrapS = document.getElementById("dash-wrap-suppliers");
  if (elS && wrapS && supRows.length) {
    wrapS.style.height = `${Math.min(480, Math.max(200, 56 + supRows.length * 32))}px`;
    const ratiosS = supRows.map((r) => r.ratio);
    const c3 = new ChartLib(elS, {
      type: "bar",
      data: {
        labels: supRows.map((r) => r.name),
        datasets: [
          {
            label: "Rolling avg %",
            data: supRows.map((r) => r.pct),
            backgroundColor: ratiosS.map(barColor),
            borderWidth: 0,
            borderRadius: 4,
          },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title(items) {
                return supRows[items[0].dataIndex].full;
              },
              label(item) {
                const r = supRows[item.dataIndex];
                return [`${item.raw}% avg`, `${r.n} closed window(s)`, r.category];
              },
            },
          },
        },
        scales: {
          x: {
            min: 0,
            max: 100,
            grid: { color: gridColor },
            ticks: { color: tickColor },
            title: { display: true, text: "% of full score (avg)", color: tickColor, font: { size: 11 } },
          },
          y: {
            grid: { display: false },
            ticks: { color: tickColor, font: { size: 10 } },
          },
        },
      },
    });
    dashboardChartInstances.push(c3);
  }
}

function viewDashboard() {
  const openW = state.windows.filter((w) => w.status === "open");
  const closedW = state.windows.filter((w) => w.status === "closed");
  const exceptions = state.pulses.filter((p) => pulseCountsAsException(p));
  const openContracts =
    openW.length === 0
      ? `<li style="color:var(--muted)">No active feedback windows.</li>`
      : openW
          .map((w) => {
            const s = supplierById(state, w.supplierId);
            const title = w.contractTitle ? ` — ${w.contractTitle}` : "";
            return `<li><strong style="font-family:var(--mono);font-size:0.8rem;">${w.contractRef}</strong>${title}<br><span style="color:var(--muted);font-size:0.8rem;">${s?.name ?? ""}</span></li>`;
          })
          .join("");

  return `
    <p class="section-title">Overview</p>
    <div class="grid grid--3">
      <div class="card">
        <div class="stat">${openW.length}</div>
        <div class="stat-label">Active feedback windows</div>
        <p>Each delivery or service completion can trigger a ${FEEDBACK_WINDOW_DAYS}-day pulse period.</p>
      </div>
      <div class="card">
        <div class="stat">${closedW.length}</div>
        <div class="stat-label">Closed scoring events</div>
        <p>Closed windows store a <strong>weighted KPI score</strong> (16 leaf KPIs × 1–5, pillar weights sum to <strong>100%</strong> → max <strong>100</strong> pts). UI also shows a <strong>0–100 index</strong> (= % of max). Green only when score = max.</p>
      </div>
      <div class="card">
        <div class="stat">${exceptions.length}</div>
        <div class="stat-label">Logged exceptions</div>
        <p>Issues reported by clinical or procurement feed SRM and renewal decisions.</p>
      </div>
    </div>
    ${dashboardAnalyticsMarkup(closedW.length > 0, safeScorecardMax(getScorecardSpec()))}
    <div class="card" style="margin-top:1rem;">
      <h2>How scoring works</h2>
      <div class="flow" style="margin-top:0.75rem;">
        <div class="flow__step"><strong>1 · Trigger</strong>Contract terms summarised; window opens on delivery / service completion.</div>
        <div class="flow__step"><strong>2 · Pulse</strong>Short quizzes: clinical (quality, usability); procurement (compliance, risk, responsiveness).</div>
        <div class="flow__step"><strong>3 · KPI composite</strong>Rationalised RMH catalogue: <strong>16 KPIs</strong> under six pillars (weights total 100%). Each leaf repeats its pillar % in data; effective weight per KPI scales so each pillar still sums to its share. Each scored 1–5; only flagged KPIs drop for a pulse. Window score = Σ (min per KPI ÷ 5) × effective weight%; max <strong>100</strong>.</div>
      </div>
      <p style="margin:0.75rem 0 0;font-size:0.8125rem;color:var(--muted);">Contract dimensions follow the <strong>Contract KPIs</strong> tab — RMH rationalised scorecard (MH24.CM.001), 16 KPIs.</p>
    </div>
    <div class="card" style="margin-top:1rem;">
      <h2>Open fictional contracts (pulse-ready)</h2>
      <p style="margin-top:0;">Synthetic RMH-style panel, PO, MOU &amp; legacy ICT references — <strong>8 suppliers</strong>, <strong>3 open</strong> windows, pulses spanning clinical/procurement and multiple pillars. Go to <strong>Pulse check</strong> to add feedback.</p>
      <ul class="check" style="margin-top:0.75rem;">${openContracts}</ul>
    </div>
  `;
}

function viewWindows() {
  const rows =
    state.windows.length === 0
      ? `<tr><td colspan="6" class="empty">No windows yet. Click <strong>Reset &amp; load full fictional demo</strong> above to load synthetic contracts, or open a new delivery below.</td></tr>`
      : [...state.windows]
          .sort((a, b) => b.startDate.localeCompare(a.startDate))
          .map((w) => {
            const sup = supplierById(state, w.supplierId);
            const rem = w.status === "open" ? daysRemaining(w.endDate) : "—";
            const agg =
              w.status === "closed"
                ? {
                    total: w.finalScoreTotal ?? computeWindowAggregate(state, w).total,
                    max: w.finalScoreMax ?? safeScorecardMax(getScorecardSpec()),
                  }
                : null;
            const final =
              w.status === "closed" && agg
                ? (() => {
                    const r = agg.max ? agg.total / agg.max : 1;
                    return `<span class="${scoreClassKpiTotalRatio(r)}">${agg.total}/${agg.max}</span> <span style="font-size:0.7rem;color:var(--muted)">(${kpiScoreSecondaryLine(agg.total, agg.max)})</span>`;
                  })()
                : `<span class="score-pill" style="color:var(--muted)">Pending</span>`;
            const refHtml = w.contractTitle
              ? `<span style="font-family:var(--mono);font-size:0.75rem;">${w.contractRef}</span><br><span style="font-size:0.72rem;color:var(--muted);line-height:1.35;">${w.contractTitle}</span>`
              : `<span style="font-family:var(--mono);font-size:0.75rem;">${w.contractRef}</span>`;
            return `<tr>
              <td><span class="badge ${w.status === "open" ? "badge--open" : "badge--closed"}">${w.status}</span></td>
              <td>${sup?.name ?? w.supplierId}</td>
              <td>${refHtml}</td>
              <td>${w.startDate} → ${w.endDate}</td>
              <td>${typeof rem === "number" ? (rem < 0 ? "0" : rem) + " d" : rem}</td>
              <td>${final}</td>
            </tr>`;
          })
          .join("");

  return `
    <p class="section-title">Post-contract feedback windows</p>
    <p class="kpi-intro" style="margin:0 0 1rem;max-width:72ch;">Window score is <strong>0–100</strong>: each leaf KPI is <strong>1–5</strong>. In <code>kpi-framework.js</code> each leaf repeats its pillar’s <strong>weightPercent</strong> (same as the workbook); the app <strong>scales within the pillar</strong> so those leaves still sum to that pillar’s share (six pillars sum to 100%). The table shows <strong>xx/100</strong> plus a <strong>0–100 index</strong> (% of max) and an approximate <strong>/5</strong> equivalent. <strong>Open</strong> windows stay “Pending” until close. For imperfect demo scores, use <strong>Reset &amp; load full fictional demo</strong> or clear old browser data.</p>
    <div class="grid grid--2" style="margin-bottom:1rem;">
      <div class="card">
        <h3>Simulate delivery / completion</h3>
        <p>Starts today; closes ${FEEDBACK_WINDOW_DAYS} days later. In production this would be driven by contract parsing and ERP events. Bulk load: <strong>Import contracts</strong> tab.</p>
        <form id="form-new-window">
          <div class="form-group">
            <label for="nw-supplier">Supplier</label>
            <select id="nw-supplier" required>
              ${state.suppliers.map((s) => `<option value="${s.id}">${s.name}</option>`).join("")}
            </select>
          </div>
          <div class="form-group">
            <label for="nw-contract">Contract / PO reference</label>
            <input type="text" id="nw-contract" placeholder="e.g. PO-2026-1842" required />
          </div>
          <button type="submit" class="btn btn--primary">Open ${FEEDBACK_WINDOW_DAYS}-day window</button>
        </form>
      </div>
      <div class="card">
        <h3>Maintenance</h3>
        <p>Close open windows by system date, or reload the full fictional contract pack.</p>
        <div class="list-actions">
          <button type="button" class="btn btn--primary" id="btn-full-demo">Reset &amp; load full fictional demo</button>
          <button type="button" class="btn btn--ghost" id="btn-process-due">Process due windows (use today’s date)</button>
          <button type="button" class="btn btn--ghost" id="btn-seed">Add extra sample closed window</button>
        </div>
      </div>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Status</th><th>Supplier</th><th>Reference</th><th>Period</th><th>Days left</th><th>KPI total</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function viewPulse() {
  const openW = state.windows.filter((w) => w.status === "open");
  const options =
    openW.length === 0
      ? `<option value="">No open windows — open one from “${FEEDBACK_WINDOW_DAYS}-day windows”</option>`
      : `<option value="">Select window…</option>` +
        openW
          .map((w) => {
            const s = supplierById(state, w.supplierId);
            return `<option value="${w.id}">${s?.name ?? ""} · ${w.contractRef} (ends ${w.endDate})</option>`;
          })
          .join("");

  return `
    <p class="section-title">Pulse check (segmented)</p>
    <div class="card">
      <p><strong>No issue:</strong> all KPIs count as 5. <strong>Exception:</strong> only the KPI you select is scored lower; every other KPI stays 5 for this pulse. After you pick the <strong>KPI area</strong>, the score slider uses <strong>0–that pillar’s %</strong> (e.g. 0–30 for Risk &amp; compliance) so one step is much smaller on the final /100 result than jumping whole 1–5 points; values map to the KPI’s 1–5 scale for aggregation. When the window closes, each KPI uses the <strong>lowest</strong> score anyone gave; the window score is the <strong>weighted</strong> total (max <strong>100</strong>).</p>
      <form id="form-pulse">
        <div class="form-group">
          <label for="p-window">Feedback window</label>
          <select id="p-window" required>${options}</select>
        </div>
        <div class="form-group">
          <label>Stakeholder role</label>
          <div class="role-toggle" id="p-role">
            <button type="button" data-role="clinical" class="is-on">Clinical</button>
            <button type="button" data-role="procurement">Procurement</button>
          </div>
          <input type="hidden" id="p-role-value" value="clinical" />
        </div>
        <div class="form-group" id="p-questions"></div>
        <div class="form-group">
          <label>
            <input type="checkbox" id="p-exception" />
            Report an exception (defect, delay, non-compliance, etc.)
          </label>
        </div>
        <div class="form-group" id="p-exception-fields" style="display:none;">
          <label for="p-kpi-area">KPI area</label>
          <select id="p-kpi-area">
            <option value="">Loading…</option>
          </select>
          <div class="form-group" style="margin-top:0.75rem;">
            <label for="p-kpi">Specific KPI</label>
            <select id="p-kpi" disabled>
              <option value="">Select an area first</option>
            </select>
          </div>
          <label for="p-detail" style="margin-top:0.75rem;">Brief detail</label>
          <textarea id="p-detail" placeholder="e.g. Lot ABC123 masks — strap failure on 3 units"></textarea>
          <label style="margin-top:0.75rem;" id="p-score-label" for="p-score">Score for this event — choose KPI area first</label>
          <div class="slider-row">
            <input type="range" id="p-score" min="0" max="5" value="0" step="1" disabled aria-valuemin="0" aria-valuemax="5" />
            <span class="slider-value" id="p-score-val">—</span>
          </div>
        </div>
        <button type="submit" class="btn btn--primary" ${openW.length === 0 ? "disabled" : ""}>Submit pulse</button>
      </form>
    </div>
  `;
}

function clinicalQuestionsHTML() {
  return `
    <label>Focus: quality &amp; usability</label>
    <ul class="check">
      <li>Did the product perform as expected clinically?</li>
      <li>Any usability or training gaps for staff?</li>
    </ul>
  `;
}

function procurementQuestionsHTML() {
  return `
    <label>Focus: compliance, risk, responsiveness</label>
    <ul class="check">
      <li>Documentation and regulatory alignment OK?</li>
      <li>Supplier response within agreed timelines?</li>
    </ul>
  `;
}

function viewSuppliers() {
  if (
    suppliersDrilldownSupplierId &&
    !state.suppliers.some((s) => s.id === suppliersDrilldownSupplierId)
  ) {
    suppliersDrilldownSupplierId = null;
  }
  if (
    suppliersFeedbackOverviewWindowId &&
    !state.windows.some((w) => w.id === suppliersFeedbackOverviewWindowId)
  ) {
    suppliersFeedbackOverviewWindowId = null;
  }

  const isContract = suppliersPageView === "contract";
  const maxS = safeScorecardMax(getScorecardSpec());

  const contractRows = contractWindowsTableBodyHtml(state, state.windows, maxS, "full", true);

  const drillSup =
    !isContract && suppliersDrilldownSupplierId
      ? state.suppliers.find((x) => x.id === suppliersDrilldownSupplierId)
      : null;
  const drillWindows = drillSup ? state.windows.filter((w) => w.supplierId === drillSup.id) : [];
  const drillContractRows = drillSup ? contractWindowsTableBodyHtml(state, drillWindows, maxS, "compact", true) : "";

  const rows = state.suppliers
    .map((s) => {
      const roll = rollingSupplierScore(state, s.id);
      const rollHtml =
        roll === null
          ? `<span style="color:var(--muted)">—</span>`
          : `<span class="${scoreClassRatio(roll.ratio)}">${roll.avgTotal.toFixed(1)}/${roll.max}</span> <span style="font-size:0.72rem;color:var(--muted)">(~${roll.equiv5}/5)</span>`;
      const events = state.windows.filter((w) => w.supplierId === s.id && w.status === "closed").length;
      const srm =
        roll === null
          ? "Insufficient events"
          : roll.ratio >= 0.9
            ? "Favourable for renewal / expansion"
            : roll.ratio >= 0.7
              ? "Monitor; consider market testing"
              : "Escalate; review contract & alternatives";
      const winCount = state.windows.filter((w) => w.supplierId === s.id).length;
      const hint = winCount ? `<span class="srm-row-hint">View contracts</span>` : "";
      return `<tr class="srm-supplier-row" data-supplier-id="${s.id}" tabindex="0" role="button" aria-label="Open contract list for ${escapeHtml(s.name)}">
        <td>${escapeHtml(s.name)} ${hint}</td>
        <td>${escapeHtml(s.category)}</td>
        <td>${rollHtml}</td>
        <td>${events}</td>
        <td style="font-size:0.8rem;color:var(--muted);">${srm}</td>
      </tr>`;
    })
    .join("");

  const excPulses = state.pulses
    .filter((p) => pulseCountsAsException(p))
    .slice()
    .sort((a, b) => (b.submittedAt || "").localeCompare(a.submittedAt || ""));
  const excRows =
    excPulses.length === 0
      ? `<tr><td colspan="5" class="empty">No exceptions yet.</td></tr>`
      : excPulses
          .slice(0, 12)
          .map((p) => {
            const w = state.windows.find((x) => x.id === p.windowId);
            const s = w ? supplierById(state, w.supplierId) : null;
            const pk = pulseKpiTotals(p);
            const kpi =
              p.kpiAreaId || p.kpiId
                ? `<span class="kpi-tag">${kpiLabelForIds(p.kpiAreaId, p.kpiId) || "Partial KPI link"}</span>`
                : `<span style="color:var(--muted)">—</span>`;
            return `<tr>
              <td>${p.submittedAt ?? "—"}</td>
              <td>${s?.name ?? "—"}</td>
              <td>${w?.contractRef ?? "—"}</td>
              <td><span class="${scoreClassKpiTotalRatio(pk.total / pk.max)}">${pk.total}/${pk.max}</span> <span style="font-size:0.7rem;color:var(--muted)">(${kpiScoreSecondaryLine(pk.total, pk.max)})</span></td>
              <td>${kpi}</td>
            </tr>`;
          })
          .join("");

  if (suppliersFeedbackOverviewWindowId) {
    const fwOv = state.windows.find((w) => w.id === suppliersFeedbackOverviewWindowId);
    if (fwOv) {
      const overviewBody = contractStaffFeedbackOverviewHTML(state, fwOv);
      return `
    <p class="section-title">Suppliers &amp; SRM</p>
    ${overviewBody}
    <p class="section-title" style="margin-top:1.75rem;">Recent exceptions &amp; KPI linkage</p>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Date</th><th>Supplier</th><th>Contract ref</th><th>Pulse score</th><th>Linked KPI</th></tr></thead>
        <tbody>${excRows}</tbody>
      </table>
    </div>
  `;
    }
    suppliersFeedbackOverviewWindowId = null;
  }

  const toolbarHint = isContract
    ? `<strong>Contract view</strong> — one row per <strong>${FEEDBACK_WINDOW_DAYS}-day window</strong>. <strong>Staff feedback</strong> opens an overview of every pulse on that contract. KPI score shows when the window is <strong>closed</strong>.`
    : drillSup
      ? "This supplier’s <strong>contracts</strong> are listed below. Use <strong>Staff feedback</strong> on each row to see all staff evaluations for that contract. <strong>← All suppliers</strong> returns to the portfolio list."
      : "<strong>Supplier view</strong> — click a <strong>supplier row</strong> to open its contracts; each contract has a <strong>Staff feedback</strong> overview of all pulses.";

  return `
    <p class="section-title">Suppliers &amp; SRM</p>
    <div class="card srm-view-toolbar">
      <p class="srm-view-toolbar__label">Performance scorecard</p>
      <div class="role-toggle" id="srm-view-toggle" role="group" aria-label="Scorecard view">
        <button type="button" data-view="contract" class="${isContract ? "is-on" : ""}">Contract view</button>
        <button type="button" data-view="supplier" class="${!isContract ? "is-on" : ""}">Supplier view</button>
      </div>
      <p class="kpi-intro srm-view-toolbar__hint">${toolbarHint}</p>
    </div>
    ${
      isContract
        ? `<div class="table-wrap">
      <table>
        <thead><tr><th>Contract ref</th><th>Supplier</th><th>Category</th><th>Status</th><th>Period</th><th>KPI score</th><th>Staff feedback</th></tr></thead>
        <tbody>${contractRows}</tbody>
      </table>
    </div>`
        : drillSup
          ? `<div class="srm-drilldown">
      <div class="srm-drilldown__head">
        <button type="button" class="btn btn--ghost" id="srm-back-suppliers">← All suppliers</button>
        <div class="srm-drilldown__head-text">
          <h2 class="srm-drilldown__title">${escapeHtml(drillSup.name)}</h2>
          <p class="kpi-intro srm-drilldown__meta">${escapeHtml(drillSup.category)} · ${drillWindows.length} window(s)</p>
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Contract ref</th><th>Status</th><th>Period</th><th>KPI score</th><th>Staff feedback</th></tr></thead>
          <tbody>${drillContractRows}</tbody>
        </table>
      </div>
    </div>`
          : `<div class="table-wrap">
      <table>
        <thead><tr><th>Supplier</th><th>Category</th><th>Rolling KPI total (avg)</th><th>Closed events</th><th>SRM hint</th></tr></thead>
        <tbody id="srm-supplier-tbody">${rows}</tbody>
      </table>
    </div>`
    }
    <p class="section-title" style="margin-top:1.75rem;">Recent exceptions &amp; KPI linkage</p>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Date</th><th>Supplier</th><th>Contract ref</th><th>Pulse score</th><th>Linked KPI</th></tr></thead>
        <tbody>${excRows}</tbody>
      </table>
    </div>
  `;
}

function viewContractKpis() {
  const fw = getFramework();
  const areaBlocks = fw.areas
    .map((area) => {
      const rows = area.kpis
        .map(
          (k) =>
            `<tr><th scope="row">${k.name}</th><td>${k.target}</td><td>${k.counterMetric}</td><td>${k.rationale}</td></tr>`
        )
        .join("");
      return `
      <div class="kpi-area-block">
        <h3>${area.label}</h3>
        <p class="kpi-area-summary">${area.summary}</p>
        <table class="kpi-table">
          <thead><tr><th scope="col">KPI</th><th scope="col">Performance target (example)</th><th scope="col">Counter-metric</th><th scope="col">Why it matters</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
    })
    .join("");

  const ops = (fw.operationalMetrics || [])
    .map((m) => `<li><strong>${m.name}</strong> — ${m.note}</li>`)
    .join("");
  const spend = (fw.spendFields || []).map((m) => `<li><strong>${m.name}</strong> — ${m.note}</li>`).join("");
  const header = (fw.scorecardHeaderFields || []).map((h) => `<li>${h}</li>`).join("");

  const excPulses = state.pulses.filter((p) => pulseCountsAsException(p));
  const byArea = {};
  for (const p of excPulses) {
    const key = p.kpiAreaId || "uncategorised";
    byArea[key] = (byArea[key] || 0) + 1;
  }
  const rollupRows =
    Object.keys(byArea).length === 0
      ? `<tr><td colspan="2" class="empty">No exceptions recorded yet.</td></tr>`
      : Object.entries(byArea)
          .map(([k, n]) => {
            const label =
              k === "uncategorised" ? "Not linked to a KPI area" : fw.areas.find((a) => a.id === k)?.label ?? k;
            return `<tr><td>${label}</td><td>${n}</td></tr>`;
          })
          .join("");

  return `
    <p class="section-title">${fw.title || "Contract performance KPIs"}</p>
    <p class="kpi-intro">${fw.sourceNote || ""}</p>
    <div class="grid grid--2">
      <div class="card">
        <h2>Scorecard context</h2>
        <p class="kpi-area-summary" style="margin-top:0;">Typical header fields each review period:</p>
        <ul class="kpi-list">${header || "<li>—</li>"}</ul>
        <p class="kpi-area-summary">Operational indicators (portfolio / category level):</p>
        <ul class="kpi-list">${ops || "<li>—</li>"}</ul>
      </div>
      <div class="card">
        <h2>Spend &amp; other contract data</h2>
        <p class="kpi-area-summary" style="margin-top:0;">Fields commonly captured alongside qualitative scores:</p>
        <ul class="kpi-list">${spend || "<li>—</li>"}</ul>
        <p class="kpi-area-summary">Exceptions in this browser (by linked KPI area):</p>
        <div class="table-wrap" style="margin-top:0.5rem;">
          <table>
            <thead><tr><th>Area</th><th>Count</th></tr></thead>
            <tbody>${rollupRows}</tbody>
          </table>
        </div>
      </div>
    </div>
    <div class="card" style="margin-top:1rem;">
      <h2>Scored dimensions &amp; example measures</h2>
      ${areaBlocks || "<p class=\"empty\">KPI catalogue unavailable — ensure kpi-framework.js is loaded.</p>"}
    </div>
  `;
}

function viewImportContracts() {
  return `
    <p class="section-title">Import existing contracts</p>
    <p class="kpi-intro" style="margin-top:0;">Load supplier + contract rows from a JSON or CSV file (or paste below). Data merges into this browser — existing suppliers are matched by <strong>supplierId</strong> or case-insensitive <strong>supplier name</strong>; new names create suppliers automatically.</p>
    <div class="grid grid--2">
      <div class="card">
        <h2>Template &amp; file</h2>
        <p>Download a sample JSON, edit in Excel / VS Code, then upload or paste.</p>
        <div class="list-actions">
          <button type="button" class="btn btn--ghost" id="btn-dl-template">Download JSON template</button>
        </div>
        <div class="form-group" style="margin-top:1rem;">
          <label for="import-file">Upload .json or .csv</label>
          <input type="file" id="import-file" class="import-file-input" accept=".json,.csv,text/csv,application/json" />
        </div>
      </div>
      <div class="card">
        <h2>How rows are mapped</h2>
        <ul class="check">
          <li><strong>JSON:</strong> root object with optional <code>suppliers</code> and one of <code>contracts</code>, <code>windows</code>, <code>feedbackWindows</code>, or <code>deliveries</code> (arrays).</li>
          <li><strong>Open window from today:</strong> set <code>"openFromToday": true</code> (or CSV column <code>open_from_today</code> = true) — end date defaults to today + <strong>${FEEDBACK_WINDOW_DAYS}</strong> days.</li>
          <li><strong>Closed history:</strong> <code>status: "closed"</code> + dates + optional <code>finalScore</code> (1–5 scale). App maps that to a weighted total on a <strong>0–100</strong> scale (pillar weights in <code>kpi-framework.js</code>).</li>
          <li><strong>CSV headers</strong> (any similar spelling): supplier_name, supplier_id, category, contract_ref, contract_title, status, start_date, end_date, final_score, open_from_today.</li>
        </ul>
      </div>
    </div>
    <div class="card" style="margin-top:1rem;">
      <h2>Paste JSON or CSV</h2>
      <textarea id="import-paste" class="import-textarea" rows="12" spellcheck="false" placeholder='{ "contracts": [ { "supplierName": "...", "contractRef": "...", "openFromToday": true } ] }'></textarea>
      <div class="list-actions" style="margin-top:0.75rem;">
        <button type="button" class="btn btn--primary" id="btn-run-import">Import into app</button>
        <button type="button" class="btn btn--ghost" id="btn-clear-import">Clear box</button>
      </div>
      <pre id="import-result" class="import-result${lastImportHadErrors ? " import-result--errors" : ""}"${lastImportReportText ? "" : " hidden"}></pre>
    </div>
  `;
}

function detectAndRunImport(text, filename) {
  const t = text.trim();
  if (!t) {
    return { ok: false, errors: ["No content to import."], messages: [], added: 0 };
  }
  const lower = (filename || "").toLowerCase();
  if (lower.endsWith(".csv")) {
    return runCSVContractImport(state, t);
  }
  if (lower.endsWith(".json")) {
    try {
      const p = JSON.parse(t);
      const root = Array.isArray(p) ? { contracts: p } : p;
      return runJSONContractImport(state, root);
    } catch (e) {
      return { ok: false, errors: [`Invalid JSON: ${e.message || String(e)}`], messages: [], added: 0 };
    }
  }
  if (t.startsWith("{") || t.startsWith("[")) {
    try {
      const p = JSON.parse(t);
      const root = Array.isArray(p) ? { contracts: p } : p;
      return runJSONContractImport(state, root);
    } catch (e) {
      return { ok: false, errors: [`Invalid JSON: ${e.message || String(e)}`], messages: [], added: 0 };
    }
  }
  return runCSVContractImport(state, t);
}

function renderMain() {
  destroyDashboardCharts();
  const main = el("main");
  const views = {
    dashboard: viewDashboard,
    windows: viewWindows,
    import: viewImportContracts,
    pulse: viewPulse,
    kpis: viewContractKpis,
    suppliers: viewSuppliers,
  };
  main.innerHTML = views[route]();

  if (route === "dashboard") {
    requestAnimationFrame(() => mountDashboardCharts());
  }

  if (route === "import") {
    const pre = el("import-result");
    if (pre && lastImportReportText) {
      pre.textContent = lastImportReportText;
      pre.hidden = false;
      pre.classList.toggle("import-result--errors", lastImportHadErrors);
    }

    el("btn-dl-template")?.addEventListener("click", () => {
      const blob = new Blob([importTemplateJSON()], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "rmh-scorecard-contract-import-template.json";
      a.click();
      URL.revokeObjectURL(url);
      toast("Template downloaded.");
    });
    el("btn-clear-import")?.addEventListener("click", () => {
      const ta = el("import-paste");
      if (ta) ta.value = "";
      lastImportReportText = "";
      lastImportHadErrors = false;
      const p = el("import-result");
      if (p) {
        p.textContent = "";
        p.hidden = true;
        p.classList.remove("import-result--errors");
      }
    });
    el("btn-run-import")?.addEventListener("click", async () => {
      const ta = el("import-paste");
      const fileInput = el("import-file");
      let text = (ta?.value || "").trim();
      let fname = "";
      if (!text && fileInput?.files?.length) {
        const f = fileInput.files[0];
        fname = f.name;
        try {
          text = await f.text();
        } catch (err) {
          lastImportReportText = formatImportReport({
            ok: false,
            errors: [`Could not read file: ${err.message || String(err)}`],
            messages: [],
          });
          lastImportHadErrors = true;
          refresh();
          return;
        }
      }
      if (!text) {
        toast("Paste JSON/CSV or choose a file.");
        return;
      }
      const guessName = fname || (text.trim().startsWith("{") || text.trim().startsWith("[") ? "paste.json" : "paste.csv");
      const res = detectAndRunImport(text, guessName);
      lastImportReportText = formatImportReport(res);
      lastImportHadErrors = (res.errors && res.errors.length > 0) || !res.ok;

      if (res.ok || res.added > 0) {
        closeExpiredWindows(state);
        persist();
        toast(res.messages[0] || "Import complete.");
      } else {
        toast("Import finished with issues — see report below.");
      }
      refresh();
    });
    el("import-file")?.addEventListener("change", () => {
      lastImportReportText = "";
      lastImportHadErrors = false;
      const p = el("import-result");
      if (p) {
        p.textContent = "";
        p.hidden = true;
        p.classList.remove("import-result--errors");
      }
    });
  }

  if (route === "windows") {
    el("form-new-window")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const supplierId = el("nw-supplier").value;
      const contractRef = el("nw-contract").value.trim();
      const start = todayISO();
      const end = addDays(start, FEEDBACK_WINDOW_DAYS);
      state.windows.push({
        id: uid("win"),
        supplierId,
        contractRef,
        startDate: start,
        endDate: end,
        status: "open",
      });
      persist();
      toast(`${FEEDBACK_WINDOW_DAYS}-day feedback window opened.`);
      el("nw-contract").value = "";
      refresh();
    });
    el("btn-process-due")?.addEventListener("click", () => {
      if (closeExpiredWindows(state)) {
        persist();
        toast("Due windows closed; scores finalised.");
      } else toast("No open windows past end date.");
      refresh();
    });
    el("btn-full-demo")?.addEventListener("click", () => {
      if (!window.confirm("Replace all saved data with the full fictional contract demo?")) return;
      state = fictionalDemoState();
      persist();
      toast("Fictional contracts & history loaded.");
      refresh();
    });
    el("btn-seed")?.addEventListener("click", () => {
      const s = state.suppliers[0];
      const start = addDays(todayISO(), -(FEEDBACK_WINDOW_DAYS + 15));
      const end = addDays(start, FEEDBACK_WINDOW_DAYS);
      const wid = uid("win");
      const win = {
        id: wid,
        supplierId: s.id,
        contractRef: "DEMO-PO-001",
        startDate: start,
        endDate: end,
        status: "closed",
      };
      state.windows.push(win);
      state.pulses.push({
        id: uid("pulse"),
        windowId: wid,
        role: "clinical",
        reportedIssue: true,
        detail: "Mask strap failure (sample exception)",
        score: 3,
        submittedAt: addDays(end, -2),
        kpiAreaId: "user_experience",
        kpiId: "product_service_quality_fit_for_purpose",
        kpiScores: buildPulseKpiScores(true, "user_experience", "product_service_quality_fit_for_purpose", 3),
      });
      const agg = computeWindowAggregate(state, win);
      win.finalScoreTotal = agg.total;
      win.finalScoreMax = agg.max;
      win.finalScore = agg.max ? Math.min(5, Math.max(1, Math.round((agg.total / agg.max) * 5 * 10) / 10)) : 5;
      persist();
      toast(`Sample closed window added (${agg.total}/${agg.max} weighted score).`);
      refresh();
    });
  }

  if (route === "suppliers") {
    el("srm-view-toggle")?.querySelectorAll("button").forEach((b) => {
      b.addEventListener("click", () => {
        const v = b.dataset.view;
        if (v === "contract" || v === "supplier") {
          suppliersPageView = v;
          suppliersDrilldownSupplierId = null;
          suppliersFeedbackOverviewWindowId = null;
          refresh();
        }
      });
    });
    el("srm-feedback-overview-back")?.addEventListener("click", () => {
      suppliersFeedbackOverviewWindowId = null;
      refresh();
    });
    el("srm-back-suppliers")?.addEventListener("click", () => {
      suppliersDrilldownSupplierId = null;
      refresh();
    });
    const supTbody = el("srm-supplier-tbody");
    supTbody?.addEventListener("click", (e) => {
      const tr = e.target.closest("tr[data-supplier-id]");
      if (!tr) return;
      suppliersDrilldownSupplierId = tr.dataset.supplierId;
      refresh();
    });
    supTbody?.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const tr = e.target.closest("tr[data-supplier-id]");
      if (!tr) return;
      e.preventDefault();
      suppliersDrilldownSupplierId = tr.dataset.supplierId;
      refresh();
    });
  }

  if (route === "pulse") {
    const roleVal = el("p-role-value");
    const qEl = el("p-questions");
    const ex = el("p-exception");
    const exFields = el("p-exception-fields");
    const scoreEl = el("p-score");
    const scoreVal = el("p-score-val");

    function setRole(r) {
      roleVal.value = r;
      el("p-role").querySelectorAll("button").forEach((b) => {
        b.classList.toggle("is-on", b.dataset.role === r);
      });
      qEl.innerHTML = r === "clinical" ? clinicalQuestionsHTML() : procurementQuestionsHTML();
    }
    el("p-role")?.querySelectorAll("button").forEach((b) => {
      b.addEventListener("click", () => setRole(b.dataset.role));
    });
    setRole("clinical");

    function fillKpiAreaSelect() {
      const sel = el("p-kpi-area");
      if (!sel) return;
      const fw = getFramework();
      sel.innerHTML =
        `<option value="">Select KPI area…</option>` +
        fw.areas.map((a) => `<option value="${a.id}">${a.label}</option>`).join("");
    }

    function fillKpiSelectForArea(areaId) {
      const sel = el("p-kpi");
      if (!sel) return;
      if (!areaId) {
        sel.innerHTML = `<option value="">Select an area first</option>`;
        sel.disabled = true;
        return;
      }
      const area = getFramework().areas.find((a) => a.id === areaId);
      sel.disabled = !area;
      const wp = area ? Number(area.weightPercent) : NaN;
      const wpSuf = area && Number.isFinite(wp) && wp > 0 ? ` (${wp}%)` : "";
      sel.innerHTML =
        `<option value="">Choose specific KPI…</option>` +
        (area
          ? area.kpis.map((k) => `<option value="${k.id}">${escapeHtml(k.name)}${wpSuf}</option>`).join("")
          : "");
    }

    function syncPulseExceptionSlider() {
      const areaId = el("p-kpi-area")?.value?.trim() || "";
      const W = pillarWeightPercentForAreaId(areaId);
      const sel = el("p-score");
      const sVal = el("p-score-val");
      const label = el("p-score-label");
      if (!sel) return;
      if (!ex?.checked) return;
      if (!W) {
        sel.disabled = true;
        sel.min = "0";
        sel.max = "1";
        sel.value = "0";
        sel.setAttribute("aria-valuemin", "0");
        sel.setAttribute("aria-valuemax", "1");
        if (sVal) sVal.textContent = "—";
        if (label) label.textContent = "Score for this event — choose KPI area first";
        return;
      }
      sel.disabled = false;
      const prevW = Number(sel.dataset.pillarW) || 0;
      const prevV = Number(sel.value);
      sel.min = "0";
      sel.max = String(W);
      sel.step = "1";
      sel.dataset.pillarW = String(W);
      sel.setAttribute("aria-valuemin", "0");
      sel.setAttribute("aria-valuemax", String(W));
      let newV;
      if (prevW > 0 && prevW !== W && Number.isFinite(prevV)) {
        const k = pulsePillarSliderToKpi1to5(Math.min(prevW, Math.max(0, prevV)), prevW);
        newV = kpi1to5ToPillarSlider(k, W);
      } else if (prevW === W && Number.isFinite(prevV) && prevV >= 0) {
        newV = Math.min(W, Math.max(0, prevV));
      } else {
        newV = Math.round(W / 2);
      }
      sel.value = String(Math.min(W, Math.max(0, newV)));
      if (sVal) sVal.textContent = sel.value;
      if (label) label.textContent = `Score for this event (0–${W} · pillar band → KPI 1–5)`;
    }

    fillKpiAreaSelect();
    fillKpiSelectForArea("");
    el("p-kpi-area")?.addEventListener("change", () => {
      fillKpiSelectForArea(el("p-kpi-area").value);
      syncPulseExceptionSlider();
    });

    ex?.addEventListener("change", () => {
      if (exFields) exFields.style.display = ex.checked ? "block" : "none";
      if (ex.checked) syncPulseExceptionSlider();
    });
    scoreEl?.addEventListener("input", () => {
      if (scoreVal) scoreVal.textContent = scoreEl.value;
    });

    el("form-pulse")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const windowId = el("p-window").value;
      if (!windowId) {
        toast("Select a feedback window.");
        return;
      }
      const role = roleVal.value;
      const reported = el("p-exception").checked;
      const detail = (el("p-detail")?.value || "").trim();
      const kpiAreaRaw = el("p-kpi-area")?.value?.trim() || "";
      const kpiRaw = el("p-kpi")?.value?.trim() || "";
      const pillarW = reported ? pillarWeightPercentForAreaId(kpiAreaRaw) : 0;
      const rawSlider = Number(el("p-score")?.value);
      const score = reported ? pulsePillarSliderToKpi1to5(rawSlider, pillarW) : 5;

      if (reported) {
        if (!kpiAreaRaw) {
          toast("Select a KPI area when reporting an exception.");
          return;
        }
        if (!pillarW) {
          toast("KPI area has no pillar weight — check kpi-framework.js.");
          return;
        }
        if (!kpiRaw) {
          toast("Select the specific KPI for this exception.");
          return;
        }
        if (detail.length < 8) {
          toast("Please add a bit more detail for the exception.");
          return;
        }
      }

      const kpiScores = buildPulseKpiScores(reported, kpiAreaRaw, kpiRaw, score);
      const pk = pulseTotalFromMap(kpiScores, getScorecardSpec());
      const maxS = safeScorecardMax(getScorecardSpec());
      state.pulses.push({
        id: uid("pulse"),
        windowId,
        role,
        reportedIssue: reported,
        detail: reported ? detail : "",
        score,
        submittedAt: todayISO(),
        kpiAreaId: reported ? kpiAreaRaw : "",
        kpiId: reported ? kpiRaw : "",
        kpiScores,
      });
      persist();
      const scoreTxt = Math.abs(score - Math.round(score)) < 1e-9 ? String(Math.round(score)) : score.toFixed(2);
      toast(
        reported
          ? `Pulse saved — tagged KPI ~${scoreTxt}/5; weighted pulse score ${pk}/${maxS}.`
          : `Pulse submitted — no issue; weighted score ${pk}/${maxS}.`
      );
      refresh();
    });
  }
}

// Init — delegation for “Staff feedback” on contract rows (stable #main, survives innerHTML swaps)
(function attachSrmFeedbackOverviewDelegation() {
  const main = el("main");
  if (!main || main.dataset.srmFeedbackDelegation) return;
  main.dataset.srmFeedbackDelegation = "1";
  main.addEventListener("click", (e) => {
    const btn = e.target.closest(".srm-feedback-overview-btn");
    if (!btn || route !== "suppliers") return;
    e.stopPropagation();
    const wid = btn.dataset.windowId;
    if (!wid) return;
    suppliersFeedbackOverviewWindowId = wid;
    refresh();
  });
})();

refresh();
