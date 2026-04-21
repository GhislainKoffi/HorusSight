import axios from 'axios';

/**
 * Ghost Engine — HTTP-based vulnerability scanner.
 * Extracted from the original Express server for reuse in Next.js API Routes.
 */
export async function performScan(targetUrl: string) {
  const vulnerabilities: any[] = [];
  const endpoints: string[] = [];

  try {
    const startTime = Date.now();
    const response = await axios.get(targetUrl, {
      timeout: 5000,
      validateStatus: () => true,
    });
    const headers = response.headers;

    // 1. Security Headers Check
    const securityHeaders = [
      { name: 'content-security-policy', severity: 'High', description: 'Content Security Policy (CSP) header is missing.' },
      { name: 'x-frame-options', severity: 'Medium', description: 'X-Frame-Options header is missing (Clickjacking risk).' },
      { name: 'strict-transport-security', severity: 'Medium', description: 'HTTP Strict Transport Security (HSTS) is not enabled.' },
      { name: 'x-content-type-options', severity: 'Low', description: 'X-Content-Type-Options: nosniff header is missing.' },
    ];

    securityHeaders.forEach((sh) => {
      if (!headers[sh.name]) {
        vulnerabilities.push({
          id: `VUL-${vulnerabilities.length + 1}`,
          type: sh.name,
          category: 'Security Configuration',
          severity: sh.severity,
          description: sh.description,
          impact: 'Information disclosure or increased attack surface.',
          recommendation: `Add the ${sh.name} header with a secure configuration.`,
        });
      }
    });

    // 2. Sensitive Files Check
    const sensitiveFiles = ['.env', '.git/config', 'wp-config.php', 'config.json'];
    for (const file of sensitiveFiles) {
      try {
        const fileUrl = new URL(file, targetUrl).toString();
        const fileRes = await axios.get(fileUrl, { timeout: 2000, validateStatus: () => true });
        if (fileRes.status === 200) {
          vulnerabilities.push({
            id: `VUL-${vulnerabilities.length + 1}`,
            type: 'Sensitive File Exposure',
            category: 'Broken Access Control',
            severity: 'Critical',
            description: `A potentially sensitive file is accessible: ${file}`,
            impact: 'Confidentiality breach, exposing system secrets or configurations.',
            recommendation: 'Restrict access to sensitive folders and files via server configuration.',
          });
        }
      } catch (_e) {
        // Ignore individual file check errors
      }
    }

    // 3. Crawler Simulation — extract same-origin links
    const html = response.data;
    if (typeof html === 'string') {
      const linkMatches = html.matchAll(/href="([^"]+)"/g);
      for (const match of linkMatches) {
        try {
          const url = new URL(match[1], targetUrl);
          if (url.origin === new URL(targetUrl).origin) {
            endpoints.push(url.toString());
          }
        } catch (_e) {
          // Ignore malformed URLs
        }
      }
    }

    const uniqueEndpoints = Array.from(new Set(endpoints)).slice(0, 50);

    return {
      status: 'Completed',
      vulnerabilities,
      endpoints: uniqueEndpoints,
      duration: Date.now() - startTime,
      target: targetUrl,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    return {
      status: 'Failed',
      error: error.message,
      vulnerabilities: [],
      endpoints: [],
      duration: 0,
      target: targetUrl,
      timestamp: new Date().toISOString(),
    };
  }
}
