import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';

type FormData = {
  email: string;
};

export default function Home() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  const router = useRouter();

  useEffect(() => {
    const storedEmail = localStorage.getItem('email');
    if (storedEmail) {
      router.replace('/upload');
    }
  }, [router]);

  const onSubmit = (data: FormData) => {
    localStorage.setItem('email', data.email);
    router.push('/upload');
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit(onSubmit)} className="form-box">
        <h1>Welcome</h1>
        <p>Enter your email to get started</p>

        <input
          type="email"
          placeholder="you@example.com"
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^\S+@\S+$/,
              message: 'Invalid email',
            },
          })}
        />
        {errors.email && (
          <p style={{ color: 'red', fontSize: '12px' }}>{errors.email.message}</p>
        )}

        <button type="submit">Continue</button>
      </form>
    </div>
  );
}
