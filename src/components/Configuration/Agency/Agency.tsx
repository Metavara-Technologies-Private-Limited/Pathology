
import React, { useEffect, useState } from "react";
import "./Agency.css";
import { FiSearch, FiPlus } from "react-icons/fi";
import { MdEdit } from "react-icons/md";

interface Agency {
  id: number;
  code: string;
  name: string;
  country: string;
  location: string;
  services: number;
  active: boolean;
}

interface Linking {
  id: number;
  clinic: string;
  agencyCount: number;
}

const AgencyPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"agency" | "linking">("agency");

  const [agencyData, setAgencyData] = useState<Agency[]>([]);
  const [linkingData, setLinkingData] = useState<Linking[]>([]);
  const [loading, setLoading] = useState(true);

  const [agencySearch, setAgencySearch] = useState("");
  const [linkingSearch, setLinkingSearch] = useState("");

  useEffect(() => {
    setLoading(true);

    setTimeout(() => {
      setAgencyData([
        { id: 1, code: "AG-1001", name: "Acuity Labs", country: "India", location: "Pune", services: 4, active: true },
        { id: 2, code: "AG-1002", name: "Pathway Diagnostics", country: "India", location: "Chennai", services: 3, active: false },
        { id: 3, code: "AG-1003", name: "Prime Labs", country: "India", location: "Delhi", services: 5, active: true },
        { id: 4, code: "AG-1004", name: "Care Labs", country: "India", location: "Hyderabad", services: 2, active: false },
        { id: 5, code: "AG-1005", name: "Wellness Labs", country: "India", location: "Mumbai", services: 6, active: true },
        { id: 6, code: "AG-1006", name: "Health Labs", country: "India", location: "Bangalore", services: 2, active: true },
        { id: 7, code: "AG-1007", name: "Metro Labs", country: "India", location: "Delhi", services: 3, active: false },
        { id: 8, code: "AG-1008", name: "City Labs", country: "India", location: "Pune", services: 4, active: true },
        { id: 9, code: "AG-1009", name: "Nova Labs", country: "India", location: "Chennai", services: 2, active: true },
        { id: 10, code: "AG-1010", name: "Global Labs", country: "India", location: "Hyderabad", services: 1, active: false },
        { id: 11, code: "AG-1011", name: "Elite Labs", country: "India", location: "Mumbai", services: 5, active: true },
      ]);

      setLinkingData([
        { id: 1, clinic: "Apollo Clinic", agencyCount: 4 },
        { id: 2, clinic: "Fortis", agencyCount: 2 },
        { id: 3, clinic: "Manipal Hospital", agencyCount: 5 },
        { id: 3, clinic: "Manipal Hospital", agencyCount: 5 },
        { id: 3, clinic: "Manipal Hospital", agencyCount: 5 },
        { id: 3, clinic: "Manipal Hospital", agencyCount: 5 },
        { id: 3, clinic: "Manipal Hospital", agencyCount: 5 },
        { id: 3, clinic: "Manipal Hospital", agencyCount: 5 },
        { id: 3, clinic: "Manipal Hospital", agencyCount: 5 },
        { id: 3, clinic: "Manipal Hospital", agencyCount: 5 },
        { id: 3, clinic: "Manipal Hospital", agencyCount: 5 },
        { id: 3, clinic: "Manipal Hospital", agencyCount: 5 },
        { id: 3, clinic: "Manipal Hospital", agencyCount: 5 },
      ]);

      setLoading(false);
    }, 500);
  }, []);

  const filteredAgency = agencyData.filter((a) =>
    a.name.toLowerCase().includes(agencySearch.toLowerCase())
  );

  const filteredLinking = linkingData.filter((l) =>
    l.clinic.toLowerCase().includes(linkingSearch.toLowerCase())
  );

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const data = activeTab === "agency" ? filteredAgency : filteredLinking;
  const totalPages = Math.max(1, Math.ceil(data.length / itemsPerPage));
  const currentData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [agencySearch, linkingSearch, activeTab]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [data]);

  const toggleStatus = (id: number) => {
    setAgencyData((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, active: !item.active } : item
      )
    );
  };

  return (
    <div className="agency-container">
      {/* Tabs */}
      <div className="tabs">
        <div
          className={`tab ${activeTab === "agency" ? "active" : ""}`}
          onClick={() => setActiveTab("agency")}
        >
          Agency
        </div>

        <div
          className={`tab ${activeTab === "linking" ? "active" : ""}`}
          onClick={() => setActiveTab("linking")}
        >
          Agency-Clinic Linking
        </div>
      </div>

      {/* Header */}
      <div className="header-row">
        <h3>
          {activeTab === "agency"
            ? `List of Agency (${filteredAgency.length})`
            : `Agency-Clinic Linking (${filteredLinking.length})`}
        </h3>

        <div className="actions">
          <div className="search-box">
            <FiSearch />
            <input
              placeholder={
                activeTab === "agency"
                  ? "Search by code / Name"
                  : "Search by Clinic"
              }
              value={activeTab === "agency" ? agencySearch : linkingSearch}
              onChange={(e) =>
                activeTab === "agency"
                  ? setAgencySearch(e.target.value)
                  : setLinkingSearch(e.target.value)
              }
            />
          </div>

          {activeTab === "agency" && (
            <button className="add-btn">
              <FiPlus /> Add New Agency
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <>
          {/* Table */}
          <div className="table">
            <div className="table-head">
              {activeTab === "agency" ? (
                <>
                  <span>Code</span>
                  <span>Name</span>
                  <span>Country</span>
                  <span>City</span>
                  <span>Services</span>
                  <span>Status</span>
                </>
              ) : (
                <>
                  <span>Clinic Name</span>
                  <span>No. of Agencies Linked</span>
                  <span>Action</span>
                </>
              )}
            </div>

            {currentData.map((item: any) => (
              <div className="table-row" key={item.id}>
                {activeTab === "agency" ? (
                  <>
                    <span>{item.code}</span>
                    <span>{item.name}</span>
                    <span>{item.country}</span>
                    <span>{item.location}</span>
                    <span>{item.services}</span>

                    <div className="status-cell">
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={item.active}
                          onChange={() => toggleStatus(item.id)}
                        />
                        <span className="slider"></span>
                      </label>

                      <button className="edit-btn">
                        <MdEdit />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <span>{item.clinic}</span>
                    <span>{item.agencyCount}</span>

                    <div className="status-cell">
                      <button className="edit-btn">
                        <MdEdit />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="footer">
            <span>
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, data.length)} of {data.length}
            </span>

            <div className="pagination">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              >
                {"<"}
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  className={currentPage === i + 1 ? "active" : ""}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
              >
                {">"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AgencyPage;