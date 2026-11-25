import crypto from 'crypto';
import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import JSZip from 'jszip';
import mammoth from 'mammoth';
import multer from 'multer';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import * as XLSX from 'xlsx';
import { INITIAL_PORTAL_DATA } from './src/data/initialPortalData';
import {
  AccessRole,
  AccountStatus,
  AuditLogEntry,
  AuthSessionUser,
  ChallengeType,
  CongratulationMessage,
  EditorialSection,
  InteractiveChallenge,
  ManagedAccount,
  ManagerPrivileges,
  PortalData,
} from './src/types/portal';

dotenv.config();

const PORT = 3000;
const app = express();
app.use(express.json({ limit: '15mb' }));

// --- Gemini AI Client (Server-Side Only) ---
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error('GEMINI_API_KEY não configurada no painel Settings > Secrets.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// --- In-Memory State (Portal Data, Uploaded Files, RBAC Directory & Audit Trail) ---
let portalData: PortalData = structuredClone(INITIAL_PORTAL_DATA);

interface StoredFile {
  id: string;
  originalName: string;
  mimeType: string;
  buffer: Buffer;
}
const uploadedFiles = new Map<string, StoredFile>();

interface ServerManagedAccount extends ManagedAccount {
  passwordHash?: string;
}

function nowFormatted(): string {
  return new Date().toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const FULL_PRIVILEGES: ManagerPrivileges = {
  canEditContent: true,
  canDeleteContent: true,
  canImportDocuments: true,
  canManageUsers: true,
};

function sanitizePrivileges(
  input: unknown,
  fallback: ManagerPrivileges = FULL_PRIVILEGES
): ManagerPrivileges {
  if (!input || typeof input !== 'object') return { ...fallback };
  const raw = input as Record<string, unknown>;
  return {
    canEditContent:
      typeof raw.canEditContent === 'boolean' ? raw.canEditContent : fallback.canEditContent,
    canDeleteContent:
      typeof raw.canDeleteContent === 'boolean' ? raw.canDeleteContent : fallback.canDeleteContent,
    canImportDocuments:
      typeof raw.canImportDocuments === 'boolean'
        ? raw.canImportDocuments
        : fallback.canImportDocuments,
    canManageUsers:
      typeof raw.canManageUsers === 'boolean' ? raw.canManageUsers : fallback.canManageUsers,
  };
}

const managedAccounts: ServerManagedAccount[] = [
  {
    id: 'acc-master-1',
    name: 'Willian Vianna',
    email: 'wjvianna2026@gmail.com',
    roleTitle: 'Responsável pelo Setor de RH · Acesso Master',
    sectorOrSite: 'Matriz - Cavalcante e Rolim Empreendimentos',
    accessRole: 'master',
    status: 'Ativo',
    photoUrl: '/src/assets/images/avatar_colaborador_3_1795629925432.jpg',
    createdAt: 'Configuração Inicial',
    createdByName: 'Sistema C&R',
    privileges: { ...FULL_PRIVILEGES },
  },
  {
    id: 'acc-mgr-1',
    name: 'Camila Albuquerque',
    email: 'camila.albuquerque@cavalcanterolim.com.br',
    roleTitle: 'Gerente de Pessoas & Cultura',
    sectorOrSite: 'Matriz - Cavalcante e Rolim Empreendimentos',
    accessRole: 'gestor',
    status: 'Ativo',
    photoUrl: '/src/assets/images/avatar_colaborador_2_1795629925418.jpg',
    createdAt: 'Configuração Inicial',
    createdByName: 'Willian Vianna',
    privileges: {
      canEditContent: true,
      canDeleteContent: false,
      canImportDocuments: true,
      canManageUsers: true,
    },
  },
  {
    id: 'acc-usr-1',
    name: 'Marina Vasconcelos',
    email: 'marina.vasconcelos@cavalcanterolim.com.br',
    roleTitle: 'Arquiteta de Coordenação',
    sectorOrSite: 'Manta - Cavalcante e Rolim Design SPE',
    accessRole: 'usuario',
    status: 'Ativo',
    photoUrl: '/src/assets/images/avatar_colaborador_2_1795629925418.jpg',
    createdAt: 'Configuração Inicial',
    createdByName: 'Willian Vianna',
  },
  {
    id: 'acc-usr-2',
    name: 'Beatriz Monteiro',
    email: 'beatriz.monteiro@cavalcanterolim.com.br',
    roleTitle: 'Analista de Suprimentos Sênior',
    sectorOrSite: 'Matriz - Cavalcante e Rolim Empreendimentos',
    accessRole: 'usuario',
    status: 'Ativo',
    photoUrl: '/src/assets/images/avatar_colaborador_2_1795629925418.jpg',
    createdAt: 'Configuração Inicial',
    createdByName: 'Willian Vianna',
  },
  {
    id: 'acc-usr-3',
    name: 'Ronaldo Santos Canuto',
    email: 'ronaldo.canuto@cavalcanterolim.com.br',
    roleTitle: 'Engenheiro Civil',
    sectorOrSite: 'Manta - Cavalcante e Rolim Design SPE',
    accessRole: 'usuario',
    status: 'Ativo',
    photoUrl: '/src/assets/images/avatar_colaborador_1_1795629924319.jpg',
    createdAt: 'Configuração Inicial',
    createdByName: 'Willian Vianna',
  },
  {
    id: 'acc-usr-4',
    name: 'Adeilton Antonio da Silva Santos Filho',
    email: 'adeilton.silva@cavalcanterolim.com.br',
    roleTitle: 'Encarregado de Manutenção',
    sectorOrSite: 'Watal Patacho Eco Boutique Residence SPE',
    accessRole: 'usuario',
    status: 'Ativo',
    photoUrl: '/src/assets/images/avatar_colaborador_3_1795629925432.jpg',
    createdAt: 'Configuração Inicial',
    createdByName: 'Willian Vianna',
  },
  {
    id: 'acc-usr-5',
    name: 'Luiz Farias Costa Neto',
    email: 'luiz.farias@cavalcanterolim.com.br',
    roleTitle: 'Pedreiro',
    sectorOrSite: 'Watal Patacho Eco Boutique Residence SPE',
    accessRole: 'usuario',
    status: 'Ativo',
    photoUrl: '/src/assets/images/avatar_colaborador_1_1795629924319.jpg',
    createdAt: 'Configuração Inicial',
    createdByName: 'Willian Vianna',
  },
];

const auditLogs: AuditLogEntry[] = [
  {
    id: 'aud-init-1',
    actorName: 'Willian Vianna',
    actorEmail: 'wjvianna2026@gmail.com',
    actorRole: 'master',
    action: 'Política de Acesso Master ativada no Portal RH de Todos',
    targetLabel: 'Governança & Segurança C&R',
    timestamp: 'Configuração Inicial',
  },
];

function recordAudit(actor: AuthSessionUser, action: string, targetLabel: string): void {
  auditLogs.unshift({
    id: `aud-${crypto.randomUUID().slice(0, 8)}`,
    actorName: actor.name,
    actorEmail: actor.email,
    actorRole: actor.accessRole,
    action,
    targetLabel,
    timestamp: nowFormatted(),
  });
  if (auditLogs.length > 100) {
    auditLogs.length = 100;
  }
}

function toPublicManagedAccount(acc: ServerManagedAccount): ManagedAccount {
  return {
    id: acc.id,
    name: acc.name,
    email: acc.email,
    roleTitle: acc.roleTitle,
    sectorOrSite: acc.sectorOrSite,
    accessRole: acc.accessRole,
    status: acc.status,
    photoUrl: acc.photoUrl,
    createdAt: acc.createdAt,
    createdByName: acc.createdByName,
    updatedAt: acc.updatedAt,
    updatedByName: acc.updatedByName,
    hasPassword: Boolean(acc.passwordHash) || acc.accessRole === 'master',
    privileges:
      acc.accessRole === 'master'
        ? { ...FULL_PRIVILEGES }
        : acc.accessRole === 'gestor'
          ? acc.privileges || { ...FULL_PRIVILEGES }
          : undefined,
  };
}

// --- Secure Multi-Manager & Master Authentication ---
const SESSION_SIGNING_KEY = crypto.randomBytes(32);
let claimedAdminHash: string | null = null;

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

function verifyScryptHash(password: string, stored: string): boolean {
  const [salt, keyHex] = stored.split(':');
  if (!salt || !keyHex) return false;
  const keyBuf = Buffer.from(keyHex, 'hex');
  const derivedBuf = crypto.scryptSync(password, salt, 64);
  if (keyBuf.length !== derivedBuf.length) return false;
  return crypto.timingSafeEqual(keyBuf, derivedBuf);
}

function verifyEnvPasscode(input: string, envPasscode: string): boolean {
  const inputDigest = crypto.createHash('sha256').update(input).digest();
  const envDigest = crypto.createHash('sha256').update(envPasscode).digest();
  return crypto.timingSafeEqual(inputDigest, envDigest);
}

function issueSessionToken(account: ServerManagedAccount): string {
  const payload = Buffer.from(
    JSON.stringify({
      sub: account.id,
      role: account.accessRole,
      exp: Date.now() + 1000 * 60 * 60 * 12,
      nonce: crypto.randomBytes(8).toString('hex'),
    })
  ).toString('base64url');
  const sig = crypto
    .createHmac('sha256', SESSION_SIGNING_KEY)
    .update(payload)
    .digest('base64url');
  return `${payload}.${sig}`;
}

function toAuthSessionUser(account: ServerManagedAccount): AuthSessionUser {
  return {
    id: account.id,
    name: account.name,
    email: account.email,
    roleTitle: account.roleTitle,
    sectorOrSite: account.sectorOrSite,
    photoUrl: account.photoUrl,
    accessRole: account.accessRole,
    privileges:
      account.accessRole === 'master'
        ? { ...FULL_PRIVILEGES }
        : account.accessRole === 'gestor'
          ? account.privileges || { ...FULL_PRIVILEGES }
          : undefined,
  };
}

function isSafeImageUrl(url: string): boolean {
  const trimmed = url.trim();
  return (
    trimmed.startsWith('/') ||
    trimmed.startsWith('data:image/') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('http://')
  );
}

function verifySessionToken(token: string): AuthSessionUser | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payload, sig] = parts;
  const expectedSig = crypto
    .createHmac('sha256', SESSION_SIGNING_KEY)
    .update(payload)
    .digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (
      (parsed.role !== 'master' && parsed.role !== 'gestor' && parsed.role !== 'usuario') ||
      typeof parsed.exp !== 'number' ||
      parsed.exp <= Date.now()
    ) {
      return null;
    }
    const account = managedAccounts.find((a) => a.id === parsed.sub);
    if (!account || account.status !== 'Ativo' || account.accessRole !== parsed.role) {
      return null;
    }
    return toAuthSessionUser(account);
  } catch {
    return null;
  }
}

