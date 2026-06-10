import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import type { ReceiveSample } from "../../services/receive.api";

type ShippedTabProps = {
  rows: ReceiveSample[];
  selectedIds: number[];
  allSelected: boolean;
  onToggleAllRows: () => void;
  onToggleSingleRow: (id: number) => void;
};

function ShippedTab({ rows, selectedIds, allSelected, onToggleAllRows, onToggleSingleRow }: ShippedTabProps) {
  return (
    <table className="receive-table">
      <thead>
        <tr>
          <th className="checkbox-column">
            <button type="button" className={`select-checkbox ${allSelected ? "selected" : ""}`} onClick={onToggleAllRows} aria-label="Select all rows" />
          </th>
          <th>Ship Date | Time</th>
          <th>Shipment No.</th>
          <th>Sample No. | Type</th>
          <th>Test Code | Name</th>
          <th>Service Name</th>
          <th>Patient</th>
          <th className="info-column" />
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            <td className="checkbox-column">
              <button type="button" className={`select-checkbox ${selectedIds.includes(row.id) ? "selected" : ""}`} onClick={() => onToggleSingleRow(row.id)} aria-label={`Select sample ${row.specimen_no}`} />
            </td>
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
        ))}
        {rows.length === 0 && (
          <tr><td colSpan={8} className="empty-row">No matching records found.</td></tr>
        )}
      </tbody>
    </table>
  );
}

export default ShippedTab;