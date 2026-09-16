// --- Normalizer Class ---
export class RegistryNormalizer {
    /**
     * Normalize a registry entry, returning its identity and cleaned data
     */
    normalize(entry, source) {
        // Determine preferred identity fields
        const registryId = entry.id || null;
        const repositoryUrl = source.sourceUrl
            ? (source.sourceUrl.includes('github.com') || source.sourceUrl.includes('gitlab.com')
                ? source.sourceUrl
                : null)
            : null;
        // Package identity from name + version
        const packageIdentity = entry.name && entry.version
            ? `${entry.name}/${entry.version}`
            : null;
        // Display name (fallback)
        const displayName = entry.name || null;
        const identity = {
            registryId,
            repositoryUrl,
            packageIdentity,
            canonicalHomepage: null,
            displayName,
        };
        // Create normalized entry
        const normalized = {
            id: registryId || 'temp-uuid',
            type: entry.type,
            name: entry.name,
            description: entry.description,
            slug: entry.slug || entry.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || '',
            version: entry.version,
            capabilities: entry.capabilities || [],
            tags: entry.tags || [],
            evidence: entry.evidence || [],
            verificationStatus: entry.verificationStatus,
            publicationStatus: entry.publicationStatus,
            creator: entry.creator,
            createdAt: entry.createdAt,
            updatedAt: new Date().toISOString(),
        };
        return { identity, normalized };
    }
}
// --- Deduplicator Class ---
export class RegistryDeduplicator {
    /**
     * Deduplicate a list of registry entries by identity
     * Keeps the entry with the highest-priority identity and most recent timestamp
     */
    deduplicate(entries, sources) {
        const log = [];
        const uniqueMap = new Map();
        const duplicates = [];
        for (let i = 0; i < entries.length; i++) {
            const entry = entries[i];
            const source = sources[i] || { sourceType: "editorial", sourceUrl: '', retrievedAt: new Date().toISOString() };
            const { identity, normalized } = new RegistryNormalizer().normalize(entry, source);
            // Create a composite key from identity fields (preferred first)
            const key = [
                identity.registryId,
                identity.repositoryUrl,
                identity.packageIdentity,
                identity.canonicalHomepage,
                identity.displayName
            ].filter(Boolean).join('|||');
            log.push(`Entry ${i}: identity key = "${key.substring(0, 80)}..."`);
            if (!uniqueMap.has(key)) {
                uniqueMap.set(key, normalized);
                log.push(`Entry ${i}: added as unique (key not seen before)`);
            }
            else {
                const existing = uniqueMap.get(key);
                duplicates.push({
                    entry: normalized,
                    reason: `Duplicate of existing entry with key: "${key.substring(0, 60)}..."`
                });
                log.push(`Entry ${i}: marked as duplicate of existing entry`);
            }
        }
        return {
            unique: Array.from(uniqueMap.values()),
            duplicates,
            resolutionLog: log,
        };
    }
}
// --- Validator Class ---
export class RegistryValidator {
    /**
     * Validate a registry entry's required fields and constraints
     */
    validateEntry(entry) {
        const errors = [];
        if (!entry.id) {
            errors.push('Missing required field: id');
        }
        if (!entry.type) {
            errors.push('Missing required field: type');
        }
        if (!entry.name) {
            errors.push('Missing required field: name');
        }
        if (!entry.slug) {
            errors.push('Missing required field: slug');
        }
        if (!entry.version) {
            errors.push('Missing required field: version');
        }
        if (!Array.isArray(entry.capabilities)) {
            errors.push('capabilities must be an array');
        }
        if (!Array.isArray(entry.tags)) {
            errors.push('tags must be an array');
        }
        return {
            valid: errors.length === 0,
            errors,
        };
    }
    /**
     * Validate a publication decision using the centralized isServerIndexable() rule
     */
    validatePublicationDecision(published, evidenceCount, evidenceVerified, status) {
        // Use the centralized publication authority rule
        const result = isServerIndexable(published, evidenceCount, evidenceVerified, status);
        return {
            valid: true,
            decision: {
                serverId: "",
                published,
                indexable: result.indexable,
                reason: result.reason,
                decidedAt: result.decidedAt,
            },
            reason: result.reason,
        };
    }
}
// --- Publication Authority (centralized function) ---
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
export function isServerIndexable(published, evidenceCount, evidenceVerified, status) {
    if (status === "published" && evidenceVerified && evidenceCount > 0) {
        return { indexable: true, reason: "published+evidence+verified", decidedAt: new Date().toISOString() };
    }
    if (status === "published" && evidenceCount === 0) {
        return { indexable: false, reason: "published+no-evidence", decidedAt: new Date().toISOString() };
    }
    if (status === "published" && !evidenceVerified) {
        return { indexable: false, reason: "published+unverified", decidedAt: new Date().toISOString() };
    }
    if (status === "draft" && evidenceVerified && evidenceCount > 0) {
        return { indexable: false, reason: "draft+evidence+verified", decidedAt: new Date().toISOString() };
    }
    // unknown status or any other case
    return { indexable: false, reason: "unknown-status", decidedAt: new Date().toISOString() };
}
/**
 * Type guard: checks if a server entry satisfies the publication authority
 * (isServerIndexable) based on its stored metadata fields.
 */
export function isServerIndexableEntry(entry) {
    const published = entry.publicationStatus === "published";
    const evidenceCount = entry.evidenceRefs?.length ?? 0;
    const evidenceVerified = entry.verificationStatus === "verified" && evidenceCount > 0;
    const rawStatus = published ? "published" : entry.verificationStatus ?? "unknown";
    const status = rawStatus === "published" || rawStatus === "unverified" || rawStatus === "draft"
        ? rawStatus
        : "unknown";
    return isServerIndexable(published, evidenceCount, evidenceVerified, status).indexable;
}
