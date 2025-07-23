import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { Dialog } from '@headlessui/react';
import { useState } from 'react';
import { Transition } from '@headlessui/react';


export default function UpdateInformation({ student }) {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const {
    data,
    setData,
    patch,
    errors,
    processing,
    recentlySuccessful,
  } = useForm({
    name: student.name || '',
    birthdate: student.birthdate || '',
    gender: student.gender || '',
    address: student.address || '',
    zip_code: student.zip_code || '',
    city: student.city || '',
    country: student.country || '',
    phone: student.phone || '',
    school: student.school || ''
  });

  const submit = (e) => {
    e.preventDefault();
    patch(route('student.profile.update'));
  };

  return (
    <section>
      <header>
        <h2 className="text-lg font-medium text-gray-900">Información del Estudiante</h2>
        <p className="mt-1 text-sm text-gray-600">Actualiza tus datos personales.</p>
        <Transition
          show={recentlySuccessful}
          enter="transition ease-in-out"
          enterFrom="opacity-0"
          leave="transition ease-in-out"
          leaveTo="opacity-0"
        >
          <p className="text-sm text-gray-600">
            Actualizado.
          </p>
        </Transition>
      </header>

      <form onSubmit={submit} className="mt-6 space-y-6">
        {[
          ['name', 'Nombre', 'text'],
          ['birthdate', 'Fecha de nacimiento', 'date'],
          ['address', 'Dirección', 'text'],
          ['zip_code', 'Código postal', 'text'],
          ['city', 'Ciudad', 'text'],
          ['country', 'País', 'text'],
          ['phone', 'Teléfono', 'text'],
          ['school', 'Escuela', 'text'],
        ].map(([field, label, type]) => (
          <div key={field}>
            <InputLabel htmlFor={field} value={label} />
            <TextInput
              id={field}
              type={type}
              className="mt-1 block w-full"
              value={data[field]}
              onChange={(e) => setData(field, e.target.value)}
            />
            <InputError className="mt-2" message={errors[field]} />
          </div>
        ))}

        <div>
          <InputLabel htmlFor="gender" value="Género" />
          <select
            id="gender"
            value={data.gender}
            onChange={(e) => setData('gender', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">Selecciona una opción</option>
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
            <option value="Otro">Otro</option>
          </select>
          <InputError className="mt-2" message={errors.gender} />
        </div>

        <div className="flex items-center justify-between">
          <PrimaryButton disabled={processing}>Guardar</PrimaryButton>
          <button
            type="button"
            onClick={() => setShowPasswordModal(true)}
            className="text-sm text-blue-600 underline hover:text-blue-800"
          >
            Cambiar contraseña
          </button>
        </div>
      </form>

      {/* Modal para cambio de contraseña */}
      <Dialog open={showPasswordModal} onClose={() => setShowPasswordModal(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-sm rounded bg-white p-6 shadow-lg">
            <Dialog.Title className="text-lg font-bold mb-4">Cambiar contraseña</Dialog.Title>
            <PasswordChangeForm onClose={() => setShowPasswordModal(false)} />
          </Dialog.Panel>
        </div>
      </Dialog>
    </section>
  );
}

function PasswordChangeForm({ onClose }) {
  const { data, setData, put, processing, errors } = useForm({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  const submit = (e) => {
    e.preventDefault();
    put(route('student.password.update'), {
      onSuccess: () => onClose(),
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <InputLabel htmlFor="current_password" value="Contraseña actual" />
        <TextInput
          id="current_password"
          type="password"
          className="mt-1 block w-full"
          value={data.current_password}
          onChange={(e) => setData('current_password', e.target.value)}
        />
        <InputError className="mt-2" message={errors.current_password} />
      </div>
      <div>
        <InputLabel htmlFor="password" value="Nueva contraseña" />
        <TextInput
          id="password"
          type="password"
          className="mt-1 block w-full"
          value={data.password}
          onChange={(e) => setData('password', e.target.value)}
        />
        <InputError className="mt-2" message={errors.password} />
      </div>
      <div>
        <InputLabel htmlFor="password_confirmation" value="Confirmar contraseña" />
        <TextInput
          id="password_confirmation"
          type="password"
          className="mt-1 block w-full"
          value={data.password_confirmation}
          onChange={(e) => setData('password_confirmation', e.target.value)}
        />
        <InputError className="mt-2" message={errors.password_confirmation} />
      </div>

      <div className="flex justify-end mt-4 gap-2">
        <button
          type="button"
          onClick={onClose}
          className="text-sm text-gray-500 hover:text-gray-800"
        >
          Cancelar
        </button>
        <PrimaryButton disabled={processing}>Guardar</PrimaryButton>
      </div>
    </form>
  );
}