interface AuthenticatedRequest extends Request {
  authActor?: AuthSessionUser;
}

function requireAuthenticated(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Autenticação obrigatória. Faça login para acessar o portal.' });
    return;
  }
  const token = authHeader.slice(7).trim();
  const actor = verifySessionToken(token);
  if (!actor) {
    res.status(401).json({ error: 'Sessão expirada, revogada ou inválida. Faça login novamente.' });
    return;
  }
  req.authActor = actor;
  next();
}

function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Acesso restrito a Gestor ou Master. Faça login administrativo.' });
    return;
  }
  const token = authHeader.slice(7).trim();
  const actor = verifySessionToken(token);
  if (!actor) {
    res.status(401).json({ error: 'Sessão expirada, revogada ou inválida.' });
    return;
  }
  if (actor.accessRole !== 'master' && actor.accessRole !== 'gestor') {
    res.status(403).json({
      error: 'Permissão insuficiente. Apenas Gestores ou Master podem inserir, corrigir ou excluir informações.',
    });
    return;
  }
  req.authActor = actor;
  next();
}

function requireMaster(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  requireAdmin(req, res, () => {
    if (req.authActor?.accessRole !== 'master') {
      res.status(403).json({
        error: 'Ação exclusiva do Gestor Master. Solicite ao Acesso Master para alterar privilégios ou promover gestores.',
      });
      return;
    }
    next();
  });
}

// --- Multer Config for Universal Document Import ---
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
});

// --- Auth & Access Policy Routes ---
app.get('/api/auth/status', (_req: Request, res: Response) => {
  const envPass = process.env.ADMIN_PASSCODE?.trim() ?? '';
  const hasEnvPasscode = envPass.length > 0;
  const needsBootstrap = !hasEnvPasscode && !claimedAdminHash;
  const masterAcc = managedAccounts.find((a) => a.accessRole === 'master');
  const activeGestoresCount = managedAccounts.filter(
    (a) => a.accessRole === 'gestor' && a.status === 'Ativo'
  ).length;
  res.json({
    needsBootstrap,
    hasEnvPasscode,
    masterName: masterAcc?.name || 'Master C&R',
    activeGestoresCount,
  });
});

// Public login gate context (non-sensitive brand styling & unactivated collaborator onboarding)
app.get('/api/portal/login-context', (_req: Request, res: Response) => {
  const envPass = process.env.ADMIN_PASSCODE?.trim() ?? '';
  const hasEnvPasscode = envPass.length > 0;
  const needsBootstrap = !hasEnvPasscode && !claimedAdminHash;
  const masterAcc = managedAccounts.find((a) => a.accessRole === 'master');
  const activeGestoresCount = managedAccounts.filter(
    (a) => a.accessRole === 'gestor' && a.status === 'Ativo'
  ).length;
  const unactivatedCollaborators = managedAccounts
    .filter((a) => a.accessRole === 'usuario' && a.status === 'Ativo' && !a.passwordHash)
    .map((a) => ({
      id: a.id,
      name: a.name,
      email: a.email,
      roleTitle: a.roleTitle,
      sectorOrSite: a.sectorOrSite,
    }));

  res.json({
    brand: {
      companyName: portalData.brand.companyName,
      tagline: portalData.brand.tagline,
      heroImage: portalData.brand.heroImage,
      customLogoUrl: portalData.brand.customLogoUrl,
    },
    needsBootstrap,
    masterName: masterAcc?.name || 'Willian Vianna',
    activeGestoresCount,
    unactivatedCollaborators,
  });
});

