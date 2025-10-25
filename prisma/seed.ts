import { PrismaClient, PaymentMethodType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Create sample users with new schema (nama, telp)
  const user1 = await prisma.user.upsert({
    where: { telp: '081234567890' },
    update: {},
    create: {
      nama: 'John Doe',
      telp: '081234567890',
      email: 'john.doe@example.com',
      apiKey: 'test-api-key-1',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { telp: '081987654321' },
    update: {},
    create: {
      nama: 'Jane Smith',
      telp: '081987654321',
      email: 'jane.smith@example.com',
      apiKey: 'test-api-key-2',
    },
  });

  const user3 = await prisma.user.upsert({
    where: { telp: '082111222333' },
    update: {},
    create: {
      nama: 'Ahmad Wijaya',
      telp: '082111222333',
      email: 'ahmad.wijaya@example.com',
    },
  });

  const user4 = await prisma.user.upsert({
    where: { telp: '085444555666' },
    update: {},
    create: {
      nama: 'Siti Nurhaliza',
      telp: '085444555666',
      // email optional
    },
  });

  console.log('Created users:', { user1, user2, user3, user4 });

  // Create payment providers
  const stripeProvider = await prisma.paymentProvider.upsert({
    where: { name: 'stripe' },
    update: {},
    create: {
      name: 'stripe',
      displayName: 'Stripe',
      isActive: true,
      config: {
        apiKey: 'sk_test_...',
        webhookSecret: 'whsec_...',
      },
    },
  });

  const paypalProvider = await prisma.paymentProvider.upsert({
    where: { name: 'paypal' },
    update: {},
    create: {
      name: 'paypal',
      displayName: 'PayPal',
      isActive: true,
      config: {
        clientId: 'test_client_id',
        clientSecret: 'test_client_secret',
        sandbox: true,
      },
    },
  });

  const midtransProvider = await prisma.paymentProvider.upsert({
    where: { name: 'midtrans' },
    update: {},
    create: {
      name: 'midtrans',
      displayName: 'Midtrans',
      isActive: true,
      config: {
        serverKey: 'SB-Mid-server-...',
        clientKey: 'SB-Mid-client-...',
        environment: 'sandbox',
      },
    },
  });

  console.log('Created payment providers:', { stripeProvider, paypalProvider, midtransProvider });

  // Create payment methods for user1
  const paymentMethod1 = await prisma.paymentMethod.create({
    data: {
      userId: user1.id,
      providerId: stripeProvider.id,
      providerMethodId: 'pm_1234567890',
      type: PaymentMethodType.CREDIT_CARD,
      last4: '4242',
      expiryMonth: 12,
      expiryYear: 2025,
      brand: 'visa',
      isDefault: true,
      metadata: {
        fingerprint: 'F1234567890ABCDEF',
        country: 'US',
      },
    },
  });

  const paymentMethod2 = await prisma.paymentMethod.create({
    data: {
      userId: user1.id,
      providerId: paypalProvider.id,
      providerMethodId: 'PAYPAL-ACCOUNT-1',
      type: PaymentMethodType.DIGITAL_WALLET,
      isDefault: false,
      metadata: {
        email: 'john.doe@example.com',
        payerId: 'PAYPAL-PAYER-ID-1',
      },
    },
  });

  // Create payment methods for user2
  const paymentMethod3 = await prisma.paymentMethod.create({
    data: {
      userId: user2.id,
      providerId: stripeProvider.id,
      providerMethodId: 'pm_0987654321',
      type: PaymentMethodType.DEBIT_CARD,
      last4: '5555',
      expiryMonth: 8,
      expiryYear: 2024,
      brand: 'mastercard',
      isDefault: true,
      metadata: {
        fingerprint: 'F0987654321FEDCBA',
        country: 'US',
      },
    },
  });

  const paymentMethod4 = await prisma.paymentMethod.create({
    data: {
      userId: user2.id,
      providerId: midtransProvider.id,
      providerMethodId: 'BCA-VA-12345',
      type: PaymentMethodType.BANK_ACCOUNT,
      isDefault: false,
      metadata: {
        bankName: 'BCA',
        accountNumber: '1234567890',
        accountHolder: 'Jane Smith',
      },
    },
  });

  console.log('Created payment methods:', {
    paymentMethod1,
    paymentMethod2,
    paymentMethod3,
    paymentMethod4
  });

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