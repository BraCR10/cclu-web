export type ThemeChoice = 'system' | 'light' | 'dark';

export const THEME_STORAGE_KEY = 'cclu-theme';

export function isThemeChoice(value: unknown): value is ThemeChoice {
  return value === 'system' || value === 'light' || value === 'dark';
}

// The attribute is the only thing the stylesheet reads. Absent means the
// operating system decides, which is what "system" means.
export function applyThemeChoice(choice: ThemeChoice, root: HTMLElement): void {
  if (choice === 'system') {
    root.removeAttribute('data-theme');
    return;
  }

  root.setAttribute('data-theme', choice);
}

// Runs before the first paint, inlined in the document head. Without it the
// page paints with the system scheme and then corrects itself, which is a
// flash of the wrong colours on every load.
export const THEME_BOOTSTRAP_SCRIPT = `(function(){try{var c=localStorage.getItem('${THEME_STORAGE_KEY}');if(c==='light'||c==='dark'){document.documentElement.setAttribute('data-theme',c)}}catch(e){}})()`;
