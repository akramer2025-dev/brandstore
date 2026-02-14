// Test Facebook Conversions API
// Run: npx tsx test-fb-capi.ts

import { fbCAPI } from './src/lib/facebook-capi';

async function testConversionsAPI() {
  console.log('🧪 Testing Facebook Conversions API...\n');

  // Check if credentials are set
  if (!process.env.FACEBOOK_PIXEL_ID || !process.env.FACEBOOK_ACCESS_TOKEN) {
    console.error('❌ Missing credentials!');
    console.log('\nAdd to .env:');
    console.log('FACEBOOK_PIXEL_ID="your-pixel-id"');
    console.log('FACEBOOK_ACCESS_TOKEN="your-access-token"');
    console.log('\nSee FACEBOOK_CONVERSIONS_API_GUIDE.md for help');
    process.exit(1);
  }

  console.log('✅ Credentials found');
  console.log(`📊 Pixel ID: ${process.env.FACEBOOK_PIXEL_ID}`);
  if (process.env.FACEBOOK_TEST_EVENT_CODE) {
    console.log(`🧪 Test Event Code: ${process.env.FACEBOOK_TEST_EVENT_CODE}`);
  }

  // Test 1: PageView
  console.log('\n📄 Test 1: Sending PageView...');
  const pageViewResult = await fbCAPI.trackPageView({
    url: 'https://www.remostore.net/test',
    ip: '156.219.123.45', // Example Egyptian IP
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  });
  console.log(pageViewResult ? '✅ PageView sent' : '❌ PageView failed');

  // Test 2: ViewContent
  console.log('\n👀 Test 2: Sending ViewContent...');
  const viewContentResult = await fbCAPI.trackViewContent({
    productId: 'test-product-123',
    productName: 'Test Product',
    price: 500,
    url: 'https://www.remostore.net/product/test-product-123',
    ip: '156.219.123.45',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  });
  console.log(viewContentResult ? '✅ ViewContent sent' : '❌ ViewContent failed');

  // Test 3: AddToCart
  console.log('\n🛒 Test 3: Sending AddToCart...');
  const addToCartResult = await fbCAPI.trackAddToCart({
    productId: 'test-product-123',
    productName: 'Test Product',
    price: 500,
    quantity: 1,
    url: 'https://www.remostore.net/cart',
    ip: '156.219.123.45',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  });
  console.log(addToCartResult ? '✅ AddToCart sent' : '❌ AddToCart failed');

  // Test 4: Purchase
  console.log('\n💰 Test 4: Sending Purchase...');
  const purchaseResult = await fbCAPI.trackPurchase({
    orderId: 'TEST-ORDER-001',
    productIds: ['test-product-123'],
    totalValue: 500,
    numItems: 1,
    phone: '01234567890', // Will be hashed
    email: 'test@example.com', // Will be hashed
    url: 'https://www.remostore.net/order-confirmation',
    ip: '156.219.123.45',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  });
  console.log(purchaseResult ? '✅ Purchase sent' : '❌ Purchase failed');

  // Test 5: Lead
  console.log('\n📝 Test 5: Sending Lead...');
  const leadResult = await fbCAPI.trackLead({
    phone: '01234567890',
    email: 'test@example.com',
    url: 'https://www.remostore.net/contact',
    ip: '156.219.123.45',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  });
  console.log(leadResult ? '✅ Lead sent' : '❌ Lead failed');

  console.log('\n✨ Test completed!');
  console.log('\n📊 Check results in Facebook Events Manager:');
  console.log('https://business.facebook.com/events_manager2/list/pixel/test_events');
  console.log('\nYou should see 5 events (PageView, ViewContent, AddToCart, Purchase, Lead)');
  console.log('If using Test Event Code, they will appear in Test Events section.');
}

testConversionsAPI().catch(console.error);
