import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { DEFAULT_AKPD_ITEMS } from '@/lib/assessment-data';

export const dynamic = 'force-dynamic';

// GET: Fetch severity configurations
export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const configs = await prisma.assessmentItemConfig.findMany({
      orderBy: { orderIndex: 'asc' }
    });

    const severityMap: Record<string, string> = {};
    configs.forEach(c => {
      severityMap[c.itemCode] = c.severity;
    });

    // Merge defaults
    const items = DEFAULT_AKPD_ITEMS.map((item, idx) => ({
      ...item,
      orderIndex: idx + 1,
      severity: severityMap[item.id] || item.severity || 'NORMAL'
    }));

    return NextResponse.json({ items, configs });
  } catch (error: any) {
    console.error('Error fetching assessment config:', error);
    return NextResponse.json({ error: 'Gagal memuat konfigurasi severity' }, { status: 500 });
  }
}

// POST: Update severity configuration for items (Guru BK / Admin only)
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !['ADMIN', 'GURU_BK'].includes(session.role)) {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
    }

    const body = await request.json();
    const { itemCode, assessmentType = 'AKPD', statement, category, severity } = body;

    if (!itemCode || !severity) {
      return NextResponse.json({ error: 'Item code dan severity wajib diisi' }, { status: 400 });
    }

    const updated = await prisma.assessmentItemConfig.upsert({
      where: {
        assessmentType_itemCode: { assessmentType, itemCode }
      },
      update: { severity },
      create: {
        assessmentType,
        itemCode,
        statement: statement || '',
        category: category || 'Pribadi',
        severity
      }
    });

    // Audit Log
    await prisma.activityLog.create({
      data: {
        userId: session.id || 'system',
        userName: session.name,
        userRole: session.role,
        action: 'UPDATE_ASSESSMENT_SEVERITY_CONFIG',
        module: 'Asesmen',
        details: `Mengubah severity butir ${itemCode} (${assessmentType}) menjadi ${severity}`
      }
    });

    return NextResponse.json({ success: true, item: updated });
  } catch (error: any) {
    console.error('Error updating assessment config:', error);
    return NextResponse.json({ error: 'Gagal menyimpan konfigurasi severity' }, { status: 500 });
  }
}
