import "dotenv/config";

async function main() {
  const email = process.argv[2] || "admin@maison.com";
  const password = process.argv[3] || "admin123";
  const name = process.argv[4] || "Admin";

  const { auth } = await import("../src/lib/auth");
  const { prisma } = await import("../src/lib/db");

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`User ${email} already exists.`);
    await prisma.$disconnect();
    return;
  }

  await auth.api.signUpEmail({
    body: { email, password, name },
  });

  await prisma.user.update({
    where: { email },
    data: { role: "ADMIN" },
  });

  console.log(`Admin user created: ${email} / ${password}`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
