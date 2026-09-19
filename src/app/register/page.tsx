import { BrandMark } from '@/shared/components/BrandMark';
import { MemberRegistrationForm } from '@/modules/members/components/MemberRegistrationForm';

export const metadata = {
  title: 'Registro de agremiados',
};

export default function RegisterPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="relative overflow-hidden bg-linear-to-br from-wash-from to-wash-to text-on-wash">
        {/* The sun of the mark, enlarged and bled off the corner. */}
        <div className="pointer-events-none absolute -top-36 -right-20 size-[26rem] rounded-full bg-highlight opacity-40 blur-[100px]" />

        <div className="relative mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-12">
          <BrandMark size="sm" />

          <div className="flex flex-col gap-3">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Solicitud de afiliación
            </h1>
            <p className="max-w-prose opacity-80">
              Complete los datos de su comercio o de su actividad profesional. La Cámara revisará la
              solicitud antes de activar la afiliación.
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-6 py-12">
        <MemberRegistrationForm />
      </main>
    </div>
  );
}
