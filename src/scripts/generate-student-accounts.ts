import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function generateBkCode(): string {
  const randomDigits = Math.floor(100 + Math.random() * 900);
  return `bk${randomDigits}`;
}

async function main() {
  console.log('=== Generating Student Accounts with format bk + 3 random digits ===');

  const students = await prisma.student.findMany({
    where: { status: 'Aktif' },
    include: { currentClass: true },
    orderBy: [{ currentClass: { name: 'asc' } }, { name: 'asc' }]
  });

  console.log(`Found ${students.length} active students in database.`);

  const existingUsers = await prisma.user.findMany({
    select: { id: true, username: true, studentId: true, nipNis: true }
  });

  const usedUsernames = new Set(existingUsers.map(u => u.username.toLowerCase()));
  const userByStudentId = new Map(existingUsers.filter(u => u.studentId).map(u => [u.studentId, u]));
  const userByNis = new Map(existingUsers.filter(u => u.nipNis).map(u => [u.nipNis, u]));

  const summary = [];

  for (const student of students) {
    let uniqueUsername = generateBkCode();
    while (usedUsernames.has(uniqueUsername.toLowerCase())) {
      uniqueUsername = generateBkCode();
    }
    usedUsernames.add(uniqueUsername.toLowerCase());

    const plainPassword = generateBkCode();
    const passwordHash = await bcrypt.hash(plainPassword, 10);

    const existingAccount = userByStudentId.get(student.id) || userByNis.get(student.nis);

    if (existingAccount) {
      await prisma.user.update({
        where: { id: existingAccount.id },
        data: {
          username: uniqueUsername,
          passwordHash,
          name: student.name,
          nipNis: student.nis,
          studentId: student.id,
          role: 'MURID'
        }
      });
    } else {
      await prisma.user.create({
        data: {
          username: uniqueUsername,
          email: student.email || `${student.nis}@siswa.smp41jkt.sch.id`,
          passwordHash,
          role: 'MURID',
          name: student.name,
          nipNis: student.nis,
          studentId: student.id,
          mustChangePassword: false
        }
      });
    }

    summary.push({
      nama: student.name,
      nis: student.nis,
      kelas: student.currentClass?.name || '-',
      username: uniqueUsername,
      password: plainPassword
    });
  }

  console.log(`Successfully generated ${summary.length} student accounts.`);
  console.log('Sample generated accounts:');
  console.table(summary.slice(0, 10));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
