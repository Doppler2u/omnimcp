import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { specUrl } = await req.json();

    if (!specUrl) {
      return NextResponse.json({ success: false, error: 'specUrl is required' }, { status: 400 });
    }

    // Fetch the actual OpenAPI spec to generate a real hash
    const response = await fetch(specUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch spec from ${specUrl}`);
    }

    const specContent = await response.text();
    
    // Calculate a real SHA-256 hash of the schema content
    const hash = crypto.createHash('sha256').update(specContent).digest('hex');

    return NextResponse.json({
      success: true,
      hash: `0x${hash}`
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
