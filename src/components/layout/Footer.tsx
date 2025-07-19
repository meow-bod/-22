'use client';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-8">
      <div className="container mx-auto px-4 text-center">
        <p>&copy; {new Date().getFullYear()} Pawdner. All rights reserved.</p>
        <p className="text-sm text-gray-400 mt-2">
          Connecting pet owners with trusted sitters.
        </p>
      </div>
    </footer>
  );
}