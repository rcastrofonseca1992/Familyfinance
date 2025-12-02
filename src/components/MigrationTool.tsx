import { useState } from 'react';
import { Button } from './ui/button';
import { PremiumCard } from './ui/premium-card';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { createClient } from '@supabase/supabase-js';

export function MigrationTool() {
  const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const runMigration = async () => {
    setStatus('running');
    setError('');
    setResults(null);

    try {
      const supabase = createClient(
        `https://${projectId}.supabase.co`,
        publicAnonKey
      );

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d9780f4d/migrate`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Migration failed');
      }

      const data = await response.json();
      setResults(data.results);
      setStatus('success');
    } catch (e: any) {
      setError(e.message);
      setStatus('error');
    }
  };

  return (
    <PremiumCard className="max-w-2xl mx-auto">
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Database Migration Tool</h2>
          <p className="text-sm text-neutral-600 mt-1">
            Migrate your data from the KV store to the new relational schema.
            This should only be run once after creating the new tables.
          </p>
        </div>

        {status === 'idle' && (
          <Button onClick={runMigration} className="w-full">
            Start Migration
          </Button>
        )}

        {status === 'running' && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-2 text-sm text-neutral-600">Migrating data...</p>
          </div>
        )}

        {status === 'success' && results && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-emerald-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-semibold">Migration Completed Successfully!</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 bg-emerald-50 rounded-lg">
                <div className="text-neutral-600">Users</div>
                <div className="text-lg font-semibold">{results.users}</div>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg">
                <div className="text-neutral-600">Households</div>
                <div className="text-lg font-semibold">{results.households}</div>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg">
                <div className="text-neutral-600">Members</div>
                <div className="text-lg font-semibold">{results.members}</div>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg">
                <div className="text-neutral-600">Income Sources</div>
                <div className="text-lg font-semibold">{results.incomeSources}</div>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg">
                <div className="text-neutral-600">Accounts</div>
                <div className="text-lg font-semibold">{results.accounts}</div>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg">
                <div className="text-neutral-600">Recurring Costs</div>
                <div className="text-lg font-semibold">{results.recurringCosts}</div>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg">
                <div className="text-neutral-600">Debts</div>
                <div className="text-lg font-semibold">{results.debts}</div>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg">
                <div className="text-neutral-600">Goals</div>
                <div className="text-lg font-semibold">{results.goals}</div>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg">
                <div className="text-neutral-600">Snapshots</div>
                <div className="text-lg font-semibold">{results.snapshots}</div>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg">
                <div className="text-neutral-600">Settings</div>
                <div className="text-lg font-semibold">{results.settings}</div>
              </div>
            </div>

            {results.errors && results.errors.length > 0 && (
              <div className="p-3 bg-red-50 rounded-lg">
                <div className="font-semibold text-red-600 mb-2">
                  Errors ({results.errors.length}):
                </div>
                <div className="text-xs space-y-1 max-h-40 overflow-y-auto">
                  {results.errors.map((err: string, i: number) => (
                    <div key={i} className="text-red-700">{err}</div>
                  ))}
                </div>
              </div>
            )}

            <Button onClick={() => window.location.reload()} className="w-full">
              Refresh Application
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-red-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="font-semibold">Migration Failed</span>
            </div>
            <div className="p-3 bg-red-50 rounded-lg text-sm text-red-700">
              {error}
            </div>
            <Button onClick={() => setStatus('idle')} variant="outline" className="w-full">
              Try Again
            </Button>
          </div>
        )}
      </div>
    </PremiumCard>
  );
}
