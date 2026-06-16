import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { FiRefreshCw } from "react-icons/fi";
import "../../styles/Authorization/ResultDetails.css";
import backIcon from "../Authorization/Icons/back-icon.png";
import { AuthorizationItem } from "../../types";
import {
  approveAuthorization,
  rejectAuthorization,
} from "../../services/authorization.api";
import {
  getResultEntryDetails,
  type ResultEntryDetails,
} from "../../services/resultEntry.api";

type Props = {
  onBack: () => void;
  authorization?: AuthorizationItem | null;
};

type ParameterRow = {
  parameterId: string;
  parameter: string;
  category: string;
  machine: string;
  operator: string;
  resultValue: string;
  referenceRange: string;
  authRange: string;
  varyingRefRange: string;
  status: string;
};

const ResultDetails: React.FC<Props> = ({ onBack, authorization }) => {
  const requestSeq = useRef(0);
  const [submitting, setSubmitting] = useState(false);
  const [showApprovePopup, setShowApprovePopup] = useState(false);
  const [details, setDetails] = useState<ResultEntryDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  const tests = useMemo(
    () =>
      authorization?.test_name
        ? authorization.test_name
            .split(",")
            .map((test) => test.trim())
            .filter(Boolean)
        : [],
    [authorization?.test_name],
  );

  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>("");

  const loadDetails = useCallback(async () => {
    if (!authorization?.result_entry) {
      setDetailsError("Result entry link is missing for this authorization.");
      setDetails(null);
      setLoadingDetails(false);
      return;
    }

    const seq = ++requestSeq.current;
    setLoadingDetails(true);
    setDetailsError(null);

    try {
      const response = await getResultEntryDetails(authorization.result_entry);
      if (requestSeq.current === seq) {
        setDetails(response);
      }
    } catch (error) {
      if (requestSeq.current === seq) {
        setDetailsError(
          error instanceof Error ? error.message : "Failed to load authorization details",
        );
        setDetails(null);
      }
    } finally {
      if (requestSeq.current === seq) {
        setLoadingDetails(false);
      }
    }
  }, [authorization?.result_entry]);

  useEffect(() => {
    void loadDetails();
  }, [loadDetails]);

  useEffect(() => {
    setSelectedTests(tests);
    setActiveTab(tests[0] ?? "");
  }, [tests]);

  const parameterRows = useMemo<ParameterRow[]>(() => {
    const savedRows = new Map(
      (details?.saved_result?.parameter_results ?? []).map((row) => [
        row.parameter_code ?? row.parameter_name ?? "",
        row,
      ]),
    );

    return (details?.parameters ?? []).map((parameter) => {
      const saved =
        savedRows.get(parameter.parameter_code) ?? savedRows.get(parameter.parameter_name);

      return {
        parameterId: parameter.id,
        parameter: parameter.parameter_name,
        category: details?.patient.gender ?? "-",
        machine: "Manual",
        operator: saved?.operator ?? "=",
        resultValue: saved?.value ?? "-",
        referenceRange: `${parameter.min_ref ?? "-"} - ${parameter.max_ref ?? "-"} ${parameter.unit}`,
        authRange: `${parameter.min_authz ?? "-"} - ${parameter.max_authz ?? "-"}`,
        varyingRefRange: parameter.varying_reference_range ?? "-",
        status: saved?.status?.join(", ") ?? "-",
      };
    });
  }, [details]);

  const handleApprove = async () => {
    if (!authorization || submitting) return;

    try {
      setSubmitting(true);
      await approveAuthorization(Number(authorization.id));
      toast.success("Approved Successfully");
      onBack();
    } catch (err) {
      console.error(err);
      toast.error("Failed to approve. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!authorization || submitting) return;

    try {
      setSubmitting(true);
      await rejectAuthorization(Number(authorization.id));
      toast.success("Rejected Successfully");
      onBack();
    } catch (err) {
      console.error(err);
      toast.error("Failed to reject. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const detailState = (title: string, message?: string) => (
    <div className="authorization-detail-state">
      <div className="authorization-detail-state-card">
        <div className="authorization-detail-state-title">{title}</div>
        {message && <p className="authorization-detail-state-copy">{message}</p>}
        <button type="button" className="authorization-state-action" onClick={loadDetails}>
          <FiRefreshCw />
          Reload
        </button>
      </div>
    </div>
  );

  if (loadingDetails && !details) {
    return (
      <div className="result-container">
        <div className="result-header">
          <button type="button" className="back-btn" onClick={onBack}>
            <img src={backIcon} alt="back" className="back-icon" />
          </button>
          <h2>View Result Details</h2>
        </div>
        {detailState(
          "Loading result details",
          "We are fetching the patient and parameter configuration for this authorization.",
        )}
      </div>
    );
  }

  if (detailsError && !details) {
    return (
      <div className="result-container">
        <div className="result-header">
          <button type="button" className="back-btn" onClick={onBack}>
            <img src={backIcon} alt="back" className="back-icon" />
          </button>
          <h2>View Result Details</h2>
        </div>
        {detailState("Could not load result details", detailsError)}
      </div>
    );
  }

  return (
    <div className="result-container">
      <div className="result-header">
        <button type="button" className="back-btn" onClick={onBack}>
          <img src={backIcon} alt="back" className="back-icon" />
        </button>
        <h2>View Result Details</h2>
      </div>

      <div className="patient-card">
        <div className="patient-grid">
          <div>
            <label>Patient Name</label>
            <p>{authorization?.patient_name ?? "-"}</p>
          </div>
          <div>
            <label>Age</label>
            <p>{authorization?.patient_age ? `${authorization.patient_age} Years` : "-"}</p>
          </div>
          <div>
            <label>Sex Assigned At Birth</label>
            <p>{authorization?.patient_gender ?? "-"}</p>
          </div>
          <div>
            <label>MRN</label>
            <p>{authorization?.patient_code ?? "-"}</p>
          </div>
          <div>
            <label>Bill No</label>
            <p>{authorization?.bill_no ?? "-"}</p>
          </div>
          <div>
            <label>Order Date</label>
            <p>{authorization?.order_date ?? "-"}</p>
          </div>
          <div>
            <label>Order Time</label>
            <p>{authorization?.order_time ?? "-"}</p>
          </div>
          <div>
            <label>Referred By</label>
            <p>{authorization?.doctor_name ?? "-"}</p>
          </div>
          <div>
            <label>Authorization Status</label>
            <p>{authorization?.authorization_status ?? "-"}</p>
          </div>
        </div>
      </div>

      <div className="result-content">
        <div className="test-sidebar">
          {tests.length > 0 ? (
            <>
              <div
                className="test-item"
                onClick={() => {
                  if (selectedTests.length === tests.length) {
                    setSelectedTests([]);
                  } else {
                    setSelectedTests(tests);
                  }
                }}
              >
                <div className="checkbox">{selectedTests.length === tests.length && "✓"}</div>
                Select All
              </div>

              {tests.map((test) => {
                const isSelected = selectedTests.includes(test);
                return (
                  <div
                    key={test}
                    className={`test-item ${isSelected ? "active" : ""}`}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedTests(selectedTests.filter((item) => item !== test));
                      } else {
                        setSelectedTests([...selectedTests, test]);
                      }
                    }}
                  >
                    <div className="checkbox">{isSelected && "✓"}</div>
                    {test}
                  </div>
                );
              })}
            </>
          ) : (
            <p className="empty-state">No tests available</p>
          )}
        </div>

        <div className="table-section">
          {tests.length > 0 && (
            <div className="result-tabs">
              {tests.map((test) => (
                <button
                  key={test}
                  type="button"
                  className={activeTab === test ? "active" : ""}
                  onClick={() => setActiveTab(test)}
                >
                  {test}
                </button>
              ))}
            </div>
          )}

          <div className="table-scroll">
            <div className="result-table">
              <table>
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
                  </tr>
                </thead>

                <tbody>
                  {parameterRows.length > 0 ? (
                    parameterRows.map((row) => (
                      <tr key={row.parameterId}>
                        <td>{row.parameter}</td>
                        <td>{row.category}</td>
                        <td>{row.machine}</td>
                        <td>{row.operator}</td>
                        <td>{row.resultValue}</td>
                        <td>{row.referenceRange}</td>
                        <td>{row.authRange}</td>
                        <td>{row.varyingRefRange}</td>
                        <td>
                          {row.status !== "-" ? (
                            <span className="badge normal">{row.status}</span>
                          ) : (
                            "-"
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="empty-state">
                        No parameter data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bottom-section">
            <div className="note-section">
              <label>Suggestion Note :</label>
              <p>{details?.saved_result?.suggestion_note ?? details?.test?.suggestion_note ?? "-"}</p>
            </div>

            <div className="note-section">
              <label>Foot Note :</label>
              <p>{details?.saved_result?.foot_note ?? details?.test?.disclaimer ?? "-"}</p>
            </div>

            {authorization?.authorization_status?.toUpperCase() !== "PENDING" && (
              <div className="status-section">
                <label>Authorization Status :</label>
                <span
                  className={
                    authorization?.authorization_status?.toUpperCase() === "APPROVED"
                      ? "authorized-badge"
                      : "rejected-badge"
                  }
                >
                  {authorization?.authorization_status?.toUpperCase() === "APPROVED"
                    ? "Approved"
                    : "Rejected"}
                </span>
              </div>
            )}
          </div>

          {authorization?.authorization_status?.toUpperCase() === "PENDING" && (
            <div className="authorize-btn-wrap">
              <button
                type="button"
                className="authorize-btn"
                onClick={() => setShowApprovePopup(true)}
                disabled={submitting}
              >
                Authorize
              </button>

              <button
                type="button"
                className="reject-btn"
                onClick={handleReject}
                disabled={submitting}
              >
                Reject
              </button>
            </div>
          )}
        </div>
      </div>

      {showApprovePopup && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <h2>Authorize Result</h2>
            <p>
              Are you sure you want to Authorize
              <br />
              "{activeTab}" Result?
            </p>

            <div className="modal-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setShowApprovePopup(false)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="yes-btn"
                onClick={async () => {
                  setShowApprovePopup(false);
                  await handleApprove();
                }}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultDetails;
