import React from "react";
import "../../styles/Authorization/ResultDetails.css";
import backIcon from "../Authorization/Icons/back-icon.png";

type Props = {
    onBack: () => void;
};

const ResultDetails: React.FC<Props> = ({ onBack }) => {
    return (
        <div className="result-container">
            {/* Top Header */}
            <div className="result-header">
                <button className="back-btn" onClick={onBack}>
                    <img src={backIcon} alt="back" className="back-icon" />
                </button>
                <h2>View Result Details</h2>
            </div>

            {/* Patient Info Card */}
            <div className="patient-card">
                <img
                    src="https://randomuser.me/api/portraits/women/44.jpg"
                    alt="patient"
                />

                <div className="patient-grid">
                    <div>
                        <label>Patient Name</label>
                        <p>Emilia Williamson</p>
                    </div>
                    <div>
                        <label>Age</label>
                        <p>27 Years</p>
                    </div>
                    <div>
                        <label>Sex Assigned At Birth</label>
                        <p>Female</p>
                    </div>
                    <div>
                        <label>MRN</label>
                        <p>PCC - 4912</p>
                    </div>
                    <div>
                        <label>Allergy</label>
                        <p>No</p>
                    </div>
                    <div>
                        <label>SART ID</label>
                        <p>14SGK9876432</p>
                    </div>
                    <div>
                        <label>Last Modified</label>
                        <p>04/02/2026</p>
                    </div>
                    <div>
                        <label>Referred By</label>
                        <p>Soniya</p>
                    </div>
                    <div>
                        <label>Pathologist</label>
                        <p>John Wick</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="result-tabs">
                <button>HIV (Rapid Card)</button>
                <button>HCV (Rapid Card)</button>
                <button className="active">(CBC) Complete Blood Count</button>
            </div>

            {/* Table */}
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
                            <th>Previous</th>
                        </tr>
                    </thead>

                    <tbody>
                        <tr>
                            <td>Heamoglobin (hb)</td>
                            <td>Female</td>
                            <td>Manual</td>
                            <td>-</td>
                            <td>14</td>
                            <td>12 - 16.5</td>
                            <td>14</td>
                            <td>
                                Female: 12-16.5 g/dl <br />
                                Newborn: 14-22 g/dl
                            </td>
                            <td>
                                <span className="badge normal">Normal</span>
                            </td>
                            <td>⚠️</td>
                        </tr>

                        <tr>
                            <td>MCV</td>
                            <td>Female</td>
                            <td>Manual</td>
                            <td>+</td>
                            <td>91</td>
                            <td>80 - 100</td>
                            <td>90</td>
                            <td>
                                Female: 12-16.5 g/dl <br />
                                Newborn: 14-22 g/dl
                            </td>
                            <td>
                                <span className="badge abnormal">Abnormal</span>
                            </td>
                            <td>-</td>
                        </tr>

                        <tr>
                            <td>Hematocrit</td>
                            <td>Female</td>
                            <td>Manual</td>
                            <td>+</td>
                            <td>47.2</td>
                            <td>40 - 52.5</td>
                            <td>45</td>
                            <td>
                                Female: 12-16.5 g/dl <br />
                                Newborn: 14-22 g/dl
                            </td>
                            <td>
                                <span className="badge reflex">Reflex</span>
                            </td>
                            <td>-</td>
                        </tr>

                        <tr>
                            <td>RDW</td>
                            <td>Female</td>
                            <td>Manual</td>
                            <td>+</td>
                            <td>12.8</td>
                            <td>12 - 16.5</td>
                            <td>13</td>
                            <td>
                                Female: 12-16.5 g/dl <br />
                                Newborn: 14-22 g/dl
                            </td>
                            <td>
                                <span className="badge panic">Panic</span>
                            </td>
                            <td>⚠️</td>
                        </tr>

                        <tr>
                            <td>MCHC</td>
                            <td>Female</td>
                            <td>Manual</td>
                            <td>-</td>
                            <td>14</td>
                            <td>12 - 16.5</td>
                            <td>14</td>
                            <td>
                                Female: 12-16.5 g/dl <br />
                                Newborn: 14-22 g/dl
                            </td>
                            <td>
                                <span className="badge improbable">Improbable</span>
                            </td>
                            <td>⚠️</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Footer Notes */}
            <div className="result-footer">
                <div>
                    <strong>Suggestion Note :</strong>
                    <p>Hb Within Normal Range. Continue Routine Monitoring If Clinically Required.</p>
                </div>

                <div>
                    <strong>Foot Note :</strong>
                    <p>Reference Ranges May Vary Depending On Age, Gender, And Clinical Condition.</p>
                </div>

                <div>
                    <strong>Authorization Status :</strong>
                    <span className="badge success">Authorized</span>
                </div>
            </div>
        </div>
    );
};

export default ResultDetails;