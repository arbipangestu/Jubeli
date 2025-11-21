import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        images: true,
        user: {
          select: {
            name: true,
            phone_number: true,
            created_at: true
          }
        },
        category: true
      }
    });

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    return NextResponse.json(vehicle);
  } catch (error) {
    console.error('Error fetching vehicle detail:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();

    // Whitelist allowed fields to prevent Mass Assignment
    const allowedFields: (keyof Prisma.VehicleUpdateInput)[] = [
      'title', 'price', 'description', 'status', 'is_sold',
      'mileage', 'location_province', 'location_city'
    ];

    const updateData: Prisma.VehicleUpdateInput = {};

    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        // Explicitly cast or handle types if necessary, but for simple scalars it's often okay.
        // Prisma types are strict, so we simply copy valid keys.
        // We use 'as any' here for simplicity in this draft,
        // but in production, type narrowing/validation (Zod) is better.
        (updateData as any)[key] = body[key];
      }
    }

    // Handle nested update for status if it's an admin action
    if (body.status) {
      // Add logic here to verify if user is admin
      updateData.status = body.status;
    }

    const updatedVehicle = await prisma.vehicle.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(updatedVehicle);
  } catch (error) {
    console.error('Error updating vehicle:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
