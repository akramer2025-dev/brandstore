const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSliderImages() {
  try {
    const slides = await prisma.sliderImage.findMany({
      orderBy: { order: 'asc' }
    });
    
    console.log('=================================');
    console.log('Total slider images:', slides.length);
    console.log('=================================\n');
    
    if (slides.length === 0) {
      console.log('No slider images found in database!');
      console.log('You need to add slider images.');
    } else {
      slides.forEach((slide, index) => {
        console.log(`${index + 1}. Title: ${slide.title || 'No title'}`);
        console.log(`   Image: ${slide.imageUrl}`);
        console.log(`   Link: ${slide.link || 'No link'}`);
        console.log(`   Active: ${slide.isActive ? 'YES' : 'NO'}`);
        console.log(`   Order: ${slide.order}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkSliderImages();
