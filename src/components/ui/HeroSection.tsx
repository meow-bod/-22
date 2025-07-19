'use client';

import Link from 'next/link';
import Image from 'next/image';

const HeroSection = () => (
  <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-primary/10">
    <div className="container px-4 md:px-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
        <div className="flex flex-col justify-center space-y-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-primary-dark">
              找到最懂你家毛孩的專屬保姆
            </h1>
            <p className="max-w-[600px] text-text-subtle md:text-xl">
              Pawdner 提供最專業、最安心的寵物保姆媒合服務。無論是到府照顧、安親，還是戶外遛狗，我們都能為您找到最適合的毛孩夥伴。
            </p>
          </div>
          <div className="flex flex-col gap-2 min-[400px]:flex-row">
            <Link
              href="/search"
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-white shadow transition-colors hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            >
              立即尋找保姆
            </Link>
          </div>
        </div>
        <Image
          src="/hero-image.jpg"
          alt="溫馨的寵物保姆與可愛的狗狗"
          width={600}
          height={600}
          className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square"
        />
      </div>
    </div>
  </section>
);

export default HeroSection;