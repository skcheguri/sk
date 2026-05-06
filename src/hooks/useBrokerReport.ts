import { useCallback, useEffect, useState } from 'react';
import { getSupabase, isSupabaseConnected } from '@/lib/supabase';
import { brokerReports } from '@/mocks/broker-reports';
import { softBlockStates } from '@/mocks/soft-block-states';
import type { BrokerReport } from '@/mocks/broker-reports';

export interface SoftBlockState {
  tenant_id: string;
  active: boolean;
  triggered_at: string | null;
  aadhaar_re_verified: boolean;
  additional_details_provided: boolean;
  details: {
    employerName?: string;
    companyAddress?: string;
    referenceContact?: string;
    purposeOfRenting?: string;
  } | null;
}

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const WINDOW_MS = 48 * HOUR_MS;
const REPORT_THRESHOLD = 2;

export type ReportReason =
  | 'broker_agent'
  | 'asked_commission'
  | 'shared_competing_listing'
  | 'refused_identity'
  | 'other';

function computeSoftBlock(reports: BrokerReport[]): boolean {
  const now = Date.now();
  const recentReports = reports.filter(
    (r) => now - new Date(r.created_at).getTime() < WINDOW_MS
  );
  return recentReports.length >= REPORT_THRESHOLD;
}

export interface BrokerReportStatus {
  reports: BrokerReport[];
  reportCount: number;
  recentReportCount: number;
  isSoftBlocked: boolean;
  softBlockState: SoftBlockState;
  canBeReportedBy: (reporterId: string) => boolean;
  loading: boolean;
}

function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

/* ---- Supabase helpers ---- */

async function fetchReportsSupabase(tenantId: string): Promise<BrokerReport[]> {
  const supabase = getSupabase();
  if (!supabase || !isValidUUID(tenantId)) return [];
  const { data, error } = await supabase
    .from('broker_reports')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false });
  if (error) {
    console.warn('Supabase broker_reports fetch error:', error.message);
    return [];
  }
  return (data as BrokerReport[]) ?? [];
}

async function insertReportSupabase(
  tenantId: string,
  ownerId: string,
  reason: ReportReason,
  reasonText: string,
  listingId: string
): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase || !isValidUUID(tenantId) || !isValidUUID(ownerId)) return false;
  const { error } = await supabase.from('broker_reports').insert({
    tenant_id: tenantId,
    owner_id: ownerId,
    listing_id: listingId,
    reason,
    reason_text: reasonText,
    created_at: new Date().toISOString(),
  });
  if (error) {
    console.warn('Supabase broker_reports insert error:', error.message);
    return false;
  }
  return true;
}

async function fetchSoftBlockSupabase(tenantId: string): Promise<SoftBlockState | null> {
  const supabase = getSupabase();
  if (!supabase || !isValidUUID(tenantId)) return null;
  const { data, error } = await supabase
    .from('soft_block_states')
    .select('*')
    .eq('tenant_id', tenantId)
    .maybeSingle();
  if (error) {
    console.warn('Supabase soft_block_states fetch error:', error.message);
    return null;
  }
  if (!data) return null;
  return {
    tenant_id: data.tenant_id,
    active: data.active,
    triggered_at: data.triggered_at,
    aadhaar_re_verified: data.aadhaar_re_verified,
    additional_details_provided: data.additional_details_provided,
    details: data.details
      ? {
          employerName: data.details.employer_name,
          companyAddress: data.details.company_address,
          referenceContact: data.details.reference_contact,
          purposeOfRenting: data.details.purpose_of_renting,
        }
      : null,
  };
}

async function upsertSoftBlockSupabase(state: SoftBlockState): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase || !isValidUUID(state.tenant_id)) return false;
  const payload = {
    tenant_id: state.tenant_id,
    active: state.active,
    triggered_at: state.triggered_at,
    aadhaar_re_verified: state.aadhaar_re_verified,
    additional_details_provided: state.additional_details_provided,
    details: state.details
      ? {
          employer_name: state.details.employerName,
          company_address: state.details.companyAddress,
          reference_contact: state.details.referenceContact,
          purpose_of_renting: state.details.purposeOfRenting,
        }
      : null,
  };
  const { error } = await supabase.from('soft_block_states').upsert(payload, {
    onConflict: 'tenant_id',
  });
  if (error) {
    console.warn('Supabase soft_block_states upsert error:', error.message);
    return false;
  }
  return true;
}

/* ---- Mock helpers (fallback when Supabase NOT connected) ---- */

function getMockReports(tenantId: string): BrokerReport[] {
  return brokerReports.filter((r) => r.tenant_id === tenantId);
}

function saveMockReport(
  tenantId: string,
  ownerId: string,
  reason: ReportReason,
  reasonText: string,
  listingId: string
): boolean {
  brokerReports.push({
    id: `mock-report-${Date.now()}`,
    tenant_id: tenantId,
    owner_id: ownerId,
    listing_id: listingId,
    reason,
    reason_text: reasonText,
    created_at: new Date().toISOString(),
  });
  return true;
}

function getMockSoftBlock(tenantId: string): SoftBlockState {
  const state = softBlockStates.find((s) => s.tenant_id === tenantId);
  if (state) return state;
  const fresh: SoftBlockState = {
    tenant_id: tenantId,
    active: false,
    triggered_at: null,
    aadhaar_re_verified: false,
    additional_details_provided: false,
    details: null,
  };
  softBlockStates.push(fresh);
  return fresh;
}

