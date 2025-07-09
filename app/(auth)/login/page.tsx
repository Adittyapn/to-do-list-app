'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginUser } from '@/services/authService';
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
import { AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    const success = await loginUser(username, password);
    setIsLoading(false);

    if (success) {
      router.push('/dashboard');
    } else {
      setError('Username atau password yang Anda masukkan salah.');
    }
  };

  return (
    <Card className='w-full max-w-sm'>
      <CardHeader>
        <CardTitle className='text-2xl'>Login</CardTitle>
        <CardDescription>
          Masukkan username dan password Anda untuk masuk.
        </CardDescription>
      </CardHeader>
      <CardContent className='grid gap-4'>
        {/* 4. Tampilkan Alert jika ada error */}
        {error && (
          <Alert variant='destructive'>
            <AlertCircle className='h-4 w-4' />
            <AlertTitle>Login Gagal</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className='grid gap-2'>
          <Label htmlFor='username'>Username</Label>
          <Input
            id='username'
            type='text'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className='grid gap-2'>
          <Label htmlFor='password'>Password</Label>
          <Input
            id='password'
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleLogin();
            }}
            required
          />
        </div>
      </CardContent>
      <CardFooter className='flex flex-col gap-4'>
        <Button onClick={handleLogin} className='w-full' disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Masuk'}
        </Button>
        <p className='text-center text-sm text-muted-foreground'>
          Belum punya akun?{' '}
          <Link href='/register' className='underline'>
            Daftar di sini
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
