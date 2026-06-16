import { useCallback, useEffect, useRef, useState } from "react";
import "./ResultEntry.css";
import {
  FiChevronLeft,
  FiChevronRight,
  FiInfo,
  FiRefreshCw,
  FiSearch,
} from "react-icons/fi";
import { HiOutlineFilter } from "react-icons/hi";
import { FaRegFileAlt } from "react-icons/fa";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

import CBC from "./CBC";
import { Result } from "./types";
import {
  createResultEntry,
  getPendingSamples,
  getResultEntries,
  toResult,
  type PendingSample,
  type ResultEntryRecord,
} from "../../services/resultEntry.api";

const ITEMS_PER_PAGE = 10;

const ResultEntry = () => {
  const requestSeq = useRef(0);

  const [results, setResults] = useState<ResultEntryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [pendingSamples, setPendingSamples] = useState<PendingSample[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedPendingId, setSelectedPendingId] = useState<number | "">("");

  const [selectedResult, setSelectedResult] = useState<Result | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [filterOpen, setFilterOpen] = useState(false);
  const [tempStatusFilter, setTempStatusFilter] = useState(statusFilter);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchResults = useCallback(async () => {
    const seq = ++requestSeq.current;
    setLoading(true);
    setError(null);

    try {
      const data = await getResultEntries();
      if (requestSeq.current === seq) {
        setResults(data);
      }
    } catch (err) {
      if (requestSeq.current === seq) {
        setError(err instanceof Error ? err.message : "Failed to load result entries");
        setResults([]);
      }
    } finally {
      if (requestSeq.current === seq) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void fetchResults();
  }, [fetchResults]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const openCreateDialog = async () => {
    try {
      const data = await getPendingSamples();
      setPendingSamples(data);
      setSelectedPendingId("");
      setShowCreateDialog(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not load pending samples");
    }
  };

  const handleCreateEntry = async () => {
    if (selectedPendingId === "") return;

    setCreating(true);
    try {
      const selected = pendingSamples.find((sample) => sample.id === selectedPendingId);
      await createResultEntry(selectedPendingId, selected?.test_name ?? "N/A");
      setShowCreateDialog(false);
      await fetchResults();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create result entry");
    } finally {
      setCreating(false);
    }
  };

  const displayRows: Result[] = results.map(toResult);
  const totalPending = displayRows.filter((item) => item.status === "Pending").length;
  const totalCompleted = displayRows.filter((item) => item.status === "Completed").length;
  const filteredData = displayRows.filter((item) => {
    const searchText = search.toLowerCase();
    const matchesSearch = Object.values(item).join(" ").toLowerCase().includes(searchText);
    const matchesStatus = statusFilter === "All" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filteredData.length / ITEMS_PER_PAGE));
  const clampedPage = Math.min(currentPage, totalPages);
  const paginatedData = filteredData.slice(
    (clampedPage - 1) * ITEMS_PER_PAGE,
    clampedPage * ITEMS_PER_PAGE,
  );
  const startEntry = filteredData.length === 0 ? 0 : (clampedPage - 1) * ITEMS_PER_PAGE + 1;
  const endEntry = Math.min(clampedPage * ITEMS_PER_PAGE, filteredData.length);

  useEffect(() => {
    if (currentPage !== clampedPage) {
      setCurrentPage(clampedPage);
    }
  }, [clampedPage, currentPage]);

  if (selectedResult) {
    return (
      <CBC
        onBack={() => {
          setSelectedResult(null);
          void fetchResults();
        }}
        data={selectedResult}
        initialMode={selectedResult.status === "Pending" ? "edit" : "view"}
      />
    );
  }

  return (
    <div className="result-page">
      <div className="result-container">
        <div className="result-header">
          <div>
            <h3>Result Entry List ({filteredData.length})</h3>
            <p className="result-subtitle">Track pending and completed pathology results.</p>
          </div>

          <div className="actions">
            <div className="search-box">
              <FiSearch />
              <input
                placeholder="Search by Patient name, MRN No."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button
              className="filter-btn"
              onClick={() => {
                setTempStatusFilter(statusFilter);
                setFilterOpen(true);
              }}
            >
              <HiOutlineFilter />
            </button>

            <button
              className="filter-btn"
              title="Create new result entry"
              onClick={openCreateDialog}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                <line x1="12" y1="8" x2="12" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        <div className="result-panel">
          <div className="result-panel-top">
            <div className="result-tabs">
              <button
                type="button"
                className={`result-tab ${statusFilter === "All" ? "active" : ""}`}
                onClick={() => {
                  setStatusFilter("All");
                  setTempStatusFilter("All");
                }}
              >
                All Entries ({filteredData.length})
              </button>
              <button
                type="button"
                className={`result-tab ${statusFilter === "Pending" ? "active" : ""}`}
                onClick={() => {
                  setStatusFilter("Pending");
                  setTempStatusFilter("Pending");
                }}
              >
                Pending ({totalPending})
              </button>
              <button
                type="button"
                className={`result-tab ${statusFilter === "Completed" ? "active" : ""}`}
                onClick={() => {
                  setStatusFilter("Completed");
                  setTempStatusFilter("Completed");
                }}
              >
                Completed ({totalCompleted})
              </button>
            </div>
            <button type="button" className="panel-reload" onClick={fetchResults}>
              <FiRefreshCw />
              Reload
            </button>
          </div>

          <div className="result-table-shell">
            <div className="result-table-head">
              <span>Order Date | Time</span>
              <span>Patient</span>
              <span>Patient Type</span>
              <span>Doctor Name</span>
              <span>Bill Details</span>
              <span>No. of Orders</span>
              <span>Result Entry Status</span>
              <span>Result</span>
            </div>

            <div className="result-table-scroll">
              {loading && (
                <div className="result-state">
                  <div className="result-state-title">Loading result entries</div>
                  <div className="result-state-copy">Please wait while we fetch the latest records.</div>
                </div>
              )}

              {!loading && error && (
                <div className="result-state result-state-error">
                  <div className="result-state-title">We could not load the table.</div>
                  <div className="result-state-copy">{error}</div>
                  <button type="button" className="state-action" onClick={fetchResults}>
                    <FiRefreshCw />
                    Reload
                  </button>
                </div>
              )}

              {!loading && !error && paginatedData.length === 0 && (
                <div className="result-state">
                  <div className="result-state-title">No results found</div>
                  <div className="result-state-copy">
                    Try a different search or status filter.
                  </div>
                </div>
              )}

              {!loading &&
                !error &&
                paginatedData.map((item) => {
                  return (
                    <div className="result-table-row" key={item.id}>
                      <div>
                        <p>{item.date}</p>
                        <small>{item.time}</small>
                      </div>

                      <div>
                        <p>{item.patient}</p>
                        <small>{item.details}</small>
                      </div>

                      <span>{item.type}</span>
                      <span>{item.doctor}</span>
                      <span className="bill-cell">
                        <FiInfo className="bill-icon" />
                        {item.bill}
                      </span>
                      <span>{item.orders}</span>

                      <span
                        className={`status-pill ${
                          item.status === "Pending" ? "pending" : "complete"
                        }`}
                      >
                        {item.status === "Completed" ? "Complete" : item.status}
                      </span>

                      <span
                        className="result-action"
                        style={{ cursor: "pointer" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedResult(item);
                        }}
                      >
                        {item.status === "Pending" ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <circle cx="12" cy="12" r="10" stroke="#1976d2" strokeWidth="2" fill="none" />
                            <line x1="12" y1="8" x2="12" y2="16" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" />
                            <line x1="8" y1="12" x2="16" y2="12" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                        ) : (
                          <FaRegFileAlt />
                        )}
                      </span>

                    </div>
                  );
                })}
            </div>
          </div>

          {!loading && !error && (
            <div className="result-footer">
              <span>
                Showing {startEntry} to {endEntry} of {filteredData.length} entries
              </span>

              <div className="pagination">
                <button
                  type="button"
                  className="page-nav"
                  aria-label="Previous page"
                  disabled={clampedPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                >
                  <FiChevronLeft />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNo) => (
                  <button
                    type="button"
                    key={pageNo}
                    onClick={() => setCurrentPage(pageNo)}
                    className={clampedPage === pageNo ? "active" : ""}
                  >
                    {pageNo}
                  </button>
                ))}

                <button
                  type="button"
                  className="page-nav"
                  aria-label="Next page"
                  disabled={clampedPage === totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                >
                  <FiChevronRight />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        PaperProps={{ style: { borderRadius: 20, minWidth: 340, padding: 0 } }}
      >
        <DialogTitle sx={{ m: 0, p: 2, fontWeight: 700, fontSize: 20, pb: 1 }}>
          Filters
          <IconButton
            aria-label="close"
            onClick={() => setFilterOpen(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
            size="large"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 0, pb: 0 }}>
          <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
            <InputLabel id="status-filter-label">Result Entry Status</InputLabel>
            <Select
              labelId="status-filter-label"
              value={tempStatusFilter}
              label="Result Entry Status"
              onChange={(e) => setTempStatusFilter(e.target.value)}
            >
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Completed">Complete</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "space-between", px: 3, pb: 2, pt: 0 }}>
          <Button
            onClick={() => setTempStatusFilter("All")}
            sx={{
              fontWeight: 700,
              borderRadius: 2,
              bgcolor: "#f5f5f5",
              color: "#222",
              boxShadow: "none",
              border: "none",
              px: 4,
              height: "40px",
              fontSize: 14,
              "&:hover": { bgcolor: "#ececec" },
            }}
          >
            Clear All
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setStatusFilter(tempStatusFilter);
              setFilterOpen(false);
            }}
            sx={{
              fontWeight: 700,
              borderRadius: 2,
              bgcolor: "#444",
              color: "#fff",
              boxShadow: "none",
              border: "none",
              px: 4,
              height: "40px",
              fontSize: 14,
              "&:hover": { bgcolor: "#222" },
            }}
          >
            Apply
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        PaperProps={{ style: { borderRadius: 20, minWidth: 380 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: 18 }}>
          New Result Entry
          <IconButton
            aria-label="close"
            onClick={() => setShowCreateDialog(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1, mb: 1 }}>
            <InputLabel id="pending-sample-label">Select Received Sample</InputLabel>
              <Select
              labelId="pending-sample-label"
              value={selectedPendingId}
              label="Select Received Sample"
              onChange={(e) => {
                const value = String(e.target.value);
                setSelectedPendingId(value === "" ? "" : Number(value));
              }}
            >
              {pendingSamples.length === 0 && (
                <MenuItem disabled value="">
                  No pending samples
                </MenuItem>
              )}
              {pendingSamples.map((sample) => (
                <MenuItem key={sample.id} value={sample.id}>
                  {sample.specimen_no} - {sample.patient_name} ({sample.test_name})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "space-between", px: 3, pb: 2 }}>
          <Button
            onClick={() => setShowCreateDialog(false)}
            sx={{
              fontWeight: 700,
              borderRadius: 2,
              bgcolor: "#f5f5f5",
              color: "#222",
              boxShadow: "none",
              px: 3,
              height: "38px",
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={selectedPendingId === "" || creating}
            onClick={handleCreateEntry}
            sx={{
              fontWeight: 700,
              borderRadius: 2,
              bgcolor: "#444",
              color: "#fff",
              boxShadow: "none",
              px: 3,
              height: "38px",
              "&:hover": { bgcolor: "#222" },
            }}
          >
            {creating ? "Creating..." : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ResultEntry;