app.post('/api/auth/bootstrap', (req: Request, res: Response) => {
  const envPass = process.env.ADMIN_PASSCODE?.trim() ?? '';
  if (envPass.length > 0 || claimedAdminHash) {
    res.status(409).json({ error: 'A senha Master já foi configurada.' });
    return;
  }
  const password = typeof req.body?.password === 'string' ? req.body.password.trim() : '';
  if (password.length < 6) {
    res.status(400).json({ error: 'Defina uma senha com pelo menos 6 caracteres.' });
    return;
  }
  claimedAdminHash = hashPassword(password);
  const masterAcc = managedAccounts.find((a) => a.accessRole === 'master') || managedAccounts[0];
  const token = issueSessionToken(masterAcc);
  const actor = toAuthSessionUser(masterAcc);
  recordAudit(actor, 'Configuração de primeiro acesso Master', masterAcc.name);
  res.json({
    token,
    user: actor,
    message: 'Senha Master configurada e autenticada.',
  });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const identifier = typeof req.body?.identifier === 'string' ? req.body.identifier.trim().toLowerCase() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  if (!password) {
    res.status(400).json({ error: 'Informe a senha de acesso do Gestor ou Master.' });
    return;
  }

  const masterAcc = managedAccounts.find((a) => a.accessRole === 'master');
  const isMasterTarget =
    !identifier ||
    identifier === 'master' ||
    (masterAcc &&
      (masterAcc.email.toLowerCase() === identifier ||
        masterAcc.name.toLowerCase() === identifier));

  if (isMasterTarget && masterAcc) {
    const envPass = process.env.ADMIN_PASSCODE?.trim() ?? '';
    if (envPass.length > 0) {
      if (!verifyEnvPasscode(password, envPass)) {
        res.status(401).json({ error: 'Senha Master incorreta.' });
        return;
      }
    } else {
      if (!claimedAdminHash) {
        res.status(400).json({ error: 'Configure a senha de primeiro acesso Master antes de entrar.' });
        return;
      }
      if (!verifyScryptHash(password, claimedAdminHash)) {
        res.status(401).json({ error: 'Senha Master incorreta.' });
        return;
      }
    }

    const token = issueSessionToken(masterAcc);
    const actor = toAuthSessionUser(masterAcc);
    recordAudit(actor, 'Login no Modo Acesso Completo (Master)', masterAcc.name);
    res.json({ token, user: actor });
    return;
  }

  // Otherwise authenticate an active Gestor by email or name
  const targetAccount = managedAccounts.find(
    (a) =>
      a.email.toLowerCase() === identifier ||
      a.name.toLowerCase() === identifier
  );

  if (!targetAccount) {
    res.status(401).json({ error: 'Gestor não encontrado com este e-mail ou nome.' });
    return;
  }
  if (targetAccount.accessRole === 'usuario') {
    res.status(403).json({
      error: 'Esta conta possui perfil de Colaborador e não tem permissão para Modo Gestor.',
    });
    return;
  }
  if (targetAccount.status !== 'Ativo') {
    res.status(403).json({ error: 'Conta de Gestor inativa. Solicite reativação ao Acesso Master.' });
    return;
  }
  if (!targetAccount.passwordHash || !verifyScryptHash(password, targetAccount.passwordHash)) {
    res.status(401).json({ error: 'Credenciais de Gestor inválidas.' });
    return;
  }

  const token = issueSessionToken(targetAccount);
  const actor = toAuthSessionUser(targetAccount);
  recordAudit(actor, 'Login no Modo Acesso Completo (Gestor)', targetAccount.name);
  res.json({ token, user: actor });
});

// Collaborator Login (required before viewing/interacting in Collaborator Mode)
app.post('/api/auth/collaborator/login', (req: Request, res: Response) => {
  const identifier = typeof req.body?.identifier === 'string' ? req.body.identifier.trim().toLowerCase() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  if (!identifier || !password) {
    res.status(400).json({ error: 'Informe seu e-mail corporativo (ou nome) e sua senha.' });
    return;
  }

  const targetAccount = managedAccounts.find(
    (a) => a.email.toLowerCase() === identifier || a.name.toLowerCase() === identifier
  );

  if (!targetAccount) {
    res.status(401).json({ error: 'Cadastro não encontrado. Verifique seu e-mail corporativo com o RH.' });
    return;
  }
  if (targetAccount.status !== 'Ativo') {
    res.status(403).json({ error: 'Cadastro inativo no portal. Procure o Gestor ou o setor de RH.' });
    return;
  }

  if (targetAccount.accessRole === 'master') {
    const envPass = process.env.ADMIN_PASSCODE?.trim() ?? '';
    const valid =
      envPass.length > 0
        ? verifyEnvPasscode(password, envPass)
        : Boolean(claimedAdminHash && verifyScryptHash(password, claimedAdminHash));
    if (!valid) {
      res.status(401).json({ error: 'Senha inválida.' });
      return;
    }
  } else {
    if (!targetAccount.passwordHash) {
      res.status(403).json({
        error: 'Primeiro acesso pendente: ative sua senha pessoal na aba "Primeiro Acesso" antes de entrar.',
        needsActivation: true,
      });
      return;
    }
    if (!verifyScryptHash(password, targetAccount.passwordHash)) {
      res.status(401).json({ error: 'E-mail ou senha incorretos.' });
      return;
    }
  }

  const token = issueSessionToken(targetAccount);
  const actor = toAuthSessionUser(targetAccount);
  recordAudit(actor, 'Login no Modo Colaborador', targetAccount.name);
  res.json({ token, user: actor, viewMode: 'colaborador' });
});

// First-Run Password Activation for Pre-Registered Collaborators without a password yet
app.post('/api/auth/collaborator/activate', (req: Request, res: Response) => {
  const identifier = typeof req.body?.identifier === 'string' ? req.body.identifier.trim().toLowerCase() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password.trim() : '';

  if (!identifier || password.length < 6) {
    res.status(400).json({
      error: 'Selecione ou informe seu e-mail corporativo e defina uma senha com no mínimo 6 caracteres.',
    });
    return;
  }

  const targetAccount = managedAccounts.find(
    (a) =>
      a.id === identifier ||
      a.email.toLowerCase() === identifier ||
      a.name.toLowerCase() === identifier
  );

  if (!targetAccount || targetAccount.accessRole !== 'usuario') {
    res.status(404).json({ error: 'Colaborador não encontrado no cadastro prévio do RH.' });
    return;
  }
  if (targetAccount.status !== 'Ativo') {
    res.status(403).json({ error: 'Este cadastro encontra-se inativo.' });
    return;
  }
  if (targetAccount.passwordHash) {
    res.status(409).json({
      error: 'Este colaborador já ativou sua senha pessoal. Utilize o login normal.',
    });
    return;
  }

  targetAccount.passwordHash = hashPassword(password);
  targetAccount.updatedAt = nowFormatted();
  targetAccount.updatedByName = targetAccount.name;

  const token = issueSessionToken(targetAccount);
  const actor = toAuthSessionUser(targetAccount);
  recordAudit(actor, 'Ativou senha de primeiro acesso (Colaborador)', targetAccount.name);
  res.json({ token, user: actor, viewMode: 'colaborador' });
});

// Authenticated portal governance summary
app.get('/api/access/public-summary', requireAuthenticated, (_req: AuthenticatedRequest, res: Response) => {
  const master = managedAccounts.find((a) => a.accessRole === 'master');
  const activeGestores = managedAccounts.filter(
    (a) => a.accessRole === 'gestor' && a.status === 'Ativo'
  );
  const collaboratorProfiles = managedAccounts
    .filter((a) => a.accessRole === 'usuario' && a.status === 'Ativo')
    .map((a) => ({
      id: a.id,
      name: a.name,
      roleTitle: a.roleTitle,
      sectorOrSite: a.sectorOrSite,
      photoUrl: a.photoUrl,
    }));

  res.json({
    masterName: master?.name || 'Willian Vianna',
    masterRoleTitle: master?.roleTitle || 'Responsável pelo Setor de RH · Acesso Master',
    masterPhotoUrl:
      master?.photoUrl || '/src/assets/images/avatar_colaborador_3_1795629925432.jpg',
    activeGestoresCount: activeGestores.length,
    activeUsersCount: collaboratorProfiles.length,
    collaboratorProfiles,
    lastChange: auditLogs[0]
      ? {
          actorName: auditLogs[0].actorName,
          actorRole: auditLogs[0].actorRole,
          action: auditLogs[0].action,
          timestamp: auditLogs[0].timestamp,
        }
      : null,
  });
});

