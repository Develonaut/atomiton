---
title: "@atomiton/typescript-config"
description: "Shared TypeScript configuration for the Atomiton monorepo."
stage: "stable"
version: "0.1.0"
last_updated: "2025-09-28"
dependencies: []
tags: []
ai_context:
  category: "tool"
  complexity: "simple"
  primary_language: "typescript"
---
# @atomiton/typescript-config

Shared TypeScript configuration for the Atomiton monorepo.

## Overview

This package provides centralized TypeScript configurations that are shared
across all packages in the Atomiton monorepo. It includes base configurations
and specialized configs for React libraries.

## Installation

This package is part of the Atomiton monorepo and is not published separately.

## Usage

In your package's `tsconfig.json`:

```json
{
  "extends": "@atomiton/typescript-config/base.json"
}
```

For React libraries:

```json
{
  "extends": "@atomiton/typescript-config/react-library.json"
}
```

## Configuration Files

- `base.json` - Base TypeScript configuration for all packages
- `react-library.json` - Extended configuration for React-based packages

## License

MIT
