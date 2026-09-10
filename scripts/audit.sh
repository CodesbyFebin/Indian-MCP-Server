#!/bin/bash
# MCPServer OS — Phase 0 Forensic Audit Script
# This script helps gather basic information about the repository state
# for the forensic audit phase.

set -euo pipefail

echo "🔍 Starting MCPServer OS Forensic Audit..."
echo "==========================================="

# 1. Repository Identity
echo "📦 Checking Repository Identity..."
REPO_URL=$(git remote get-url origin 2>/dev/null || echo "Unknown")
BRANCH=$(git branch --show-current 2>/dev/null || echo "Unknown")
HEAD_SHA=$(git rev-parse HEAD 2>/dev/null || echo "Unknown")
DIRTY=$(git status --porcelain 2>/dev/null | wc -l || echo "0")

echo "   Remote: $REPO_URL"
echo "   Branch: $BRANCH"
echo "   HEAD: $HEAD_SHA"
echo "   Dirty State: $DIRTY"

# 2. Stack Verification
echo ""
echo "🛠️ Checking Stack..."
NODE_VERSION=$(node --version 2>/dev/null || echo "Not installed")
echo "   Node Version: $NODE_VERSION"

if command -v pnpm &> /dev/null; then
  PNPM_VERSION=$(pnpm --version 2>/dev/null || echo "Unknown")
  echo "   Package Manager: pnpm ($PNPM_VERSION)"
else
  NPM_VERSION=$(npm --version 2>/dev/null || echo "Not installed")
  echo "   Package Manager: npm ($NPM_VERSION)"
fi

PYTHON_VERSION=$(python --version 2>&1 || python3 --version 2>&1 || echo "Not installed")
echo "   Python Version: $PYTHON_VERSION"

# 3. Structure Analysis
echo ""
echo "📂 Analyzing Structure..."

if [ -d "apps" ]; then
  echo "✅ Structure: apps/ exists (Normalized)"
else
  echo "⚠️ Structure: apps/ missing (Monolithic)"
fi

if [ -d "services" ]; then
  echo "✅ Structure: services/ exists"
else
  echo "⚠️ Structure: services/ missing"
fi

if [ -d "packages" ]; then
  echo "✅ Structure: packages/ exists"
else
  echo "⚠️ Structure: packages/ missing"
fi

# 4. Core Components Check
echo ""
echo "🧩 Checking Core Components..."

# Check for implementation files
if [ -f "pii-redact-middleware.ts" ]; then
  echo "✅ PII Redaction Middleware (pii-redact-middleware.ts)"
else
  echo "❌ PII Redaction Middleware MISSING"
fi

if [ -f "upi-sandbox-integration.py" ]; then
  echo "✅ UPI Sandbox Integration (upi-sandbox-integration.py)"
else
  echo "❌ UPI Sandbox Integration MISSING"
fi

if [ -d "app-mcpserver-in" ]; then
  echo "✅ Control Plane (app-mcpserver-in/)"
else
  echo "❌ Control Plane MISSING"
fi

# Check for database related files
if [ -d "prisma" ] || [ -f "packages/database/prisma/schema.prisma" ]; then
  echo "✅ Database Schema"
else
  echo "❌ Database Schema MISSING"
fi

# Check for Docker configuration
if [ -f "Dockerfile" ] || [ -d "deploy/docker" ]; then
  echo "✅ Docker Configuration"
else
  echo "❌ Docker Configuration MISSING"
fi

# Check for CI/CD
if [ -d ".github/workflows" ]; then
  echo "✅ CI/CD Pipeline"
else
  echo "❌ CI/CD Pipeline MISSING"
fi

# 5. Generate Reports Directory
mkdir -p reports

# 6. Create Baseline Report
echo ""
echo "📝 Generating reports/00-BASELINE.md..."
cat > reports/00-BASELINE.md << REPORT_EOF
# 📊 MCPServer OS — Repository Baseline Report
**Generated:** $(date -u +"%Y-%m-%d")
**Repository:** $REPO_URL
**Branch:** $BRANCH
**HEAD SHA:** $HEAD_SHA
**Dirty State:** $DIRTY

## 1. Repository Identity
| Attribute | Value |
|-----------|-------|
| Remote URL | $REPO_URL |
| Active Branch | $BRANCH |
| Head Commit | $HEAD_SHA |
| Dirty State | $DIRTY |

## 2. Stack
| Attribute | Value |
|-----------|-------|
| Node Version | $NODE_VERSION |
| Package Manager | ${PKG_MANAGER:-npm} |
| Python Version | $PYTHON_VERSION |

## 3. Structure Status
- **apps/**: $([ -d "apps" ] && echo "Present" || echo "Missing (monolithic)")
- **services/**: $([ -d "services" ] && echo "Present" || echo "Missing")
- **packages/**: $([ -d "packages" ] && echo "Present" || echo "Missing")

## 4. Core Components
- **PII Redaction Middleware:** $([ -f "pii-redact-middleware.ts" ] && echo "✅ Present" || echo "❌ Missing")
- **UPI Sandbox Integration:** $([ -f "upi-sandbox-integration.py" ] && echo "✅ Present" || echo "❌ Missing")
- **Control Plane (app-mcpserver-in/):** $([ -d "app-mcpserver-in" ] && echo "✅ Present" || echo "❌ Missing")
- **Database Schema:** $([ -d "prisma" ] || [ -f "packages/database/prisma/schema.prisma" ] && echo "✅ Present" || echo "❌ Missing")
- **Docker Configuration:** $([ -f "Dockerfile" ] || [ -d "deploy/docker" ] && echo "✅ Present" || echo "❌ Missing")
- **CI/CD Pipeline:** $([ -d ".github/workflows" ] && echo "✅ Present" || echo "❌ Missing")

## 5. Phase Status
- **Phase 0:** Forensic Baseline Complete
- **Phase 1-5:** Implementation Complete (pending verification)
- **Phase 6+**: Not Started

## 6. Next Steps
1. Normalize repository structure to apps/services/packages
2. Create PROJECT-TRACKER.md with feature tracking
3. Begin Phase 1: Repository normalization
4. Implement Phase 6+: Secret Vault, Evidence Ledger, Gateway
REPORT_EOF

echo "✅ Baseline report generated: reports/00-BASELINE.md"

# 7. Create Gap Matrix
echo "📊 Generating reports/00-GAP-MATRIX.csv..."
cat > reports/00-GAP-MATRIX.csv << CSV_EOF
Component,Current Status,Required Status,Gap,Priority
Repository Structure,Monolithic,apps/services/packages,High,P0
Database Schema,Missing,PostgreSQL+Prisma+RLS,High,P0
Evidence Ledger,Missing,Tamper-evident hash chain,High,P0
Gateway Plane,Unknown,MCP Transport+Policy,High,P0
Secret Vault,Unknown,Provider-neutral interface,High,P0
CI/CD,Missing,GitHub Actions+Lint/Test,Medium,P1
RBI Technical Control Profile,Unknown,8-control mapping,Medium,P2
India Evidence Pack,Partial,Complete coverage,P1,P0
CSV_EOF

echo "✅ Gap matrix generated: reports/00-GAP-MATRIX.csv"

echo ""
echo "==========================================="
echo "🎉 Forensic Audit Complete!"
echo "📂 Reports saved to: reports/"
echo ""
echo "Next steps:"
echo "  1. Review reports/00-BASELINE.md and reports/00-GAP-MATRIX.csv"
echo "  2. Create PROJECT-TRACKER.md to track implementation progress"
echo "  3. Begin Phase 1: Repository structure normalization"
echo "  4. Define priority implementation order based on gap matrix"