'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export function UserMenu() {
  const t = useTranslations('auth');
  const { user, isAuthenticated, logout, isLogoutLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/auth/login"
          className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
        >
          {t('login')}
        </Link>
        <Link
          href="/auth/register"
          className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          {t('register')}
        </Link>
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        {user.profileImageUrl ? (
          <img
            src={user.profileImageUrl}
            alt={user.name}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="hidden sm:inline text-gray-700 font-medium">{user.name}</span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="font-medium text-gray-900">{user.name}</p>
            <p className="text-sm text-gray-500 truncate">{user.email}</p>
          </div>

          <Link
            href="/projects"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {t('myProjects')}
          </Link>

          <hr className="my-2 border-gray-100" />

          <button
            onClick={() => {
              logout();
              setIsOpen(false);
            }}
            disabled={isLogoutLoading}
            className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            {isLogoutLoading ? t('loading') : t('logout')}
          </button>
        </div>
      )}
    </div>
  );
}
