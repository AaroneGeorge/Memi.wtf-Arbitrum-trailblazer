import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader) {
    return NextResponse.json({ error: 'No authorization token provided' }, { status: 401 });
  }

  try {
    const response = await fetch(`https://discord.com/api/v10/applications/${id}`, {
      headers: {
        'Accept': '*/*',
        'Authorization': authHeader
      }
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching Discord bot details:', error);
    return NextResponse.json({ error: 'Failed to fetch Discord bot details' }, { status: 500 });
  }
} 