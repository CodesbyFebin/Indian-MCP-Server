// packages/security/src/secrets/provider.ts
// Provider-neutral SecretProvider interface

import { SecretContext, SecretReference, SecretMetadata, SecretVerificationResult } from './types';

/**
 * SecretProvider defines a provider-neutral interface for secret management.
 * 
 * Implementations:
 * - LocalEncryptedProvider: For development (encrypted local storage)
 * - VaultProvider: For production (HashiCorp Vault)
 * - AWSSecretsProvider: For cloud production (AWS Secrets Manager)
 * 
 * Security Rules:
 * - Secrets must be encrypted at rest and in transit
 * - Access to secrets must require proper authorization
 * - Secret access must be audited
 * - Raw secret values must never be returned to client applications
 * - Secret rotation must invalidate old values immediately
 */
export interface SecretProvider {
  /**
   * List available provider types
   */
  readonly type: 'local-encrypted' | 'vault' | 'aws-secrets' | 'kubernetes';

  /**
   * Initialize the secret provider
   */
  initialize(config: Record<string, unknown>): Promise<void>;

  /**
   * Create a new secret
   * @throws Error if context lacks authorization
   * @throws Error if secret name already exists
   */
  create(
    context: SecretContext,
    name: string,
    value: string,
    metadata: SecretMetadata,
  ): Promise<SecretReference>;

  /**
   * Read a secret value by reference
   * @throws Error if context lacks authorization
   * @throws Error if secret not found or expired
   * @note The raw secret value is ONLY returned to authorized server-side processes,
   *       never to client applications.
   */
  read(
    context: SecretContext,
    ref: SecretReference,
  ): Promise<string>;

  /**
   * Rotate a secret's value
   * @throws Error if context lacks authorization
   */
  rotate(
    context: SecretContext,
    ref: SecretReference,
    newValue: string,
  ): Promise<SecretReference>;

  /**
   * Revoke (delete) a secret
   * @throws Error if context lacks authorization
   */
  revoke(
    context: SecretContext,
    ref: SecretReference,
  ): Promise<void>;

  /**
   * List secrets matching criteria for an organization
   */
  list(
    context: SecretContext,
    filters?: {
      resourceType?: string;
      resourceId?: string;
      name?: string;
    },
  ): Promise<SecretReference[]>;

  /**
   * Verify that a secret exists and is accessible
   */
  verify(
    context: SecretContext,
    ref: SecretReference,
  ): Promise<SecretVerificationResult>;

  /**
   * Get secret metadata (without the actual secret value)
   */
  getMetadata(
    context: SecretContext,
    ref: SecretReference,
  ): Promise<SecretMetadata>;

  /**
   * Shutdown and cleanup connections
   */
  shutdown(): Promise<void>;
}

/**
 * Provider factory function
 */
export type SecretProviderType = 'local-encrypted' | 'vault' | 'aws-secrets' | 'kubernetes' | 'auto';