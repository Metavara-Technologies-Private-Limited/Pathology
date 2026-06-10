import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import type { ReceiveSample } from "../../services/receive.api";

type ActivityLogsTabProps = { rows: ReceiveSample[] };

function ActivityLogsTab({ rows }: ActivityLogsTabProps) {
  return (
    <table className="receive-table">
      <thead>
        <tr>
          <th>Ship Date | Time</th>
          <th>Ship No.</th>
          <th>Receive Date | Time</th>
          <th>Receive No.</th>
          <th>Ship From | To</th>
          <th>Ship By</th>
          <th>Receive At</th>
          <th>Received By</th>
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
              <div className="cell-primary">{row.receive_date ?? "—"}</div>
              <div className="cell-secondary">{row.receive_time ?? "—"}</div>
            </td>
            <td><div className="cell-primary">{row.shipment_no}</div></td>
            <td>
              <div className="cell-primary">—</div>
              <div className="cell-secondary">—</div>
            </td>
            <td><div className="cell-primary">—</div></td>
            <td><div className="cell-primary">—</div></td>
            <td><div className="cell-primary">{row.accepted_by ?? "—"}</div></td>
            <td className="info-column">
              <PrintOutlinedIcon className="print-icon" fontSize="small" />
            </td>
          </tr>
        ))}
        {rows.length === 0 && (
          <tr><td colSpan={9} className="empty-row">No matching records found.</td></tr>
        )}
      </tbody>
    </table>
  );
}

export default ActivityLogsTab;