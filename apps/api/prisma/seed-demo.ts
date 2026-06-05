/**
 * Demo seed script — creates an agency account with 3 sample creator clients
 * and sample messages to populate the AI inbox for demos.
 *
 * Run: npx ts-node prisma/seed-demo.ts
 * Or:  POSTGRES_URL=... npx ts-node prisma/seed-demo.ts
 */
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding demo data...");

  // 1. Create demo agency user
  const agencyEmail = "demo-agency@novafans.app";
  const hashedPw = await bcrypt.hash("DemoPass123!", 10);

  const agency = await prisma.user.upsert({
    where: { email: agencyEmail },
    update: {},
    create: {
      email: agencyEmail,
      username: "demo_agency",
      displayName: "Demo Agency",
      passwordHash: hashedPw,
      role: "AGENCY",
      ageVerified: true,
      tosAccepted: true,
      privacyAccepted: true,
    },
  });
  console.log(`✅ Agency user: ${agency.email} (password: DemoPass123!)`);

  // 2. Create 3 demo creator clients
  const clientData = [
    { name: "Sofia Marin", slug: "sofia-marin", colorTag: "#EC4899", bio: "Travel & lifestyle creator. Capturing moments around the world.", toneProfile: "Warm, playful, slightly flirty. Use emojis sparingly. Reference travel often." },
    { name: "Luna Knight", slug: "luna-knight", colorTag: "#8B5CF6", bio: "Music, mood, and midnight thoughts. Subscriber-only mixes monthly.", toneProfile: "Mysterious, poetic, gentle. Short responses. Reference music and night vibes." },
    { name: "Aria Stone", slug: "aria-stone", colorTag: "#3B82F6", bio: "Fitness, mindset, and morning routines. Your daily dose of motivation.", toneProfile: "Energetic, motivating, supportive. Use exclamation marks. Reference workouts and goals." },
  ];

  const clients: any[] = [];
  for (const data of clientData) {
    const existing = await prisma.agencyClient.findUnique({ where: { slug: data.slug } });
    const client = existing || await prisma.agencyClient.create({
      data: {
        agencyId: agency.id,
        name: data.name,
        slug: data.slug,
        bio: data.bio,
        colorTag: data.colorTag,
        toneProfile: data.toneProfile,
        payoutSplit: 0.8,
        platformLinks: { INSTAGRAM: `https://instagram.com/${data.slug}`, TWITTER: `https://twitter.com/${data.slug}` },
        status: "ACTIVE",
      },
    });
    clients.push(client);
    console.log(`✅ Client: ${client.name} (/${client.slug})`);
  }

  // 3. Create sample inbox messages for each client
  const fanNames = ["Alex M.", "Jamie L.", "Taylor R.", "Jordan K.", "Riley S."];
  const messageBodies = [
    "Hey! Love your latest post 😍 Are you doing any meet-ups soon?",
    "I've been a fan forever. Just upgraded to Premium — totally worth it!",
    "Could you do a custom video for my birthday? Happy to pay extra.",
    "Your content is everything. Just wanted to say thank you 💜",
    "Have you tried the new spot in LA? You'd love it!",
  ];

  for (const client of clients) {
    for (let i = 0; i < 3; i++) {
      await prisma.agencyMessage.create({
        data: {
          clientId: client.id,
          platform: ["INSTAGRAM", "TWITTER", "ONLYFANS"][i % 3] as any,
          fanName: fanNames[i % fanNames.length],
          content: messageBodies[i % messageBodies.length],
          direction: "INBOUND",
          status: "UNREAD",
        },
      });
    }
  }
  console.log(`✅ Created ${clients.length * 3} sample messages`);

  // 4. Create sample products for each client
  for (const client of clients) {
    await prisma.agencyProduct.createMany({
      data: [
        { clientId: client.id, title: "Exclusive Photo Set", description: "10 unreleased photos", price: 14.99, type: "PHOTO" },
        { clientId: client.id, title: "Premium Video Bundle", description: "5 full-length videos", price: 29.99, type: "BUNDLE" },
        { clientId: client.id, title: "Custom Shoutout", description: "Personalized video message", price: 49.99, type: "VIDEO" },
      ],
    });
  }
  console.log(`✅ Created ${clients.length * 3} sample products`);

  // 5. Create sample response templates
  const templates = [
    { title: "Thanks for subscribing", content: "Thank you so much for joining! 💜 Can't wait to share more with you. Have a great day!" },
    { title: "Custom request reply", content: "Hi! I'd love to do that for you. Send me what you have in mind via DM and we can sort out the details." },
    { title: "Compliment response", content: "Aww thank you so much! You just made my day 🥰 I appreciate you being here." },
  ];
  for (const tpl of templates) {
    await prisma.agencyResponseTemplate.create({
      data: { agencyId: agency.id, title: tpl.title, content: tpl.content, tags: [] },
    });
  }
  console.log(`✅ Created ${templates.length} response templates`);

  console.log("\n🎉 Demo data seeded successfully!");
  console.log("\nLog in with:");
  console.log("  Email:    demo-agency@novafans.app");
  console.log("  Password: DemoPass123!");
  console.log("\nThen visit /agency to see the dashboard with 3 clients.\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
