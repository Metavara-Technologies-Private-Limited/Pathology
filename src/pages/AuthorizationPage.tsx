import React, { useCallback, useEffect, useRef, useState } from "react";
import { FiRefreshCw } from "react-icons/fi";
import { toast } from "react-toastify";
import TopSection from "../components/Authorization/TopSection";
import TableSection from "../components/Authorization/TableSection";
import ResultDetails from "../components/Authorization/ResultDetails";
import { AuthorizationItem } from "../types";
import { getAuthorizations } from "../services/authorization.api";
import "../styles/Authorization/AuthorizationPage.css";

const AuthorizationPage: React.FC = () => {
  const requestSeq = useRef(0);
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "rejected">("pending");
  const [search, setSearch] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [approvedCount, setApprovedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [selectedAuthorization, setSelectedAuthorization] = useState<AuthorizationItem | null>(
    null,
  );
  const [data, setData] = useState<AuthorizationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCounts = useCallback(async () => {
    try {
      const [pending, approved, rejected] = await Promise.all([
        getAuthorizations("Pending"),
        getAuthorizations("APPROVED"),
        getAuthorizations("REJECTED"),
      ]);

      setPendingCount(pending.length);
      setApprovedCount(approved.length);
      setRejectedCount(rejected.length);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load authorization counts");
    }
  }, []);

  const fetchAuthorizations = useCallback(async () => {
    const seq = ++requestSeq.current;
    setLoading(true);
    setError(null);

    try {
      const status =
        activeTab === "pending"
          ? "Pending"
          : activeTab === "approved"
            ? "APPROVED"
            : "REJECTED";

      const response = await getAuthorizations(status, search);

      if (requestSeq.current === seq) {
        setData(response);
      }
    } catch (err) {
      if (requestSeq.current === seq) {
        const message = err instanceof Error ? err.message : "Failed to load authorizations";
        setError(message);
        setData([]);
      }
    } finally {
      if (requestSeq.current === seq) {
        setLoading(false);
      }
    }
  }, [activeTab, search]);

  useEffect(() => {
    void loadCounts();
  }, [loadCounts]);

  useEffect(() => {
    void fetchAuthorizations();
  }, [fetchAuthorizations]);

  const renderState = (title: string, message?: string) => (
    <div className="authorization-state">
      <div className="authorization-state-card">
        <div className="authorization-state-title">{title}</div>
        {message && <p className="authorization-state-copy">{message}</p>}
        <button type="button" className="authorization-state-action" onClick={fetchAuthorizations}>
          <FiRefreshCw />
          Reload
        </button>
      </div>
    </div>
  );

  return (
    <div className="container">
      {showResult ? (
        <ResultDetails
          onBack={() => {
            setShowResult(false);
            void loadCounts();
            void fetchAuthorizations();
          }}
          authorization={selectedAuthorization}
        />
      ) : (
        <>
          <TopSection
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            search={search}
            setSearch={setSearch}
            pendingCount={pendingCount}
            approvedCount={approvedCount}
            rejectedCount={rejectedCount}
          />

          {loading && renderState("Loading authorizations", "Please wait while we fetch the latest list.")}

          {!loading && error && renderState("Could not load authorizations", error)}

          {!loading && !error && data.length === 0 && (
            <div className="authorization-state">
              <div className="authorization-state-card">
                <div className="authorization-state-title">No authorizations found</div>
                <p className="authorization-state-copy">
                  Try a different search or switch to another status tab.
                </p>
              </div>
            </div>
          )}

          {!loading && !error && data.length > 0 && (
            <TableSection
              data={data}
              onViewResult={(item) => {
                setSelectedAuthorization(item);
                setShowResult(true);
              }}
            />
          )}
        </>
      )}
    </div>
  );
};

export default AuthorizationPage;
