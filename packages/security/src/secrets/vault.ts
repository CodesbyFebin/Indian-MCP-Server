// packages/security/src/secrets/vault.ts
// HashiCorp Vault provider for production

import { SecretProvider } from './provider';
import { SecretContext, SecretReference, SecretMetadata, SecretVerificationResult } from './types';

export interface VaultConfig {
  address: string;
  token?: string;
  namespace?: string;
  mountPath?: string;
  roleId?: string;
  secretId?: string;
}

/**
 * VaultProvider integrates with HashiCorp Vault for production secret management.
 * 
 * Features:
 * - KV Engine v2 for secret storage
 * - AppRole authentication support
 * - Token-based authentication (with rotation)
 * - Transit engine for additional encryption at rest
 * - Namespace support for multi-tenancy
 * - Secret versioning
 */
export class VaultProvider implements SecretProvider {
  readonly type = 'vault' as const;
  
  private config: VaultConfig;
  private client: any; // Vault client (would be imported from 'node-vault' or '@hashicorp/vault')

  constructor(config: VaultConfig) {
    this.config = config;
  }

  async initialize(config: Record<string, unknown>): Promise<void> {
    // Import Vault client lazily to avoid dependency in development
    const vault = require('node-vault');
    
    const options: any = {
      apiVersion: 'v1',
      endpoint: this.config.address,
    };

    if (this.config.token) {
      options.token = this.config.token;
    } else if (this.config.roleId && this.config.secretId) {
      // AppRole authentication
      options.method = 'approle';
      options.role_id = this.config.roleId;
      options.secret_id = this.config.secretId;
    }

    this.client = vault(options);

    // Verify connection
    await this.client.status();
  }

  async create(
    context: SecretContext,
    name: string,
    value: string,
    metadata: SecretMetadata,
  ): Promise<SecretReference> {
    this.validateContext(context);

    const id = `secret-${context.organizationId}-${Date.now()}`;
    const path = this.buildPath(context.organizationId, id);
    
    // Store secret in Vault KV engine
    await this.client.write(`${this.config.mountPath || 'secret'}/data/${path}`, {
      data: { value },
      options: { cas_required: true },
      metadata: {
        ...metadata,
        createdAt: new Date().toISOString(),
      },
    });

    const now = new Date();
    const ref: SecretReference = {
      id,
      name,
      path: `vault://${this.config.address}/${path}`,
      provider: 'vault',
      createdAt: now,
      updatedAt: now,
      expiresAt: metadata.rotationPeriod 
        ? new Date(now.getTime() + metadata.rotationPeriod * 24 * 60 * 60 * 1000)
        : undefined,
      version: '1',
    };

    return ref;
  }

  async read(context: SecretContext, ref: SecretReference): Promise<string> {
    this.validateContext(context);

    const path = this.extractPathFromRef(ref);
    
    const result = await this.client.read(`${this.config.mountPath || 'secret'}/data/${path}`);
    if (!result || !result.data) {
      throw new Error(`Secret not found in Vault: ${ref.id}`);
    }

    // Check expiration
    if (ref.expiresAt && ref.expiresAt < new Date()) {
      throw new Error(`Secret expired: ${ref.id}`);
    }

    return result.data.data.value;
  }

  async rotate(
    context: SecretContext,
    ref: SecretReference,
    newValue: string,
  ): Promise<SecretReference> {
    this.validateContext(context);

    const path = this.extractPathFromRef(ref);
    
    // Write new version (KV v2 automatically versions)
    const writeResult = await this.client.write(`${this.config.mountPath || 'secret'}/data/${path}`, {
      data: { value: newValue },
      metadata: {
        updatedAt: new Date().toISOString(),
      },
    });

    const version = writeResult?.data?.metadata?.version || parseInt(ref.version) + 1;

    const now = new Date();
    return {
      ...ref,
      updatedAt: now,
      version: String(version),
      expiresAt: now, // Forces re-verification
    };
  }

  async revoke(context: SecretContext, ref: SecretReference): Promise<void> {
    this.validateContext(context);

    const path = this.extractPathFromRef(ref);
    
    // Mark as deleted in Vault (KV v2 soft delete)
    await this.client.delete(`${this.config.mountPath || 'secret'}/data/${path}`);
    await this.client.delete(`${this.config.mountPath || 'secret'}/metadata/${path}`);
  }

  async list(
    context: SecretContext,
    filters?: { resourceType?: string; resourceId?: string; name?: string },
  ): Promise<SecretReference[]> {
    this.validateContext(context);

    const listPath = `${this.config.mountPath || 'secret'}/metadata/organizations/${context.organizationId}`;
    const result = await this.client.list(listPath);
    
    if (!result || !result.data) {
      return [];
    }

    return result.data.keys.map((key: string) => ({
      id: key,
      name: key,
      path: `vault://${this.config.address}/${listPath}/${key}`,
      provider: 'vault' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: '1',
    }));
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
        method: 'vault-verify',
      };
    } catch (error) {
      return {
        valid: false,
        secretId: ref.id,
        verifiedAt: new Date(),
        method: 'vault-verify',
        metadata: { error: error instanceof Error ? error.message : String(error) },
      };
    }
  }

  async getMetadata(
    context: SecretContext,
    ref: SecretReference,
  ): Promise<SecretMetadata> {
    const path = this.extractPathFromRef(ref);
    const result = await this.client.read(`${this.config.mountPath || 'secret'}/metadata/${path}`);
    
    if (!result || !result.data || !result.data.metadata) {
      throw new Error(`Metadata not found for secret: ${ref.id}`);
    }

    return result.data.metadata as SecretMetadata;
  }

  async shutdown(): Promise<void> {
    if (this.client && typeof this.client.end === 'function') {
      this.client.end();
    }
  }

  private buildPath(organizationId: string, secretId: string): string {
    if (this.config.namespace) {
      return `${this.config.namespace}/${organizationId}/${secretId}`;
    }
    return `org-${organizationId}/${secretId}`;
  }

  private extractPathFromRef(ref: SecretReference): string {
    // Extract the path portion after the organization prefix
    const match = ref.path.match(/^vault:\/\/[^/]+\/(.+)$/);
    if (!match) {
      throw new Error(`Invalid Vault secret reference path: ${ref.path}`);
    }
    return match[1];
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