// Update currently authenticated Master or Gestor profile (name, photo, role, sector, email)
app.put('/api/access/me', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const actor = req.authActor!;
  const target = managedAccounts.find((a) => a.id === actor.id);
  if (!target) {
    res.status(404).json({ error: 'Cadastro do gestor não encontrado.' });
    return;
  }

  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : target.name;
  const email =
    typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : target.email;
  const roleTitle =
    typeof req.body?.roleTitle === 'string' ? req.body.roleTitle.trim() : target.roleTitle;
  const sectorOrSite =
    typeof req.body?.sectorOrSite === 'string' ? req.body.sectorOrSite.trim() : target.sectorOrSite;
  const rawPhoto = typeof req.body?.photoUrl === 'string' ? req.body.photoUrl.trim() : '';
  const photoUrl = rawPhoto && isSafeImageUrl(rawPhoto) ? rawPhoto : target.photoUrl;
  const password = typeof req.body?.password === 'string' ? req.body.password.trim() : '';

  if (!name || !email || !roleTitle || !sectorOrSite) {
    res.status(400).json({ error: 'Nome, e-mail, cargo e setor/obra são obrigatórios.' });
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: 'Informe um endereço de e-mail válido.' });
    return;
  }
  if (managedAccounts.some((a) => a.id !== target.id && a.email.toLowerCase() === email)) {
    res.status(409).json({ error: 'Outro cadastro já utiliza este e-mail.' });
    return;
  }
  if (password && password.length < 6) {
    res.status(400).json({ error: 'A nova senha deve ter no mínimo 6 caracteres.' });
    return;
  }

  target.name = name.slice(0, 100);
  target.email = email.slice(0, 140);
  target.roleTitle = roleTitle.slice(0, 100);
  target.sectorOrSite = sectorOrSite.slice(0, 120);
  target.photoUrl = photoUrl;
  target.updatedAt = nowFormatted();
  target.updatedByName = target.name;

  if (password.length >= 6 && target.accessRole === 'gestor') {
    target.passwordHash = hashPassword(password);
  }

  const updatedUser = toAuthSessionUser(target);
  recordAudit(
    updatedUser,
    'Atualizou nome, foto ou perfil do Gestor da Página',
    `${target.name} (${target.roleTitle})`
  );

  res.json({
    user: updatedUser,
    account: toPublicManagedAccount(target),
  });
});

// Protected Governance Directory & Audit Trail (Master & Gestores only)
app.get('/api/access/manage', requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  res.json({
    accounts: managedAccounts.map(toPublicManagedAccount),
    auditLogs: auditLogs.slice(0, 40),
  });
});

// Master-Only: Promote Collaborator to Gestor with Dedicated Privileges
app.post('/api/access/managers/promote', requireMaster, (req: AuthenticatedRequest, res: Response) => {
  const actor = req.authActor!;
  const collaboratorId =
    typeof req.body?.collaboratorId === 'string' ? req.body.collaboratorId.trim() : '';
  const roleTitle = typeof req.body?.roleTitle === 'string' ? req.body.roleTitle.trim() : '';
  const sectorOrSite =
    typeof req.body?.sectorOrSite === 'string' ? req.body.sectorOrSite.trim() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password.trim() : '';
  const privileges = sanitizePrivileges(req.body?.privileges, FULL_PRIVILEGES);

  const target = managedAccounts.find((a) => a.id === collaboratorId);
  if (!target) {
    res.status(404).json({ error: 'Colaborador selecionado não foi encontrado.' });
    return;
  }
  if (target.accessRole === 'master' || target.accessRole === 'gestor') {
    res.status(400).json({ error: 'Esta conta já possui perfil de Gestão no portal.' });
    return;
  }
  if (password && password.length < 6) {
    res.status(400).json({ error: 'A senha de Gestor deve ter no mínimo 6 caracteres.' });
    return;
  }
  if (!target.passwordHash && password.length < 6) {
    res.status(400).json({
      error: 'Este colaborador ainda não possui senha ativa. Defina uma senha inicial (mín. 6 caracteres) para promovê-lo a Gestor.',
    });
    return;
  }

  target.accessRole = 'gestor';
  target.status = 'Ativo';
  if (roleTitle) target.roleTitle = roleTitle.slice(0, 100);
  if (sectorOrSite) target.sectorOrSite = sectorOrSite.slice(0, 120);
  target.privileges = privileges;
  if (password.length >= 6) {
    target.passwordHash = hashPassword(password);
  }
  target.updatedAt = nowFormatted();
  target.updatedByName = actor.name;

  recordAudit(
    actor,
    'Promoveu colaborador a Gestor',
    `${target.name} (${target.roleTitle})`
  );

  res.json({
    account: toPublicManagedAccount(target),
    accounts: managedAccounts.map(toPublicManagedAccount),
    auditLogs: auditLogs.slice(0, 40),
  });
});

// Master-Only: Edit Gestor Privileges & Administrative Metadata
app.put('/api/access/managers/:id/privileges', requireMaster, (req: AuthenticatedRequest, res: Response) => {
  const actor = req.authActor!;
  const target = managedAccounts.find((a) => a.id === req.params.id);
  if (!target) {
    res.status(404).json({ error: 'Gestor não encontrado.' });
    return;
  }
  if (target.accessRole !== 'gestor') {
    res.status(400).json({
      error:
        target.accessRole === 'master'
          ? 'A conta Master soberana possui privilégios integrais permanentes.'
          : 'Esta conta é de Colaborador. Utilize o formulário de promoção para torná-la Gestor.',
    });
    return;
  }

  const roleTitle = typeof req.body?.roleTitle === 'string' ? req.body.roleTitle.trim() : target.roleTitle;
  const sectorOrSite =
    typeof req.body?.sectorOrSite === 'string' ? req.body.sectorOrSite.trim() : target.sectorOrSite;
  const password = typeof req.body?.password === 'string' ? req.body.password.trim() : '';
  const nextPrivileges = sanitizePrivileges(
    req.body?.privileges,
    target.privileges || FULL_PRIVILEGES
  );

  if (!roleTitle || !sectorOrSite) {
    res.status(400).json({ error: 'Cargo e setor/obra do Gestor são obrigatórios.' });
    return;
  }
  if (password && password.length < 6) {
    res.status(400).json({ error: 'A nova senha do Gestor deve ter no mínimo 6 caracteres.' });
    return;
  }

  target.roleTitle = roleTitle.slice(0, 100);
  target.sectorOrSite = sectorOrSite.slice(0, 120);
  target.privileges = nextPrivileges;
  if (password.length >= 6) {
    target.passwordHash = hashPassword(password);
  }
  target.updatedAt = nowFormatted();
  target.updatedByName = actor.name;

  recordAudit(
    actor,
    'Editou privilégios de Gestor',
    `${target.name} · Edição:${nextPrivileges.canEditContent ? 'Sim' : 'Não'} · Exclusão:${nextPrivileges.canDeleteContent ? 'Sim' : 'Não'} · Import:${nextPrivileges.canImportDocuments ? 'Sim' : 'Não'} · Equipe:${nextPrivileges.canManageUsers ? 'Sim' : 'Não'}`
  );

  res.json({
    account: toPublicManagedAccount(target),
    accounts: managedAccounts.map(toPublicManagedAccount),
    auditLogs: auditLogs.slice(0, 40),
  });
});

