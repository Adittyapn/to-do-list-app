'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerUser } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Terminal } from 'lucide-react';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const router = useRouter();

  const handleRegister = async () => {
    setIsLoading(true);
    setNotification(null);
    const success = await registerUser(email, username, password);
    setIsLoading(false);

    if (success) {
      setNotification({
        type: 'success',
        message: 'Registrasi berhasil! Silakan login.',
      });
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } else {
      setNotification({
        type: 'error',
        message: 'Terjadi kesalahan atau username sudah digunakan.',
      });
    }
  };

  return (
    <Card className='w-full max-w-sm'>
      <CardHeader>
        <CardTitle className='text-2xl'>Register</CardTitle>
        <CardDescription>
          Buat akun baru dengan mengisi form di bawah ini.
        </CardDescription>
      </CardHeader>
      <CardContent className='grid gap-4'>
        {notification && (
          <Alert
            variant={notification.type === 'error' ? 'destructive' : 'default'}
          >
            {notification.type === 'error' ? (
              <AlertCircle className='h-4 w-4' />
            ) : (
              <Terminal className='h-4 w-4' />
            )}
            <AlertTitle>
              {notification.type === 'error'
                ? 'Registrasi Gagal'
                : 'Registrasi Berhasil'}
            </AlertTitle>
            <AlertDescription>{notification.message}</AlertDescription>
          </Alert>
        )}
        <div className='grid gap-2'>
          <Label htmlFor='email'>Email</Label>
          <Input
            id='email'
            type='text'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <div className='grid gap-2'>
          <Label htmlFor='username'>Username</Label>
          <Input
            id='username'
            type='text'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <div className='grid gap-2'>
          <Label htmlFor='password'>Password</Label>
          <Input
            id='password'
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
      </CardContent>
      <CardFooter className='flex flex-col gap-4'>
        <Button
          onClick={handleRegister}
          className='w-full'
          disabled={isLoading}
        >
          {isLoading ? 'Mendaftar...' : 'Daftar'}
        </Button>
        <p className='text-center text-sm text-muted-foreground'>
          Sudah punya akun?{' '}
          <Link href='/login' className='underline'>
            Login di sini
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
