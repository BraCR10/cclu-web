'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { CONTROL_CLASS, Field } from '@/shared/components/Field';
import {
  fetchCantons,
  fetchSectors,
  type Canton,
  type Sector,
} from '@/modules/members/api/registration';

export type SearchFilterValues = { name?: string; canton?: string; sector?: string };

type SearchFiltersProps = {
  idPrefix: string;
  namePlaceholder: string;
  onSearch: (filters: SearchFilterValues) => void;
  loadCantons?: () => Promise<Canton[]>;
  loadSectors?: () => Promise<Sector[]>;
};

// The same three criteria the ERS asks of every catalog: free text, canton and
// sector, combinable (CA-MKT-002/004/006/008).
export function SearchFilters({
  idPrefix,
  namePlaceholder,
  onSearch,
  loadCantons = fetchCantons,
  loadSectors = fetchSectors,
}: SearchFiltersProps) {
  const [cantons, setCantons] = useState<Canton[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [name, setName] = useState('');
  const [canton, setCanton] = useState('');
  const [sector, setSector] = useState('');

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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSearch({
      name: name.trim() === '' ? undefined : name.trim(),
      canton: canton === '' ? undefined : canton,
      sector: sector === '' ? undefined : sector,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-4 rounded-panel border border-border bg-surface-raised p-6 sm:grid-cols-3"
    >
      <Field id={`${idPrefix}-name`} label="Buscar">
        {(control) => (
          <input
            {...control}
            id={`${idPrefix}-name`}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={namePlaceholder}
            className={CONTROL_CLASS}
          />
        )}
      </Field>

      <Field id={`${idPrefix}-canton`} label="Cantón">
        {(control) => (
          <select
            {...control}
            id={`${idPrefix}-canton`}
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

      <Field id={`${idPrefix}-sector`} label="Sector">
        {(control) => (
          <select
            {...control}
            id={`${idPrefix}-sector`}
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
          className="rounded-control bg-brand px-6 py-2.5 font-medium text-on-brand"
        >
          Buscar
        </button>
      </div>
    </form>
  );
}
