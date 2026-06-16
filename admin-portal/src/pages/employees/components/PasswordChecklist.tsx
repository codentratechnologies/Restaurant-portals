import { Check, X } from 'lucide-react';

interface PasswordChecklistProps {
  password?: string;
  confirmPassword?: string;
  showMatch?: boolean;
}

export default function PasswordChecklist({ password = '', confirmPassword = '', showMatch = true }: PasswordChecklistProps) {
  const requirements = [
    { label: 'Minimum 8 characters', regex: /.{8,}/ },
    { label: 'At least 1 uppercase letter', regex: /[A-Z]/ },
    { label: 'At least 1 lowercase letter', regex: /[a-z]/ },
    { label: 'At least 1 digit', regex: /[0-9]/ },
    { label: 'At least 1 special character', regex: /[^A-Za-z0-9]/ },
  ];

  const hasStartedTyping = password.length > 0;
  
  const passwordsMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;
  const showMatchError = showMatch && confirmPassword.length > 0 && !passwordsMatch;

  return (
    <div className="bg-gray-50 border border-border rounded-xl p-4 mt-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
        {requirements.map((req, i) => {
          const isValid = req.regex.test(password);
          return (
            <div key={i} className="flex items-center gap-2 text-sm">
              {isValid ? (
                <div className="bg-green-100 p-0.5 rounded-full shrink-0">
                  <Check className="w-3 h-3 text-green-600" />
                </div>
              ) : (
                <div className="bg-gray-200 p-0.5 rounded-full shrink-0">
                  <span className="block w-3 h-3" />
                </div>
              )}
              <span className={`font-medium ${isValid ? 'text-green-700' : 'text-text-secondary'}`}>
                {req.label}
              </span>
            </div>
          );
        })}
      </div>

      {showMatch && (password.length > 0 || confirmPassword.length > 0) && (
        <div className="pt-3 border-t border-border flex items-center gap-2 text-sm">
          {passwordsMatch ? (
            <>
              <div className="bg-green-100 p-0.5 rounded-full shrink-0">
                <Check className="w-3 h-3 text-green-600" />
              </div>
              <span className="font-bold text-green-700">Passwords match</span>
            </>
          ) : showMatchError ? (
            <>
              <div className="bg-red-100 p-0.5 rounded-full shrink-0">
                <X className="w-3 h-3 text-red-600" />
              </div>
              <span className="font-bold text-red-700">Passwords do not match</span>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}
