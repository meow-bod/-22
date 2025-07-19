'use client';

import React from 'react';

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
    <div className="mb-4 text-primary">{icon}</div>
    <h3 className="text-xl font-bold mb-2 text-secondary">{title}</h3>
    <p className="text-text-subtle">{description}</p>
  </div>
);

export default FeatureCard;