export interface RegistryEntry {
    id: string;
    type: "server" | "tool" | "resource" | "prompt";
    name: string;
    description: string;
    slug: string;
    version: string;
    capabilities: string[];
    tags: string[];
    evidence: string[];
    verificationStatus: "verified" | "unverified" | "pending";
    publicationStatus: "draft" | "published" | "archived";
    creator: string;
    createdAt: string;
    updatedAt: string;
}
export interface RegistryEvent {
    eventId: string;
    aggregateId: string;
    eventType: "created" | "updated" | "verified" | "published" | "archived";
    payload: Record<string, unknown>;
    occurredAt: string;
}
export type BlueprintEntry = RegistryEntry;
export type GeneratorEntry = RegistryEntry;
export type SectionEntry = RegistryEntry & {
    sectionId: string;
};
export type EngineEntry = RegistryEntry & {
    engineId: string;
    engineVersion: string;
};
export interface RegistryIdentity {
    /** Official registry-assigned ID (preferred) */
    registryId: string | null;
    /** Repository URL (e.g., GitHub, GitLab) */
    repositoryUrl: string | null;
    /** Package identity: name + version hash */
    packageIdentity: string | null;
    /** Canonical homepage URL */
    canonicalHomepage: string | null;
    /** Display name (least preferred for deduplication) */
    displayName: string | null;
}
export interface RegistrySource {
    sourceType: "official" | "registry" | "repository" | "documentation" | "package-registry" | "measurement" | "editorial";
    sourceUrl: string;
    retrievedAt: string;
    metadata?: Record<string, unknown>;
}
export interface RegistryVersion {
    version: string;
    committedAt: string;
    committedBy: string;
    changeSummary: string;
    previousVersion?: string;
}
export interface RegistryChange {
    changeId: string;
    aggregateId: string;
    changeType: "created" | "updated" | "verified" | "published" | "archived" | "deleted";
    changedBy: string;
    changedAt: string;
    previousState?: Record<string, unknown>;
    newState: Record<string, unknown>;
}
export declare class RegistryNormalizer {
    /**
     * Normalize a registry entry, returning its identity and cleaned data
     */
    normalize(entry: RegistryEntry, source: RegistrySource): {
        identity: RegistryIdentity;
        normalized: RegistryEntry;
    };
}
export declare class RegistryDeduplicator {
    /**
     * Deduplicate a list of registry entries by identity
     * Keeps the entry with the highest-priority identity and most recent timestamp
     */
    deduplicate(entries: RegistryEntry[], sources: RegistrySource[]): {
        unique: RegistryEntry[];
        duplicates: {
            entry: RegistryEntry;
            reason: string;
        }[];
        resolutionLog: string[];
    };
}
export declare class RegistryValidator {
    /**
     * Validate a registry entry's required fields and constraints
     */
    validateEntry(entry: RegistryEntry): {
        valid: boolean;
        errors: string[];
    };
    /**
     * Validate a publication decision using the centralized isServerIndexable() rule
     */
    validatePublicationDecision(published: boolean, evidenceCount: number, evidenceVerified: boolean, status: "published" | "unverified" | "draft" | "unknown"): {
        valid: boolean;
        decision: {
            serverId: string;
            published: boolean;
            indexable: boolean;
            reason: string;
            decidedAt: string;
        };
        reason: string;
    };
}
/**
 * Publication authority: deterministic isServerIndexable() rule
 *
 * Rules (evaluated against a server's evidence ledger):
 *   - published + evidence + verified       => indexable
 *   - published + no evidence              => not indexable
 *   - published + unverified               => not indexable
 *   - draft + evidence + verified          => not indexable
 *   - unknown status                       => not indexable
 */
export declare function isServerIndexable(published: boolean, evidenceCount: number, evidenceVerified: boolean, status: "published" | "unverified" | "draft" | "unknown"): {
    indexable: boolean;
    reason: string;
    decidedAt: string;
};
/**
 * Type guard: checks if a server entry satisfies the publication authority
 * (isServerIndexable) based on its stored metadata fields.
 */
export declare function isServerIndexableEntry(entry: {
    publicationStatus?: string;
    verificationStatus?: string;
    evidenceRefs?: string[];
}): boolean;
//# sourceMappingURL=index.d.ts.map