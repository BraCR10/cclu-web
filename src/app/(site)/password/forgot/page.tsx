import { ForgottenPasswordForm } from '@/shared/components/ForgottenPasswordForm';
import { BackLink } from '@/shared/components/BackLink';

export const metadata = {
  title: 'Recuperar su contraseña',
};

export default function ForgottenPasswordPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16">
      <BackLink href="/login" label="Volver a iniciar sesión" />

      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">Recuperar su contraseña</h1>
        <p className="max-w-prose text-content-muted">
          Escriba el correo de su cuenta y le enviaremos un enlace para establecer una nueva.
        </p>
      </div>

      <ForgottenPasswordForm />
    </main>
  );
}
