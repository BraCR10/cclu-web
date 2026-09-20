type PanelHeadingProps = {
  title: string;
  subtitle?: string;
};

// Each screen says what it is. The shell around it does not, because the shell
// outlives the screen and would have to be told on every navigation.
export function PanelHeading({ title, subtitle }: PanelHeadingProps) {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold tracking-tight text-brand lg:text-3xl">{title}</h1>
      {subtitle && <p className="text-content-muted">{subtitle}</p>}
    </div>
  );
}