// Master-Only: Suspend or Reactivate a Gestor's Access
app.put('/api/access/managers/:id/status', requireMaster, (req: AuthenticatedRequest, res: Response) => {
  const actor = req.authActor!;
  const target = managedAccounts.find((a) => a.id === req.params.id);
  if (!target) {
    res.status(404).json({ error: 'Gestor não encontrado.' });
    return;
  }
  if (target.accessRole === 'master') {
    res.status(403).json({ error: 'A conta Master soberana não pode ter o acesso suspenso.' });
    return;
  }
  if (target.accessRole !== 'gestor') {
    res.status(400).json({ error: 'Esta operação aplica-se apenas a contas de Gestor.' });
    return;
  }

  const nextStatus = req.body?.status as AccountStatus;
  if (nextStatus !== 'Ativo' && nextStatus !== 'Suspenso' && nextStatus !== 'Inativo') {
    res.status(400).json({ error: 'Status inválido. Use Ativo ou Suspenso.' });
    return;
  }

  target.status = nextStatus;
  target.updatedAt = nowFormatted();
  target.updatedByName = actor.name;

  recordAudit(
    actor,
    nextStatus === 'Ativo' ? 'Reativou acesso de Gestor' : 'Suspendeu acesso de Gestor',
    `${target.name} (${target.email})`
  );

  res.json({
    account: toPublicManagedAccount(target),
    accounts: managedAccounts.map(toPublicManagedAccount),
    auditLogs: auditLogs.slice(0, 40),
  });
});

// Create User or Gestor (Strictly Master / Authorized Gestor)
app.post('/api/access/users', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const actor = req.authActor!;
  if (actor.accessRole === 'gestor' && actor.privileges && !actor.privileges.canManageUsers) {
    res.status(403).json({ error: 'Seu perfil de Gestor não possui privilégio para incluir usuários.' });
    return;
  }

  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const roleTitle = typeof req.body?.roleTitle === 'string' ? req.body.roleTitle.trim() : '';
  const sectorOrSite = typeof req.body?.sectorOrSite === 'string' ? req.body.sectorOrSite.trim() : '';
  const accessRole = req.body?.accessRole as AccessRole;
  const password = typeof req.body?.password === 'string' ? req.body.password.trim() : '';
  const photoUrl =
    typeof req.body?.photoUrl === 'string' && req.body.photoUrl.trim()
      ? req.body.photoUrl.trim()
      : '/src/assets/images/avatar_colaborador_1_1795629924319.jpg';

  if (!name || !email || !roleTitle || !sectorOrSite) {
    res.status(400).json({ error: 'Nome, e-mail, cargo e setor/obra são obrigatórios.' });
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: 'Informe um endereço de e-mail válido.' });
    return;
  }
  if (accessRole !== 'gestor' && accessRole !== 'usuario') {
    res.status(400).json({
      error: 'O perfil deve ser Gestor ou Usuário. Existe apenas uma conta Master soberana.',
    });
    return;
  }
  if (accessRole === 'gestor' && actor.accessRole !== 'master') {
    res.status(403).json({
      error: 'Somente o Gestor Master pode incluir ou promover novos Gestores na plataforma.',
    });
    return;
  }
  if (managedAccounts.some((a) => a.email.toLowerCase() === email)) {
    res.status(409).json({ error: 'Já existe uma conta cadastrada com este e-mail.' });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({
      error: `Para cadastrar um novo ${accessRole === 'gestor' ? 'Gestor' : 'Colaborador'}, defina uma senha inicial com no mínimo 6 caracteres.`,
    });
    return;
  }

  const newAccount: ServerManagedAccount = {
    id: `acc-${crypto.randomUUID().slice(0, 8)}`,
    name: name.slice(0, 100),
    email: email.slice(0, 140),
    roleTitle: roleTitle.slice(0, 100),
    sectorOrSite: sectorOrSite.slice(0, 120),
    accessRole,
    status: 'Ativo',
    photoUrl,
    createdAt: nowFormatted(),
    createdByName: actor.name,
    passwordHash: password.length >= 6 ? hashPassword(password) : undefined,
    privileges:
      accessRole === 'gestor'
        ? sanitizePrivileges(req.body?.privileges, FULL_PRIVILEGES)
        : undefined,
  };

  managedAccounts.unshift(newAccount);
  recordAudit(
    actor,
    `Incluiu ${accessRole === 'gestor' ? 'novo Gestor' : 'novo Usuário'}`,
    `${newAccount.name} (${newAccount.email})`
  );
  res.status(201).json({
    account: toPublicManagedAccount(newAccount),
    accounts: managedAccounts.map(toPublicManagedAccount),
    auditLogs: auditLogs.slice(0, 40),
  });
});

// Edit / Correct User or Gestor (Master / Authorized Gestor)
app.put('/api/access/users/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const actor = req.authActor!;
  if (actor.accessRole === 'gestor' && actor.privileges && !actor.privileges.canManageUsers) {
    res.status(403).json({ error: 'Seu perfil de Gestor não possui privilégio para corrigir cadastros.' });
    return;
  }

  const target = managedAccounts.find((a) => a.id === req.params.id);
  if (!target) {
    res.status(404).json({ error: 'Usuário ou gestor não encontrado.' });
    return;
  }

  if (target.accessRole === 'master' && actor.accessRole !== 'master') {
    res.status(403).json({ error: 'Somente a conta Master pode corrigir os próprios dados de Master.' });
    return;
  }
  if (target.accessRole === 'gestor' && actor.accessRole !== 'master' && target.id !== actor.id) {
    res.status(403).json({
      error: 'Somente o Gestor Master pode editar privilégios, suspender ou corrigir outros Gestores.',
    });
    return;
  }

  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : target.name;
  const email =
    typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : target.email;
  const roleTitle =
    typeof req.body?.roleTitle === 'string' ? req.body.roleTitle.trim() : target.roleTitle;
  const sectorOrSite =
    typeof req.body?.sectorOrSite === 'string' ? req.body.sectorOrSite.trim() : target.sectorOrSite;
  const requestedRole = (req.body?.accessRole as AccessRole) || target.accessRole;
  const requestedStatus: AccountStatus =
    req.body?.status === 'Inativo' || req.body?.status === 'Suspenso' || req.body?.status === 'Ativo'
      ? req.body.status
      : target.status;
  const password = typeof req.body?.password === 'string' ? req.body.password.trim() : '';
  const photoUrl =
    typeof req.body?.photoUrl === 'string' && req.body.photoUrl.trim()
      ? req.body.photoUrl.trim()
      : target.photoUrl;

  if (!name || !email || !roleTitle || !sectorOrSite) {
    res.status(400).json({ error: 'Nome, e-mail, cargo e setor/obra não podem ficar vazios.' });
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: 'Endereço de e-mail inválido.' });
    return;
  }
  if (managedAccounts.some((a) => a.id !== target.id && a.email.toLowerCase() === email)) {
    res.status(409).json({ error: 'Outro cadastro já utiliza este e-mail.' });
    return;
  }

  // Protect Master invariants
  if (target.accessRole === 'master') {
    if (requestedRole !== 'master' || requestedStatus !== 'Ativo') {
      res.status(403).json({ error: 'A conta Master não pode ser rebaixada nem inativada.' });
      return;
    }
  } else {
    if (requestedRole !== 'gestor' && requestedRole !== 'usuario') {
      res.status(400).json({ error: 'Perfil inválido para edição. Use Gestor ou Usuário.' });
      return;
    }
    if (requestedRole === 'gestor' && target.accessRole === 'usuario' && actor.accessRole !== 'master') {
      res.status(403).json({ error: 'Somente o Gestor Master pode promover um colaborador a Gestor.' });
      return;
    }
    if (target.id === actor.id && (requestedRole !== 'gestor' || requestedStatus !== 'Ativo')) {
      res.status(400).json({
        error: 'Você não pode rebaixar ou suspender o seu próprio acesso de Gestor enquanto está logado.',
      });
      return;
    }
  }

  if (password && password.length < 6) {
    res.status(400).json({ error: 'A nova senha deve ter no mínimo 6 caracteres.' });
    return;
  }
  if (requestedRole === 'gestor' && !target.passwordHash && password.length < 6) {
    res.status(400).json({
      error: 'Ao promover um Usuário para Gestor, defina uma senha inicial com pelo menos 6 caracteres.',
    });
    return;
  }

  target.name = name.slice(0, 100);
  target.email = email.slice(0, 140);
  target.roleTitle = roleTitle.slice(0, 100);
  target.sectorOrSite = sectorOrSite.slice(0, 120);
  target.accessRole = target.accessRole === 'master' ? 'master' : requestedRole;
  target.status = target.accessRole === 'master' ? 'Ativo' : requestedStatus;
  if (target.accessRole === 'gestor') {
    target.privileges = sanitizePrivileges(
      req.body?.privileges,
      target.privileges || FULL_PRIVILEGES
    );
  } else if (target.accessRole === 'usuario') {
    target.privileges = undefined;
  }
  target.photoUrl = isSafeImageUrl(photoUrl) ? photoUrl : target.photoUrl;
  target.updatedAt = nowFormatted();
  target.updatedByName = actor.name;
  if (password.length >= 6) {
    target.passwordHash = hashPassword(password);
  }

  recordAudit(
    actor,
    `Corrigiu cadastro (${target.accessRole})`,
    `${target.name} · ${target.status}`
  );

  res.json({
    account: toPublicManagedAccount(target),
    accounts: managedAccounts.map(toPublicManagedAccount),
    auditLogs: auditLogs.slice(0, 40),
    updatedSessionUser: target.id === actor.id ? toAuthSessionUser(target) : undefined,
  });
});

