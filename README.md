<p align="center">
  <img src="apps/web/public/logo-192.png" width="80" alt="Stirling Image logo">
</p>

<h1 align="center">Stirling Image</h1>

<p align="center">Open-source, self-hosted image processing. One Docker container, no cloud dependencies.</p>

<p align="center">
  <a href="https://github.com/siddharthksah/Stirling-Image/pkgs/container/stirling-image"><img src="https://img.shields.io/badge/Docker-ghcr.io-blue?logo=docker" alt="Docker"></a>
  <a href="https://github.com/siddharthksah/Stirling-Image/actions"><img src="https://img.shields.io/github/actions/workflow/status/siddharthksah/Stirling-Image/ci.yml?label=CI" alt="CI"></a>
  <a href="https://github.com/siddharthksah/Stirling-Image/blob/main/LICENSE"><img src="https://img.shields.io/github/license/siddharthksah/Stirling-Image" alt="License"></a>
  <a href="https://github.com/siddharthksah/Stirling-Image/stargazers"><img src="https://img.shields.io/github/stars/siddharthksah/Stirling-Image?style=social" alt="Stars"></a>
</p>

![Stirling Image - Dashboard](images/dashboard.png)

## What it does

Resize, crop, compress, convert, watermark, OCR, remove backgrounds, upscale, erase objects, blur faces, and more. 33+ tools in total, all running locally on your hardware.

You can chain tools into reusable pipelines and batch process up to 200 images at once. Every tool is also available through a REST API with Swagger docs.

No telemetry, no tracking, no external calls. Your images never leave your machine.

## Quick start

```bash
docker run -d -p 1349:1349 -v stirling-data:/data ghcr.io/siddharthksah/stirling-image:latest
```

Open http://localhost:1349 in your browser.

**Default credentials:**

| Field    | Value   |
|----------|---------|
| Username | `admin` |
| Password | `admin` |

You will be asked to change your password on first login. This is enforced for all new accounts and cannot be skipped in production.

For Docker Compose, persistent storage, and other setup options, see the [Getting Started Guide](https://siddharthksah.github.io/Stirling-Image/guide/getting-started).

## Documentation

- [Getting started](https://siddharthksah.github.io/Stirling-Image/guide/getting-started)
- [Configuration](https://siddharthksah.github.io/Stirling-Image/guide/configuration)
- [REST API](https://siddharthksah.github.io/Stirling-Image/api/rest)
- [Architecture](https://siddharthksah.github.io/Stirling-Image/guide/architecture)
- [Developer guide](https://siddharthksah.github.io/Stirling-Image/guide/developer)
- [Translation guide](https://siddharthksah.github.io/Stirling-Image/guide/translations)

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

For development setup, see the [Developer Guide](https://siddharthksah.github.io/Stirling-Image/guide/developer).

For adding translations, see the [Translation Guide](https://siddharthksah.github.io/Stirling-Image/guide/translations).

## Support

Bug reports and feature requests: [GitHub Issues](https://github.com/siddharthksah/Stirling-Image/issues)

<p align="center">
  <a href="https://github.com/sponsors/siddharthksah"><img src="https://img.shields.io/badge/Sponsor-GitHub-ea4aaa?logo=github-sponsors" alt="GitHub Sponsors"></a>
  <a href="https://ko-fi.com/siddharthksah"><img src="https://img.shields.io/badge/Buy%20Me%20a%20Coffee-Ko--fi-FF5E5B?logo=ko-fi" alt="Ko-fi"></a>
</p>

## License

[MIT](LICENSE)
