import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cluster = await db.contentCluster.findUnique({
      where: { id },
      include: {
        blogs: {
          orderBy: [
            { type: 'desc' }, // pillar first
            { createdAt: 'asc' },
          ],
        },
        project: true,
      },
    });

    if (!cluster) {
      return NextResponse.json({ error: 'Cluster not found' }, { status: 404 });
    }

    return NextResponse.json(cluster);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch cluster' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.contentCluster.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete cluster' }, { status: 500 });
  }
}
