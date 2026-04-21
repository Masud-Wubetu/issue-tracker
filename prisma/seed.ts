const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Clear existing data (in reverse order of dependencies)
  await prisma.activityLog.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.issue.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  const manager1 = await prisma.user.create({
    data: {
      name: 'Project Manager One',
      email: 'manager1@example.com',
      password: hashedPassword,
      role: 'MANAGER',
    },
  });

  const manager2 = await prisma.user.create({
    data: {
      name: 'Project Manager Two',
      email: 'manager2@example.com',
      password: hashedPassword,
      role: 'MANAGER',
    },
  });

  const devs = [];
  for (let i = 1; i <= 5; i++) {
    const dev = await prisma.user.create({
      data: {
        name: `Developer ${i}`,
        email: `dev${i}@example.com`,
        password: hashedPassword,
        role: 'DEVELOPER',
      },
    });
    devs.push(dev);
  }

  const qas = [];
  for (let i = 1; i <= 2; i++) {
    const qa = await prisma.user.create({
      data: {
        name: `QA Tester ${i}`,
        email: `qa${i}@example.com`,
        password: hashedPassword,
        role: 'QA',
      },
    });
    qas.push(qa);
  }

  // 3. Create Projects
  const project1 = await prisma.project.create({
    data: {
      name: 'Mobile App Redesign',
      description: 'A complete overhaul of our primary mobile application to improve UX and performance.',
      members: { connect: [{ id: admin.id }, { id: manager1.id }, { id: devs[0].id }, { id: devs[1].id }, { id: qas[0].id }] },
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'Cloud Migration',
      description: 'Moving our legacy on-premise infrastructure to a modern cloud-native architecture.',
      members: { connect: [{ id: admin.id }, { id: manager2.id }, { id: devs[2].id }, { id: devs[3].id }, { id: qas[1].id }] },
    },
  });

  const project3 = await prisma.project.create({
    data: {
      name: 'External API Portal',
      description: 'Developing a secure and scalable portal for third-party developers to access our core services.',
      members: { connect: [{ id: admin.id }, { id: manager1.id }, { id: manager2.id }, { id: devs[4].id }] },
    },
  });

  // 4. Create Issues
  const projects = [project1, project2, project3];
  const statuses = ['OPEN', 'IN_PROGRESS', 'IN_REVIEW', 'RESOLVED', 'CLOSED'];
  const priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  const types = ['BUG', 'FEATURE', 'TASK', 'IMPROVEMENT'];

  for (const project of projects) {
    for (let i = 1; i <= 10; i++) {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const priority = priorities[Math.floor(Math.random() * priorities.length)];
      const type = types[Math.floor(Math.random() * types.length)];
      const assignee = devs[Math.floor(Math.random() * devs.length)];

      await prisma.issue.create({
        data: {
          title: `${project.name} - ${type} #${i}`,
          description: `Detailed description for ${type} in ${project.name}. This issue needs immediate attention and systematic resolution.`,
          status: status,
          priority: priority,
          type: type,
          projectId: project.id,
          reporterId: admin.id,
          assigneeId: status === 'OPEN' ? null : assignee.id,
        },
      });
    }
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
