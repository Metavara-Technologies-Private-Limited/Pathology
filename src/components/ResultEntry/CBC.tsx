import React, { useCallback, useEffect, useRef, useState } from "react";
import "./CBC.css";
// import { Result } from "./types";
import { Result } from "./types";

import Chromosome from "./Chromosome";

import Ellipse_12 from "../../assets/icons/Ellipse_12.svg";
import UndoIconAsset from "../../assets/icons/undo.png";
import {
  getResultEntryDetails,
  saveResultEntryDetails,
  ResultEntryDetails,
} from "../../services/resultEntry.api";
import { FiChevronDown, FiChevronUp, FiPrinter, FiX } from "react-icons/fi";

interface Props {
  onBack: () => void;
  data: Result;
  initialMode?: "edit" | "view";
}

interface SidebarItem {
  label: string;
  checked: boolean;
}

interface TemplateItem {
  id: string;
  label: string;
  checked: boolean;
}

const previousResults: Record<
  string,
  { date: string; param: string; value: string }[]
> = {
  "Heamoglobin (hb)": [
    { date: "04/02/2026", param: "Heamoglobin (hb)", value: "13.2 g/dL" },
    { date: "26/10/2025", param: "Heamoglobin (hb)", value: "12.8 g/dL" },
    { date: "29/12/2024", param: "Heamoglobin (hb)", value: "13.0 g/dL" },
  ],
  RDW: [
    { date: "04/02/2026", param: "RDW", value: "12.5 %" },
    { date: "26/10/2025", param: "RDW", value: "13.1 %" },
    { date: "29/12/2024", param: "RDW", value: "12.9 %" },
  ],
  MCHC: [
    { date: "04/02/2026", param: "MCHC", value: "31 g/dL" },
    { date: "26/10/2025", param: "MCHC", value: "33 g/dL" },
    { date: "29/12/2024", param: "MCHC", value: "32 g/dL" },
  ],
};

