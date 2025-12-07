'use client';

import { useState } from 'react';
import { Header } from '../../components/home/Header';
import { Footer } from '../../components/home/Footer';
import { PublishForm } from '../../components/publish/PublishForm';
import RegisterPage from '@/components/RegisterPage/RegisterPage';

export default function Register() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-slate-50">
      {/* <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} /> */}

     

          <RegisterPage />
        

      {/* <Footer /> */}
    </div>
  );
}
