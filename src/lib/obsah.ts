import { getCollection, type CollectionEntry } from 'astro:content';

export type Tema = CollectionEntry<'temata'>;
export type Projekt = CollectionEntry<'projekty'>;

export interface TemaSPolozkami {
  tema: Tema;
  projekty: Projekt[];
  oblasti: Projekt[];
}

const podlePoradi = (a: Projekt, b: Projekt) =>
  a.data.poradi - b.data.poradi || a.data.nazev.localeCompare(b.data.nazev, 'cs');

/** Všech šest témat v pořadí podle čísla, každé s projekty a oblastmi. Počty se vždy počítají z dat. */
export async function nactiTemata(): Promise<TemaSPolozkami[]> {
  const temata = (await getCollection('temata')).sort((a, b) => a.data.cislo - b.data.cislo);
  const polozky = (await getCollection('projekty')).sort(podlePoradi);
  return temata.map((tema) => {
    const vTematu = polozky.filter((p) => p.data.tema === tema.id);
    return {
      tema,
      projekty: vTematu.filter((p) => p.data.typ === 'projekt'),
      oblasti: vTematu.filter((p) => p.data.typ === 'oblast'),
    };
  });
}

/** České skloňování podle počtu: sklonuj(3, ['projekt', 'projekty', 'projektů']). */
export function sklonuj(pocet: number, tvary: [string, string, string]): string {
  if (pocet === 1) return `${pocet} ${tvary[0]}`;
  if (pocet >= 2 && pocet <= 4) return `${pocet} ${tvary[1]}`;
  return `${pocet} ${tvary[2]}`;
}

export const zobrazovanyNazev = (p: Projekt) => p.data.kratky_nazev ?? p.data.nazev;

/** Barva textu na tematické ploše. */
export const textNaPlose = (t: Tema) =>
  t.data.text_na_plose === 'bila' ? 'var(--bila)' : 'var(--nocni-modra)';