function saveMockSoftBlock(state: SoftBlockState) {
  const idx = softBlockStates.findIndex((s) => s.tenant_id === state.tenant_id);
  if (idx !== -1) {
    softBlockStates[idx] = state;
  } else {
    softBlockStates.push(state);
  }
}

/* ---- Status builder ---- */

async function buildBrokerReportStatus(
  tenantId: string,
  reports: BrokerReport[],
  softBlock: SoftBlockState | null
): Promise<BrokerReportStatus> {
  const now = Date.now();
  const recentReports = reports.filter(
    (r) => now - new Date(r.created_at).getTime() < WINDOW_MS
  );
  const isSoftBlocked = computeSoftBlock(reports);

  let state: SoftBlockState;
  if (softBlock) {
    state = softBlock;
  } else {
    state = {
      tenant_id: tenantId,
      active: false,
      triggered_at: null,
      aadhaar_re_verified: false,
      additional_details_provided: false,
      details: null,
    };
  }

  if (isSoftBlocked && !state.active) {
    state = { ...state, active: true, triggered_at: new Date().toISOString() };
    if (isSupabaseConnected() && isValidUUID(tenantId)) {
      await upsertSoftBlockSupabase(state);
    } else {
      saveMockSoftBlock(state);
    }
  }

  if (
    !isSoftBlocked &&
    state.active &&
    state.aadhaar_re_verified &&
    state.additional_details_provided
  ) {
    state = { ...state, active: false };
    if (isSupabaseConnected() && isValidUUID(tenantId)) {
      await upsertSoftBlockSupabase(state);
    } else {
      saveMockSoftBlock(state);
    }
  }

  const canBeReportedBy = (reporterId: string) => {
    return !reports.some((r) => r.owner_id === reporterId);
  };

  return {
    reports,
    reportCount: reports.length,
    recentReportCount: recentReports.length,
    isSoftBlocked: state.active,
    softBlockState: state,
    canBeReportedBy,
    loading: false,
  };
}

/* ---- Hook ---- */

export function useBrokerReport(tenantId: string | undefined) {
  const [status, setStatus] = useState<BrokerReportStatus>({
    reports: [],
    reportCount: 0,
    recentReportCount: 0,
    isSoftBlocked: false,
    softBlockState: {
      tenant_id: '',
      active: false,
      triggered_at: null,
      aadhaar_re_verified: false,
      additional_details_provided: false,
      details: null,
    },
    canBeReportedBy: () => false,
    loading: true,
  });

  const id = tenantId ?? '';

  const load = useCallback(async () => {
    if (!id) {
      setStatus((prev) => ({ ...prev, loading: false }));
      return;
    }
    setStatus((prev) => ({ ...prev, loading: true }));

    let reports: BrokerReport[];
    let softBlock: SoftBlockState | null = null;

    if (isSupabaseConnected() && isValidUUID(id)) {
      [reports, softBlock] = await Promise.all([
        fetchReportsSupabase(id),
        fetchSoftBlockSupabase(id),
      ]);
    } else {
      reports = getMockReports(id);
      softBlock = getMockSoftBlock(id);
    }

    const next = await buildBrokerReportStatus(id, reports, softBlock);
    setStatus(next);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const report = useCallback(
    async (
      reporterId: string,
      _reporterName: string,
      reason: ReportReason,
      reasonText: string,
      listingId: string
    ): Promise<boolean> => {
      if (!id) return false;
      const alreadyReported = status.reports.some((r) => r.owner_id === reporterId);
      if (alreadyReported) return false;

      if (isSupabaseConnected() && isValidUUID(id) && isValidUUID(reporterId)) {
        const ok = await insertReportSupabase(id, reporterId, reason, reasonText, listingId);
        if (!ok) return false;
      } else {
        saveMockReport(id, reporterId, reason, reasonText, listingId);
      }

      await load();
      return true;
    },
    [id, status.reports, load]
  );

  const resolveAadhaar = useCallback(async () => {
    if (!id) return;
    const next: SoftBlockState = {
      ...status.softBlockState,
      tenant_id: id,
      aadhaar_re_verified: true,
    };
    if (isSupabaseConnected() && isValidUUID(id)) {
      await upsertSoftBlockSupabase(next);
    } else {
      saveMockSoftBlock(next);
    }
    await load();
  }, [id, status.softBlockState, load]);

  const submitDetails = useCallback(
    async (details: {
      employerName: string;
      companyAddress: string;
      referenceContact: string;
      purposeOfRenting: string;
    }) => {
      if (!id) return;
      const next: SoftBlockState = {
        ...status.softBlockState,
        tenant_id: id,
        additional_details_provided: true,
        details: {
          employerName: details.employerName,
          companyAddress: details.companyAddress,
          referenceContact: details.referenceContact,
          purposeOfRenting: details.purposeOfRenting,
        },
      };
      if (isSupabaseConnected() && isValidUUID(id)) {
        await upsertSoftBlockSupabase(next);
      } else {
        saveMockSoftBlock(next);
      }
      await load();
    },
    [id, status.softBlockState, load]
  );

  return { ...status, report, resolveAadhaar, submitDetails, refresh: load };
}