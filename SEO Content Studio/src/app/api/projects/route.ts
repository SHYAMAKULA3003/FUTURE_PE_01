import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const projects = await db.project.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        clusters: {
          include: {
            blogs: true,
          },
        },
      },
    });
    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, businessType, city, state, description, website, targetAudience, keywords } = body;

    if (!name || !businessType || !city) {
      return NextResponse.json(
        { error: 'Name, business type, and city are required' },
        { status: 400 }
      );
    }

    const project = await db.project.create({
      data: {
        name,
        businessType,
        city,
        state: state || '',
        description: description || '',
        website: website || '',
        targetAudience: targetAudience || '',
        keywords: keywords ? JSON.stringify(keywords) : '[]',
        status: 'draft',
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
