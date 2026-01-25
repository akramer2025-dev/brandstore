import { prisma } from '@/lib/prisma';
import HeroSliderClient from './HeroSliderClient';

export async function HeroSlider() {
  const slides = await prisma.sliderImage.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });

  return <HeroSliderClient slides={slides} />;
}