// Delete User or Gestor (Master / Authorized Gestor)
app.delete('/api/access/users/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const actor = req.authActor!;
  if (actor.accessRole === 'gestor' && actor.privileges && !actor.privileges.canManageUsers) {
    res.status(403).json({ error: 'Seu perfil de Gestor não possui privilégio para excluir cadastros.' });
    return;
  }

  const idx = managedAccounts.findIndex((a) => a.id === req.params.id);
  if (idx < 0) {
    res.status(404).json({ error: 'Cadastro não encontrado.' });
    return;
  }
  const target = managedAccounts[idx];
  if (target.accessRole === 'master') {
    res.status(403).json({ error: 'A conta Master soberana não pode ser excluída.' });
    return;
  }
  if (target.accessRole === 'gestor' && actor.accessRole !== 'master') {
    res.status(403).json({ error: 'Somente o Gestor Master pode excluir outro Gestor.' });
    return;
  }
  if (target.id === actor.id) {
    res.status(400).json({ error: 'Você não pode excluir o próprio cadastro durante a sessão ativa.' });
    return;
  }

  managedAccounts.splice(idx, 1);
  recordAudit(
    actor,
    `Excluiu ${target.accessRole === 'gestor' ? 'Gestor' : 'Usuário'}`,
    `${target.name} (${target.email})`
  );

  res.json({
    ok: true,
    accounts: managedAccounts.map(toPublicManagedAccount),
    auditLogs: auditLogs.slice(0, 40),
  });
});

// --- Portal Data Routes (Requires Collaborator, Gestor or Master Login) ---
app.get('/api/portal', requireAuthenticated, (_req: AuthenticatedRequest, res: Response) => {
  res.json(portalData);
});

app.put('/api/portal', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const actor = req.authActor!;
  if (actor.accessRole === 'gestor' && actor.privileges && !actor.privileges.canEditContent) {
    res.status(403).json({
      error: 'Seu perfil de Gestor não possui privilégio de edição de conteúdos do portal.',
    });
    return;
  }
  const nextData = req.body as PortalData;
  if (!nextData || typeof nextData !== 'object' || !nextData.brand || !Array.isArray(nextData.announcements)) {
    res.status(400).json({ error: 'Estrutura de dados do portal inválida.' });
    return;
  }
  const rawImageSettings = (nextData.brand as any).imageSettings;
  if (rawImageSettings && typeof rawImageSettings === 'object') {
    nextData.brand.imageSettings = {
      bannerAspectRatio:
        rawImageSettings.bannerAspectRatio === '4:3' || rawImageSettings.bannerAspectRatio === '21:9'
          ? rawImageSettings.bannerAspectRatio
          : '16:9',
      fitMode:
        rawImageSettings.fitMode === 'smart-crop' ||
        rawImageSettings.fitMode === 'adapt-contain' ||
        rawImageSettings.fitMode === 'blur-backdrop'
          ? rawImageSettings.fitMode
          : 'blur-backdrop',
      qualityPreset:
        rawImageSettings.qualityPreset === 'high' ||
        rawImageSettings.qualityPreset === 'compact' ||
        rawImageSettings.qualityPreset === 'balanced'
          ? rawImageSettings.qualityPreset
          : 'balanced',
      roundedStyle:
        rawImageSettings.roundedStyle === 'md' ||
        rawImageSettings.roundedStyle === 'xl' ||
        rawImageSettings.roundedStyle === 'lg'
          ? rawImageSettings.roundedStyle
          : 'lg',
      goldBorder:
        typeof rawImageSettings.goldBorder === 'boolean' ? rawImageSettings.goldBorder : true,
      autoAdaptUploads:
        typeof rawImageSettings.autoAdaptUploads === 'boolean'
          ? rawImageSettings.autoAdaptUploads
          : true,
    };
  }
  portalData = nextData;
  recordAudit(actor, 'Alterou conteúdo do portal', 'Portal RH de Todos');
  res.json({ ok: true, portalData, lastChange: auditLogs[0] || null });
});

app.post('/api/announcements/:id/view', requireAuthenticated, (req: AuthenticatedRequest, res: Response) => {
  const item = portalData.announcements.find((a) => a.id === req.params.id);
  if (!item) {
    res.status(404).json({ error: 'Comunicado não encontrado.' });
    return;
  }
  item.views += 1;
  res.json({ views: item.views });
});

app.post('/api/announcements/:id/react', requireAuthenticated, (req: AuthenticatedRequest, res: Response) => {
  const item = portalData.announcements.find((a) => a.id === req.params.id);
  const reaction = req.body?.reaction as 'applause' | 'insightful' | 'important';
  if (!item || !['applause', 'insightful', 'important'].includes(reaction)) {
    res.status(400).json({ error: 'Reação inválida.' });
    return;
  }
  item.reactions[reaction] += 1;
  res.json({ reactions: item.reactions });
});

app.post('/api/birthdays/:id/congratulate', requireAuthenticated, (req: AuthenticatedRequest, res: Response) => {
  const person = portalData.birthdays.find((b) => b.id === req.params.id);
  if (!person) {
    res.status(404).json({ error: 'Aniversariante não encontrado.' });
    return;
  }
  const senderName = req.authActor?.name || (typeof req.body?.senderName === 'string' ? req.body.senderName.trim() : '');
  const senderRole = req.authActor?.roleTitle || (typeof req.body?.senderRole === 'string' ? req.body.senderRole.trim() : 'Colaborador C&R');
  const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';

  if (!senderName || !message) {
    res.status(400).json({ error: 'Nome e mensagem de felicitação são obrigatórios.' });
    return;
  }

  const newMsg: CongratulationMessage = {
    id: `msg-${crypto.randomUUID().slice(0, 8)}`,
    senderName: senderName.slice(0, 80),
    senderRole: senderRole.slice(0, 80),
    message: message.slice(0, 400),
    createdAt: 'Agora mesmo',
  };
  person.messages.unshift(newMsg);
  res.json({ message: newMsg, messages: person.messages });
});

