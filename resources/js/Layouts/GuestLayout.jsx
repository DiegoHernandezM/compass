import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col items-center bg-gray-100 pt-6 sm:justify-center sm:pt-0 auth-section">
      <div>
        <img
          src="/assets/logos/ais-normal.png"
          alt="Aviation In Sight Logo"
          style={{ width: '180px', marginBottom: '16px' }}
        />
      </div>

      <div className="mt-6 w-full overflow-hidden bg-white px-6 py-4 shadow-md sm:max-w-md sm:rounded-lg">
        {children}
      </div>
    </div>
  );
}
