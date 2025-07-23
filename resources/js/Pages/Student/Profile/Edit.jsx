import StudentLayout from '@/Layouts/StudentLayout';
import { Head, usePage } from '@inertiajs/react';
import UpdateInformation from './Partials/UpdateInformation';

export default function Edit() {
  const { student } = usePage().props;
  return (
    <StudentLayout>
      <Head title="Perfil - Estudiante" />
      <div className="py-12">
        <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
          <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
            <UpdateInformation student={student} className="max-w-xl" />
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
