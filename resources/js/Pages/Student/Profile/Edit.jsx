import StudentLayout from '@/Layouts/StudentLayout';
import { Head, usePage } from '@inertiajs/react';
import UpdateInformation from './Partials/UpdateInformation';
import SubscriptionRenewalNotice from '@/Components/PayPal/SubscriptionRenewalNotice';

export default function Edit() {
  const { student, subscription, paypalClientId } = usePage().props;
  const { user } = usePage().props.auth;
  return (
    <StudentLayout>
      <Head title="Perfil - Estudiante" />
      <div className="py-12">
        <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
          <SubscriptionRenewalNotice
            subscription={subscription}
            user={user}
            clientId={paypalClientId}
          />
          <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
            <UpdateInformation student={student} className="max-w-xl" />
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