const CBC: React.FC<Props> = ({ onBack, data, initialMode = "edit" }) => {
  const [isEdit, setIsEdit] = useState(initialMode === "edit");
  const [activeTab, setActiveTab] = useState("");
  const [modalParam, setModalParam] = useState<string | null>(null);
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [details, setDetails] = useState<ResultEntryDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const detailsRequestSeq = useRef(0);
  const [tableData, setTableData] = useState<any[]>([]);
  const [suggestionNote, setSuggestionNote] = useState("");
  const [footNote, setFootNote] = useState("");
  const [referredBy, setReferredBy] = useState("");
  const [pathologist, setPathologist] = useState("");
  const parameters: SidebarItem[] = [
    {
      label: "Select All",
      checked: true,
    },
    ...(details?.parameters?.map((parameter) => ({
      label: parameter.parameter_name,
      checked: true,
    })) ?? []),
  ];

  React.useEffect(() => {
    setIsEdit(initialMode === "edit");
  }, [initialMode]);

  const loadDetails = useCallback(async () => {
    if (!data?.id) return;

    const seq = ++detailsRequestSeq.current;
    setLoadingDetails(true);
    setDetailsError(null);

    try {
      const response = await getResultEntryDetails(data.id);
      if (detailsRequestSeq.current === seq) {
        setDetails(response);
      }
    } catch (error) {
      if (detailsRequestSeq.current === seq) {
        setDetailsError(
          error instanceof Error ? error.message : "Failed to load result details",
        );
        setDetails(null);
      }
    } finally {
      if (detailsRequestSeq.current === seq) {
        setLoadingDetails(false);
      }
    }
  }, [data.id]);

  useEffect(() => {
    void loadDetails();
  }, [loadDetails]);

  useEffect(() => {
    if (!details) return;

    const savedRows = new Map(
      (details.saved_result?.parameter_results ?? []).map((row) => [
        row.parameter_code ?? row.parameter_name ?? "",
        row,
      ]),
    );

    setTableData(
      (details.parameters ?? []).map((parameter) => {
        const saved =
          savedRows.get(parameter.parameter_code) ?? savedRows.get(parameter.parameter_name);

        return {
          parameter_id: parameter.id,
          parameter_code: parameter.parameter_code,
          param: parameter.parameter_name,
          category: details.patient.gender,
          type: "Manual",
          operator: saved?.operator ?? "=",
          value: saved?.value ?? "",
          ref: `${parameter.min_ref ?? "-"} - ${parameter.max_ref ?? "-"} ${parameter.unit}`,
          auth: `${parameter.min_authz ?? "-"} - ${parameter.max_authz ?? "-"}`,
          varying: [
            {
              label: details.patient.gender,
              val: parameter.varying_reference_range ?? "-",
            },
          ],
          status: saved?.status ?? [],
          warn: Boolean(saved?.warn),
        };
      }),
    );

    setTemplates(
      (details.templates ?? []).map((template) => ({
        id: template.id,
        label: template.template_name,
        checked: (details.saved_result?.selected_templates ?? []).includes(template.id),
      })),
    );

    setSuggestionNote(
      details.saved_result?.suggestion_note ?? details.test?.suggestion_note ?? "",
    );
    setFootNote(details.saved_result?.foot_note ?? details.test?.disclaimer ?? "");
    setReferredBy(details.saved_result?.referred_by ?? "");
    setPathologist(details.saved_result?.pathologist ?? "");
  }, [details]);

  // const testTabs = [
  //   "HIV (Rapid Card)",
  //   "HCV (Rapid Card)",
  //   "(CBC) Complete Blood Count",
  //   "Y Chromosome Microdeletion",
  // ];
  const testTabs = [details?.test?.test_name ?? "Loading..."];

  // const toggleParameter = (index: number) => {
  //   setParameters((prev) => {
  //     // First row controls all test checkboxes.
  //     if (index === 0) {
  //       const nextChecked = !prev[0].checked;
  //       return prev.map((item) => ({ ...item, checked: nextChecked }));
  //     }

  //     const next = prev.map((item, i) =>
  //       i === index ? { ...item, checked: !item.checked } : item,
  //     );
  //     const allChecked = next.slice(1).every((item) => item.checked);
  //     next[0] = { ...next[0], checked: allChecked };
  //     return next;
  //   });
  // };

  const toggleTemplate = (index: number) => {
    setTemplates((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, checked: !item.checked } : item,
      ),
    );
  };

  const handleSave = async () => {
    if (!details?.result_entry?.id) return;

    setSaving(true);
    try {
      await saveResultEntryDetails(details.result_entry.id, {
        parameter_results: tableData.map((row) => ({
          parameter_id: row.parameter_id,
          parameter_name: row.param,
          parameter_code: row.parameter_code,
          operator: row.operator ?? "=",
          value: row.value ?? "",
          status: row.status ?? [],
          warn: Boolean(row.warn),
        })),
        suggestion_note: suggestionNote,
        foot_note: footNote,
        referred_by: referredBy,
        pathologist,
        selected_templates: templates.filter((template) => template.checked).map((template) => template.id),
        result_status: "Completed",
      });
      setIsEdit(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to save result details");
    } finally {
      setSaving(false);
    }
  };

  const updateRow = (
    index: number,
    field: "operator" | "value",
    val: string,
  ) => {
    setTableData((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: val } : row)),
    );
  };

  const statusClass = (s: string) => {
    switch (s.toLowerCase()) {
      case "normal":
        return "status normal";
      case "abnormal":
        return "status abnormal";
      case "panic":
        return "status panic";
      case "improbable":
        return "status improbable";
      case "reflex":
        return "status reflex";
      default:
        return "status";
    }
  };

  const loadShell = (message: string, detail?: string) => (
    <div className={isEdit ? "cbc-edit-wrapper" : "cbc-view-wrapper"}>
      <div className="cbc-header">
        <button className="back-btn" onClick={onBack}>
          <img src={UndoIconAsset} alt="Back" className="back-btn-icon" />
        </button>
        <h2>{isEdit ? "Add Result Details" : "View Result Details"}</h2>
      </div>

      <div className="cbc-state-card">
        <div className="cbc-state-title">{message}</div>
        {detail && <p className="cbc-state-copy">{detail}</p>}
        <button className="state-retry-btn" onClick={loadDetails}>
          Reload
        </button>
      </div>
    </div>
  );

  const PreviousModal = () => {
    const modalData = modalParam ? (previousResults[modalParam] ?? []) : [];
    return (
      <div className="modal-overlay" onClick={() => setModalParam(null)}>
        <div className="modal-box" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>Previous Result</h3>
            <button className="modal-close" onClick={() => setModalParam(null)}>
              <FiX />
            </button>
          </div>
          <div className="modal-divider" />
          <table className="modal-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Parameter Name</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {modalData.map((row, i) => (
                <tr key={i}>
                  <td>{row.date}</td>
                  <td>{row.param}</td>
                  <td>{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  if (loadingDetails && !details) {
    return loadShell(
      "Loading result details",
      "We are fetching the patient and test configuration for this entry.",
    );
  }

  if (detailsError && !details) {
    return loadShell(
      "Could not load result details",
      detailsError,
    );
  }

  const renderRows = (editable: boolean) =>
    tableData.map((row, i) => (
      <tr key={i}>
        <td>{row.param}</td>
        <td>{row.category}</td>
        <td>{row.type}</td>
        <td>
          {editable ? (
            <div className="select-wrap">
              <select
                value={row.operator}
                onChange={(e) => updateRow(i, "operator", e.target.value)}
              >
                <option value="Select">Select</option>
                <option value="=">=</option>
                <option value="+">+</option>
                <option value="-">-</option>
              </select>
            </div>
          ) : (
            row.operator
          )}
        </td>
        <td>
          {editable ? (
            <div className="spinner-wrap">
              <input
                type="number"
                value={row.value}
                onChange={(e) => updateRow(i, "value", e.target.value)}
              />
              <div className="spinner-arrows">
                <button
                  type="button"
                  onClick={() =>
                    updateRow(
                      i,
                      "value",
                      String((parseFloat(row.value) + 0.1).toFixed(1)),
                    )
                  }
                  aria-label="Increase result value"
                >
                  <FiChevronUp />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updateRow(
                      i,
                      "value",
                      String((parseFloat(row.value) - 0.1).toFixed(1)),
                    )
                  }
                  aria-label="Decrease result value"
                >
                  <FiChevronDown />
                </button>
              </div>
            </div>
          ) : (
            row.value
          )}
        </td>
        <td>{row.ref}</td>
        <td>{row.auth}</td>
        <td className="varying-cell">
          {row.varying.map((v: { label: string; val: string }, vi: number) => (
            <div key={vi} className="varying-row">
              <span className="varying-label">{v.label}</span>
              <span className="varying-val">{v.val}</span>
            </div>
          ))}
        </td>
        <td>
          <div className="status-wrap">
            {row.status.map((s: string, si: number) => (
              <span key={si} className={statusClass(s)}>
                {s}
              </span>
            ))}
          </div>
        </td>
        <td>
          {row.warn ? (
            <button
              className="warn-icon-btn"
              onClick={() => setModalParam(row.param)}
              title="View previous results"
            >
              !
            </button>
          ) : (
            <span className="no-warn">-</span>
          )}
        </td>
      </tr>
    ));
  if (activeTab === "Y Chromosome Microdeletion") {
    return (
      <Chromosome
        onBack={() => setActiveTab("")}
        data={data}
        initialMode={isEdit ? "edit" : "view"}
        startInEditor
      />
    );
  }

  if (isEdit) {
    return (
      <div className="cbc-edit-wrapper">
        {modalParam && <PreviousModal />}

        <div className="cbc-header">
          <button className="back-btn" onClick={onBack}>
            <img src={UndoIconAsset} alt="Back" className="back-btn-icon" />
          </button>
          <h2>Add Result Details</h2>
        </div>

        <div className="cbc-patient-card">
          <img src={Ellipse_12} alt="profile" />

          <div className="cbc-patient-info">
            <div className="pi-field">
              <span>Patient Name</span>
              <strong>{data.patient}</strong>
            </div>
            <div className="pi-field">
              <span>Age</span>
              <strong>{details?.patient.age} Years</strong>
            </div>
            <div className="pi-field">
              <span>Sex Assigned At Birth</span>
              <strong>{details?.patient.gender}</strong>
            </div>
            <div className="pi-field">
              <span>MRN</span>
              <strong>{details?.patient.patient_code}</strong>
            </div>
            <div className="pi-field">
              <span>Allergy</span>
              <strong>No</strong>
            </div>
            <div className="pi-field">
              <span>SART ID</span>
              <strong>14SKG9876432</strong>
            </div>
            <div className="pi-field">
              <span>Last Modified</span>
              <strong>{data.date}</strong>
            </div>
          </div>
        </div>

        <div className="cbc-body">
          <div className="cbc-sidebar">
            <div className="sidebar-section-title">PARAMETER</div>
            {parameters.length > 0 ? (
              parameters.map((p, i) => (
                <label
                  key={i}
                  className="sidebar-item"
                  onClick={() => {}}
                  style={{ cursor: "pointer" }}
                >
                  <span className={`sidebar-check ${p.checked ? "checked" : ""}`}>
                    {p.checked && <span>✓</span>}
                  </span>
                  {p.label}
                </label>
              ))
            ) : (
              <div className="sidebar-empty">No parameters configured for this test.</div>
            )}
            <div className="sidebar-section-title" style={{ marginTop: 20 }}>
              TEMPLATE
            </div>
            {templates.length > 0 ? (
              templates.map((t, i) => (
                <label
                  key={i}
                  className="sidebar-item"
                  onClick={() => toggleTemplate(i)}
                  style={{ cursor: "pointer" }}
                >
                  <span className={`sidebar-check ${t.checked ? "checked" : ""}`}>
                    {t.checked && <span>✓</span>}
                  </span>
                  {t.label}
                </label>
              ))
            ) : (
              <div className="sidebar-empty">No templates configured for this test.</div>
            )}
            <button className="get-test-btn">Get Test</button>
          </div>

          <div className="cbc-main">
            <div className="cbc-tabs">
              {testTabs.map((tab, i) => (
                <button
                  key={i}
                  className={`cbc-tab ${tab === details?.test?.test_name ? "active" : ""}`}
                  onClick={() => {
                    if (tab === "Y Chromosome Microdeletion") {
                      setActiveTab(tab);
                    }
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="cbc-table-wrap">
              <table className="cbc-table">
                <thead>
                  <tr>
                    <th>Parameter</th>
                    <th>Category</th>
                    <th>Machine/Manual</th>
                    <th>Operator</th>
                    <th>Result Value</th>
                    <th>Reference Range</th>
                    <th>AuthZ Range</th>
                    <th>Varying Ref. Range</th>
                    <th>Result Status</th>
                    <th>Previous</th>
                  </tr>
                </thead>
                <tbody>{renderRows(true)}</tbody>
              </table>
            </div>

            <div className="cbc-notes-row">
              <div className="cbc-note-field">
                <label>Suggestion Note</label>
                <textarea
                  value={suggestionNote}
                  onChange={(e) => setSuggestionNote(e.target.value)}
                />
              </div>
              <div className="cbc-note-field">
                <label>Foot Note</label>
                <textarea
                  value={footNote}
                  onChange={(e) => setFootNote(e.target.value)}
                />
              </div>
            </div>

            <div className="cbc-bottom-row">
              <div className="cbc-input-field">
                <label>Referred By</label>
                <input
                  type="text"
                  value={referredBy}
                  onChange={(e) => setReferredBy(e.target.value)}
                />
              </div>
              <div className="cbc-input-field">
                <label>Pathologist</label>
                <div className="select-wrap">
                  <select value={pathologist} onChange={(e) => setPathologist(e.target.value)}>
                    <option value="">Select pathologist</option>
                    <option value="John Wick">John Wick</option>
                    <option value="Dr. Smith">Dr. Smith</option>
                  </select>
                </div>
              </div>
              <div className="cbc-action-btns">
                <button className="cancel-btn" onClick={() => setIsEdit(false)}>
                  Cancel
                </button>
                <button className="save-btn" onClick={() => void handleSave()} disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cbc-view-wrapper">
      {modalParam && <PreviousModal />}

      <div className="cbc-header">
        <button className="back-btn" onClick={onBack}>
          <img src={UndoIconAsset} alt="Back" className="back-btn-icon" />
        </button>
        <h2>View Result Details</h2>
        <button className="print-btn" style={{ marginLeft: "auto" }}>
          <FiPrinter />
        </button>
      </div>

      <div className="cbc-patient-card">
        <img src={Ellipse_12} alt="profile" />
        <div className="cbc-patient-info">
          <div className="pi-field">
            <span>Patient Name</span>
            <strong>{data.patient}</strong>
          </div>
          <div className="pi-field">
            <span>Age</span>
            <strong>{details?.patient.age} Years</strong>
          </div>
          <div className="pi-field">
            <span>Sex Assigned At Birth</span>
            <strong>{details?.patient.gender}</strong>
          </div>
          <div className="pi-field">
            <span>MRN</span>
            <strong>{details?.patient.patient_code}</strong>
          </div>
          <div className="pi-field">
            <span>Allergy</span>
            <strong>No</strong>
          </div>
          <div className="pi-field">
            <span>SART ID</span>
            <strong>14SKG9876432</strong>
          </div>
          <div className="pi-field">
            <span>Last Modified</span>
            <strong>{data.date}</strong>
          </div>
          <div className="pi-field">
            <span>Referred By</span>
            <strong>{referredBy || "—"}</strong>
          </div>
          <div className="pi-field">
            <span>Pathologist</span>
            <strong>{pathologist || "—"}</strong>
          </div>
        </div>
      </div>

      <div className="cbc-tabs">
        {testTabs.map((tab, i) => (
          <button
            key={i}
            className={`cbc-tab ${tab === details?.test?.test_name ? "active" : ""}`}
            onClick={() => {
              if (tab === "Y Chromosome Microdeletion") {
                setActiveTab(tab);
              }
            }}
          >
            {tab}
          </button>
        ))}
        <button className="print-btn tab-print" type="button">
          <FiPrinter />
        </button>
      </div>

      <div className="cbc-table-wrap">
        <table className="cbc-table">
          <thead>
            <tr>
              <th>Parameter</th>
              <th>Category</th>
              <th>Machine/Manual</th>
              <th>Operator</th>
              <th>Result Value</th>
              <th>Reference Range</th>
              <th>AuthZ Range</th>
              <th>Varying Ref. Range</th>
              <th>Result Status</th>
              <th>Previous</th>
            </tr>
          </thead>
          <tbody>{renderRows(false)}</tbody>
        </table>
      </div>

      <div className="cbc-footer-notes">
        <div>
          <span className="note-label">Suggestion Note :</span>
          <p>{suggestionNote || "—"}</p>
        </div>
        <div>
          <span className="note-label">Foot Note :</span>
          <p>{footNote || "—"}</p>
        </div>
      </div>

      <div className="view-edit-row">
        <button className="save-btn" onClick={() => setIsEdit(true)}>
          Edit
        </button>
      </div>
    </div>
  );
};

export default CBC;

