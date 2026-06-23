const MANIFEST_URL = 'https://olympix-download.s3.amazonaws.com/cli/manifest.json';

const FALLBACK_VERSION = '0.11.74';
const FALLBACK_BINARIES: Binaries = {
  'osx-arm64':   { url: `https://olympix-download.s3.amazonaws.com/cli/v${FALLBACK_VERSION}/osx-arm64/olympix`,       sha256: '', size: 0 },
  'osx-x64':     { url: `https://olympix-download.s3.amazonaws.com/cli/v${FALLBACK_VERSION}/osx-x64/olympix`,         sha256: '', size: 0 },
  'linux-x64':   { url: `https://olympix-download.s3.amazonaws.com/cli/v${FALLBACK_VERSION}/linux-x64/olympix`,       sha256: '', size: 0 },
  'linux-arm64': { url: `https://olympix-download.s3.amazonaws.com/cli/v${FALLBACK_VERSION}/linux-arm64/olympix`,     sha256: '', size: 0 },
  'win-x64':     { url: `https://olympix-download.s3.amazonaws.com/cli/v${FALLBACK_VERSION}/win-x64/olympix.exe`,     sha256: '', size: 0 },
  'win-arm64':   { url: `https://olympix-download.s3.amazonaws.com/cli/v${FALLBACK_VERSION}/win-arm64/olympix.exe`,   sha256: '', size: 0 },
};

export type Platform = 'osx-arm64' | 'osx-x64' | 'linux-x64' | 'linux-arm64' | 'win-x64' | 'win-arm64';
export type BinaryEntry = { url: string; sha256: string; size: number };
export type Binaries = Record<Platform, BinaryEntry>;

type Manifest = {
  latestVersion: string;
  releaseDate: string;
  releaseNotes: string;
  binaries: Binaries;
};

async function fetchManifest(): Promise<{ version: string; binaries: Binaries }> {
  try {
    const res = await fetch(MANIFEST_URL);
    if (!res.ok) throw new Error(`S3 manifest returned ${res.status}`);
    const data = (await res.json()) as Manifest;
    return { version: data.latestVersion, binaries: data.binaries };
  } catch (err) {
    console.warn(
      `[cli-version] failed to fetch manifest from S3, using fallback v${FALLBACK_VERSION}:`,
      err,
    );
    return { version: FALLBACK_VERSION, binaries: FALLBACK_BINARIES };
  }
}

const { version, binaries } = await fetchManifest();

export const CLI_VERSION: string = version;
export const CLI_BINARIES: Binaries = binaries;
