'use client';

import { PawPrint, Bone, Home as HomeIcon } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/Form';
import HeroSection from '@/components/ui/HeroSection';
import FeatureCard from '@/components/ui/FeatureCard';

// Main Home Page Component
export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <HeroSection />

        <section className="w-full py-12 md:py-24 lg:py-32 bg-background-subtle">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary/20 px-3 py-1 text-sm text-primary-dark">我們的服務</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-secondary">全方位寵物照護</h2>
                <p className="max-w-[900px] text-text-subtle md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  我們提供多樣化的服務，滿足您與毛孩的各種需求，讓您出門在外也能無後顧之憂。
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 mt-12">
              <FeatureCard 
                icon={<HomeIcon className="h-12 w-12" />} 
                title="到府照顧"
                description="專業保姆到您最熟悉的家中，給毛孩最溫暖的陪伴。"
              />
              <FeatureCard 
                icon={<PawPrint className="h-12 w-12" />} 
                title="到府遛狗"
                description="讓充滿活力的狗狗，享受每日的陽光與散步時光。"
              />
              <FeatureCard 
                icon={<Bone className="h-12 w-12" />} 
                title="寵物安親"
                description="白天需要上班？我們提供日間安親，讓毛孩不孤單。"
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
