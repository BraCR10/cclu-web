import { ComingSoon } from '@/shared/components/ComingSoon';

const SECTION = {
  label: 'Recuperar su contraseña',
  summary:
    'Todavía estamos construyendo este paso. Mientras tanto, escriba a la Cámara y le restablecemos el acceso.',
  coming: [
    'Pida el enlace escribiendo el correo con el que se registró.',
    'La Cámara le envía un enlace temporal a ese correo.',
    'Desde el enlace establece una contraseña nueva, sin necesitar la anterior.',
  ],
} as const;

export const metadata = {
  title: 'Recuperar su contraseña',
};

export default function ForgottenPasswordPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <ComingSoon section={SECTION} />
    </main>
  );
}
