/**
 * MCPserver.in Content Registry
 *
 * Single source of truth for every editorial page on the public knowledge
 * graph. Route templates consume this registry — they do not define their own
 * metadata. Every entry carries: slug, route, type, intent, parent/children,
 * related links, publication status, and schema identity.
 *
 * The registry is deliberately data-only. Publication eligibility is decided
 * by the publication authority (isServerIndexable), not by this file.
 */

export type ContentType =
  | "pillar"
  | "guide"
  | "client"
  | "comparison"
  | "security"
  | "glossary"
  | "state-of-mcp"
  | "category"
  | "capability";

export type Intent =
  | "informational"
  | "commercial"
  | "transactional"
  | "troubleshooting"
  | "navigational";

export type Status = "draft" | "review" | "published" | "stale" | "retired";

export type SchemaType = "article" | "collection" | "software" | "definedterm";

export interface ContentFaq {
  question: string;
  answer: string;
}

export interface ContentSection {
  heading: string;
  markdown: string;
}

export interface RegistryEntry {
  slug: string;
  parent: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  type: ContentType;
  intent: Intent;
  status: Status;
  noindex?: boolean;
  indexPath: string;
  sections?: ContentSection[];
  faq?: ContentFaq[];
  relatedInternalLinks?: { label: string; href: string }[];
  schemaType: SchemaType;
  reviewedAt?: string;
}

/** Default metadata + sections for a learn pillar. */
function learnEntry(
  slug: string,
  opts: {
    title: string;
    meta: string;
    h1: string;
    intent: Intent;
    direct: string;
    sections: ContentSection[];
    faq?: ContentFaq[];
    related?: { label: string; href: string }[];
  },
): RegistryEntry {
  return {
    slug,
    parent: "learn",
    title: opts.title,
    metaTitle: `${opts.title} — MCPserver.in`,
    metaDescription: opts.meta,
    h1: opts.h1,
    type: "pillar",
    intent: opts.intent,
    status: "published",
    indexPath: `/learn/${slug}`,
    schemaType: "article",
    reviewedAt: "2026-08-22",
    sections: [
      {
        heading: "TL;DR",
        markdown: opts.direct,
      },
      ...opts.sections,
    ],
    faq: opts.faq,
    relatedInternalLinks: opts.related,
  };
}

/** Default metadata for a guide pillar. */
function guideEntry(
  slug: string,
  opts: {
    title: string;
    meta: string;
    h1: string;
    intent: Intent;
    direct: string;
    sections: ContentSection[];
    noindex?: boolean;
  },
): RegistryEntry {
  return {
    slug,
    parent: "guides",
    title: opts.title,
    metaTitle: `${opts.title} — MCPserver.in`,
    metaDescription: opts.meta,
    h1: opts.h1,
    type: "guide",
    intent: opts.intent,
    status: "published",
    noindex: opts.noindex,
    indexPath: `/guides/${slug}`,
    schemaType: "article",
    reviewedAt: "2026-08-22",
    sections: [
      { heading: "TL;DR", markdown: opts.direct },
      ...opts.sections,
    ],
  };
}

/** Default metadata for a security pillar. */
function securityEntry(
  slug: string,
  opts: {
    title: string;
    meta: string;
    h1: string;
    direct: string;
    sections: ContentSection[];
  },
): RegistryEntry {
  return {
    slug,
    parent: "security",
    title: opts.title,
    metaTitle: `${opts.title} — MCPserver.in`,
    metaDescription: opts.meta,
    h1: opts.h1,
    type: "security",
    intent: "informational",
    status: "published",
    indexPath: `/security/${slug}`,
    schemaType: "article",
    reviewedAt: "2026-08-22",
    sections: [
      { heading: "TL;DR", markdown: opts.direct },
      ...opts.sections,
    ],
  };
}

/** Default metadata for a glossary term. */
function glossaryEntry(
  slug: string,
  opts: {
    title: string;
    meta: string;
    h1: string;
    direct: string;
    sections: ContentSection[];
    noindex?: boolean;
  },
): RegistryEntry {
  return {
    slug,
    parent: "glossary",
    title: opts.title,
    metaTitle: `${opts.title} — MCPserver.in Glossary`,
    metaDescription: opts.meta,
    h1: opts.h1,
    type: "glossary",
    intent: "informational",
    status: "published",
    noindex: opts.noindex,
    indexPath: `/glossary/${slug}`,
    schemaType: "definedterm",
    reviewedAt: "2026-08-23",
    sections: [
      { heading: "Definition", markdown: opts.direct },
      ...opts.sections,
    ],
  };
}

/** Default metadata for a client page. */
function clientEntry(
  slug: string,
  opts: {
    title: string;
    meta: string;
    h1: string;
    direct: string;
    sections: ContentSection[];
  },
): RegistryEntry {
  return {
    slug,
    parent: "clients",
    title: opts.title,
    metaTitle: `${opts.title} — MCPserver.in`,
    metaDescription: opts.meta,
    h1: opts.h1,
    type: "client",
    intent: "transactional",
    status: "published",
    indexPath: `/clients/${slug}`,
    schemaType: "article",
    reviewedAt: "2026-08-22",
    sections: [
      { heading: "TL;DR", markdown: opts.direct },
      ...opts.sections,
    ],
  };
}

/** Default metadata for a build page. */
function buildEntry(
  slug: string,
  opts: {
    title: string;
    meta: string;
    h1: string;
    direct: string;
    sections: ContentSection[];
  },
): RegistryEntry {
  return {
    slug,
    parent: "build",
    title: opts.title,
    metaTitle: `${opts.title} — MCPserver.in`,
    metaDescription: opts.meta,
    h1: opts.h1,
    type: "guide",
    intent: "transactional",
    status: "published",
    indexPath: `/build/${slug}`,
    schemaType: "article",
    reviewedAt: "2026-08-22",
    sections: [
      { heading: "TL;DR", markdown: opts.direct },
      ...opts.sections,
    ],
  };
}

/**
 * Registry keyed by canonical path so lookups are deterministic and safe.
 * A page is only indexable when it satisfies the publication authority:
 * published status AND evidence AND not noindex AND not quarantined.
 */
