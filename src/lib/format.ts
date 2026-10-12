import type { Projekt } from './obsah';

const MESICE = ['leden', 'únor', 'březen', 'duben', 'květen', 'červen', 'červenec', 'srpen', 'září', 'říjen', 'listopad', 'prosinec'];

/** "2024-04" → "duben 2024", "2025" → "2025" */
export function datumSlovy(d: string): string {
  const [rok, mesic] = d.split('-');
  return mesic ? `${MESICE[Number(mesic) - 1]} ${rok}` : rok;
}

/** Období realizace v textu bez pomlček: "od dubna 2024 do června 2028", "od roku 2004, průběžně". */
export function obdobiSlovy(p: Projekt): string {
  const o = p.data.obdobi;
  if (!o?.zacatek) return '';
  const od = datumSlovy(o.zacatek);
  if (o.prubezne || !o.konec) return `od ${od.includes(' ') ? od : 'roku ' + od}, průběžně`;
  if (o.zacatek === o.konec) return datumSlovy(o.zacatek);
  return `${datumSlovy(o.zacatek)} až ${datumSlovy(o.konec)}`;
}

export type Stav = 'planovano' | 'probiha' | 'ukonceno';
export const STAV_NAZEV: Record<Stav, string> = { planovano: 'Plánováno', probiha: 'Probíhá', ukonceno: 'Ukončeno' };

/** Stav se dopočítá z období k datu sestavení webu, pokud není v souboru uveden ručně. */
export function stavProjektu(p: Projekt, dnes = new Date()): Stav | undefined {
  if (p.data.stav) return p.data.stav;
  const o = p.data.obdobi;
  if (!o?.zacatek) return undefined;
  const mesic = dnes.getFullYear() * 12 + dnes.getMonth();
  const naMesic = (d: string, konec: boolean) => {
    const [r, m] = d.split('-').map(Number);
    return r * 12 + (m ? m - 1 : konec ? 11 : 0);
  };
  if (naMesic(o.zacatek, false) > mesic) return 'planovano';
  if (!o.prubezne && o.konec && naMesic(o.konec, true) < mesic) return 'ukonceno';
  return 'probiha';
}

export const CILOVE_SKUPINY_NAZEV: Record<string, string> = {
  obcane: 'Občané',
  obce: 'Obce, města a regiony',
  podnikatele: 'Podnikatelé a MSP',
  'velke-podniky': 'Velké podniky',
  studenti: 'Žáci a studenti',
  'verejny-sektor': 'Veřejný sektor',
  'neziskovy-sektor': 'Neziskový sektor',
};

export const ROLE_NAZEV: Record<string, string> = {
  vedouci: 'Vedoucí',
  'spoluprace-interni': 'Spolupráce interní',
  'spoluprace-externi': 'Spolupráce externí',
};
