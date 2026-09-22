'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { CONTROL_CLASS, Field } from '@/shared/components/Field';
import {
  fetchCantons,
  fetchSectors,
  type Canton,
  type Sector,
} from '@/modules/members/api/registration';
import { formatMemberCode } from '@/shared/format';
import {
  fetchReport,
  REPORT_TYPES,
  REPORT_TYPE_LABELS,
  type MemberReportRow,
  type PublicationReportRow,
  type Report,
  type ReportFilters,
  type ReportType,
} from '../api/reports';

const dateFormatter = new Intl.DateTimeFormat('es-CR', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

const MEMBER_REPORT_TYPES: ReportType[] = [
  REPORT_TYPES.MEMBERS,
  REPORT_TYPES.PAID_MEMBERS,
  REPORT_TYPES.UNPAID_MEMBERS,
];

type ReportsPanelProps = {
  loadReport?: (type: ReportType, filters: ReportFilters) => Promise<Report>;
  loadCantons?: () => Promise<Canton[]>;
  loadSectors?: () => Promise<Sector[]>;
};

function MemberRows({ rows }: { rows: MemberReportRow[] }) {
  return (
    <table className="w-full min-w-[40rem] text-left text-sm">
      <thead>
        <tr className="border-b border-border text-xs tracking-wide text-content-muted uppercase">
          <th className="py-2 pr-4 font-medium">Comercio</th>
          <th className="py-2 pr-4 font-medium">Código</th>
          <th className="py-2 pr-4 font-medium">Correo</th>
          <th className="py-2 pr-4 font-medium">Cantón</th>
          <th className="py-2 pr-4 font-medium">Sector</th>
          <th className="py-2 font-medium">Membresía</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr key={index} className="border-b border-border last:border-b-0">
            <td className="py-2 pr-4">{row.businessName}</td>
            <td className="py-2 pr-4 font-mono text-xs">
              {row.memberCode ? formatMemberCode(row.memberCode) : '—'}
            </td>
            <td className="py-2 pr-4">{row.email}</td>
            <td className="py-2 pr-4">{row.canton ?? '—'}</td>
            <td className="py-2 pr-4">{row.sector ?? '—'}</td>
            <td className="py-2">{row.membership === 'paid' ? 'Paga' : 'Gratuita'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function PublicationRows({ rows }: { rows: PublicationReportRow[] }) {
  return (
    <table className="w-full min-w-[40rem] text-left text-sm">
      <thead>
        <tr className="border-b border-border text-xs tracking-wide text-content-muted uppercase">
          <th className="py-2 pr-4 font-medium">Publicación</th>
          <th className="py-2 pr-4 font-medium">Comercio</th>
          <th className="py-2 pr-4 font-medium">Cantón</th>
          <th className="py-2 pr-4 font-medium">Sector</th>
          <th className="py-2 font-medium">Publicada</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr key={index} className="border-b border-border last:border-b-0">
            <td className="max-w-64 truncate py-2 pr-4">{row.title ?? row.description ?? '—'}</td>
            <td className="py-2 pr-4">{row.businessName}</td>
            <td className="py-2 pr-4">{row.canton ?? '—'}</td>
            <td className="py-2 pr-4">{row.sector ?? '—'}</td>
            <td className="py-2">{dateFormatter.format(new Date(row.createdAt))}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function ReportsPanel({
  loadReport = fetchReport,
  loadCantons = fetchCantons,
  loadSectors = fetchSectors,
}: ReportsPanelProps) {
  const [cantons, setCantons] = useState<Canton[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [type, setType] = useState<ReportType>(REPORT_TYPES.MEMBERS);
  const [canton, setCanton] = useState('');
  const [sector, setSector] = useState('');
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let stillMounted = true;

    Promise.all([loadCantons(), loadSectors()])
      .then(([cantonList, sectorList]) => {
        if (stillMounted) {
          setCantons(cantonList);
          setSectors(sectorList);
        }
      })
      .catch(() => {});

    return () => {
      stillMounted = false;
    };
  }, [loadCantons, loadSectors]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setFailed(false);

    try {
      setReport(
        await loadReport(type, {
          ...(canton === '' ? {} : { canton }),
          ...(sector === '' ? {} : { sector }),
        }),
      );
    } catch {
      setFailed(true);
      setReport(null);
    } finally {
      setLoading(false);
    }
  }

  const isMemberReport = report !== null && MEMBER_REPORT_TYPES.includes(report.type);

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-panel border border-border bg-surface-raised p-6 sm:grid-cols-3"
      >
        <Field id="report-type" label="Tipo de reporte">
          {(control) => (
            <select
              {...control}
              id="report-type"
              value={type}
              onChange={(event) => setType(event.target.value as ReportType)}
              className={CONTROL_CLASS}
            >
              {Object.values(REPORT_TYPES).map((value) => (
                <option key={value} value={value}>
                  {REPORT_TYPE_LABELS[value]}
                </option>
              ))}
            </select>
          )}
        </Field>

        <Field id="report-canton" label="Cantón">
          {(control) => (
            <select
              {...control}
              id="report-canton"
              value={canton}
              onChange={(event) => setCanton(event.target.value)}
              className={CONTROL_CLASS}
            >
              <option value="">Todos</option>
              {cantons.map((found) => (
                <option key={found._id} value={found._id}>
                  {found.name}
                </option>
              ))}
            </select>
          )}
        </Field>

        <Field id="report-sector" label="Sector">
          {(control) => (
            <select
              {...control}
              id="report-sector"
              value={sector}
              onChange={(event) => setSector(event.target.value)}
              className={CONTROL_CLASS}
            >
              <option value="">Todos</option>
              {sectors.map((found) => (
                <option key={found._id} value={found._id}>
                  {found.name}
                </option>
              ))}
            </select>
          )}
        </Field>

        <div className="flex justify-end sm:col-span-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-control bg-brand px-6 py-2.5 font-medium text-on-brand disabled:opacity-50"
          >
            {loading ? 'Generando…' : 'Generar reporte'}
          </button>
        </div>
      </form>

      {failed && (
        <p role="alert" className="text-sm text-danger">
          No fue posible generar el reporte. Intente de nuevo.
        </p>
      )}

      {report !== null && (
        <section className="flex flex-col gap-4 rounded-panel border border-border bg-surface-raised p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-semibold tracking-tight">{REPORT_TYPE_LABELS[report.type]}</h3>
            <span className="text-sm text-content-muted">
              {report.total} {report.total === 1 ? 'resultado' : 'resultados'}
            </span>
          </div>

          {report.rows.length === 0 ? (
            <p className="text-sm text-content-muted">
              No hay resultados con los criterios aplicados.
            </p>
          ) : (
            <div className="overflow-x-auto">
              {isMemberReport ? (
                <MemberRows rows={report.rows as MemberReportRow[]} />
              ) : (
                <PublicationRows rows={report.rows as PublicationReportRow[]} />
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