// --- Gemini Resilient Retry & Error Formatter ---
function isTransientGeminiError(err: unknown): boolean {
  const msg = String((err as any)?.message || err || '').toLowerCase();
  const status = Number((err as any)?.status || (err as any)?.code || 0);
  return (
    status === 503 ||
    status === 429 ||
    status === 500 ||
    msg.includes('503') ||
    msg.includes('429') ||
    msg.includes('unavailable') ||
    msg.includes('high demand') ||
    msg.includes('overloaded') ||
    msg.includes('resource_exhausted') ||
    msg.includes('rate limit')
  );
}

function formatGeminiError(err: unknown): { status: number; message: string } {
  const raw = String((err as any)?.message || err || '').trim();
  const lower = raw.toLowerCase();

  if (lower.includes('gemini_api_key')) {
    return {
      status: 500,
      message: 'A chave da IA (GEMINI_API_KEY) não está configurada no servidor.',
    };
  }
  if (lower.includes('503') || lower.includes('unavailable') || lower.includes('high demand') || lower.includes('overloaded')) {
    return {
      status: 503,
      message:
        'O serviço de IA está temporariamente sobrecarregado devido à alta demanda. Tente novamente em instantes.',
    };
  }
  if (lower.includes('429') || lower.includes('resource_exhausted') || lower.includes('quota')) {
    return {
      status: 429,
      message:
        'Limite momentâneo de requisições de IA atingido. Aguarde alguns segundos e tente novamente.',
    };
  }
  if (raw.startsWith('{') && raw.includes('"error"')) {
    try {
      const parsed = JSON.parse(raw);
      const code = Number(parsed?.error?.code || 500);
      const statusText = String(parsed?.error?.status || '');
      if (code === 503 || statusText === 'UNAVAILABLE') {
        return {
          status: 503,
          message:
            'O serviço de IA está temporariamente sobrecarregado devido à alta demanda. Tente novamente em instantes.',
        };
      }
      if (parsed?.error?.message) {
        return {
          status: code >= 400 && code < 600 ? code : 500,
          message: String(parsed.error.message),
        };
      }
    } catch {
      // fall through
    }
  }
  return {
    status: 500,
    message: raw || 'Não foi possível concluir o processamento com IA neste momento.',
  };
}

async function runGeminiWithRetry(
  ai: GoogleGenAI,
  params: {
    contents: any;
    config?: any;
  }
) {
  const attempts: { model: string; delayMs: number }[] = [
    { model: 'gemini-4-hydrogen', delayMs: 0 },
    { model: 'gemini-4-hydrogen', delayMs: 800 },
    { model: 'gemini-3.1-flash-lite', delayMs: 1400 },
  ];

  let lastErr: unknown;
  for (let i = 0; i < attempts.length; i += 1) {
    const attempt = attempts[i];
    if (attempt.delayMs > 0) {
      await new Promise((r) => setTimeout(r, attempt.delayMs));
    }
    try {
      return await ai.models.generateContent({
        model: attempt.model,
        contents: params.contents,
        config: params.config,
      });
    } catch (err) {
      lastErr = err;
      if (!isTransientGeminiError(err) || i === attempts.length - 1) {
        throw err;
      }
      console.warn(
        `Gemini modelo ${attempt.model} retornou erro transitório; tentando alternativa (${i + 2}/${attempts.length})...`
      );
    }
  }
  throw lastErr;
}

// --- AI Challenge Generator Helper ---
async function generateInteractiveChallenge(
  title: string,
  contentText: string,
  preferredType?: ChallengeType
): Promise<InteractiveChallenge> {
  const ai = getGeminiClient();
  const chosenType: ChallengeType =
    preferredType ||
    (['multiple_choice', 'true_false', 'matching', 'decision_scenario'] as ChallengeType[])[
      Math.floor(Math.random() * 4)
    ];

  const prompt = `Você é a Inteligência de Gamificação do Portal de RH da Cavalcante & Rolim Empreendimentos (construtora de alto padrão "Signature Spaces").
Com base no conteúdo abaixo, crie um desafio interativo em português do Brasil do tipo "${chosenType}".
Regras por tipo:
- "multiple_choice": 2 ou 3 perguntas objetivas com 3 ou 4 opções cada, exatamente 1 correta (correctIndex), e explicação curta.
- "true_false": 2 ou 3 afirmações com exatamente 2 opções: ["Verdadeiro", "Falso"], correctIndex (0 ou 1) e explicação.
- "decision_scenario": 1 ou 2 cenários práticos realistas de obra ou escritório (preencha scenarioContext) com 3 decisões possíveis em options, 1 correta e explicação.
- "matching": preencha matchingPairs com 3 ou 4 pares de { term, definition } curtos e claros extraídos do texto (e deixe questions como array vazio).

Título do conteúdo: ${title}
Texto do conteúdo:
${contentText.slice(0, 9000)}`;

  const response = await runGeminiWithRetry(ai, {
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          type: { type: Type.STRING },
          scenarioContext: { type: Type.STRING },
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                prompt: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctIndex: { type: Type.INTEGER },
                explanation: { type: Type.STRING },
              },
              required: ['prompt', 'options', 'correctIndex', 'explanation'],
            },
          },
          matchingPairs: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                term: { type: Type.STRING },
                definition: { type: Type.STRING },
              },
              required: ['term', 'definition'],
            },
          },
        },
        required: ['title', 'type', 'questions'],
      },
    },
  });

  const rawText = (response.text ?? '{}').trim();
  const parsed = JSON.parse(rawText);

  const normalizedType: ChallengeType = ['multiple_choice', 'true_false', 'matching', 'decision_scenario'].includes(
    parsed.type
  )
    ? parsed.type
    : chosenType;

  return {
    id: `chal-ai-${crypto.randomUUID().slice(0, 8)}`,
    title: parsed.title || `Desafio Signature: ${title}`,
    type: normalizedType,
    scenarioContext: parsed.scenarioContext || undefined,
    questions: Array.isArray(parsed.questions)
      ? parsed.questions.map((q: any, idx: number) => ({
          id: `q-${idx}-${Date.now()}`,
          prompt: String(q.prompt || ''),
          options: Array.isArray(q.options) ? q.options.map(String) : [],
          correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : 0,
          explanation: String(q.explanation || ''),
        }))
      : [],
    matchingPairs: Array.isArray(parsed.matchingPairs)
      ? parsed.matchingPairs.map((p: any, idx: number) => ({
          id: `mp-${idx}-${Date.now()}`,
          term: String(p.term || ''),
          definition: String(p.definition || ''),
        }))
      : undefined,
    generatedByAI: true,
  };
}

app.post('/api/ai/generate-challenge', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const actor = req.authActor!;
    if (actor.accessRole === 'gestor' && actor.privileges && !actor.privileges.canImportDocuments) {
      res.status(403).json({ error: 'Seu perfil de Gestor não possui privilégio para gerar desafios com IA.' });
      return;
    }
    const title = typeof req.body?.title === 'string' ? req.body.title.trim() : '';
    const contentText = typeof req.body?.contentText === 'string' ? req.body.contentText.trim() : '';
    const preferredType = req.body?.preferredType as ChallengeType | undefined;

    if (!title || !contentText) {
      res.status(400).json({ error: 'Título e conteúdo são necessários para gerar o desafio.' });
      return;
    }

    const challenge = await generateInteractiveChallenge(title, contentText, preferredType);
    res.json({ challenge });
  } catch (err: any) {
    console.error('Erro ao gerar desafio com IA:', err);
    const formatted = formatGeminiError(err);
    res.status(formatted.status).json({
      error: formatted.message,
    });
  }
});

