import { z } from 'zod';
import { TIPOS_LOGRADOURO, UFS, TIPOS_IMOVEL } from './shared/constants.js';

export function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) throw new Error('Email inválido');
  return email.toLowerCase();
}

export function validateNumber(value) {
  const num = Number(value);
  if (isNaN(num) || num < 0) throw new Error('Número inválido');
  return num;
}

export const EnderecoSchema = z.object({
  tipo_logradouro: z.string().transform(v => TIPOS_LOGRADOURO.find(t => t.toLowerCase() === v.toLowerCase()) || v).pipe(z.enum(TIPOS_LOGRADOURO)),
  logradouro: z.string().trim().min(1),
  numero: z.string().trim().min(1),
  complemento: z.string().trim().optional(),
  bairro: z.string().trim().min(1),
  cep: z.string().regex(/^\d{5}-\d{3}$/, 'CEP deve estar no formato 00000-000'),
  cidade: z.string().trim().min(1),
  uf: z.string().transform(v => v.toUpperCase()).pipe(z.enum(UFS))
});

export const InteresseSchema = z.object({
  quartos: z.coerce.number().min(0).refine((val) => validateNumber(val) !== null),
  tamanho_min_m2: z.coerce.number().min(1).refine((val) => validateNumber(val) !== null),
  area_lazer: z.union([z.boolean(), z.string().transform(val => val === 'true')]),
  bairro: z.string().trim().min(1),
  cidade: z.string().trim().min(1),
  uf: z.string().transform(v => v.toUpperCase()).pipe(z.enum(UFS)),
  valor_maximo: z.coerce.number().min(0).refine((val) => validateNumber(val) !== null)
});

export const ClienteSchema = z.object({
  nome: z.string().trim().min(1),
  endereco: EnderecoSchema,
  telefone: z.string().trim().min(1),
  email: z.string().trim().refine((val) => {
    try { validateEmail(val); return true; } catch { return false; }
  }, { message: "Email inválido" }),
  tipo: z.union([
    z.string().transform(val => [val]),
    z.array(z.string())
  ]).transform(arr => {
    const valid = ['vendedor', 'comprador'];
    const filtered = arr.filter(t => valid.includes(t.toLowerCase()));
    if (filtered.length === 0) throw new Error('tipo deve conter vendedor, comprador ou ambos');
    return [...new Set(filtered.map(t => t.toLowerCase()))];
  }),
  interesses: z.array(InteresseSchema).optional().default([])
});

export const ImovelSchema = z.object({
  tipo: z.string().transform(v => TIPOS_IMOVEL.find(t => t.toLowerCase() === v.toLowerCase()) || v).pipe(z.enum(TIPOS_IMOVEL)),
  endereco: EnderecoSchema,
  preco: z.coerce.number().min(0).refine((val) => validateNumber(val) !== null, { message: "Preço inválido" }),
  data_construcao: z.coerce.date().refine((date) => !isNaN(date.getTime()), { message: "Data inválida" }),
  ocupado: z.union([z.boolean(), z.string().transform(val => val === 'true')]),
  dono_id: z.union([z.string(), z.number()]) // Convertido para Number nas rotas
});

export const VisitaSchema = z.object({
  imovel_id: z.union([z.string(), z.number()]),
  cliente_id: z.union([z.string(), z.number()]),
  data_hora: z.coerce.date().refine((date) => !isNaN(date.getTime()), { message: "Data e hora inválidas" }),
  observacao: z.string().trim().optional()
});

// Wrapper functions
export function normalizeCliente(body, partial = false) {
  const schema = partial ? ClienteSchema.partial() : ClienteSchema;
  return schema.parse(body);
}

export function normalizeInteresse(body) {
  return InteresseSchema.parse(body);
}

export function normalizeImovel(body, partial = false) {
  const schema = partial ? ImovelSchema.partial() : ImovelSchema;
  return schema.parse(body);
}

export function normalizeVisita(body, partial = false) {
  const schema = partial ? VisitaSchema.partial() : VisitaSchema;
  return schema.parse(body);
}
