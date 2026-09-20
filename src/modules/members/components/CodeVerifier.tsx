'use client';

import { useState, type FormEvent } from 'react';
import { ApiError } from '@/shared/api/request';
import { CheckCircleIcon, CrossCircleIcon } from '@/shared/components/icons';
import { MEMBER_TYPE_LABELS } from '@/modules/admin/applicationLabels';
import { verifyMemberCode, type VerificationResult } from '../api/verification';

type CodeVerifierProps = {
  verify?: (code: string) => Promise<VerificationResult>;
};

const MESSAGES = {
  tooMany: 'Demasiadas consultas. Espere unos minutos e intente de nuevo.',
  unavailable: 'No fue posible verificar el código. Intente de nuevo en unos momentos.',
};

export function CodeVerifier({ verify = verifyMemberCode }: CodeVerifierProps) {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult(null);
    setProblem(null);
    setChecking(true);

    try {
      setResult(await verify(code.trim()));
    } catch (caught) {
      setProblem(
        caught instanceof ApiError && caught.status === 429
          ? MESSAGES.tooMany
          : MESSAGES.unavailable,
      );
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 rounded-panel border border-border bg-surface-raised p-6"
      >
        <label htmlFor="member-code" className="text-sm font-medium">
          Código de agremiado
        </label>
        <p className="text-sm text-content-muted">
          Escríbalo como aparece en el carné. No importan las mayúsculas ni los guiones.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="member-code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            required
            autoComplete="off"
            spellCheck={false}
            placeholder="M-A7K2-Q4"
            className="flex-1 rounded-control border border-border bg-surface px-4 py-3 font-mono text-lg tracking-widest tabular-nums uppercase outline-none focus-visible:ring-2 focus-visible:ring-brand"
          />
          <button
            type="submit"
            disabled={checking || code.trim() === ''}
            className="rounded-control bg-brand px-6 py-3 font-medium text-on-brand disabled:opacity-50"
          >
            {checking ? 'Verificando…' : 'Verificar'}
          </button>
        </div>
      </form>

      {problem !== null && (
        <p
          role="alert"
          className="rounded-control bg-highlight px-4 py-3 text-sm text-on-highlight"
        >
          {problem}
        </p>
      )}

      {result !== null && result.valid && (
        <div
          role="status"
          className="animate-panel-in flex flex-col gap-4 rounded-panel border border-support bg-surface-raised p-6"
        >
          <div className="flex items-center gap-3">
            <CheckCircleIcon className="size-6 text-support" />
            <p className="font-medium">Afiliado de la Cámara</p>
          </div>

          <dl className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <dt className="text-xs tracking-wide text-content-muted uppercase">Nombre</dt>
              <dd className="font-medium">{result.member.businessName}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-xs tracking-wide text-content-muted uppercase">Código</dt>
              <dd className="font-mono tabular-nums">{result.member.memberCode}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-xs tracking-wide text-content-muted uppercase">Tipo</dt>
              <dd>{MEMBER_TYPE_LABELS[result.member.memberType]}</dd>
            </div>
            {result.member.sector !== null && (
              <div className="flex flex-col gap-1">
                <dt className="text-xs tracking-wide text-content-muted uppercase">Sector</dt>
                <dd>{result.member.sector}</dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {result !== null && !result.valid && (
        <div
          role="status"
          className="animate-panel-in flex items-start gap-3 rounded-panel border border-border bg-surface-raised p-6"
        >
          <CrossCircleIcon className="mt-0.5 size-6 text-content-muted" />
          <div className="flex flex-col gap-1">
            <p className="font-medium">Ese código no corresponde a un afiliado</p>
            <p className="text-sm text-content-muted">
              Verifique que lo escribió completo. Si está seguro, la afiliación puede no estar
              vigente.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
