import {
  CreateReceiveSamplePayload,
  ReceiveSamplePayload,
  RejectSamplePayload,
} from "../types/Receive.types";
import { http } from "./http";

// =====================================================
// Types
// =====================================================
export interface ReceiveSample {
  id: number;
  shipment: number | null;
  ship_date: string;
  ship_time: string;
  shipment_no: string;
  specimen_no: string;
  specimen_type: string;
  test_code: string;
  test_name: string;
  service_name: string;
  patient_name: string;
  patient_age: number;
  patient_gender: string;
  patient_code: string;
  receive_date: string | null;
  receive_time: string | null;
  accepted_by: string | null;
  remark: string | null;
  sub_optimal: boolean;
  status: "Shipped" | "Received" | "Rejected";
  is_deleted: boolean;
  created_at: string;
  deleted_at: string | null;
}

// =====================================================
// Receive Sample APIs (object style)
// =====================================================
export const receiveApi = {
  getSamples: () => http.get("/active-samples/"),

  createSample: async (payload: CreateReceiveSamplePayload) => {
    return await http.post("/create-sample/", payload);
  },

  receiveSample: async (sampleId: number, payload: ReceiveSamplePayload) => {
    return await http.post(`/receive-sample/${sampleId}/`, payload);
  },

  rejectSample: async (sampleId: number, payload: RejectSamplePayload) => {
    return await http.post(`/reject-sample/${sampleId}/`, payload);
  },

  getActivityLogs: () => http.get("/receive-activity-logs/"),

  deleteSample: async (sampleId: number) => {
    return await http.delete(`/delete-sample/${sampleId}/`);
  },
};

// =====================================================
// Typed helpers for Redux / UI
// =====================================================
export const getAllSamples = async (): Promise<ReceiveSample[]> => {
  const res = await http.get<{ message: string; data: ReceiveSample[] }>(
    "/active-samples/"
  );
  return res.data.data;
};

export const getActivityLogSamples = async (): Promise<ReceiveSample[]> => {
  const res = await http.get<{ message: string; data: ReceiveSample[] }>(
    "/receive-activity-logs/"
  );
  return res.data.data;
};

// =====================================================
// Named exports (consumed by ReceiveSlice & ReceiveView)
// =====================================================
export const receiveSample = async (
  sampleId: number,
  payload?: ReceiveSamplePayload
): Promise<void> => {
  await http.post(`/receive-sample/${sampleId}/`, payload ?? {});
};

export const rejectSample = async (
  sampleId: number,
  payload?: RejectSamplePayload
): Promise<void> => {
  await http.post(`/reject-sample/${sampleId}/`, payload ?? {});
};

export const createSample = async (
  payload: CreateReceiveSamplePayload
) => {
  return await http.post("/create-sample/", payload);
};

export const deleteSample = async (sampleId: number): Promise<void> => {
  await http.delete(`/delete-sample/${sampleId}/`);
};