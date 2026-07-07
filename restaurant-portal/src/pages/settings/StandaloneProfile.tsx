import { useState } from 'react';
import ProfileSettings from './ProfileSettings';
import Button from '../../components/common/Button';
import { Edit3, X } from 'lucide-react';

export default function StandaloneProfile() {
  const [editing, setEditing] = useState(false);

  return (
    <div className="max-w-[1100px] mx-auto">
      <div className="bg-white rounded-2xl border border-border shadow-soft p-8">
        {/* Page heading row — Edit button lives here, right edge */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-brand-navy">My Profile</h1>
            <p className="text-text-secondary mt-1">Manage your personal account details and preferences.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-4">
            {!editing ? (
              <Button
                onClick={() => setEditing(true)}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit Profile
              </Button>
            ) : (
              <button
                onClick={() => setEditing(false)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-text-secondary hover:text-brand-navy border border-border rounded-xl transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Discard
              </button>
            )}
          </div>
        </div>

        <ProfileSettings editing={editing} onSetEditing={setEditing} />
      </div>
    </div>
  );
}
