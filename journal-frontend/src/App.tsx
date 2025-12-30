import { useState, useEffect } from 'react';
import { RedirectToSignIn, SignedIn, UserButton } from '@neondatabase/neon-js/auth/react/ui';
import { api } from './api';
import { Route, Routes } from 'react-router';
import Auth from './pages/Auth';
import Account from './pages/Account';

type Entry = { id: number; content: string; createdAt: string };

function Journal() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [newEntry, setNewEntry] = useState('');

  useEffect(() => {
    api.getEntries().then(setEntries).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntry) return;

    const entry = await api.createEntry(newEntry);
    setEntries([entry, ...entries]);
    setNewEntry('');
  };

  return (
    <div className="bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 min-h-screen">
      <div className="mx-auto max-w-4xl p-6">
        <header className="border-gray-200 dark:border-gray-700 mb-8 flex items-center justify-between border-b pb-4">
          <span className="text-2xl font-bold">Daily Journal</span>
          <UserButton size="icon" />
        </header>

        <SignedIn>
          <h1 className="mb-4 text-2xl font-semibold">My Private Journal</h1>

          <form onSubmit={handleSubmit} className="mb-8 flex gap-2">
            <textarea
              className="border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 flex-1 resize-none rounded-md border bg-white p-3 focus:outline-none focus:ring-2"
              rows={4}
              value={newEntry}
              onChange={(e) => setNewEntry(e.target.value)}
              placeholder="Write a thought..."
            />

            <button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 min-w-[80px] rounded-md px-4 py-2 font-medium text-white">
              Save
            </button>
          </form>

          <div className="space-y-4">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg border bg-white
                           p-4 shadow-sm"
              >
                <p className="mb-2">{entry.content}</p>
                <small className="text-gray-500 dark:text-gray-400">
                  {new Date(entry.createdAt).toLocaleString()}
                </small>
              </div>
            ))}
          </div>
        </SignedIn>

        <RedirectToSignIn />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Journal />} />
      <Route path="/auth/:pathname" element={<Auth />} />
      <Route path="/account/:pathname" element={<Account />} />
    </Routes>
  );
}