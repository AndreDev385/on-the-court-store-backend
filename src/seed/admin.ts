// seedAdminUser.ts
import { User } from '../models/User';

export async function seedAdminUser(): Promise<void> {
  // Check if the admin user already exists
  const adminExists = await User.findOne({ privilege: 1 });
  if (adminExists) {
    console.log('Admin user already exists.');
    return;
  }

  // Create the admin user
  const adminUser = new User({
    name: 'Riccardo',
    email: 'riccardo@onthecourtstore.com',
    password: process.env.ADMIN_PASSWORD,
    privilege: 1,
  });

  await adminUser.save();
  console.log('Admin user created successfully.');
}