// --- Universal Document Importer ---
async function extractRawTextFromUpload(file: Express.Multer.File): Promise<{
  extractedText: string;
  isMultimodalHandled?: boolean;
  structuredByGemini?: { title: string; summary: string; sections: EditorialSection[] };
}> {
  const ext = path.extname(file.originalname).toLowerCase();

  // Plain text / Markdown / CSV
  if (['.txt', '.md', '.csv'].includes(ext)) {
    return { extractedText: file.buffer.toString('utf8') };
  }

  // Word (.docx)
  if (ext === '.docx') {
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    return { extractedText: result.value || '' };
  }

  // Excel (.xlsx, .xls)
  if (['.xlsx', '.xls'].includes(ext)) {
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetsText = workbook.SheetNames.map((sheetName) => {
      const sheet = workbook.Sheets[sheetName];
      const csv = XLSX.utils.sheet_to_csv(sheet);
      return `Planilha: ${sheetName}\n${csv}`;
    }).join('\n\n');
    return { extractedText: sheetsText };
  }

  // PowerPoint (.pptx)
  if (ext === '.pptx') {
    const zip = await JSZip.loadAsync(file.buffer);
    const slideFiles = Object.keys(zip.files)
      .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
      .sort((a, b) => {
        const na = parseInt(a.match(/\d+/)?.[0] || '0', 10);
        const nb = parseInt(b.match(/\d+/)?.[0] || '0', 10);
        return na - nb;
      });

    const slidesText: string[] = [];
    for (const slidePath of slideFiles) {
      const xml = await zip.files[slidePath].async('string');
      const matches = Array.from(xml.matchAll(/<a:t[^>]*>(.*?)<\/a:t>/g)).map((m) => m[1]);
      if (matches.length > 0) {
        slidesText.push(matches.join(' '));
      }
    }
    return { extractedText: slidesText.join('\n\n') };
  }

  // PDF or Images -> Multimodal Gemini extraction & structuring
  const supportedImageMimes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
  const mimeType =
    ext === '.pdf'
      ? 'application/pdf'
      : supportedImageMimes.includes(file.mimetype)
        ? file.mimetype
        : 'application/octet-stream';

  if (mimeType === 'application/pdf' || mimeType.startsWith('image/')) {
    const ai = getGeminiClient();
    const response = await runGeminiWithRetry(ai, {
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: file.buffer.toString('base64'),
            },
          },
          {
            text: `Analise integralmente este documento ou imagem enviado para o Portal da Cavalcante & Rolim Empreendimentos.
Extraia todo o conteúdo textual relevante e organize-o no Template Editorial Padrão em português do Brasil:
- title: título claro e institucional
- summary: resumo executivo em 2 frases
- sections: lista de seções organizadas com heading e content completo e fiel ao documento original.`,
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            sections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  heading: { type: Type.STRING },
                  content: { type: Type.STRING },
                },
                required: ['heading', 'content'],
              },
            },
          },
          required: ['title', 'summary', 'sections'],
        },
      },
    });

    const parsed = JSON.parse((response.text ?? '{}').trim());
    const sections: EditorialSection[] = Array.isArray(parsed.sections)
      ? parsed.sections.map((s: any, idx: number) => ({
          id: `imp-sec-${idx}-${Date.now()}`,
          heading: String(s.heading || `Seção ${idx + 1}`),
          content: String(s.content || ''),
        }))
      : [];
    const joinedText = sections.map((s) => `${s.heading}\n${s.content}`).join('\n\n');

    return {
      extractedText: joinedText,
      isMultimodalHandled: true,
      structuredByGemini: {
        title: String(parsed.title || file.originalname),
        summary: String(parsed.summary || ''),
        sections,
      },
    };
  }

  // Generic fallback UTF-8
  return { extractedText: file.buffer.toString('utf8') };
}

app.post('/api/documents/import', requireAdmin, upload.single('file'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const actor = req.authActor!;
    if (actor.accessRole === 'gestor' && actor.privileges && !actor.privileges.canImportDocuments) {
      res.status(403).json({ error: 'Seu perfil de Gestor não possui privilégio de importação universal de documentos.' });
      return;
    }
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'Nenhum arquivo enviado.' });
      return;
    }

    const fileId = `doc-${crypto.randomUUID().slice(0, 10)}`;
    uploadedFiles.set(fileId, {
      id: fileId,
      originalName: file.originalname,
      mimeType: file.mimetype || 'application/octet-stream',
      buffer: file.buffer,
    });

    const extraction = await extractRawTextFromUpload(file);
    let title = extraction.structuredByGemini?.title || file.originalname.replace(/\.[^/.]+$/, '');
    let summary = extraction.structuredByGemini?.summary || '';
    let sections = extraction.structuredByGemini?.sections || [];

    if (!extraction.isMultimodalHandled) {
      const rawText = extraction.extractedText.trim();
      if (!rawText) {
        res.status(400).json({ error: 'Não foi possível extrair texto legível deste arquivo.' });
        return;
      }

      const ai = getGeminiClient();
      const structureResp = await runGeminiWithRetry(ai, {
        contents: `Organize o conteúdo extraído do arquivo "${file.originalname}" para o Template Editorial Padrão da construtora Cavalcante & Rolim Empreendimentos (português do Brasil).
Retorne um JSON com:
- title: título elegante e fiel
- summary: resumo executivo de 2 frases
- sections: de 2 a 6 seções bem organizadas com heading e content claro, preservando todos os dados, números e regras importantes do texto original.

Texto extraído:
${rawText.slice(0, 14000)}`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              summary: { type: Type.STRING },
              sections: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    heading: { type: Type.STRING },
                    content: { type: Type.STRING },
                  },
                  required: ['heading', 'content'],
                },
              },
            },
            required: ['title', 'summary', 'sections'],
          },
        },
      });

      const parsed = JSON.parse((structureResp.text ?? '{}').trim());
      title = String(parsed.title || title);
      summary = String(parsed.summary || 'Documento importado e padronizado no layout editorial C&R.');
      sections = Array.isArray(parsed.sections)
        ? parsed.sections.map((s: any, idx: number) => ({
            id: `imp-sec-${idx}-${Date.now()}`,
            heading: String(s.heading || `Seção ${idx + 1}`),
            content: String(s.content || ''),
          }))
        : [
            {
              id: `imp-sec-0-${Date.now()}`,
              heading: 'Conteúdo Integral',
              content: rawText.slice(0, 5000),
            },
          ];
    }

    const fullContentForQuiz = `${summary}\n\n${sections.map((s) => `${s.heading}: ${s.content}`).join('\n')}`;
    const challenge = await generateInteractiveChallenge(title, fullContentForQuiz);

    if (req.authActor) {
      recordAudit(req.authActor, 'Importou documento universal', `${title} (${file.originalname})`);
    }

    res.json({
      fileId,
      originalFileName: file.originalname,
      title,
      summary,
      sections,
      challenge,
    });
  } catch (err: any) {
    console.error('Erro na importação universal de documento:', err);
    const formatted = formatGeminiError(err);
    res.status(formatted.status).json({
      error: formatted.message,
    });
  }
});

app.get('/api/documents/download/:id', requireAuthenticated, (req: AuthenticatedRequest, res: Response) => {
  const file = uploadedFiles.get(req.params.id);
  if (!file) {
    res.status(404).json({ error: 'Arquivo original não encontrado no armazenamento da sessão.' });
    return;
  }
  const safeName = file.originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
  res.setHeader('Content-Type', file.mimeType);
  res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`);
  res.send(file.buffer);
});

// --- Vite Dev Middleware / Production Static Serving ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Cavalcante & Rolim Portal rodando em http://0.0.0.0:${PORT}`);
  });
}

startServer();
