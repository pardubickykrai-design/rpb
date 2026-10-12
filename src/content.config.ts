// Schéma obsahu webu (MASTER, kapitola 5). Chybné pole v souboru zastaví build.
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

export const TEMATA = [
  'udrzitelnost-a-cirkularni-ekonomika',
  'podnikani-a-inovace',
  'vzdelavani',
  'problemove-regiony',
  'cestovni-ruch',
  'socialni-veci',
] as const;

export const CILOVE_SKUPINY = [
  'obcane',
  'obce',
  'podnikatele',
  'velke-podniky',
  'studenti',
  'verejny-sektor',
  'neziskovy-sektor',
] as const;

// overeno: potvrdila organizace; podklad: převzato z publikace nebo final.docx.
// Oba stavy se zobrazují. k-overeni a nedolozeno se na web nedostanou (MASTER, kapitola 9).
const stavOvereni = z.enum(['overeno', 'podklad', 'k-overeni', 'nedolozeno']);

const datum = z.string().regex(/^\d{4}(-\d{2})?$/, 'Použijte formát RRRR nebo RRRR-MM');

const temata = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/temata' }),
  schema: z.object({
    nazev: z.string(),
    cislo: z.number().int().min(1).max(6),
    barva: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    barva_plocha: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    text_na_plose: z.enum(['bila', 'nocni-modra']),
    uvod: z.string().default(''),
  }),
});

const projekty = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/projekty' }),
  schema: z.object({
    nazev: z.string(),
    kratky_nazev: z.string().optional(),
    tema: z.enum(TEMATA),
    typ: z.enum(['projekt', 'oblast']),
    perex: z.string().max(200).default(''),
    cilove_skupiny: z.array(z.enum(CILOVE_SKUPINY)).default([]),
    organizace: z
      .array(
        z.object({
          id: z.string(),
          role: z.enum(['vedouci', 'spoluprace-interni', 'spoluprace-externi']),
        }),
      )
      .default([]),
    obdobi: z
      .object({
        zacatek: datum.optional(),
        konec: datum.optional(),
        prubezne: z.boolean().default(false),
      })
      .optional(),
    stav: z.enum(['planovano', 'probiha', 'ukonceno']).optional(),
    financovani: z.array(z.string()).default([]),
    nastroje: z.array(z.string()).default([]),
    overeno: z
      .object({
        popis: stavOvereni.default('podklad'),
        harmonogram: stavOvereni.default('podklad'),
        financovani: stavOvereni.default('podklad'),
        vysledky: stavOvereni.default('podklad'),
      })
      .default({ popis: 'podklad', harmonogram: 'podklad', financovani: 'podklad', vysledky: 'podklad' }),
    aktualizovano: z.string().optional(),
    poradi: z.number().default(100),
  }),
});

export const collections = { temata, projekty };
