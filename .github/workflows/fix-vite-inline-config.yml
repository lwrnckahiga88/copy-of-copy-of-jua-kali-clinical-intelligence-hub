name: fix/vite-inline-config

on:
  workflow_dispatch:

permissions:
  contents: write
  pull-requests: write

jobs:
  fix:
    runs-on: ubuntu-latest
    env:
      BRANCH: fix/vite-inline-config
      VITETS_B64: aW1wb3J0IGV4cHJlc3MsIHsgdHlwZSBFeHByZXNzIH0gZnJvbSAiZXhwcmVzcyI7CmltcG9ydCBmcyBmcm9tICJmcyI7CmltcG9ydCB7IHR5cGUgU2VydmVyIH0gZnJvbSAiaHR0cCI7CmltcG9ydCBwYXRoIGZyb20gInBhdGgiOwoKZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNldHVwVml0ZShhcHA6IEV4cHJlc3MsIHNlcnZlcjogU2VydmVyKSB7CiAgY29uc3QgeyBjcmVhdGVTZXJ2ZXI6IGNyZWF0ZVZpdGVTZXJ2ZXIgfSA9IGF3YWl0IGltcG9ydCgidml0ZSIpOwoKICAvLyBJbmxpbmUgY29uZmlnIC0gZG8gTk9UIGltcG9ydCB2aXRlLmNvbmZpZy50cyBoZXJlLgogIC8vIHZpdGUuY29uZmlnIGltcG9ydHMgZGV2RGVwZW5kZW5jaWVzIChAdGFpbHdpbmRjc3Mvdml0ZSwgQHZpdGVqcy9wbHVnaW4tcmVhY3QpCiAgLy8gd2hpY2ggYXJlIGFic2VudCBpbiBwcm9kdWN0aW9uIGFuZCB3b3VsZCBjcmFzaCBvbiBzdGFydHVwLgogIGNvbnN0IHZpdGUgPSBhd2FpdCBjcmVhdGVWaXRlU2VydmVyKHsKICAgIGNvbmZpZ0ZpbGU6IGZhbHNlLAogICAgcm9vdDogcGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCksICJjbGllbnQiKSwKICAgIHNlcnZlcjogewogICAgICBtaWRkbGV3YXJlTW9kZTogdHJ1ZSwKICAgICAgaG1yOiB7IHNlcnZlciB9LAogICAgICBhbGxvd2VkSG9zdHM6IHRydWUgYXMgY29uc3QsCiAgICB9LAogICAgYXBwVHlwZTogImN1c3RvbSIsCiAgfSk7CgogIGFwcC51c2Uodml0ZS5taWRkbGV3YXJlcyk7CgogIGFwcC51c2UoIioiLCBhc3luYyAocmVxLCByZXMsIG5leHQpID0+IHsKICAgIGNvbnN0IHVybCA9IHJlcS5vcmlnaW5hbFVybDsKICAgIHRyeSB7CiAgICAgIGNvbnN0IGNsaWVudFRlbXBsYXRlID0gcGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCksICJjbGllbnQiLCAiaW5kZXguaHRtbCIpOwogICAgICBsZXQgdGVtcGxhdGUgPSBhd2FpdCBmcy5wcm9taXNlcy5yZWFkRmlsZShjbGllbnRUZW1wbGF0ZSwgInV0Zi04Iik7CiAgICAgIGNvbnN0IHsgbmFub2lkIH0gPSBhd2FpdCBpbXBvcnQoIm5hbm9pZCIpOwogICAgICB0ZW1wbGF0ZSA9IHRlbXBsYXRlLnJlcGxhY2UoCiAgICAgICAgJ3NyYz0iL3NyYy9tYWluLnRzeCInLAogICAgICAgIGBzcmM9Ii9zcmMvbWFpbi50c3g/dj0ke25hbm9pZCgpfSJgCiAgICAgICk7CiAgICAgIGNvbnN0IHBhZ2UgPSBhd2FpdCB2aXRlLnRyYW5zZm9ybUluZGV4SHRtbCh1cmwsIHRlbXBsYXRlKTsKICAgICAgcmVzLnN0YXR1cygyMDApLnNldCh7ICJDb250ZW50LVR5cGUiOiAidGV4dC9odG1sIiB9KS5lbmQocGFnZSk7CiAgICB9IGNhdGNoIChlKSB7CiAgICAgIHZpdGUuc3NyRml4U3RhY2t0cmFjZShlIGFzIEVycm9yKTsKICAgICAgbmV4dChlKTsKICAgIH0KICB9KTsKfQoKZXhwb3J0IGZ1bmN0aW9uIHNlcnZlU3RhdGljKGFwcDogRXhwcmVzcykgewogIC8vIFZpdGUgYnVpbGRzIHRvIGRpc3QvcHVibGljICh2aXRlLmNvbmZpZy50cyBidWlsZC5vdXREaXIpCiAgLy8gRG9ja2VyZmlsZTogQ09QWSBjbGllbnQvZGlzdCAtPiBkaXN0L3B1YmxpYwogIC8vIGltcG9ydC5tZXRhLmRpcm5hbWUgb2YgZGlzdC9pbmRleC5qcyA9IC9hcHAvZGlzdAogIGNvbnN0IGRpc3RQYXRoID0gcGF0aC5yZXNvbHZlKGltcG9ydC5tZXRhLmRpcm5hbWUsICJwdWJsaWMiKTsKCiAgaWYgKCFmcy5leGlzdHNTeW5jKGRpc3RQYXRoKSkgewogICAgY29uc29sZS5lcnJvcihgQ291bGQgbm90IGZpbmQgdGhlIGJ1aWxkIGRpcmVjdG9yeTogJHtkaXN0UGF0aH1gKTsKICB9CgogIGFwcC51c2UoZXhwcmVzcy5zdGF0aWMoZGlzdFBhdGgpKTsKCiAgYXBwLnVzZSgiKiIsIChfcmVxLCByZXMpID0+IHsKICAgIHJlcy5zZW5kRmlsZShwYXRoLnJlc29sdmUoZGlzdFBhdGgsICJpbmRleC5odG1sIikpOwogIH0pOwp9Cg==

    steps:
      - name: Checkout main
        uses: actions/checkout@v4
        with:
          ref: main
          fetch-depth: 0

      - name: Create or reset branch
        run: git checkout -B "$BRANCH"

      - name: Write server/_core/vite.ts from base64
        run: echo "$VITETS_B64" | base64 -d > server/_core/vite.ts

      - name: Verify - show file and check no vite.config import
        run: |
          echo "=== server/_core/vite.ts ==="
          cat server/_core/vite.ts
          echo ""
          echo "=== Checking for vite.config import ==="
          grep "vite.config" server/_core/vite.ts && echo "ERROR: vite.config still imported" || echo "OK: no vite.config import"
          echo "=== Checking for @tailwindcss import ==="
          grep "tailwindcss" server/_core/vite.ts && echo "ERROR: tailwindcss still imported" || echo "OK: no tailwindcss import"

      - name: Commit
        run: |
          git config user.name  "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add server/_core/vite.ts
          git commit -m "fix: remove vite.config import from server/_core/vite.ts

          Dynamically importing vite.config.ts pulled in devDependencies
          (@tailwindcss/vite, @vitejs/plugin-react) which are not installed
          in production, causing ERR_MODULE_NOT_FOUND at startup.

          Fix: inline the minimal vite server config (configFile: false,
          root, middlewareMode) directly in setupVite(). The config options
          needed for dev middleware do not require any plugins."

      - name: Push
        run: git push origin "$BRANCH" --force

      - name: Print PR URL
        run: |
          echo ""
          echo "Open PR at:"
          echo "https://github.com/lwrnckahiga88/copy-of-copy-of-jua-kali-clinical-intelligence-hub/compare/main...$BRANCH"
