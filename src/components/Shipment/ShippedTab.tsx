import React from "react";
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

interface ShippedTabProps {
  data: any[];
}

const ShippedTab: React.FC<ShippedTabProps> = ({ data }) => {
  return (
    <table className="custom-table">
      <thead>
        <tr>
          <th>Ship Date | Time</th>
          <th>Shipment No.</th>
          <th>Sample No. | Type</th>
          <th>Test Code | Name</th>
          <th>Service Name</th>
          <th>Patient</th>
          <th>Ship To</th>
          <th style={{ width: "50px" }}></th>
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr key={row.id}>
            <td>
              <div className="cell-top">{row.shipDate}</div>
              <div className="cell-bottom">{row.time}</div>
            </td>
            <td>
              <div className="cell-top">{row.shipmentNo}</div>
            </td>
            <td>
              <div className="cell-top">{row.sampleNo}</div>
              <div className="cell-bottom">{row.type}</div>
            </td>
            <td>
              <div className="cell-top">{row.testCode}</div>
              <div className="cell-bottom">{row.testName}</div>
            </td>
            <td>
              <div className="cell-top">{row.serviceName}</div>
            </td>
            <td>
              <div className="patient-name">
                {row.patientName} | {row.age}
              </div>
              <div className="patient-details">
                {row.patientCode} | {row.gender}
              </div>
            </td>
            <td>
              <div className="cell-top">{row.shipTo}</div>
            </td>
            <td style={{ textAlign: "center" }}>
              <ErrorOutlineIcon style={{ color: "#fdba74", fontSize: "20px" }} />
            </td>
          </tr>
        ))}
        {data.length === 0 && (
          <tr>
            <td colSpan={8} style={{ textAlign: "center", padding: "40px", color: "#9ca3af" }}>
              No matching records found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default ShippedTab;
