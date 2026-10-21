'use client';

import { useEffect, useState } from 'react';
import { useErrorFeedback } from '@/shared/errors/useErrorFeedback';
import { saveFile } from '@/shared/utils/saveFile';
import {
  exportReport,
  NO_REPORT_FILTERS,
  readReport,
  readReportCatalog,
  type ExportFormat,
  type Report,
  type ReportDefinition,
  type ReportFilters,
} from '../api/reports';

type Generated = { type: string; filters: Partial<ReportFilters>; page: number };
type Answer = { request: Generated; report: Report | null; failed: boolean };

// Only the filters the report takes travel with it, so a choice left from
// another report cannot narrow this one unseen.
function filtersOf(definition: ReportDefinition, filters: ReportFilters): Partial<ReportFilters> {
  return Object.fromEntries(definition.filters.map((name) => [name, filters[name]]));
}

// A-10: the report is chosen and filtered as a draft, and nothing is read until
// it is generated; paging and exporting follow what was generated.
export function useReports() {
  const showError = useErrorFeedback();
  const [catalog, setCatalog] = useState<ReportDefinition[] | null>(null);
  const [catalogFailed, setCatalogFailed] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [filters, setFilters] = useState<ReportFilters>(NO_REPORT_FILTERS);
  const [generated, setGenerated] = useState<Generated | null>(null);
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [exporting, setExporting] = useState<ExportFormat | null>(null);

  useEffect(() => {
    let cancelled = false;

    readReportCatalog()
      .then(({ items }) => {
        if (!cancelled) {
          setCatalog(items);
          setSelected(items.find((item) => item.available)?.type ?? null);
        }
      })
      .catch(() => !cancelled && setCatalogFailed(true));

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (generated === null) {
      return;
    }

    let cancelled = false;

    readReport(generated.type, generated.filters, generated.page)
      .then((report) => !cancelled && setAnswer({ request: generated, report, failed: false }))
      .catch(() => !cancelled && setAnswer({ request: generated, report: null, failed: true }));

    return () => {
      cancelled = true;
    };
  }, [generated]);

  const definition = catalog?.find((item) => item.type === selected) ?? null;
  const isCurrent = answer !== null && answer.request === generated;

  function generate() {
    if (definition !== null && definition.available) {
      setGenerated({ type: definition.type, filters: filtersOf(definition, filters), page: 1 });
    }
  }

  async function download(format: ExportFormat) {
    if (generated === null) {
      return;
    }

    setExporting(format);

    try {
      saveFile(
        await exportReport(generated.type, generated.filters, format),
        `reporte-${generated.type}.${format}`,
      );
    } catch (error) {
      showError(error);
    } finally {
      setExporting(null);
    }
  }

  return {
    catalog,
    catalogFailed,
    definition,
    select: setSelected,
    filters,
    changeFilters: (changes: Partial<ReportFilters>) =>
      setFilters((current) => ({ ...current, ...changes })),
    generate,
    generated: generated !== null,
    report: answer?.report ?? null,
    loading: generated !== null && !isCurrent,
    failed: isCurrent && answer.failed,
    showPage: (page: number) =>
      setGenerated((current) => (current === null ? current : { ...current, page })),
    exporting,
    download,
  };
}
