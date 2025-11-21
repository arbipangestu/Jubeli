import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // Extract filters
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const brand = searchParams.get('brand');
  const yearMin = searchParams.get('year_min');
  const yearMax = searchParams.get('year_max');
  const transmission = searchParams.get('transmission');
  const isAdmin = searchParams.get('admin') === 'true'; // Check if admin mode

  const where: Prisma.VehicleWhereInput = {};

  // If not admin request, only show ACTIVE listings
  if (!isAdmin) {
    where.status = 'ACTIVE';
  }

  if (brand) {
    where.brand = { contains: brand, mode: 'insensitive' };
  }

  if (yearMin || yearMax) {
    const yearFilter: Prisma.IntFilter = {};
    if (yearMin) yearFilter.gte = parseInt(yearMin);
    if (yearMax) yearFilter.lte = parseInt(yearMax);
    where.year = yearFilter;
  }

  if (transmission) {
    where.transmission = { equals: transmission, mode: 'insensitive' };
  }

  try {
    const [vehicles, total] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { created_at: 'desc' },
        include: {
          images: {
            where: { is_primary: true },
            take: 1
          },
          user: isAdmin ? { select: { name: true } } : false // Include user info for admin
        }
      }),
      prisma.vehicle.count({ where })
    ]);

    return NextResponse.json({
      data: vehicles,
      meta: {
        total,
        page,
        last_page: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Basic validation (In real app, use Zod)
    if (!body.title || !body.price || !body.user_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        user_id: body.user_id, // In real app, get from session
        category_id: body.category_id,
        title: body.title,
        brand: body.brand,
        model: body.model,
        year: body.year,
        transmission: body.transmission,
        fuel_type: body.fuel_type,
        engine_size: body.engine_size,
        mileage: body.mileage,
        color: body.color,
        price: body.price,
        description: body.description,
        location_province: body.location_province,
        location_city: body.location_city,
        status: 'PENDING', // Default to pending
        images: {
          create: body.images?.map((url: string, index: number) => ({
            image_url: url,
            is_primary: index === 0
          }))
        }
      }
    });

    return NextResponse.json(vehicle, { status: 201 });
  } catch (error) {
    console.error('Error creating vehicle:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
