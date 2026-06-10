import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import type { ReceiveSample } from "../../services/receive.api";

type ReceivedTabProps = { rows: ReceiveSample[] };

function ReceivedTab({ rows }: ReceivedTabProps) {
  return (
    <table className="receive-table">
      <thead>
        <tr>
          <th>Receive Date | Time</th>
          <th>Received No.</th>
          <th>Sample No. | Type</th>
          <th>Test Code | Name</th>
          <th>Service Name</th>
          <th>Patient</th>
          <th>Result Status</th>
          <th>Result</th>
          <th className="info-column" />
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => {
          const isPending = !row.receive_date || !row.receive_time;
          return (
            <tr key={row.id}>
              <td>
                <div className="cell-primary">{row.receive_date ?? row.ship_date}</div>
                <div className="cell-secondary">{row.receive_time ?? row.ship_time}</div>
              </td>
              <td><div className="cell-primary">{row.shipment_no}</div></td>
              <td>
                <div className="cell-primary">{row.specimen_no}</div>
                <div className="cell-secondary">{row.specimen_type}</div>
              </td>
              <td>
                <div className="cell-primary">{row.test_code}</div>
                <div className="cell-secondary">{row.test_name}</div>
              </td>
              <td><div className="cell-primary">{row.service_name}</div></td>
              <td>
                <div className="patient-primary">{row.patient_name} | {row.patient_age}</div>
                <div className="patient-secondary">{row.patient_code} | {row.patient_gender}</div>
              </td>
              <td>
                <span className={`result-status-pill ${isPending ? "pending" : "complete"}`}>
                  {isPending ? "Pending" : "Complete"}
                </span>
              </td>
              <td>
                {isPending
                  ? <AddCircleOutlineIcon className="result-icon" fontSize="small" />
                  : <DescriptionOutlinedIcon className="result-icon" fontSize="small" />}
              </td>
              <td className="info-column">
                <span className="info-hover-target">
                  <ErrorOutlineIcon className="warning-icon" fontSize="small" />
                  <span className="info-hover-card" role="tooltip">
                    <span className="info-hover-row"><span>Order Date & Time</span><strong>{row.ship_date} | {row.ship_time}</strong></span>
                    <span className="info-hover-row"><span>Ship Date & Time</span><strong>{row.ship_date} | {row.ship_time}</strong></span>
                    <span className="info-hover-row"><span>Shipment No.</span><strong>{row.shipment_no}</strong></span>
                    <span className="info-hover-row"><span>Receive Remark</span><strong>{row.remark ?? "—"}</strong></span>
                  </span>
                </span>
              </td>
            </tr>
          );
        })}
        {rows.length === 0 && (
          <tr><td colSpan={9} className="empty-row">No matching records found.</td></tr>
        )}
      </tbody>
    </table>
  );
}

export default ReceivedTab;