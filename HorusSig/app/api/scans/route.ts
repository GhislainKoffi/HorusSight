import { NextResponse } from 'next/server';
import { scans } from '@/lib/store';
import { spawn } from 'child_process';
import path from 'path';

// Helper to extract user ID from mock token
const getUserId = (request: Request) => {
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer mock_token_')) {
    return authHeader.replace('Bearer mock_token_', '');
  }
  return 'system'; // Fallback for guest/demo
};

export async function GET(request: Request) {
  const userId = getUserId(request);
  // Filter scans by user ID
  return NextResponse.json(scans.filter(s => s.userId === userId));
}

export async function POST(request: Request) {
  try {
    const userId = getUserId(request);
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const scanId = `scan_${Date.now()}`;
    const newScan = {
      id: scanId,
      userId: userId, // Associate with user
      target: url,
      status: 'In Progress',
      timestamp: new Date().toISOString(),
      vulnerabilities: [],
      endpoints: [url],
      logs: [] as string[]
    };

    scans.unshift(newScan);

    const pythonScriptPath = path.resolve(process.cwd(), '..', 'main.py');
    // Pass --user-id to Python engine
    const pythonProcess = spawn('python', [
      pythonScriptPath, 
      '--url', url, 
      '--json',
      '--user-id', userId
    ]);

    let outputData = '';

    pythonProcess.stdout.on('data', (data) => {
      const chunk = data.toString();
      outputData += chunk;

      const lines = chunk.split('\n');
      lines.forEach((line: string) => {
        if (line.trim().startsWith('LOG:')) {
          const logMessage = line.replace('LOG:', '').trim();
          const scanIndex = scans.findIndex(s => s.id === scanId);
          if (scanIndex !== -1) {
            scans[scanIndex].logs = [...(scans[scanIndex].logs || []), logMessage].slice(-50);
          }
        }
      });
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`[!] Python Error: ${data.toString()}`);
    });

    pythonProcess.on('close', (code) => {
      const scanIndex = scans.findIndex(s => s.id === scanId);
      if (scanIndex === -1) return;

      if (code === 0) {
        try {
          // Robust JSON extraction from the tail of outputData
          const jsonStartIndex = outputData.lastIndexOf('{');
          const jsonEndIndex = outputData.lastIndexOf('}');
          
          if (jsonStartIndex !== -1 && jsonEndIndex !== -1 && jsonEndIndex > jsonStartIndex) {
            const jsonString = outputData.substring(jsonStartIndex, jsonEndIndex + 1);
            const results = JSON.parse(jsonString);
            
            scans[scanIndex].status = 'Completed';
            scans[scanIndex].vulnerabilities = (results.findings || []).map((f: any) => ({
              type: f.type,
              severity: f.severity,
              category: f.type,
              evidence: f.evidence,
              url: f.url
            }));
            if (results.ai_analysis) {
              scans[scanIndex].ai_analysis = results.ai_analysis;
            }
            console.log(`[+] Scan ${scanId} (User: ${userId}) completed successfully.`);
          } else {
            throw new Error("No payload JSON block found in output");
          }
        } catch (e) {
          console.error(`[!] Failed to parse Python output for ${scanId}:`, e);
          scans[scanIndex].status = 'Error';
        }
      } else {
        console.error(`[!] Python scan failed with code ${code}`);
        scans[scanIndex].status = 'Error';
      }
    });

    return NextResponse.json(newScan);
  } catch (error) {
    console.error('[!] API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
