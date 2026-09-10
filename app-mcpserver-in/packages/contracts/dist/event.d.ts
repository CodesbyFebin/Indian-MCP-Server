/**
 * Event Contracts - Hardened Production Model
 *
 * EventEnvelope: Immutable, ordered record of something that happened
 * Events are the source of truth; artifacts are materialized views.
 *
 * Guarantees:
 * - sequence uniqueness per aggregate
 * - immutable events
 * - deterministic ordering
 * - idempotency
 * - correlation tracking
 */
import { z } from "zod";
export interface CausedBy {
    causationId: string;
    correlationId?: string;
}
export interface Actor {
    type: 'human' | 'system' | 'engine';
    id: string;
}
export interface Metadata {
    version: string;
    source: string;
    digest: string;
}
export declare const ActorSchema: z.ZodObject<{
    type: z.ZodEnum<["human", "system", "engine"]>;
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "human" | "system" | "engine";
    id: string;
}, {
    type: "human" | "system" | "engine";
    id: string;
}>;
export declare const MetadataSchema: z.ZodObject<{
    version: z.ZodString;
    source: z.ZodString;
    digest: z.ZodString;
}, "strip", z.ZodTypeAny, {
    version: string;
    source: string;
    digest: string;
}, {
    version: string;
    source: string;
    digest: string;
}>;
export declare const EventEnvelopeSchema: z.ZodObject<{
    eventId: z.ZodString;
    eventType: z.ZodString;
    aggregateId: z.ZodString;
    aggregateType: z.ZodString;
    sequence: z.ZodNumber;
    occurredAt: z.ZodString;
    causedBy: z.ZodLazy<z.ZodObject<{
        causationId: z.ZodString;
        correlationId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        causationId: string;
        correlationId?: string | undefined;
    }, {
        causationId: string;
        correlationId?: string | undefined;
    }>>;
    actor: z.ZodObject<{
        type: z.ZodEnum<["human", "system", "engine"]>;
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: "human" | "system" | "engine";
        id: string;
    }, {
        type: "human" | "system" | "engine";
        id: string;
    }>;
    payload: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    metadata: z.ZodObject<{
        version: z.ZodString;
        source: z.ZodString;
        digest: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        version: string;
        source: string;
        digest: string;
    }, {
        version: string;
        source: string;
        digest: string;
    }>;
    contractVersion: z.ZodString;
    schemaVersion: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    eventId: string;
    eventType: string;
    aggregateId: string;
    aggregateType: string;
    sequence: number;
    occurredAt: string;
    causedBy: {
        causationId: string;
        correlationId?: string | undefined;
    };
    actor: {
        type: "human" | "system" | "engine";
        id: string;
    };
    payload: Record<string, unknown>;
    metadata: {
        version: string;
        source: string;
        digest: string;
    };
    contractVersion: string;
    schemaVersion: string;
}, {
    eventId: string;
    eventType: string;
    aggregateId: string;
    aggregateType: string;
    sequence: number;
    occurredAt: string;
    causedBy: {
        causationId: string;
        correlationId?: string | undefined;
    };
    actor: {
        type: "human" | "system" | "engine";
        id: string;
    };
    payload: Record<string, unknown>;
    metadata: {
        version: string;
        source: string;
        digest: string;
    };
    contractVersion: string;
    schemaVersion?: string | undefined;
}>;
export type EventEnvelope = z.infer<typeof EventEnvelopeSchema>;
export declare const DomainEventIntentSchema: z.ZodObject<{
    eventType: z.ZodString;
    aggregateId: z.ZodString;
    payload: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    metadata: z.ZodObject<{
        source: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        source?: string | undefined;
    }, {
        source?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    eventType: string;
    aggregateId: string;
    payload: Record<string, unknown>;
    metadata: {
        source?: string | undefined;
    };
}, {
    eventType: string;
    aggregateId: string;
    payload: Record<string, unknown>;
    metadata: {
        source?: string | undefined;
    };
}>;
export type DomainEventIntent = z.infer<typeof DomainEventIntentSchema>;
export interface EventStore {
    init(): Promise<void>;
    append(envelope: EventEnvelope | EventEnvelope[]): Promise<void>;
    getForAggregate(aggregateId: string): Promise<EventEnvelope[]>;
    getNextSequence(aggregateId: string): Promise<number>;
    getByEventId(eventId: string): Promise<EventEnvelope | null>;
    exists(eventId: string): Promise<boolean>;
    transaction(envelopes: EventEnvelope[]): Promise<void>;
}
export declare class MemoryEventStore implements EventStore {
    private store;
    private sequences;
    init(): Promise<void>;
    append(envelopes: EventEnvelope | EventEnvelope[]): Promise<void>;
    getNextSequence(aggregateId: string): Promise<number>;
    getForAggregate(aggregateId: string): Promise<EventEnvelope[]>;
    getByEventId(eventId: string): Promise<EventEnvelope | null>;
    exists(eventId: string): Promise<boolean>;
    transaction(envelopes: EventEnvelope[]): Promise<void>;
}
export declare class PgEventStore implements EventStore {
    private pool;
    constructor(pool: any);
    init(): Promise<void>;
    append(envelopes: EventEnvelope | EventEnvelope[]): Promise<void>;
    getForAggregate(aggregateId: string): Promise<EventEnvelope[]>;
    getNextSequence(aggregateId: string): Promise<number>;
    getByEventId(eventId: string): Promise<EventEnvelope | null>;
    exists(eventId: string): Promise<boolean>;
    transaction(envelopes: EventEnvelope[]): Promise<void>;
}
//# sourceMappingURL=event.d.ts.map