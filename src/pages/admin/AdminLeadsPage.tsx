import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Users,
  Search,
  Filter,
  Download,
  Phone,
  MessageSquare,
  Calendar,
  Building2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  Send,
  FileCheck2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  X,
} from 'lucide-react';

export interface LeadRecord {
  id: string;
  reference_number: string;
  timestamp: string;
  name: string;
  email: string;
  phone: string;
  jurisdiction: string;
  activity: string;
  timeline?: string | null;
  visa_count?: number | null;
  notes?: string | null;
  source: string;
  platform: string;
  status: 'New' | 'Contacted' | 'Proposal Sent' | 'Converted' | 'Archived';
  created_at?: string;
  updated_at?: string;
}

const STATUS_OPTIONS: Array<LeadRecord['status']> = [
  'New',
  'Contacted',
  'Proposal Sent',
  'Converted',
  'Archived',
];

const JURISDICTION_OPTIONS = [
  'All Jurisdictions',
  'Meydan Free Zone',
  'IFZA',
  'DIFC',
  'ADGM',
  'Dubai Mainland',
  'RAK ICC',
  'DMCC',
  'JAFZA',
  'RAKEZ',
  'Offshore',
];

export function AdminLeadsPage() {
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [allLeadsForStats, setAllLeadsForStats] = useState<LeadRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [jurisdictionFilter, setJurisdictionFilter] = useState('All Jurisdictions');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Updating status tracker (leadId -> boolean)
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const headers: Record<string, string> = {
        Accept: 'application/json',
      };

      // Fetch all leads for comprehensive table & stats
      const res = await fetch('/api/admin/leads?limit=500', {
        headers,
        credentials: 'include',
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Session expired. Please log in again.');
        }
        throw new Error(`Failed to load leads (${res.status})`);
      }

      const data = await res.json();
      const rawLeads: LeadRecord[] = Array.isArray(data.leads) ? data.leads : [];
      setLeads(rawLeads);
      setAllLeadsForStats(rawLeads);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error fetching leads';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Toast auto-clear
  useEffect(() => {
    if (successToast) {
      const timer = setTimeout(() => setSuccessToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [successToast]);

  // Status mutation handler
  const handleStatusChange = async (leadId: string, newStatus: LeadRecord['status']) => {
    setUpdatingId(leadId);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };

      const res = await fetch(`/api/admin/leads/${encodeURIComponent(leadId)}`, {
        method: 'PATCH',
        headers,
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Status update failed (${res.status})`);
      }

      // Update state in memory
      setLeads((prev) =>
        prev.map((l) =>
          l.id === leadId ? { ...l, status: newStatus, updated_at: new Date().toISOString() } : l
        )
      );
      setAllLeadsForStats((prev) =>
        prev.map((l) =>
          l.id === leadId ? { ...l, status: newStatus, updated_at: new Date().toISOString() } : l
        )
      );

      setSuccessToast(`Lead ${leadId} status updated to ${newStatus}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update status';
      setError(msg);
    } finally {
      setUpdatingId(null);
    }
  };

  // KPI Calculations across all leads
  const kpis = useMemo(() => {
    const total = allLeadsForStats.length;
    let newCount = 0;
    let contactedCount = 0;
    let proposalSentCount = 0;
    let convertedCount = 0;

    for (const lead of allLeadsForStats) {
      if (lead.status === 'New') newCount++;
      else if (lead.status === 'Contacted') contactedCount++;
      else if (lead.status === 'Proposal Sent') proposalSentCount++;
      else if (lead.status === 'Converted') convertedCount++;
    }

    return {
      total,
      newCount,
      contactedCount,
      proposalSentCount,
      convertedCount,
    };
  }, [allLeadsForStats]);

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return leads.filter((lead) => {
      // Text search
      if (query) {
        const matchName = lead.name?.toLowerCase().includes(query);
        const matchEmail = lead.email?.toLowerCase().includes(query);
        const matchPhone = lead.phone?.toLowerCase().includes(query);
        const matchRef = lead.reference_number?.toLowerCase().includes(query);
        const matchActivity = lead.activity?.toLowerCase().includes(query);
        if (!matchName && !matchEmail && !matchPhone && !matchRef && !matchActivity) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== 'All' && lead.status !== statusFilter) {
        return false;
      }

      // Jurisdiction filter
      if (jurisdictionFilter !== 'All Jurisdictions') {
        const jLower = (lead.jurisdiction || '').toLowerCase();
        const fLower = jurisdictionFilter.toLowerCase();
        if (!jLower.includes(fLower)) {
          return false;
        }
      }

      // Date range filter
      if (fromDate) {
        const leadDate = (lead.timestamp || lead.created_at || '').slice(0, 10);
        if (leadDate && leadDate < fromDate) return false;
      }
      if (toDate) {
        const leadDate = (lead.timestamp || lead.created_at || '').slice(0, 10);
        if (leadDate && leadDate > toDate) return false;
      }

      return true;
    });
  }, [leads, searchQuery, statusFilter, jurisdictionFilter, fromDate, toDate]);

  // Paginated subset
  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / itemsPerPage));
  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLeads.slice(start, start + itemsPerPage);
  }, [filteredLeads, currentPage, itemsPerPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, jurisdictionFilter, fromDate, toDate]);

  // CSV Export
  const handleExportCsv = () => {
    if (filteredLeads.length === 0) return;

    const headers = [
      'Reference ID',
      'Date',
      'Name',
      'Email',
      'Phone',
      'Jurisdiction',
      'Activity',
      'Visa Count',
      'Status',
      'Source',
      'Notes',
    ];

    const escapeCsv = (str: string | null | undefined) => {
      if (str === null || str === undefined) return '""';
      const clean = String(str).replace(/"/g, '""');
      return `"${clean}"`;
    };

    const rows = filteredLeads.map((lead) => [
      escapeCsv(lead.reference_number || lead.id),
      escapeCsv(lead.timestamp || lead.created_at || ''),
      escapeCsv(lead.name),
      escapeCsv(lead.email),
      escapeCsv(lead.phone),
      escapeCsv(lead.jurisdiction),
      escapeCsv(lead.activity),
      escapeCsv(lead.visa_count?.toString() || '0'),
      escapeCsv(lead.status),
      escapeCsv(lead.source || 'portal'),
      escapeCsv(lead.notes || ''),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const today = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `klay-leads-export-${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setSuccessToast(`Exported ${filteredLeads.length} leads to CSV.`);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setJurisdictionFilter('All Jurisdictions');
    setFromDate('');
    setToDate('');
  };

  // Helper for WhatsApp normalization
  const getWhatsAppUrl = (phone: string, name: string) => {
    const raw = (phone || '').replace(/\D/g, '');
    let normalized = raw;
    if (raw.startsWith('05') && raw.length === 10) {
      normalized = '971' + raw.slice(1);
    } else if (raw.startsWith('5') && raw.length === 9) {
      normalized = '971' + raw;
    }
    const message = encodeURIComponent(
      `Hello ${name || 'Founder'}, this is Klay Consultants following up on your UAE setup inquiry.`
    );
    return `https://wa.me/${normalized}?text=${message}`;
  };

  // Status Badge Styling Helper
  const getStatusBadgeClass = (status: LeadRecord['status']) => {
    switch (status) {
      case 'New':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case 'Contacted':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'Proposal Sent':
        return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      case 'Converted':
        return 'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30';
      case 'Archived':
      default:
        return 'bg-gray-500/15 text-gray-400 border-gray-500/30';
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            Leads Intake Intelligence
            <span className="font-mono text-xs font-medium px-2.5 py-1 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
              {allLeadsForStats.length} Total Captured
            </span>
          </h1>
          <p className="font-mono text-xs text-white/50 mt-1">
            Real-time multi-channel client inquiries, CRM pipeline &amp; direct telemetry
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchLeads}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0A1E30] hover:bg-[#0C2D48] text-white/80 hover:text-white border border-white/10 hover:border-[#D4AF37]/40 text-xs font-mono transition-all disabled:opacity-50"
            title="Refresh Table Data"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#D4AF37]' : ''}`}
            />
            <span>Sync DB</span>
          </button>

          <button
            onClick={handleExportCsv}
            disabled={filteredLeads.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0C2D48] hover:bg-[#103859] text-[#D4AF37] border border-[#D4AF37]/40 hover:border-[#D4AF37] text-xs font-mono font-semibold transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV ({filteredLeads.length})</span>
          </button>
        </div>
      </div>

      {/* Success / Error Notification Banners */}
      {successToast && (
        <div className="p-3.5 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E] text-xs font-mono flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center justify-between gap-2 shadow-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 5 KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Total */}
        <div className="bg-[#0A1E30] border border-[#0C2D48] hover:border-[#D4AF37]/30 transition-all rounded-2xl p-4 shadow-lg shadow-black/20 relative overflow-hidden">
          <div className="flex items-center justify-between text-white/50 text-xs font-mono">
            <span>Total Captured</span>
            <Users className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <div className="mt-2 font-serif text-2xl sm:text-3xl font-bold text-white">
            {kpis.total}
          </div>
          <div className="mt-1 font-mono text-[10px] text-white/40 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-[#22C55E]" />
            <span>Lifetime intake</span>
          </div>
        </div>

        {/* New */}
        <div className="bg-[#0A1E30] border border-blue-500/20 hover:border-blue-500/40 transition-all rounded-2xl p-4 shadow-lg shadow-black/20">
          <div className="flex items-center justify-between text-blue-400 text-xs font-mono">
            <span>New Leads</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 font-serif text-2xl sm:text-3xl font-bold text-blue-400">
            {kpis.newCount}
          </div>
          <div className="mt-1 font-mono text-[10px] text-blue-300/60">Awaiting contact</div>
        </div>

        {/* Contacted */}
        <div className="bg-[#0A1E30] border border-amber-500/20 hover:border-amber-500/40 transition-all rounded-2xl p-4 shadow-lg shadow-black/20">
          <div className="flex items-center justify-between text-amber-400 text-xs font-mono">
            <span>Contacted</span>
            <MessageSquare className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 font-serif text-2xl sm:text-3xl font-bold text-amber-400">
            {kpis.contactedCount}
          </div>
          <div className="mt-1 font-mono text-[10px] text-amber-300/60">In consultation</div>
        </div>

        {/* Proposal Sent */}
        <div className="bg-[#0A1E30] border border-purple-500/20 hover:border-purple-500/40 transition-all rounded-2xl p-4 shadow-lg shadow-black/20">
          <div className="flex items-center justify-between text-purple-400 text-xs font-mono">
            <span>Proposal Sent</span>
            <Send className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2 font-serif text-2xl sm:text-3xl font-bold text-purple-400">
            {kpis.proposalSentCount}
          </div>
          <div className="mt-1 font-mono text-[10px] text-purple-300/60">Quotes issued</div>
        </div>

        {/* Converted */}
        <div className="bg-[#0A1E30] border border-[#22C55E]/20 hover:border-[#22C55E]/40 transition-all rounded-2xl p-4 shadow-lg shadow-black/20">
          <div className="flex items-center justify-between text-[#22C55E] text-xs font-mono">
            <span>Converted</span>
            <FileCheck2 className="w-4 h-4 text-[#22C55E]" />
          </div>
          <div className="mt-2 font-serif text-2xl sm:text-3xl font-bold text-[#22C55E]">
            {kpis.convertedCount}
          </div>
          <div className="mt-1 font-mono text-[10px] text-[#22C55E]/60">Retained clients</div>
        </div>
      </div>

      {/* Controls & Filter Toolbar */}
      <div className="bg-[#0A1E30] border border-[#0C2D48] rounded-2xl p-4 sm:p-5 shadow-lg shadow-black/30 space-y-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          {/* Search Input (5 cols on lg) */}
          <div className="lg:col-span-4 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/40">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search reference, name, email, phone, activity..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-[#05131F] border border-white/10 rounded-xl text-xs font-mono text-white placeholder-white/40 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-white/40 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Dropdown Filter (2 cols on lg) */}
          <div className="lg:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-[#05131F] border border-white/10 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#D4AF37] cursor-pointer"
            >
              <option value="All">All Statuses</option>
              {STATUS_OPTIONS.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Jurisdiction Dropdown Filter (2 cols on lg) */}
          <div className="lg:col-span-2">
            <select
              value={jurisdictionFilter}
              onChange={(e) => setJurisdictionFilter(e.target.value)}
              className="w-full px-3 py-2 bg-[#05131F] border border-white/10 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#D4AF37] cursor-pointer"
            >
              {JURISDICTION_OPTIONS.map((j) => (
                <option key={j} value={j}>
                  {j}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range: From (2 cols) */}
          <div className="lg:col-span-2">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              title="From Date"
              className="w-full px-2.5 py-2 bg-[#05131F] border border-white/10 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          {/* Date Range: To (2 cols) */}
          <div className="lg:col-span-2 flex items-center gap-2">
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              title="To Date"
              className="w-full px-2.5 py-2 bg-[#05131F] border border-white/10 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#D4AF37]"
            />

            {(searchQuery ||
              statusFilter !== 'All' ||
              jurisdictionFilter !== 'All Jurisdictions' ||
              fromDate ||
              toDate) && (
              <button
                onClick={clearFilters}
                className="p-2 text-white/50 hover:text-rose-400 transition-colors shrink-0"
                title="Reset all filters"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Summary Bar */}
        <div className="flex flex-wrap items-center justify-between text-xs font-mono text-white/50 pt-2 border-t border-white/5">
          <div>
            Showing <span className="text-[#D4AF37] font-semibold">{filteredLeads.length}</span> of{' '}
            <span className="text-white">{leads.length}</span> leads matching criteria
          </div>
          {totalPages > 1 && (
            <div>
              Page {currentPage} of {totalPages}
            </div>
          )}
        </div>
      </div>

      {/* Responsive Data Table */}
      <div className="bg-[#0A1E30] border border-[#0C2D48] rounded-2xl shadow-xl shadow-black/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-[#05131F] border-b border-[#0C2D48] text-white/60 uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 font-semibold">Ref ID</th>
                <th className="py-3.5 px-4 font-semibold">Date</th>
                <th className="py-3.5 px-4 font-semibold">Client</th>
                <th className="py-3.5 px-4 font-semibold">Contact Info</th>
                <th className="py-3.5 px-4 font-semibold">Jurisdiction</th>
                <th className="py-3.5 px-4 font-semibold">Activity</th>
                <th className="py-3.5 px-3 font-semibold text-center">Visas</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Instant Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-white/50">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#D4AF37] mb-2" />
                    <span>Loading leads ledger from database...</span>
                  </td>
                </tr>
              ) : paginatedLeads.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-white/50">
                    <Users className="w-8 h-8 mx-auto text-white/20 mb-2" />
                    <p className="font-semibold text-white/70">
                      No leads match the specified criteria.
                    </p>
                    <p className="text-xs text-white/40 mt-1">
                      Try clearing filters or search parameters.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedLeads.map((lead) => {
                  const isUpdating = updatingId === lead.id;
                  const waUrl = getWhatsAppUrl(lead.phone, lead.name);
                  const cleanTel = (lead.phone || '').replace(/\s+/g, '');

                  return (
                    <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors group">
                      {/* Ref ID */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-semibold text-[#D4AF37] group-hover:underline">
                          {lead.reference_number || lead.id.slice(0, 8)}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-white/70">
                        {formatDate(lead.timestamp || lead.created_at)}
                      </td>

                      {/* Name */}
                      <td className="py-3.5 px-4 font-sans font-medium text-white whitespace-nowrap">
                        {lead.name || 'Anonymous Founder'}
                      </td>

                      {/* Contact Info (Email & Phone) */}
                      <td className="py-3.5 px-4 space-y-0.5">
                        <div className="text-white/80 hover:text-white transition-colors">
                          <a href={`mailto:${lead.email}`} className="hover:underline">
                            {lead.email}
                          </a>
                        </div>
                        <div className="text-white/50 text-[11px] font-mono">{lead.phone}</div>
                      </td>

                      {/* Jurisdiction */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-white/80 text-[11px]">
                          <Building2 className="w-3 h-3 text-[#D4AF37]" />
                          <span>{lead.jurisdiction || 'UAE General'}</span>
                        </span>
                      </td>

                      {/* Activity */}
                      <td
                        className="py-3.5 px-4 max-w-[180px] truncate text-white/70"
                        title={lead.activity}
                      >
                        {lead.activity || 'Commercial Consulting'}
                      </td>

                      {/* Visas */}
                      <td className="py-3.5 px-3 text-center text-white/80">
                        {lead.visa_count !== null && lead.visa_count !== undefined
                          ? lead.visa_count
                          : '—'}
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="relative inline-block">
                          <select
                            value={lead.status}
                            disabled={isUpdating}
                            onChange={(e) =>
                              handleStatusChange(lead.id, e.target.value as LeadRecord['status'])
                            }
                            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold border cursor-pointer focus:outline-none transition-all ${getStatusBadgeClass(
                              lead.status
                            )} disabled:opacity-50`}
                          >
                            {STATUS_OPTIONS.map((st) => (
                              <option key={st} value={st} className="bg-[#05131F] text-white">
                                {st}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>

                      {/* 1-Click Action Buttons */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          {/* WhatsApp wa.me Link */}
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#22C55E]/15 hover:bg-[#22C55E]/25 text-[#22C55E] border border-[#22C55E]/30 text-xs font-mono transition-all shadow-sm"
                            title={`Chat with ${lead.name} on WhatsApp`}
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">WhatsApp</span>
                          </a>

                          {/* Phone Dialer */}
                          <a
                            href={`tel:${cleanTel}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#0C2D48] hover:bg-[#103859] text-white/80 hover:text-white border border-white/10 text-xs font-mono transition-all"
                            title={`Dial ${lead.phone}`}
                          >
                            <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
                            <span className="hidden sm:inline">Call</span>
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 bg-[#05131F] border-t border-[#0C2D48] flex items-center justify-between text-xs font-mono text-white/60">
            <div>
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredLeads.length)} of {filteredLeads.length}{' '}
              leads
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg bg-[#0A1E30] hover:bg-[#0C2D48] border border-white/10 text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              <span className="px-2 text-white/80">
                {currentPage} / {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg bg-[#0A1E30] hover:bg-[#0C2D48] border border-white/10 text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminLeadsPage;
