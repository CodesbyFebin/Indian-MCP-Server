export declare const schemas: {
    organization: {
        "@context": string;
        "@type": string;
        name: string;
        description: string;
        url: string;
        logo: string;
        sameAs: string[];
    };
    website: {
        "@context": string;
        "@type": string;
        name: string;
        url: string;
        description: string;
        potentialAction: {
            "@type": string;
            target: string;
            "query-input": string;
        }[];
    };
    softwareApplication: {
        "@context": string;
        "@type": string;
        name: string;
        description: string;
        url: string;
        operatingSystem: string;
        softwareVersion: string;
        creator: string;
    };
    itemListBase: {
        "@context": string;
        "@type": string;
        numberOfItems: number;
        itemListElement: never[];
    };
    faq: {
        "@context": string;
        "@type": string;
        mainEntity: {
            "@type": string;
            name: string;
            acceptedAnswer: {
                "@type": string;
                text: string;
            };
        }[];
    };
    howTo: {
        "@context": string;
        "@type": string;
        name: string;
        description: string;
        step: {
            text: string;
            position: number;
        }[];
    };
};
export declare function generateHomepageLd(serverCount: number, integrationCount: number, categoryCount: number, recentExecutions: number): ({
    "@context": string;
    "@type": string;
    name: string;
    url: string;
    description: string;
    potentialAction: {
        "@type": string;
        target: string;
        "query-input": string;
    }[];
} | {
    "@context": string;
    "@type": string;
    mainEntity: {
        "@type": string;
        name: string;
        acceptedAnswer: {
            "@type": string;
            text: string;
        };
    }[];
} | {
    "@context": string;
    "@type": string;
    name: string;
    description: string;
    step: {
        text: string;
        position: number;
    }[];
} | {
    "@type": string;
    "@context": string;
    name: string;
    description: string;
    url: string;
    logo: string;
    sameAs: string[];
    numberOfItems?: undefined;
    itemListElement?: undefined;
} | {
    "@type": string;
    "@context": string;
    name: string;
    description: string;
    url: string;
    operatingSystem: string;
    softwareVersion: string;
    creator: string;
    numberOfItems?: undefined;
    itemListElement?: undefined;
} | {
    "@context": string;
    "@type": string;
    numberOfItems: number;
    itemListElement: {
        "@type": string;
        position: number;
        item: {
            "@id": string;
            name: string;
        };
    }[];
})[];
/** Generate JSON-LD for /servers page */
export declare function generateServersLd(serverEntries: Array<{
    slug: string;
    name: string;
    description?: string;
    publisher: string;
    status: "healthy" | "degraded" | "unknown";
    capabilities: string[];
}>): ({
    "@context": string;
    "@type": string;
    name: string;
    url: string;
    description: string;
    potentialAction: {
        "@type": string;
        target: string;
        "query-input": string;
    }[];
} | {
    "@context": string;
    "@type": string;
    numberOfItems: number;
    itemListElement: {
        "@type": string;
        position: number;
        item: {
            "@id": string;
            name: string;
            description: string;
            url: string;
        };
    }[];
})[];
/** Generate JSON-LD for individual server page */
export declare function generateServerLd(server: {
    slug: string;
    name: string;
    description: string;
    publisher: string;
    status: "healthy" | "degraded" | "unknown";
    capabilities: string[];
    version?: string;
    evidence: Array<{
        type: string;
        sourceUrl: string;
        verified: boolean;
    }>;
}, publicationDecision: {
    indexable: boolean;
    reason: string;
}): Record<string, any>;
/** Generate JSON-LD for /integrations page */
export declare function generateIntegrationsLd(integrationEntries: Array<{
    name: string;
    description: string;
    url: string;
    category: string;
}>): ({
    "@context": string;
    "@type": string;
    name: string;
    url: string;
    description: string;
    potentialAction: {
        "@type": string;
        target: string;
        "query-input": string;
    }[];
} | {
    "@context": string;
    "@type": string;
    numberOfItems: number;
    itemListElement: {
        "@type": string;
        position: number;
        item: {
            "@id": string;
            name: string;
            description: string;
            url: string;
        };
    }[];
})[];
/** Generate JSON-LD for /clients page */
export declare function generateClientsLd(clientEntries: Array<{
    name: string;
    description: string;
    type: string;
    url: string;
}>): ({
    "@context": string;
    "@type": string;
    name: string;
    url: string;
    description: string;
    potentialAction: {
        "@type": string;
        target: string;
        "query-input": string;
    }[];
} | {
    "@context": string;
    "@type": string;
    numberOfItems: number;
    itemListElement: {
        "@type": string;
        position: number;
        item: {
            "@id": string;
            name: string;
            description: string;
            url: string;
        };
    }[];
})[];
/** Generate JSON-LD for /evidence page */
export declare function generateEvidenceLd(evidenceEntries: Array<{
    id: string;
    sourceUrl: string;
    sourceType: "official" | "registry" | "repository" | "documentation" | "package-registry" | "measurement" | "editorial";
    status: "verified" | "unverified";
    supports: string[];
}>): ({
    "@context": string;
    "@type": string;
    name: string;
    url: string;
    description: string;
    potentialAction: {
        "@type": string;
        target: string;
        "query-input": string;
    }[];
} | {
    "@context": string;
    "@type": string;
    termCode: string;
    alternateName: string;
    description: string;
    termStatus: string;
    providedBy: {
        "@type": string;
        name: string;
    };
    numberOfItems?: undefined;
    itemListElement?: undefined;
} | {
    "@context": string;
    "@type": string;
    numberOfItems: number;
    itemListElement: {
        "@type": string;
        termCode: string;
        description: string;
        termStatus: string;
        supplementalProperty: {
            supports: string[];
        };
    }[];
    termCode?: undefined;
    alternateName?: undefined;
    description?: undefined;
    termStatus?: undefined;
    providedBy?: undefined;
})[];
/** Generate JSON-LD for /methodology page */
export declare function generateMethodologyLd(): ({
    "@context": string;
    "@type": string;
    name: string;
    url: string;
    description: string;
    potentialAction: {
        "@type": string;
        target: string;
        "query-input": string;
    }[];
} | {
    "@context": string;
    "@type": string;
    termCode: string;
    description: string;
    termStatus: string;
    alternateName: string;
    providedBy: {
        "@type": string;
        name: string;
    };
    exampleOfUsage: string;
})[];
/** Generate JSON-LD for /docs page */
export declare function generateDocsLd(docsEntries: Array<{
    title: string;
    description: string;
    url: string;
    type: "article" | "faq" | "how-to";
}>): ({
    "@context": string;
    "@type": string;
    name: string;
    url: string;
    description: string;
    potentialAction: {
        "@type": string;
        target: string;
        "query-input": string;
    }[];
} | {
    "@context": string;
    "@type": string;
    numberOfItems: number;
    itemListElement: ({
        "@type": string;
        mainEntity: {
            "@type": string;
            name: string;
            acceptedAnswer: {
                "@type": string;
                text: string;
            };
        }[];
        "@context"?: undefined;
        name?: undefined;
        description?: undefined;
        step?: undefined;
        headline?: undefined;
        url?: undefined;
    } | {
        "@context": string;
        "@type": string;
        name: string;
        description: string;
        step: {
            position: number;
            text: string;
        }[];
        mainEntity?: undefined;
        headline?: undefined;
        url?: undefined;
    } | {
        "@context": string;
        "@type": string;
        headline: string;
        description: string;
        url: string;
        mainEntity?: undefined;
        name?: undefined;
        step?: undefined;
    })[];
})[];
/** Generate JSON-LD for /glossary page */
export declare function generateGlossaryLd(termEntries: Array<{
    term: string;
    definition: string;
    definedTerm: string;
    category: string;
}>): ({
    "@context": string;
    "@type": string;
    name: string;
    url: string;
    description: string;
    potentialAction: {
        "@type": string;
        target: string;
        "query-input": string;
    }[];
} | {
    "@context": string;
    "@type": string;
    termCode: string;
    alternateName: string;
    description: string;
    termStatus: string;
    providedBy: {
        "@type": string;
        name: string;
    };
    exampleOfUsage: string;
    numberOfItems?: undefined;
    itemListElement?: undefined;
} | {
    "@context": string;
    "@type": string;
    numberOfItems: number;
    itemListElement: {
        "@type": string;
        termCode: string;
        description: string;
        termStatus: string;
    }[];
    termCode?: undefined;
    alternateName?: undefined;
    description?: undefined;
    termStatus?: undefined;
    providedBy?: undefined;
    exampleOfUsage?: undefined;
})[];
//# sourceMappingURL=schemas.d.ts.map