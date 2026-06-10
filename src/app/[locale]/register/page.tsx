import { redirect } from 'next/navigation';

// Redirect /register to /register/brand directly
export default function RegisterPage() {
  redirect('/register/brand');
}
