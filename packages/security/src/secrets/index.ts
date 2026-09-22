// packages/security/src/secrets/index.ts
// Phase 6 - Secret Vault Implementation (P0)
// Provider-neutral secret storage interface

export { SecretProvider, SecretProviderType } from './provider';
export { LocalEncryptedProvider } from './local-encrypted';
export { VaultProvider } from './vault';
export { SecretContext, SecretReference, SecretMetadata } from './types';