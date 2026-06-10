import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import type { ReceiveSample } from "../../services/receive.api";

type RejectedTabProps = { rows: ReceiveSample[] };

function RejectedTab({ rows }: RejectedTabProps) {
  return (
    <table className="receive-table">
      <thead>
        <tr>
          <th>Date | Time</th>
          <th>Shipment No.</th>
          <th>Sample No. | Type</th>
          <th>Test Code | Name</th>
          <th>Service Name</th>
          <th>Patient</th>
          <th>Resend for New Sample</th>
          <th className="info-column" />
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            <td>
              <div className="cell-primary">{row.ship_date}</div>
              <div className="cell-secondary">{row.ship_time}</div>
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
              {row.sub_optimal
                ? <CheckCircleOutlineIcon className="resend-icon" fontSize="small" />
                : null}
            </td>
            <td className="info-column">
              <span className="info-hover-target">
                <ErrorOutlineIcon className="warning-icon" fontSize="small" />
                <span className="info-hover-card" role="tooltip">
                  <span className="info-hover-row"><span>Order Date & Time</span><strong>{row.ship_date} | {row.ship_time}</strong></span>
                  <span className="info-hover-row"><span>Ship Date & Time</span><strong>{row.ship_date} | {row.ship_time}</strong></span>
                  <span className="info-hover-row"><span>Shipment No.</span><strong>{row.shipment_no}</strong></span>
                  <span className="info-hover-row"><span>Reject Remark</span><strong>{row.remark ?? "—"}</strong></span>
                </span>
              </span>
            </td>
          </tr>
        ))}
        {rows.length === 0 && (
          <tr><td colSpan={8} className="empty-row">No matching records found.</td></tr>
        )}
      </tbody>
    </table>
  );
}

export default RejectedTab;