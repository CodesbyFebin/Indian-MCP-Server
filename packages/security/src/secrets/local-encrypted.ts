// packages/security/src/secrets/local-encrypted.ts
// Local encrypted provider for development only

import crypto from 'crypto';
import { SecretProvider } from './provider';
import { SecretContext, SecretReference, SecretMetadata, SecretVerificationResult } from './types';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const SALT_LENGTH = 32;

export interface LocalEncryptedConfig {
  encryptionKeyPath?: string;
  storagePath?: string;
  masterPassword?: string;
}

/**
 * LocalEncryptedProvider provides secret storage with local encryption.
 * 
 * ⚠️ WARNING: This provider is for development ONLY.
 * Production environments MUST use Vault or AWS Secrets Manager.
 */
export class LocalEncryptedProvider implements SecretProvider {
  readonly type = 'local-encrypted' as const;
  
  private encryptionKey: Buffer | null = null;
  private storage: Map<string, SecretReference> = new Map();
  private secretValues: Map<string, Buffer> = new Map(); // In-memory, not persisted
  private readonly storagePath: string;
  private readonly keyPath: string;

  constructor(config: LocalEncryptedConfig = {}) {
    this.storagePath = config.storagePath || '/tmp/mcpserver-secrets';
    this.keyPath = config.encryptionKeyPath || '/tmp/mcpserver-secrets-key';
  }

  async initialize(config: LocalEncryptedConfig = {}): Promise<void> {
    // Load or generate encryption key
    this.encryptionKey = await this.loadOrCreateEncryptionKey();
  }

  private async loadOrCreateEncryptionKey(): Promise<Buffer> {
    const fs = require('fs').promises;
    
    try {
      const keyData = await fs.readFile(this.keyPath);
      return Buffer.from(keyData, 'hex');
    } catch {
      // Generate new key if it doesn't exist
      const salt = crypto.randomBytes(SALT_LENGTH);
      const password = process.env.SECRET_ENCRYPTION_PASSWORD || 'dev-only-password';
      const key = crypto.scryptSync(password, salt, KEY_LENGTH);
      
      // Store salt + key
      const combined = Buffer.concat([salt, key]);
      await fs.writeFile(this.keyPath, combined.toString('hex'));
      return key;
    }
  }

  private encrypt(value: string): Buffer {
    if (!this.encryptionKey) {
      throw new Error('Provider not initialized');
    }

    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, this.encryptionKey, iv);
    
    const valueBuffer = Buffer.from(value, 'utf-8');
    const encrypted = Buffer.concat([
      cipher.update(valueBuffer),
      cipher.final(),
    ]);
    
    const tag = cipher.getAuthTag();
    
    // Format: iv(16) + tag(16) + encrypted
    return Buffer.concat([iv, tag, encrypted]);
  }

  private decrypt(encrypted: Buffer): string {
    if (!this.encryptionKey) {
      throw new Error('Provider not initialized');
    }

    const iv = encrypted.slice(0, IV_LENGTH);
    const tag = encrypted.slice(IV_LENGTH, IV_LENGTH + 16);
    const data = encrypted.slice(IV_LENGTH + 16);

    const decipher = crypto.createDecipheriv(ALGORITHM, this.encryptionKey, iv);
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([
      decipher.update(data),
      decipher.final(),
    ]);

    return decrypted.toString('utf-8');
  }

  async create(
    context: SecretContext,
    name: string,
    value: string,
    metadata: SecretMetadata,
  ): Promise<SecretReference> {
    this.validateContext(context);

    const id = crypto.randomUUID();
    const now = new Date();
    
    const ref: SecretReference = {
      id,
      name,
      path: `local://${context.organizationId}/${id}`,
      provider: 'local-encrypted',
      createdAt: now,
      updatedAt: now,
      expiresAt: metadata.rotationPeriod 
        ? new Date(now.getTime() + metadata.rotationPeriod * 24 * 60 * 60 * 1000)
        : undefined,
      version: '1',
    };

    this.storage.set(id, ref);
    this.secretValues.set(id, this.encrypt(value));

    return ref;
  }

  async read(context: SecretContext, ref: SecretReference): Promise<string> {
    this.validateContext(context);

    const stored = this.storage.get(ref.id);
    if (!stored) {
      throw new Error(`Secret not found: ${ref.id}`);
    }

    if (ref.expiresAt && ref.expiresAt < new Date()) {
      throw new Error(`Secret expired: ${ref.id}`);
    }

    const encrypted = this.secretValues.get(ref.id);
    if (!encrypted) {
      throw new Error(`Secret value not found: ${ref.id}`);
    }

    return this.decrypt(encrypted);
  }

  async rotate(
    context: SecretContext,
    ref: SecretReference,
    newValue: string,
  ): Promise<SecretReference> {
    this.validateContext(context);

    const stored = this.storage.get(ref.id);
    if (!stored) {
      throw new Error(`Secret not found: ${ref.id}`);
    }

    const now = new Date();
    const updated: SecretReference = {
      ...stored,
      updatedAt: now,
      expiresAt: now,
      version: (parseInt(stored.version) + 1).toString(),
    };

    this.storage.set(ref.id, updated);
    this.secretValues.set(ref.id, this.encrypt(newValue));

    return updated;
  }

  async revoke(context: SecretContext, ref: SecretReference): Promise<void> {
    this.validateContext(context);

    this.storage.delete(ref.id);
    this.secretValues.delete(ref.id);
  }

  async list(
    context: SecretContext,
    filters?: { resourceType?: string; resourceId?: string; name?: string },
  ): Promise<SecretReference[]> {
    this.validateContext(context);

    let results = Array.from(this.storage.values());

    if (filters?.name) {
      results = results.filter(r => r.name.includes(filters.name!));
    }

    return results;
  }

  async verify(
    context: SecretContext,
    ref: SecretReference,
  ): Promise<SecretVerificationResult> {
    try {
      await this.read(context, ref);
      return {
        valid: true,
        secretId: ref.id,
        verifiedAt: new Date(),
        method: 'local-encrypted-verify',
      };
    } catch (error) {
      return {
        valid: false,
        secretId: ref.id,
        verifiedAt: new Date(),
        method: 'local-encrypted-verify',
        metadata: { error: error instanceof Error ? error.message : String(error) },
      };
    }
  }

  async getMetadata(
    context: SecretContext,
    ref: SecretReference,
  ): Promise<SecretMetadata> {
    // In a real implementation, metadata would be stored separately
    // For dev purposes, return minimal metadata
    return {
      description: `Dev secret for ${ref.name}`,
      owner: context.userId || context.organizationId,
      accessPattern: 'on-demand',
    };
  }

  async shutdown(): Promise<void> {
    this.storage.clear();
    this.secretValues.clear();
  }

  private validateContext(context: SecretContext): void {
    if (!context.organizationId) {
      throw new Error('Missing organizationId in context');
    }
    if (!context.resourceType || !context.resourceId) {
      throw new Error('Missing resource information in context');
    }
  }
}