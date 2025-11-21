import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // 1. Create Categories
  const carCategory = await prisma.category.upsert({
    where: { slug: 'mobil' },
    update: {},
    create: {
      name: 'Mobil',
      slug: 'mobil',
    },
  });

  const motorCategory = await prisma.category.upsert({
    where: { slug: 'motor' },
    update: {},
    create: {
      name: 'Motor',
      slug: 'motor',
    },
  });

  console.log(`Created categories: ${carCategory.name}, ${motorCategory.name}`);

  // 2. Create Users
  // Note: In a real app, passwords should be hashed (e.g., using bcrypt).
  // For this draft/demo, we are storing them plainly or you can mock the hash.
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@example.com',
      password_hash: 'secret_admin_hash',
      phone_number: '081234567890',
      role: 'ADMIN',
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      name: 'Regular Seller',
      email: 'user@example.com',
      password_hash: 'secret_user_hash',
      phone_number: '089876543210',
      role: 'USER',
    },
  });

  console.log(`Created users: ${admin.name} (ID: ${admin.id}), ${user.name} (ID: ${user.id})`);

  // 3. Create Dummy Vehicle
  const dummyVehicle = await prisma.vehicle.create({
    data: {
      user_id: user.id,
      category_id: carCategory.id,
      title: 'Toyota Avanza 2020 Type G',
      brand: 'Toyota',
      model: 'Avanza',
      year: 2020,
      transmission: 'Automatic',
      fuel_type: 'Bensin',
      engine_size: 1500,
      mileage: 25000,
      color: 'Hitam',
      price: 185000000,
      description: 'Mobil tangan pertama, kondisi mulus, pajak hidup.',
      location_province: 'DKI Jakarta',
      location_city: 'Jakarta Selatan',
      status: 'ACTIVE',
      images: {
        create: [
          {
            image_url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80',
            is_primary: true
          }
        ]
      }
    }
  });

  console.log(`Created dummy vehicle: ${dummyVehicle.title}`);

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