export const contentRegistry: Record<string, RegistryEntry> = Object.fromEntries(
  ([
    /* ============================================================
     * LEARN PILLARS 1–10
     * ============================================================ */
    learnEntry("model-context-protocol", {
      title: "Model Context Protocol",
      meta: "Model Context Protocol (MCP) explained: what it is, why it exists, how it works, and the host/client/server architecture.",
      h1: "Model Context Protocol (MCP): what it is and how it works",
      intent: "informational",
      direct:
        "The Model Context Protocol (MCP) is an open protocol that connects AI applications — the 'clients' — to external servers that expose tools, resources, and prompts. A host application (such as a coding agent or desktop assistant) delegates to a client, which communicates with one or more servers over a JSON-RPC transport. Servers run locally over stdio or remotely over HTTP. MCP standardizes what used to be a tangle of one-off integrations.",
      sections: [
        {
          heading: "Why MCP exists",
          markdown:
            "Before MCP, connecting an AI assistant to a database, a search engine, or a file system meant writing a bespoke integration for every data source and every assistant. Each pair had to agree on request shape, authentication, and error handling. MCP defines one protocol so that a single server can be consumed by any compatible client, and a single client can drive any server that follows the protocol.",
        },
        {
          heading: "How MCP works",
          markdown:
            "MCP is built on the JSON-RPC 2.0 message format. At startup, the client sends an initialize request carrying a protocol version and a list of capabilities. The server replies with its own version and capabilities. The two sides then exchange notifications. Once connected, the client can list tools, call tools, read resources, and list prompts.",
        },
        {
          heading: "Host vs client vs server",
          markdown:
            "The MCP specification distinguishes three roles. A host is the surrounding application that holds a user or agent context and provides the UI or the model. A client is the protocol participant that maintains a one-to-one connection to a server and translates host intent into protocol requests. A server exposes the protocol primitives — tools, resources, prompts — for a specific capability.",
        },
        {
          heading: "Tools, resources, and prompts",
          markdown:
            "Servers expose three kinds of primitives. Tools are callable functions defined by an input schema and invoked via tools/call. Resources are addressable data returned through a read request with an optional MIME type. Prompts are reusable invocation templates the client can present to the user. Each primitive has its own list-and-request lifecycle.",
        },
        {
          heading: "Local vs remote servers",
          markdown:
            "A server may run on the same machine as the client and communicate over stdio, or on a remote host and communicate over HTTP. Local servers are simple to start and require no network. Remote servers are addressable over the network and involve authentication. The protocol supports both; which one applies depends on the server implementation.",
        },
      ],
    }),

    learnEntry("mcp-server", {
      title: "MCP server",
      meta: "What an MCP server is, what it exposes, how local and remote servers differ, and how to choose and run one.",
      h1: "What is an MCP server?",
      intent: "informational",
      direct:
        "An MCP server is software that exposes tools, resources, or prompts through the Model Context Protocol so an AI client can interact with an external system. A server may run locally over stdio or remotely over HTTP. The client discovers the server's capabilities through MCP and calls them through the protocol.",
      sections: [
        {
          heading: "What a server exposes",
          markdown:
            "Every server can expose any combination of tools, resources, and prompts. A database server might expose a query tool; a search server might expose a search tool and a results resource. Nothing in the protocol requires a server to expose all three.",
        },
        {
          heading: "Local server",
          markdown:
            "A local server runs on the same machine as the client and communicates over stdio: the client spawns the server process and exchanges JSON-RPC over standard input and output. This is the simplest deployment and requires no network exposure or authentication.",
        },
        {
          heading: "Remote server",
          markdown:
            "A remote server runs on another host and is reachable over HTTP. A client establishes a session over the network. Authentication is the server's responsibility; the specification supports OAuth-based authorization for protected resources.",
        },
        {
          heading: "How servers are discovered",
          markdown:
            "A client learns a server's capabilities by sending tools/list, resources/list, and prompts/list and reading the returned schemas. There is no global registry requirement; discovery comes from the protocol conversation itself.",
        },
        {
          heading: "How to choose a server",
          markdown:
            "Before using a server, verify what tools or resources it actually exposes, whether it needs credentials, whether it can mutate state, and whether it follows a transport and authentication you can support. Read the server's source or documentation rather than trusting a name alone.",
        },
      ],
    }),

    learnEntry("mcp-client", {
      title: "MCP client",
      meta: "What an MCP client is, the client lifecycle, tool and resource calls, and which applications function as clients.",
      h1: "What is an MCP client?",
      intent: "informational",
      direct:
        "An MCP client is software that runs the Model Context Protocol, discovers a server's capabilities, and invokes tools, resources, and prompts on the server's behalf. A client is driven by a host — the application with the user or model context. Clients connect to servers, transmit protocol requests, and deliver responses back to the host.",
      sections: [
        {
          heading: "Host vs client",
          markdown:
            "The MCP specification separates the host from the client. The host is the application that holds context — the desktop app, the coding tool, or the agent runtime. The client is the protocol-facing component it uses. Separating the two lets one host manage many server connections.",
        },
        {
          heading: "Client lifecycle",
          markdown:
            "A client lifecycle mirrors the MCP initialization sequence. The client sends an initialize request, receives the server's capabilities, exchanges an initialized notification, then performs primitive operations: tools/list, resources/list, prompts/list, then the corresponding call/read/get requests.",
        },
        {
          heading: "Tool and resource calls",
          markdown:
            "A client calls a tool with tools/call, supplying arguments that match the tool's declared schema, and receives content back. For resources, a client reads them by URI. Which primitives are available is negotiated during initialization.",
        },
      ],
    }),

    learnEntry("mcp-architecture", {
      title: "MCP architecture",
      meta: "The MCP three-layer architecture: host, client, and server, plus the request lifecycle, capability negotiation, and transports.",
      h1: "MCP architecture: hosts, clients, and servers",
      intent: "informational",
      direct:
        "MCP has a three-layer architecture. The host holds the user or model context. A client, bounded by one connection per server, translates that context into protocol requests. Servers expose tools, resources, and prompts. Hosts, clients, and servers exchange JSON-RPC messages over stdio or HTTP, negotiating capabilities during initialization.",
      sections: [
        {
          heading: "The three layers",
          markdown:
            "The MCP specification defines three explicit layers. The host application manages multiple client instances and provides the surrounding context. Each client maintains exactly one connection to one server. Each server exposes the protocol primitives for a particular capability. Keeping these separate produces a clean division of responsibility.",
        },
        {
          heading: "Request lifecycle",
          markdown:
            "A request begins at the host, is translated by a client into a JSON-RPC message, travels over the transport to the server, is processed, and the response returns through the client to the host. Both sides may also send notifications, which require no response.",
        },
        {
          heading: "Capability negotiation",
          markdown:
            "During initialize, the client declares the capabilities it supports and the server declares its own. This tells each side which features to rely on. Negotiation lets servers and clients of different implementations interoperate safely.",
        },
        {
          heading: "Transports",
          markdown:
            "The message layer is transport-agnostic. Local servers use stdio. Remote servers use HTTP. The choice affects security, authentication, and deployment, but the protocol layer stays the same.",
        },
      ],
    }),

    learnEntry("mcp-tools", {
      title: "MCP tools",
      meta: "What MCP tools are: the tools/list and tools/call lifecycle, tool schemas, arguments, execution, and security.",
      h1: "MCP tools: discovery, schemas, and invocation",
      intent: "informational",
      direct:
        "MCP tools are callable functions a server exposes to a client. A client lists them with tools/list to get each tool's name, description, and input schema, then invokes one with tools/call, passing arguments that fit the schema. The server returns content in the response.",
      sections: [
        {
          heading: "Tool discovery",
          markdown:
            "A client sends tools/list and receives an array of tools. Each tool entry describes its name, a description, and an input schema — commonly JSON Schema. This lets a client present the right arguments without prior knowledge of the tool.",
        },
        {
          heading: "Schemas and arguments",
          markdown:
            "The input schema defines the shape of arguments a tool accepts: which fields are required, their types, and their descriptions. The client validates or at least shapes its request against the schema before sending tools/call.",
        },
        {
          heading: "Tool execution",
          markdown:
            "The client sends tools/call with the tool name and arguments. The server executes the operation and returns the result as content. Whether a tool mutates state is determined by the server implementation.",
        },
        {
          heading: "Tool security",
          markdown:
            "Tools are the primary action surface of MCP. A tool that can write to a database or a file system carries real risk if invoked by an AI agent. Treat tool permissions as a trust boundary: verify what a tool does, what access it has, and whether it should be read-only.",
        },
      ],
    }),

    learnEntry("mcp-resources", {
      title: "MCP resources",
      meta: "What MCP resources are, resource URIs, the resources/list request, and how resources differ from tools.",
      h1: "MCP resources: exposing data to clients",
      intent: "informational",
      direct:
        "MCP resources are data a server exposes for reading. Each resource has a URI; a client lists available resources with resources/list and reads one by its URI. Content comes back with a MIME type. Resources model data, whereas tools model actions.",
      sections: [
        {
          heading: "Resource URIs",
          markdown:
            "A resource is identified by a URI. The URI is how a client addresses a specific piece of data — a document, a schema, a status object. The server defines which URIs it exposes.",
        },
        {
          heading: "Listing and reading",
          markdown:
            "A client discovers available resources through resources/list and can use resource templates to anticipate URIs. To retrieve content, it reads the resource by URI and receives the value plus its MIME type.",
        },
        {
          heading: "Resources vs tools",
          markdown:
            "Resources are passive data the client reads. Tools are actions the client triggers. A version-control server might expose branches and files as resources and expose commit or merge operations as tools. Choosing one or the other affects how the client presents the server.",
        },
      ],
    }),

    learnEntry("mcp-prompts", {
      title: "MCP prompts",
      meta: "What MCP prompts are, the prompts/list and prompts/get lifecycle, prompt arguments, and how prompts differ from tools.",
      h1: "MCP prompts: reusable invocation templates",
      intent: "informational",
      direct:
        "MCP prompts are reusable templates a server exposes so a client can present structured invocation patterns to a user. A client lists prompts with prompts/list and retrieves one with prompts/get, supplying arguments that fill the template. Prompt support is client-specific.",
      sections: [
        {
          heading: "Prompt discovery",
          markdown:
            "A server may expose templates that package a set of argument-driven instructions. The client lists them and can present each to the user as a suggested start to a task. Whether a client surfaces prompts as first-class UI is up to the client.",
        },
        {
          heading: "Arguments",
          markdown:
            "A prompt template declares the arguments it accepts. The client prompts the user for values and fills them in, turning the template into concrete working instructions.",
        },
        {
          heading: "Prompts vs tools",
          markdown:
            "A prompt is input to a model — guidance the client hands to a user or model to structure a response. A tool is an executable action. The distinction matters for how the client models each, though both are declared and negotiated through the protocol.",
        },
      ],
    }),

    learnEntry("mcp-protocol", {
      title: "MCP protocol",
      meta: "The MCP protocol: JSON-RPC message layer, initialization, capability negotiation, primitives, and transports.",
      h1: "The MCP protocol under the hood",
      intent: "informational",
      direct:
        "MCP is a JSON-RPC protocol layered on top of a transport. Two applications build one-way JSON-RPC message routes over stdio or HTTP. The protocol establishes authentication, capability negotiation, and a defined lifecycle for tools, resources, and prompts.",
      sections: [
        {
          heading: "Message layer",
          markdown:
            "The message layer uses JSON-RPC. The two applications create connections in which one side sends requests and the other responds; notifications flow in either direction without a reply.",
        },
        {
          heading: "Initialization",
          markdown:
            "Every connection begins with an initialize request. It identifies the protocol version and the client's capabilities. The server replies with its version and capabilities. Both sides agree on a baseline before any tool or resource operation.",
        },
        {
          heading: "Primitives lifecycle",
          markdown:
            "Tools, resources, and prompts each have a list-request and an invocation lifecycle. The client discovers what the server supports, then exercises it. Each primitive is a first-class protocol concept, not a special case.",
        },
        {
          heading: "Authorization",
          markdown:
            "For remote servers, the specification supports OAuth-based authorization for advertised protected endpoints. Authentication controls who may connect; the transported messages remain JSON-RPC.",
        },
      ],
    }),

    learnEntry("mcp-use-cases", {
      title: "MCP use cases",
      meta: "Real MCP use cases across development workflows, databases, browser automation, research, and enterprise systems.",
      h1: "MCP use cases",
      intent: "informational",
      direct:
        "MCP's value is that one protocol connects many AI clients to many external systems. Common use cases include developer workflows (databases, version control, issue trackers), research and knowledge access (web search, document parsing), and automation of browser, DevOps, and cloud tasks.",
      sections: [
        {
          heading: "Developer workflows",
          markdown:
            "The most visible MCP use case is developer tooling: servers give coding agents access to databases, file systems, version-control repositories, and issue trackers so the agent can query state and act within a defined tool surface.",
        },
        {
          heading: "Research and knowledge",
          markdown:
            "Search and knowledge servers expose web search and document parsing through MCP, letting an assistant gather current information instead of relying on stale context. These are popular early MCP integrations.",
        },
        {
          heading: "Automation",
          markdown:
            "Browser, DevOps, and cloud servers expose automation tools. They grant an assistant the ability to drive a browser, manage infrastructure, or query cloud services — which carries greater permission and security responsibility.",
        },
      ],
    }),

    learnEntry("how-mcp-works", {
      title: "How MCP works",
      meta: "A step-by-step explanation of how an MCP request flows from host to client to server and back, with common failure points.",
      h1: "How does MCP work, step by step?",
      intent: "informational",
      direct:
        "MCP works through a defined request flow. A host instructs a client; the client sends a JSON-RPC request over a transport to a server; the server handles it and returns a response; the client returns the result to the host. Initialization negotiates capabilities before any request is served.",
      sections: [
        {
          heading: "The request flow",
          markdown:
            "First, the client initializes the connection and exchanges capabilities. Then the host asks the client for something a server can provide. The client sends the appropriate protocol request — tools/call, resources/read, or prompts/get — to the server. The server processes it and returns a structured response, which the client passes back to the host.",
        },
        {
          heading: "Common failure points",
          markdown:
            "Most failures occur at the boundaries: the server is not running or not on the expected transport; capability negotiation failed so a requested primitive is unavailable; the transport dropped the connection; or the server rejected authentication. Because the protocol is clear, most problems are detectable by inspecting the client and server logs during initialization.",
        },
      ],
    }),

    learnEntry("mcp-json-rpc", {
      title: "MCP JSON-RPC",
      meta: "MCP uses JSON-RPC 2.0 as its message layer: request/response/notification structure, batch requests, and error codes.",
      h1: "MCP JSON-RPC message layer",
      intent: "informational",
      direct:
        "MCP encodes its protocol messages as JSON-RPC 2.0. The client and server exchange requests, responses, and notifications over the transport. Each request has an id; responses carry that id and either a result or an error object with a code and message. Notifications have no id and no response.",
      sections: [
        {
          heading: "Request and response",
          markdown:
            "A JSON-RPC request is an object with jsonrpc: '2.0', method, params (optional), and id. A response matches the id and contains either result or error. The error object has a numeric code and a message string, and optional data.",
        },
        {
          heading: "Notifications",
          markdown:
            "A notification is a request without an id. The sender does not expect a response. MCP uses notifications for progress updates, logging, and server-initiated events such as tool list changes.",
        },
        {
          heading: "Batch requests",
          markdown:
            "JSON-RPC 2.0 supports batch requests: an array of request objects sent together. The receiver processes each and returns an array of responses. MCP allows batching for efficiency.",
        },
        {
          heading: "Error codes",
          markdown:
            "Standard JSON-RPC error codes apply: -32700 (parse error), -32600 (invalid request), -32601 (method not found), -32602 (invalid params), -32603 (internal error). MCP may define additional application-level error codes in the -32000 to -32099 range.",
        },
      ],
    }),

    learnEntry("mcp-stdio", {
      title: "MCP stdio transport",
      meta: "The stdio transport runs the server as a child process and exchanges JSON-RPC over standard input and output.",
      h1: "MCP stdio transport",
      intent: "informational",
      direct:
        "The stdio transport spawns the server as a local child process. The client writes JSON-RPC messages to the server's stdin and reads responses from stdout. This is the simplest deployment: no network, no authentication, the server inherits the client's environment.",
      sections: [
        {
          heading: "How it works",
          markdown:
            "The client launches the server executable with the configured command and arguments. Both sides exchange newline-delimited JSON-RPC messages. The server process lifecycle is managed by the client; when the client exits, the server is terminated.",
        },
        {
          heading: "Use cases",
          markdown:
            "Stdio is ideal for local development, single-user tools, and servers that must access local resources (files, databases, shell) with the user's permissions. It requires no network configuration.",
        },
        {
          heading: "Limitations",
          markdown:
            "Stdio servers cannot be reached by remote clients. They run on the same machine as the client, so they are not suitable for multi-user or networked deployments.",
        },
      ],
    }),

    learnEntry("mcp-streamable-http", {
      title: "MCP Streamable HTTP transport",
      meta: "The Streamable HTTP transport runs MCP over HTTP with server-sent events for server-to-client messages and POST for client-to-server.",
      h1: "MCP Streamable HTTP transport",
      intent: "informational",
      direct:
        "Streamable HTTP is the MCP remote transport. The client POSTs JSON-RPC requests to the server's HTTP endpoint; the server responds with the JSON-RPC response. For server-to-client messages (notifications, streaming responses), the server uses server-sent events (SSE) over a long-lived connection.",
      sections: [
        {
          heading: "Request flow",
          markdown:
            "The client sends a POST request with a JSON-RPC message to the server URL. The server processes it and returns the response in the HTTP response body. For streaming, the client opens an SSE connection to receive notifications and long-running responses.",
        },
        {
          heading: "Authentication",
          markdown:
            "Remote servers must authenticate callers. The MCP specification supports OAuth-based authorization for protected resources. Bearer tokens are the common mechanism.",
        },
        {
          heading: "Deployment",
          markdown:
            "Streamable HTTP servers run as network services. They require a reachable URL, TLS in production, and proper authentication. They enable multi-user and remote access.",
        },
      ],
    }),

    /* ============================================================
     * GUIDE PILLARS 14–20, 44–50 (Wave 5)
     * ============================================================ */
    guideEntry("best-mcp-servers", {
      title: "Best MCP servers",
      meta: "How MCPserver.in selects and qualifies MCP servers, using documented capabilities rather than fabricated scores.",
      h1: "Best MCP servers (evidence-based)",
      intent: "commercial",
      direct:
        "MCPserver.in does not produce subjectively-ranked 'best' lists. We qualify servers by documented capabilities and source provenance. A server is presented as recommended for a category only when its exposed tools and read/write behavior are evidenced. No numeric scores or star ratings are used.",
      sections: [
        {
          heading: "Selection criteria",
          markdown:
            "A server qualifies for a recommendation when it satisfies the publication authority: a non-placeholder implementation, documented tool surface, identifiable maintainer, and verifiable source repository. Read/write behavior is called out explicitly because it determines risk.",
        },
        {
          heading: "Categories evaluated",
          markdown:
            "The catalog groups servers by use case: developer workflows, databases, browser automation, research and search, and productivity. Each category page explains what users in that category need and links to qualified server entities.",
        },
      ],
    }),

    guideEntry("how-to-choose-mcp-server", {
      title: "How to choose an MCP server",
      meta: "A decision framework for choosing an MCP server: maintainer, source, documentation, transport, permissions, and read/write behavior.",
      h1: "How to choose an MCP server",
      intent: "informational",
      direct:
        "Choose an MCP server by evaluating source provenance, exposed capabilities, transport, authentication, and read/write behavior — not by name recognition or popularity. Prefer a server whose source you can inspect, whose tools match your task, and whose permissions you can constrain to least privilege.",
      sections: [
        {
          heading: "What to evaluate",
          markdown:
            "Review the maintainer and repository, the documentation quality, the transport(s) supported, the authentication required, whether tools can mutate state, and when the project was last updated. A read-only server is lower risk for AI-agent use than one that can write.",
        },
        {
          heading: "Evidence over popularity",
          markdown:
            "Prefer claims you can verify from the repository and docs over popularity signals. A widely-downloaded package is not necessarily well-maintained or safe. Where possible, confirm the tools a server exposes before granting it access.",
        },
      ],
    }),

    guideEntry("verified-mcp-servers", {
      title: "Verified MCP servers",
      meta: "What verified status means at MCPserver.in: evidence, source provenance, and the difference between measurement and declaration.",
      h1: "Verified MCP servers: what verified means",
      intent: "informational",
      direct:
        "At MCPserver.in, 'verified' means a server has satisfied the publication authority — it is published, its exposed capabilities are documented, and it has qualifying source evidence. Verification reflects documented facts and provenance, not a rating.",
      sections: [
        {
          heading: "Verification states",
          markdown:
            "A server is either verified (passes the publication authority) or not verified (missing evidence, a placeholder, or quarantined). The state is derived from the evidence ledger, not a subjective editorial opinion.",
        },
        {
          heading: "Measurement vs declaration",
          markdown:
            "When a capability is asserted by the maintainer, that is a declaration. When it is independently confirmed from source, that is measurement. We label which applies. Declarations alone do not flip a server to fully verified unless corroborated.",
        },
      ],
    }),

    guideEntry("mcp-server-comparison", {
      title: "MCP server comparison methodology",
      meta: "How MCPserver.in compares MCP servers: what we compare, when comparisons are published, and the evidence requirements.",
      h1: "MCP server comparison methodology",
      intent: "commercial",
      direct:
        "MCPserver.in publishes a comparison only when both sides are evidence-backed, search intent exists, and meaningful differences exist. Comparisons are structured tables of documented capabilities, transport, authentication, and read/write behavior — not opinion scores.",
      sections: [
        {
          heading: "When we compare",
          markdown:
            "A comparison page requires two or more qualified server entities, a real decision the reader faces, and non-trivial differences worth showing. We do not generate automatic 'A vs B' pages for every pair.",
        },
        {
          heading: "What we compare",
          markdown:
            "Capabilities exposed, transport, authentication, client compatibility (where evidenced), read/write behavior, use cases, and known limitations. Rows are sourced from the evidence ledger.",
        },
      ],
    }),

    guideEntry("mcp-marketplaces", {
      title: "MCP registries, directories, and marketplaces",
      meta: "The difference between an MCP registry, a directory, a marketplace, and a discovery platform, and how to evaluate each.",
      h1: "MCP registry vs directory vs marketplace",
      intent: "informational",
      direct:
        "An MCP registry stores machine-readable server metadata that clients and verification tools consume. A directory is a human-searchable catalog of servers. A marketplace adds purchase or install flows. A discovery platform combines several of these. They differ in what they store and what they let you do.",
      sections: [
        {
          heading: "Registry",
          markdown:
            "A registry is structured data about servers — names, versions, metadata — intended to be consumed programmatically. It is a source of truth for machine tools rather than a browsing interface.",
        },
        {
          heading: "Directory and marketplace",
          markdown:
            "A directory presents servers for humans to browse and compare. A marketplace layers on install or commercial flows. MCPserver.in is a directory and knowledge resource; it is not itself the authoritative registry.",
        },
      ],
    }),

    /* ============================================================
     * SECURITY PILLARS 41–43 (Wave 4)
     * ============================================================ */
    securityEntry("mcp-security", {
      title: "MCP security",
      meta: "An MCP security overview: threat model, authentication, tool permissions, prompt injection, and least privilege.",
      h1: "MCP security overview",
      direct:
        "MCP security is about controlling what an AI client can do through a server. The main surfaces are authentication (who can connect), tool permissions (what a tool can do), and data handling (secrets, PII, and prompt injection). Least privilege is the core principle: grant the minimum access a task requires.",
      sections: [
        {
          heading: "Threat model",
          markdown:
            "The primary risk is that an AI agent operating through tools performs an action its operator did not intend. Secondary risks include malicious or compromised servers, prompt injection steering the agent, credential leakage, and overly broad tool access.",
        },
        {
          heading: "Authentication and authorization",
          markdown:
            "Remote servers must authenticate callers. Bearer tokens and OAuth are the common mechanisms. Authorization decides which caller may invoke which tool. Separating authentication from authorization keeps control proportional.",
        },
        {
          heading: "Tool permissions and read-only",
          markdown:
            "Grant tools the minimum capability required. Prefer read-only servers for AI-agent callers. Treat any write-capable tool as a high-risk surface and review it before enabling.",
        },
        {
          heading: "Prompt injection and secrets",
          markdown:
            "Prompt injection is content that tries to subvert the agent's instructions; it is mitigated at the host and model layer. Secrets should never appear in tool arguments or logs. Keep PII out of request and response trails.",
        },
      ],
    }),

    securityEntry("authentication", {
      title: "MCP authentication",
      meta: "MCP authentication and authorization: bearer tokens, OAuth, scopes, and role-based access control.",
      h1: "MCP authentication and authorization",
      direct:
        "MCP authentication verifies who is connecting to a remote server. Bearer tokens and OAuth are the common approaches. Authorization then decides what an authenticated caller may do, potentially down to individual tools and scopes.",
      sections: [
        {
          heading: "Bearer tokens",
          markdown:
            "A bearer token proves identity by possession. The client includes it in the request; the server validates it. Keep tokens out of logs, URLs, and tool arguments.",
        },
        {
          heading: "OAuth",
          markdown:
            "OAuth adds a delegated flow with scopes that bound what the client may do. The MCP specification supports OAuth-based authorization for protected resources and remote endpoints.",
        },
        {
          heading: "Scopes and RBAC",
          markdown:
            "Scopes and role-based access control bound a caller's reach. Restricting by scope limits what a compromised token or an over-eager agent can touch. Default-deny is safer than default-grant.",
        },
      ],
    }),

    securityEntry("mcp-oauth", {
      title: "MCP OAuth",
      meta: "MCP OAuth flow, protected resources, and how remote servers authorize access.",
      h1: "MCP OAuth in practice",
      direct:
        "MCP OAuth follows the standard OAuth 2.0 authorization flow. A client is registered, a user authorizes within granted scopes, and a token is issued. The client presents the token to a protected MCP endpoint; the resource server authorizes the request within the token's scope.",
      sections: [
        {
          heading: "The flow",
          markdown:
            "The client requests authorization from the authorization server, the user approves within the granted scopes, and the client receives an access token. It then calls the protected MCP server with that token. The server enforces the scopes.",
        },
        {
          heading: "Protecting resources",
          markdown:
            "Only resources and tools explicitly protected by the resource-server flow require tokens. A server advertises which endpoints are protected and which capabilities require authorization. Unlisted public capabilities can be reached without a token, subject to the server's own policy.",
        },
      ],
    }),

    securityEntry("tool-security", {
      title: "MCP tool security and prompt injection",
      meta: "Prompt injection, tool poisoning, malicious servers, tool descriptions, and input validation in MCP.",
      h1: "MCP tool security: prompt injection and tool poisoning",
      direct:
        "Tool security addresses how a server's inputs and outputs can be abused. Prompt injection tries to steer an agent by embedding instructions in untrusted content. Malicious servers expose traps in their descriptions or tools. Input validation, least-privilege permissions, and treating tool output as untrusted are the defenses.",
      sections: [
        {
          heading: "Prompt injection",
          markdown:
            "Prompt injection is untrusted content — a web page, a document, a tool output — that instructs the model to act against the user's intent. Mitigation happens in the host and model layer, not the protocol. Treat anything a tool returns as data, not instructions.",
        },
        {
          heading: "Tool poisoning",
          markdown:
            "A malicious or compromised server can show misleading tool descriptions to trick the agent or user into invoking a harmful operation. This is why tool descriptions and tool surfaces must come from a trusted source and be reviewed.",
        },
        {
          heading: "Input validation",
          markdown:
            "Servers must validate the arguments they receive, since an agent may pass malformed or hostile input. Validation is a server responsibility.",
        },
      ],
    }),

    /* ============================================================
     * CLIENTS (Wave 2)
     * ============================================================ */
    clientEntry("claude-desktop", {
      title: "Claude Desktop MCP",
      meta: "Claude Desktop MCP support: local and remote servers, configuration, and how to add an MCP server.",
      h1: "Claude Desktop MCP: setup guide",
      direct:
        "Claude Desktop supports local MCP servers that run on the user's machine and are configured in a JSON settings file. Servers are added by declaring a command in the configuration; the desktop app spawns the local server and exposes its tools to the assistant.",
      sections: [
        {
          heading: "Configuration location",
          markdown:
            "MCP servers are added to the Claude Desktop configuration — on macOS a settings JSON file in the application's config directory. The file declares named servers, each with a command and arguments.",
        },
        {
          heading: "Adding a server",
          markdown:
            "You add a server by placing an entry in the config with the command that launches it (for example, a package runner or a binary path). After editing, restart Claude Desktop and grant the tools permission when prompted.",
        },
      ],
    }),

    clientEntry("claude-code", {
      title: "Claude Code MCP",
      meta: "Claude Code MCP support: adding servers to the coding agent and accessing tools from the terminal.",
      h1: "Claude Code MCP: setup",
      direct:
        "Claude Code, the command-line coding agent, supports MCP servers. Servers provide the agent access to external tools such as databases and version control. Configuration is command-driven inside the Claude Code session.",
      sections: [
        {
          heading: "Adding a server",
          markdown:
            "Claude Code exposes commands to connect and list servers. A user can add a server that the agent then discovers and can invoke. Permissions govern which tools the agent may use.",
        },
      ],
    }),

    clientEntry("cursor", {
      title: "Cursor MCP",
      meta: "Cursor MCP support: stdio and Streamable HTTP transports, configuration, and troubleshooting.",
      h1: "Cursor MCP: setup and configuration",
      direct:
        "Cursor supports MCP servers through configuration files, with both stdio (local) and Streamable HTTP (remote) transports documented. Additional server configuration can be stored in a project-scoped file in the repository.",
      sections: [
        {
          heading: "Transports",
          markdown:
            "Cursor documents both stdio and Streamable HTTP transports. A local server is launched by Cursor; a remote server is reached over an HTTP URL.",
        },
        {
          heading: "Configuration",
          markdown:
            "Server entries are declared in a Cursor configuration file. Cursor also supports a project-level configuration that can be committed to the repository so teammates share server definitions.",
        },
      ],
    }),

    clientEntry("vscode", {
      title: "VS Code MCP",
      meta: "VS Code MCP support: managed servers, user vs workspace configuration, and local and remote servers.",
      h1: "VS Code MCP: setup and management",
      direct:
        "VS Code supports MCP servers with a management UI, configuration at user and workspace scope, and both local and remote servers. Whether a given environment supports MCP depends on the VS Code release being used.",
      sections: [
        {
          heading: "Managed configuration",
          markdown:
            "VS Code exposes views for installing and managing MCP servers. Configuration lives in a JSON file and can be scoped per-user or per-workspace when the environment supports it.",
        },
        {
          heading: "Local and remote",
          markdown:
            "VS Code can launch local servers and connect to remote servers. Which transports are available depends on the version of the MCP integration.",
        },
      ],
    }),

    clientEntry("github-copilot", {
      title: "GitHub Copilot MCP",
      meta: "GitHub Copilot MCP support and configuration for agent tools.",
      h1: "GitHub Copilot MCP",
      direct:
        "GitHub Copilot agents can connect to MCP servers to extend their tool access. Configuration is managed through GitHub settings for Agent MCP servers, subject to the current feature availability.",
      sections: [
        {
          heading: "Recent support",
          markdown:
            "Copilot began supporting Agent MCP servers for users with agent-capable plans, managing connections through GitHub. This is a newer capability; confirm current availability in GitHub's documentation.",
        },
      ],
    }),

    clientEntry("openai", {
      title: "OpenAI MCP",
      meta: "OpenAI API remote MCP tools, allowed_tools, and read_only filters.",
      h1: "OpenAI API MCP tools",
      direct:
        "OpenAI's API supports remote MCP tools whose results are returned through the Responses API. Exposed tools are controlled with filters such as allowed_tools to select a subset, and read_only to restrict a tool's mode.",
      sections: [
        {
          heading: "Remote MCP tools",
          markdown:
            "Remote MCP servers can be connected so their tools appear in the OpenAI API response. Only the API-supported subset of tools is available.",
        },
        {
          heading: "Filters",
          markdown:
            "allowed_tools selects which tools are exposed, and read_only restricts the tool's mode. These filters narrow what the model can invoke.",
        },
      ],
    }),

    clientEntry("codex", {
      title: "Codex MCP",
      meta: "OpenAI Codex MCP server configuration.",
      h1: "Codex MCP",
      direct:
        "Codex, OpenAI's coding agent, supports configuring MCP servers so the agent can access external tools. Setup is command-driven in the Codex environment.",
      sections: [
        {
          heading: "Configuration",
          markdown:
            "Codex exposes commands for adding and managing MCP servers. Refer to current Codex documentation for the exact configuration keys and supported transports.",
        },
      ],
    }),

    clientEntry("windsurf", {
      title: "Windsurf MCP",
      meta: "Windsurf MCP server configuration.",
      h1: "Windsurf MCP",
      direct:
        "Windsurf, an AI coding environment, supports MCP servers and stores additional server configuration in the project. Setup follows the MCP-standard configuration approach.",
      sections: [
        {
          heading: "Configuration",
          markdown:
            "Windsurf MCP servers are declared in configuration, with project-scoped settings available. Refer to Windsurf's documentation for supported transports.",
        },
      ],
    }),

    clientEntry("gemini-cli", {
      title: "Gemini CLI MCP",
      meta: "Gemini CLI MCP server configuration.",
      h1: "Gemini CLI MCP",
      direct:
        "Gemini CLI supports configuring MCP servers so the command-line agent can connect to external tools. Setup is command-driven.",
      sections: [
        {
          heading: "Configuration",
          markdown:
            "Gemini CLI exposes commands to add and manage MCP servers. Confirm supported transports in the current Gemini CLI documentation.",
        },
      ],
    }),

    clientEntry("docker", {
      title: "Docker MCP",
      meta: "Running and connecting MCP servers with Docker: containerized servers and networking.",
      h1: "MCP servers with Docker",
      direct:
        "Docker is used to run MCP servers in containers, isolating them and simplifying deployment. Multiple servers can run in a Compose network, and a gateway can route MCP traffic to the correct container.",
      sections: [
        {
          heading: "Containerized servers",
          markdown:
            "Packaging a server as a container lets you pin its dependencies and control its network access. A server container typically exposes stdio to its spawner or an HTTP port to a network.",
        },
        {
          heading: "Networking and gateways",
          markdown:
            "Compose networks let server containers reach each other. A gateway service can route MCP requests to the right container host. Docker networking changes the trust boundary: containers on the same network are mutually reachable.",
        },
      ],
    }),

    /* ============================================================
     * BUILD PILLARS 31–34, 39–40 (Wave 3)
     * ============================================================ */
    buildEntry("mcp-server", {
      title: "Build an MCP server",
      meta: "How to build an MCP server: architecture, primitives, transport, authentication, testing, and publishing.",
      h1: "How to build an MCP server",
      direct:
        "To build an MCP server, implement the MCP server lifecycle, expose your capabilities as tools, resources, or prompts, and support at least one transport. The easiest path is an MCP SDK for your language. Test against a real client, then secure and publish it.",
      sections: [
        {
          heading: "Choose an SDK",
          markdown:
            "MCP provides SDKs for several languages, including TypeScript and Python. The SDK handles the protocol lifecycle, message framing, and transport so you focus on your tools.",
        },
        {
          heading: "Expose your surface",
          markdown:
            "Declare your tools (name, description, input schema), resources (URIs), and prompts. The SDK turns your declarations into the protocol responses a client expects.",
        },
        {
          heading: "Testing and publishing",
          markdown:
            "Test against an MCP inspector or a real client before shipping. Document the tools, the auth, and the read/write behavior. Publishing to a registry or marketplace is separate from making the server work.",
        },
      ],
    }),

    buildEntry("mcp-client", {
      title: "Build an MCP client",
      meta: "How to build an MCP client: host integration, lifecycle, primitive operations, and transport.",
      h1: "How to build an MCP client",
      direct:
        "To build an MCP client, implement the initialize handshake, then the list-and-invoke flows for tools, read flows for resources, and get flows for prompts. The MCP SDKs provide client classes that handle the protocol so you integrate with your host.",
      sections: [
        {
          heading: "The client lifecycle",
          markdown:
            "A client connects to a server, initializes and negotiates capabilities, then issues requests. Handle requests and notifications asynchronously so the UI never blocks on the server.",
        },
        {
          heading: "Host integration",
          markdown:
            "Expose discovered tools to your host as callable actions and resources as readable data. The client is the translation layer between host intent and protocol messages.",
        },
      ],
    }),

    buildEntry("typescript-mcp-server", {
      title: "TypeScript MCP server",
      meta: "Build an MCP server with the official TypeScript SDK.",
      h1: "Build an MCP server with TypeScript",
      direct:
        "The MCP TypeScript SDK provides a server class that handles the protocol. You declare tools and resource handlers against a typed surface, then register a transport and start listening.",
      sections: [
        {
          heading: "Using the SDK",
          markdown:
            "The TypeScript SDK exposes a server you configure with tool and resource handlers. It implements the JSON-RPC lifecycle and gives you stdio and HTTP transports. Type definitions keep your tool schemas and arguments aligned.",
        },
      ],
    }),

    buildEntry("python-mcp-server", {
      title: "Python MCP server",
      meta: "Build an MCP server with the official Python SDK.",
      h1: "Build an MCP server with Python",
      direct:
        "The MCP Python SDK provides a server that handles the protocol. You register tools and resources, then run with stdio or HTTP transport. Python is a common choice for data and compute servers.",
      sections: [
        {
          heading: "Using the SDK",
          markdown:
            "The Python SDK lets you declare tools with input schemas and resource handlers. It manages the protocol so you can focus on your domain logic, then exposes a transport entrypoint.",
        },
      ],
    }),

    buildEntry("server-json", {
      title: "server.json and server metadata",
      meta: "MCP server metadata: what server.json is and how registry publication metadata is structured.",
      h1: "server.json and publication metadata",
      direct:
        "server.json is a metadata format for describing an MCP server — name, version, description, capabilities, and where to find it — used for discovery and registry publication. Exact schema fields follow the registry or marketplace you publish to.",
      sections: [
        {
          heading: "Purpose",
          markdown:
            "Structured server metadata lets registries, directories, and tools understand a server without digging through its source. Fields typically cover identity, capability, and provenance.",
        },
        {
          heading: "Where to publish",
          markdown:
            "A registry or marketplace defines the schema it expects and validates submissions against it. Correct metadata is a prerequisite to appearing in that graph.",
        },
      ],
    }),

    buildEntry("publish-mcp-server", {
      title: "Publish an MCP server",
      meta: "How to publish an MCP server: package, document, declare metadata, and submit to a registry.",
      h1: "How to publish an MCP server",
      direct:
        "To publish an MCP server: package it for its transport, document its tools and auth, prepare metadata such as server.json, and submit it to a registry or marketplace. Publication is separate from the server working correctly.",
      sections: [
        {
          heading: "Prepare the server",
          markdown:
            "Make the server installable (a package, container, or binary) and document how to run it, what tools it exposes, and what access it needs.",
        },
        {
          heading: "Submit metadata",
          markdown:
            "Fill in the registry's metadata schema, then submit for review. A registry applies its own validation and verification; publication may require fixing the metadata or adding evidence.",
        },
      ],
    }),

    /* ============================================================
     * GUIDE LONG-TAIL PILLARS 51–60 (Wave 6)
     * ============================================================ */
    guideEntry("mcp-servers-for-databases", {
      title: "MCP servers for databases",
      meta: "How to evaluate MCP servers for databases, including read-only access and connection security.",
      h1: "MCP servers for databases",
      intent: "commercial",
      direct:
        "Database MCP servers give AI agents read or write access to a database through tools. Because live database credentials carry real risk, treat a database server as a read-only surface for agent callers by default and constrain its schema scope.",
      sections: [
        {
          heading: "What to look for",
          markdown:
            "Evaluate the connection mechanism, whether read-only mode exists, and what queries the exposed tools can run. Prefer a server whose tool surface you can bound to the minimum tables a task needs.",
        },
        {
          heading: "Read-only by default",
          markdown:
            "Granting a model a write-capable database tool means any crafted query can change data. Prefer servers that support a read-only mode and limit the connected role to SELECT where possible.",
        },
      ],
    }),

    guideEntry("database-mcp-read-only", {
      title: "Read-only database access with MCP",
      meta: "Configuring a database MCP server in read-only mode to protect data from AI-agent calls.",
      h1: "Read-only database access for MCP servers",
      intent: "informational",
      direct:
        "Read-only database access restricts an MCP server's tools to queries that do not modify data. It is the recommended posture for AI-agent callers. Enforce it both at the server's tool layer and, where possible, with a database role that has only SELECT rights.",
      sections: [
        {
          heading: "Why read-only",
          markdown:
            "A write-capable database tool lets an agent's tool calls alter state. Read-only bounds the blast radius to what can be read, which is usually all a research or analysis task needs.",
        },
        {
          heading: "Enforcing it",
          markdown:
            "Use a database role restricted to read-only privileges as a second layer beyond any server-side flag. Defense in depth protects data even if the server's read-only switch fails or is absent.",
        },
      ],
    }),

    guideEntry("mcp-servers-for-developers", {
      title: "MCP servers for developers",
      meta: "MCP servers for developer workflows: version control, databases, and code tools.",
      h1: "MCP servers for developers",
      intent: "commercial",
      direct:
        "Developer-focused MCP servers give coding agents access to databases, version-control repositories, and code tooling. The selection criterion is documented capability plus read/write behavior you can contain.",
      sections: [
        {
          heading: "Developer use cases",
          markdown:
            "Common servers cover database queries, repository access, issue tracking, and build tooling. Each expands what a coding agent can inspect or act on within a defined tool surface.",
        },
      ],
    }),

    guideEntry("mcp-browser-automation", {
      title: "MCP browser automation",
      meta: "MCP servers for browser automation: driving a browser from an AI agent and the security responsibility.",
      h1: "MCP browser automation",
      intent: "commercial",
      direct:
        "Browser automation MCP servers let an agent drive a real browser — navigating, clicking, and reading pages. This ability carries significant responsibility because a browser can act on arbitrary web content and reach authenticated sessions.",
      sections: [
        {
          heading: "Capabilities",
          markdown:
            "Browser servers typically expose navigation and interaction tools and return page state for the agent to read. That read-back of live pages is where untrusted content can introduce prompt-injection risk.",
        },
        {
          heading: "Security",
          markdown:
            "A browser connected to a logged-in session can act as the user. Run browser automation in a constrained session and treat everything it reads as potentially hostile content.",
        },
      ],
    }),

    guideEntry("mcp-search-research", {
      title: "MCP servers for search and research",
      meta: "MCP servers for web search and research, and how they reduce reliance on stale context.",
      h1: "MCP servers for search and research",
      intent: "commercial",
      direct:
        "Search and research MCP servers expose web search and content retrieval through tools, letting an agent fetch current information. They are among the most common early MCP integrations.",
      sections: [
        {
          heading: "Why they matter",
          markdown:
            "A model's knowledge is static at train time. A search tool returns live results, closing the gap between the model and the present. Document and search access are the two main shapes.",
        },
      ],
    }),

    guideEntry("mcp-productivity", {
      title: "MCP servers for productivity",
      meta: "MCP servers for productivity tools: documents, communication, and task management.",
      h1: "MCP servers for productivity",
      intent: "commercial",
      direct:
        "Productivity MCP servers connect an agent to documents, messaging, calendars, and task managers. They let an assistant retrieve and, sometimes, modify productivity data on the user's behalf.",
      sections: [
        {
          heading: "Data and actions",
          markdown:
            "Productivity servers often expose both resources (document content) and tools (send, create, schedule). Because they can act on user-facing communication, review what they may send or change before enabling.",
        },
      ],
    }),

    guideEntry("mcp-devops", {
      title: "MCP servers for DevOps and cloud",
      meta: "MCP servers for infrastructure, deployment, cloud, and CI/CD, and the access risk.",
      h1: "MCP servers for DevOps and cloud",
      intent: "commercial",
      direct:
        "DevOps and cloud MCP servers expose infrastructure tooling — deployments, containers, cloud services, CI/CD — to an agent. These often carry write and permissions capability, making them high-risk surfaces that require strong least-privilege control.",
      sections: [
        {
          heading: "What they expose",
          markdown:
            "Depending on the server, an agent could query or change infrastructure state. Read-only queries carry low risk; mutating operations carry high risk.",
        },
        {
          heading: "Contain the access",
          markdown:
            "Limit the tool surface, the credentials, and the scope of what a DevOps server may touch. Prefer credentials bound to a narrow role.",
        },
      ],
    }),

    guideEntry("enterprise-mcp", {
      title: "Enterprise MCP",
      meta: "MCP for enterprises: private registries, governance, audit logs, and multi-tenant controls.",
      h1: "Enterprise MCP",
      intent: "commercial",
      direct:
        "Enterprise MCP is about governance: approved server catalogs, private registries, authorization, audit logs, and multi-tenant isolation. The goal is to let teams use MCP while keeping enforcement, review, and accountability centralized.",
      sections: [
        {
          heading: "Governance controls",
          markdown:
            "Enterprises benefit from an approved catalog of servers, authorization that maps callers to allowed tools, and audit logs that record tool use. Isolation keeps one team's data from another.",
        },
        {
          heading: "Centralized enforcement",
          markdown:
            "Private registries and gateways centralize which servers are allowed. Combined with policy and audit, this transforms MCP from an individual tool into a governed capability.",
        },
      ],
    }),

    guideEntry("postgres-mcp-server", {
      title: "Postgres MCP server guide",
      meta: "Guide to Postgres MCP servers: what they do, how to evaluate them, read-only access, and connection security.",
      h1: "Postgres MCP server: what to know",
      intent: "commercial",
      direct:
        "A Postgres MCP server exposes PostgreSQL as tools through MCP so an agent can query a database. There is no verified official implementation in the MCP project as of 2026-08-22, so evaluate community servers carefully, prefer read-only access, and scope the connected role tightly.",
      sections: [
        {
          heading: "What a Postgres server exposes",
          markdown:
            "A Postgres MCP server runs against a live database connection and exposes tools that issue queries. Tool names, schemas, and the connection mechanism are implementation-specific.",
        },
        {
          heading: "Evaluating a server",
          markdown:
            "Inspect the source to see what queries it can run and whether read-only mode exists. Prefer a server you can bound to a narrow schema and a read-only database role.",
        },
        {
          heading: "Security",
          markdown:
            "Use a database role with only the privileges the task needs — SELECT-only for read tasks. Keep credentials out of logs and tool arguments.",
        },
      ],
    }),

    guideEntry("playwright-mcp", {
      title: "Playwright MCP",
      meta: "What Playwright MCP is, how it drives a browser, and the security responsibility.",
      h1: "Playwright MCP",
      intent: "commercial",
      direct:
        "Playwright MCP is a browser-automation server that lets an agent control a real browser through MCP tools. It exposes navigation and interaction tools and lets the agent read the page back. With live sessions comes responsibility for what the browser can reach and act on.",
      sections: [
        {
          heading: "Capabilities",
          markdown:
            "Playwright MCP exposes browser tools and returns page content to the agent. This makes it useful for testing and page inspection as well as automation.",
        },
        {
          heading: "Security",
          markdown:
            "A connected browser can act on authenticated sessions. Run it in a constrained profile and treat page content as untrusted.",
        },
      ],
    }),

    /* ============================================================
     * LONG-TAIL TROUBLESHOOTING GUIDES (Wave 6)
     * ============================================================ */
    guideEntry("claude-desktop-mcp-not-showing", {
      title: "MCP server not showing in Claude Desktop",
      meta: "Why an MCP server might not appear in Claude Desktop and how to fix it: config validation, paths, and restart.",
      h1: "MCP server not showing in Claude Desktop",
      intent: "troubleshooting",
      direct:
        "When an MCP server does not appear in Claude Desktop, the cause is usually a configuration or launch problem: invalid JSON, an incorrect command or path, a missing package, or a server that fails to start. Validate the config, check the logs, and restart the app.",
      sections: [
        {
          heading: "Diagnostic checklist",
          markdown:
            "Check the JSON is valid (no trailing commas), the command and arguments are correct, and the server is installed. A path that is relative or missing will prevent startup. After editing, fully quit and reopen the app.",
        },
        {
          heading: "Inspect the logs",
          markdown:
            "Claude Desktop exposes a log of MCP configuration and runtime activity. The log reveals whether the server failed to launch, failed to initialize, or was never picked up from the config.",
        },
      ],
    }),

    guideEntry("cursor-mcp-tools-not-showing", {
      title: "Cursor MCP tools not showing",
      meta: "Why Cursor MCP tools may not appear and how to fix it: configuration, reload, and transport.",
      h1: "Cursor MCP tools not showing",
      intent: "troubleshooting",
      direct:
        "Cursor MCP tools may not appear because the server is not connected, the configuration is invalid, or Cursor failed to start the server. Verify the connection status, validate the config, and reload Cursor's MCP servers.",
      sections: [
        {
          heading: "Diagnostic checks",
          markdown:
            "Confirm the server shows as connected in Cursor's MCP view. If it does not, validate the config JSON and the transport. A remote server must be reachable; a local server must launch successfully.",
        },
        {
          heading: "Reload",
          markdown:
            "Cursor lets you reload or reconnect servers. After editing configuration, reload the server list so Cursor re-reads the config and restarts the server.",
        },
      ],
    }),

    guideEntry("mcp-connection-refused", {
      title: "MCP connection refused and timeout errors",
      meta: "How to diagnose MCP connection-refused and timeout errors across stdio and HTTP transports.",
      h1: "MCP connection refused and timeout errors",
      intent: "troubleshooting",
      direct:
        "An MCP connection error means the client could not reach the server. For local servers the process failed to start; for remote servers the HTTP endpoint was unreachable, timed out, or was misaddressed. Verify the transport, address, port, and that the server is running.",
      sections: [
        {
          heading: "Local (stdio) errors",
          markdown:
            "A stdio server that cannot start (bad command, missing binary) produces a connection failure. Confirm the command works when run directly and the transport config matches.",
        },
        {
          heading: "Remote (HTTP) errors",
          markdown:
            "Connection refused on HTTP means nothing is listening at the address, or a firewall blocks the port. A timeout means the host is reachable but not answering. Verify the URL, port, and that the service is running behind any proxy.",
        },
      ],
    }),

    guideEntry("claude-desktop-mcp-config", {
      title: "Claude Desktop MCP configuration",
      meta: "How to configure MCP servers in Claude Desktop: the config file, environment variables, and restart behavior.",
      h1: "Claude Desktop MCP configuration",
      intent: "transactional",
      direct:
        "Claude Desktop MCP configuration is a JSON file that lists servers, each with a command and arguments that launch a local MCP server. Editing it, saving, and fully restarting the app registers and starts the configured servers.",
      sections: [
        {
          heading: "Config location and format",
          markdown:
            "The configuration is a JSON object mapping server names to command definitions. Each entry provides the launcher command and any arguments. Paths should be absolute where possible.",
        },
        {
          heading: "After editing",
          markdown:
            "Save the file and quit Claude Desktop entirely, then reopen it. The app reads the configuration at startup and launches each declared server.",
        },
      ],
    }),

    guideEntry("vscode-mcp-json", {
      title: "VS Code MCP configuration",
      meta: "How to configure MCP servers in VS Code at user and workspace scope, with examples.",
      h1: "VS Code MCP configuration",
      intent: "transactional",
      direct:
        "VS Code stores MCP server configuration in JSON at user or workspace scope. A workspace-scoped config can be committed to the repository so teammates share the same servers.",
      sections: [
        {
          heading: "User vs workspace",
          markdown:
            "User-scoped configuration applies across your editor; workspace-scoped configuration applies to one project. Use workspace scope for project-specific servers, user scope for personal ones.",
        },
        {
          heading: "Configuration example",
          markdown:
            "Each server entry declares how to launch or reach it — a command for a local server or an HTTP endpoint for a remote one. Which fields are accepted depends on the VS Code MCP integration and version.",
        },
      ],
    }),

    guideEntry("remote-mcp-oauth", {
      title: "Remote MCP servers with OAuth",
      meta: "How to secure and connect to remote MCP servers with OAuth, bearer tokens, and scopes.",
      h1: "Remote MCP servers with OAuth",
      intent: "informational",
      direct:
        "Connect a remote MCP server over HTTPS and authenticate the client with OAuth. The authorization flow issues a scoped token the client presents to the protected endpoint, letting the server enforce what the client may do.",
      sections: [
        {
          heading: "The authorization flow",
          markdown:
            "The client starts an OAuth flow at the server, the user approves within the requested scopes, and the client receives an access token. Subsequent requests carry the token to the protected MCP endpoint.",
        },
        {
          heading: "Protecting resources and tools",
          markdown:
            "Only protected capabilities require tokens. A server advertises which endpoints and capabilities need authorization, and enforces the granted scopes on each request.",
        },
      ],
    }),

    guideEntry("best-mcp-server-for-github", {
      title: "MCP server for GitHub",
      meta: "How to evaluate GitHub MCP servers: read-only repository access, issues, and PR review.",
      h1: "MCP server for GitHub",
      intent: "commercial",
      direct:
        "A GitHub MCP server gives a coding agent access to repositories, issues, and pull requests through tools. Select one by documented capability and the access it requires, preferring read-only operation for review tasks.",
      sections: [
        {
          heading: "Capabilities",
          markdown:
            "GitHub servers typically expose repository data, issue and PR operations, and search. Whether they can modify resources (open PRs, edit issues) depends on the implementation and its permissions.",
        },
        {
          heading: "Permissions",
          markdown:
            "A token with broad scope grants the agent wide reach. Prefer a token limited to the repositories and operations the task needs, and prefer read-only tokens where the task is review.",
        },
      ],
    }),

    /* ============================================================
     * GLOSSARY TERMS (DefinedTerm)
     * ============================================================ */
    glossaryEntry("model-context-protocol", {
      title: "Model Context Protocol (MCP)",
      meta: "Definition of the Model Context Protocol — an open protocol for connecting AI applications to external tools and data sources.",
      h1: "Model Context Protocol (MCP)",
      direct:
        "The Model Context Protocol (MCP) is an open protocol that standardizes how AI applications (clients) connect to external systems (servers) that expose tools, resources, and prompts. It uses JSON-RPC 2.0 over stdio or HTTP transports.",
      sections: [
        {
          heading: "Key concepts",
          markdown:
            "**Host**: The application holding user/agent context (e.g., Claude Desktop, Cursor).\n\n**Client**: The protocol component maintaining a 1:1 connection to a server.\n\n**Server**: Exposes tools, resources, and prompts for a specific capability.\n\n**Transport**: stdio (local) or Streamable HTTP (remote).",
        },
      ],
    }),

    glossaryEntry("json-rpc", {
      title: "JSON-RPC 2.0",
      meta: "JSON-RPC 2.0 is the message format used by MCP for requests, responses, and notifications.",
      h1: "JSON-RPC 2.0 in MCP",
      direct:
        "MCP encodes all protocol messages as JSON-RPC 2.0. A request has a method, optional params, and an id. Responses match the id and contain either result or error. Notifications have no id and expect no response.",
      sections: [
        {
          heading: "Message types",
          markdown:
            "**Request**: `{ jsonrpc: '2.0', method: string, params?: object, id: string|number }`\n\n**Response**: `{ jsonrpc: '2.0', result: unknown, id: string|number }` or `{ jsonrpc: '2.0', error: { code: number, message: string, data?: unknown }, id: string|number }`\n\n**Notification**: `{ jsonrpc: '2.0', method: string, params?: object }` (no id)",
        },
        {
          heading: "Standard error codes",
          markdown:
            "-32700 Parse error\n-32600 Invalid request\n-32601 Method not found\n-32602 Invalid params\n-32603 Internal error\n-32000 to -32099 Server-defined errors",
        },
      ],
    }),

    glossaryEntry("tool", {
      title: "MCP Tool",
      meta: "An MCP tool is a callable function exposed by a server with a name, description, and input schema.",
      h1: "MCP Tool",
      direct:
        "A tool is an executable action a server exposes. Clients discover tools via tools/list (returning name, description, inputSchema) and invoke them via tools/call with arguments matching the schema. Tools are the primary action surface of MCP.",
      sections: [
        {
          heading: "Tool lifecycle",
          markdown:
            "1. Client sends tools/list → Server returns array of tool definitions\n2. Client sends tools/call with { name, arguments } → Server executes and returns content\n3. Tool may return text, images, or structured data",
        },
        {
          heading: "Security",
          markdown:
            "Tools can mutate state. Prefer read-only tools for AI-agent callers. Treat tool permissions as a trust boundary.",
        },
      ],
    }),

    glossaryEntry("resource", {
      title: "MCP Resource",
      meta: "An MCP resource is addressable data exposed by a server, identified by a URI and returned with a MIME type.",
      h1: "MCP Resource",
      direct:
        "A resource is passive data a server exposes for reading. Each resource has a URI. Clients list resources via resources/list and read them via resources/read with the URI. Content is returned with a MIME type.",
      sections: [
        {
          heading: "Resource vs Tool",
          markdown:
            "Resources model data (read-only). Tools model actions (may mutate). A version-control server might expose branches as resources and commit operations as tools.",
        },
      ],
    }),

    glossaryEntry("prompt", {
      title: "MCP Prompt",
      meta: "An MCP prompt is a reusable invocation template a server exposes, with arguments that fill the template.",
      h1: "MCP Prompt",
      direct:
        "A prompt is a template the server exposes so a client can present structured invocation patterns to a user. Clients list prompts via prompts/list and retrieve one via prompts/get with arguments. Prompts are input to a model, not executable actions.",
      sections: [
        {
          heading: "Prompt vs Tool",
          markdown:
            "A prompt structures model input. A tool executes an action. Both are negotiated during initialization.",
        },
      ],
    }),

    glossaryEntry("transport", {
      title: "MCP Transport",
      meta: "MCP supports two transports: stdio for local servers and Streamable HTTP for remote servers.",
      h1: "MCP Transport",
      direct:
        "The transport carries JSON-RPC messages between client and server. stdio spawns the server as a child process. Streamable HTTP uses POST for client→server and Server-Sent Events for server→client streaming.",
      sections: [
        {
          heading: "stdio",
          markdown:
            "Local only. Client launches server process. No network. Inherits client environment.",
        },
        {
          heading: "Streamable HTTP",
          markdown:
            "Remote. Client POSTs JSON-RPC to server endpoint. Server uses SSE for notifications and streaming responses. Requires TLS and authentication in production.",
        },
      ],
    }),

    glossaryEntry("initialize", {
      title: "MCP Initialize",
      meta: "The initialize handshake negotiates protocol version and capabilities before any primitive operations.",
      h1: "MCP Initialize Handshake",
      direct:
        "Every MCP connection begins with initialize. The client sends protocol version and its capabilities. The server replies with its version and capabilities. Both sides agree on a baseline before any tools/list, resources/list, or prompts/list requests.",
      sections: [
        {
          heading: "Negotiated capabilities",
          markdown:
            "tools, resources, prompts, logging, completions, experimental features.",
        },
      ],
    }),

    glossaryEntry("capability-negotiation", {
      title: "Capability Negotiation",
      meta: "During initialize, client and server declare supported capabilities to establish a common baseline.",
      h1: "MCP Capability Negotiation",
      direct:
        "Capability negotiation happens in the initialize exchange. The client declares what it supports; the server declares what it provides. This lets different implementations interoperate safely by only using mutually-supported features.",
      sections: [
        {
          heading: "Capability types",
          markdown:
            "tools (list/call), resources (list/read/templates), prompts (list/get), logging, completions, experimental.",
        },
      ],
    }),

    glossaryEntry("server-sent-events", {
      title: "Server-Sent Events (SSE)",
      meta: "SSE is used by the Streamable HTTP transport for server-to-client streaming and notifications.",
      h1: "Server-Sent Events in MCP",
      direct:
        "In Streamable HTTP, the client opens a long-lived SSE connection to receive server-initiated messages: notifications, progress updates, and streaming tool responses. The client POSTs requests separately.",
      sections: [],
    }),

    glossaryEntry("bearer-token", {
      title: "Bearer Token",
      meta: "A bearer token proves identity by possession. The client includes it in the Authorization header for remote MCP servers.",
      h1: "Bearer Token Authentication",
      direct:
        "A bearer token is an opaque string the client sends as `Authorization: Bearer <token>`. The server validates it. Tokens must be kept out of logs, URLs, and tool arguments.",
      sections: [
        {
          heading: "Best practices",
          markdown:
            "Use short-lived tokens. Rotate regularly. Scope to minimum required permissions.",
        },
      ],
    }),

    glossaryEntry("oauth", {
      title: "OAuth 2.0 in MCP",
      meta: "MCP supports OAuth 2.0 for delegated authorization of remote servers with scopes.",
      h1: "OAuth 2.0 for MCP",
      direct:
        "MCP OAuth follows the standard authorization code flow. The client redirects to the authorization server, the user approves scopes, and the client receives an access token. The token is presented to protected MCP endpoints.",
      sections: [
        {
          heading: "Protected resources",
          markdown:
            "Only explicitly protected endpoints require tokens. Servers advertise which capabilities need authorization.",
        },
      ],
    }),

    glossaryEntry("scope", {
      title: "OAuth Scope",
      meta: "An OAuth scope bounds what an authenticated caller may do — down to individual tools or resources.",
      h1: "OAuth Scope",
      direct:
        "Scopes are strings granted during authorization that limit a token's reach. A server enforces scopes on each request. Default-deny is safer than default-grant.",
      sections: [],
    }),

    glossaryEntry("read-only", {
      title: "Read-Only Mode",
      meta: "Read-only mode restricts a server's exposed tools to operations that do not mutate state.",
      h1: "Read-Only Mode",
      direct:
        "Read-only mode is the recommended posture for AI-agent callers. It bounds blast radius to data retrieval. Enforce at both the server tool layer and the underlying system (e.g., database SELECT-only role).",
      sections: [],
    }),

    glossaryEntry("prompt-injection", {
      title: "Prompt Injection",
      meta: "Prompt injection is untrusted content that tries to steer an AI agent against the user's intent.",
      h1: "Prompt Injection",
      direct:
        "Prompt injection occurs when untrusted content (web page, document, tool output) contains instructions that subvert the agent. Mitigation happens at the host/model layer. Treat all tool output as data, not instructions.",
      sections: [],
    }),

    glossaryEntry("tool-poisoning", {
      title: "Tool Poisoning",
      meta: "Tool poisoning is when a malicious server exposes misleading tool descriptions to trick an agent into harmful operations.",
      h1: "Tool Poisoning",
      direct:
        "A compromised server can show deceptive tool descriptions or schemas. This is why tool surfaces must come from trusted sources and be reviewed before enabling.",
      sections: [],
    }),

    glossaryEntry("least-privilege", {
      title: "Least Privilege",
      meta: "Least privilege grants the minimum access a task requires — applied to tools, credentials, and scopes.",
      h1: "Least Privilege Principle",
      direct:
        "Grant only the permissions necessary. For MCP: read-only tools, scoped tokens, narrow database roles, minimal file-system access. Defense in depth: enforce at multiple layers.",
      sections: [],
    }),

    glossaryEntry("server-json", {
      title: "server.json",
      meta: "server.json is a metadata format describing an MCP server for registry publication and discovery.",
      h1: "server.json Metadata",
      direct:
        "server.json provides structured metadata: name, version, description, capabilities, transport, authentication, and provenance. Registries and marketplaces validate submissions against their schema.",
      sections: [
        {
          heading: "Typical fields",
          markdown:
            "name, version, description, author, repository, license, capabilities (tools/resources/prompts), transports, authentication, readOnly, homepage.",
        },
      ],
    }),

    glossaryEntry("registry", {
      title: "MCP Registry",
      meta: "An MCP registry stores machine-readable server metadata for programmatic consumption by clients and verification tools.",
      h1: "MCP Registry",
      direct:
        "A registry is structured data about servers — not a browsing interface. It serves as a source of truth for machine tools. Directories and marketplaces build on registries for human-facing discovery.",
      sections: [],
    }),

    glossaryEntry("directory", {
      title: "MCP Directory",
      meta: "An MCP directory is a human-searchable catalog of servers for browsing and comparison.",
      h1: "MCP Directory",
      direct:
        "A directory presents servers for humans to browse, filter, and compare. MCPserver.in is a directory and knowledge resource; it is not itself the authoritative registry.",
      sections: [],
    }),

    glossaryEntry("marketplace", {
      title: "MCP Marketplace",
      meta: "An MCP marketplace adds install/purchase flows on top of a directory.",
      h1: "MCP Marketplace",
      direct:
        "A marketplace layers commercial or install flows on a directory. It may include ratings, reviews, and one-click deployment — which directories do not provide.",
      sections: [],
    }),

    /* ============================================================
     * AGGREGATE ROUTES (discovery)
     * ============================================================ */
    {
      slug: "learn",
      parent: "",
      title: "Learn",
      metaTitle: "Learn MCP — guides and concepts",
      metaDescription: "Guides and concept articles about the Model Context Protocol.",
      h1: "Learn",
      type: "pillar",
      intent: "informational",
      status: "published",
      indexPath: "/learn",
      schemaType: "article",
    },
    {
      slug: "clients",
      parent: "",
      title: "Clients",
      metaTitle: "MCP clients — setup guides",
      metaDescription: "Setup and configuration guides for MCP client applications.",
      h1: "MCP clients",
      type: "client",
      intent: "commercial",
      status: "published",
      indexPath: "/clients",
      schemaType: "collection",
    },
    {
      slug: "guides",
      parent: "",
      title: "Guides",
      metaTitle: "MCP guides — decision, comparison, and troubleshooting",
      metaDescription: "MCP guides for choosing servers, comparing options, and troubleshooting.",
      h1: "MCP guides",
      type: "guide",
      intent: "commercial",
      status: "published",
      indexPath: "/guides",
      schemaType: "collection",
    },
    {
      slug: "build",
      parent: "",
      title: "Build",
      metaTitle: "Build MCP servers and clients",
      metaDescription: "Guides for building and publishing MCP servers and clients.",
      h1: "Build MCP tools",
      type: "guide",
      intent: "transactional",
      status: "published",
      indexPath: "/build",
      schemaType: "collection",
    },
    {
      slug: "security",
      parent: "",
      title: "Security",
      metaTitle: "MCP security",
      metaDescription: "MCP security concepts: authentication, permissions, and threat model.",
      h1: "MCP security",
      type: "security",
      intent: "informational",
      status: "published",
      indexPath: "/security",
      schemaType: "collection",
    },
    {
      slug: "compare",
      parent: "",
      title: "Compare",
      metaTitle: "MCP server comparisons",
      metaDescription: "Evidence-based MCP server comparisons.",
      h1: "MCP server comparisons",
      type: "comparison",
      intent: "commercial",
      status: "published",
      indexPath: "/compare",
      schemaType: "collection",
    },
    {
      slug: "glossary",
      parent: "",
      title: "Glossary",
      metaTitle: "MCP Glossary — defined terms",
      metaDescription: "Core MCP terms and concepts with evidence-backed definitions.",
      h1: "MCP Glossary",
      type: "glossary",
      intent: "informational",
      status: "published",
      indexPath: "/glossary",
      schemaType: "collection",
    },
  ] as RegistryEntry[]).map((e) => [e.indexPath, e]));

/**
 * Look up a registry entry by canonical path, or return undefined.
 * Exported helper so route templates never reach for missing entries.
 */
export function getEntry(indexPath: string): RegistryEntry | undefined {
  return contentRegistry[indexPath];
}

/** Entries that are eligible for the public graph (publication authority). */
export function getIndexableEntries(): RegistryEntry[] {
  return Object.values(contentRegistry).filter(
    (e) => e.status === "published" && !e.noindex,
  );
}

/** All entries with a given parent path segment (used by aggregate pages). */
export function getChildren(parentPath: string): RegistryEntry[] {
  return Object.values(contentRegistry).filter((e) => e.parent === parentPath);
}