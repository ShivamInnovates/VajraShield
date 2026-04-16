import React, { useState } from 'react';
import { FiShield, FiSmartphone, FiKey, FiCheckCircle, FiCopy, FiRefreshCw } from 'react-icons/fi';

export default function MFASetupPage({ darkMode }) {
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState('totp');
  const [verified, setVerified] = useState(false);
  const [code, setCode] = useState('');
  const backupCodes = ['A7K2-M9P4', 'B3L8-N1Q6', 'C5R2-X7T9', 'D8S4-W2V6', 'E1U7-Y3H5', 'F6J9-Z4K8'];

  const handleVerify = () => {
    if (code.length === 6) setVerified(true);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2.5 rounded-lg bg-indigo-500/20">
            <FiShield className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Multi-Factor Authentication</h1>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Secure your account with an additional verification step</p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center space-x-4 px-2">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              step >= s ? 'bg-indigo-500 text-white' : darkMode ? 'bg-gray-800 text-gray-500' : 'bg-gray-200 text-gray-400'
            }`}>{s}</div>
            {s < 3 && <div className={`flex-1 h-0.5 mx-2 ${step > s ? 'bg-indigo-500' : darkMode ? 'bg-gray-800' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Choose method */}
      {step === 1 && (
        <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Choose Authentication Method</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { id: 'totp', icon: FiSmartphone, title: 'Authenticator App', desc: 'Google Authenticator, Authy, etc.' },
              { id: 'sms', icon: FiKey, title: 'SMS Verification', desc: 'Receive codes via SMS' },
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setMethod(m.id)}
                className={`p-5 rounded-xl border-2 text-left transition-all ${
                  method === m.id
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : darkMode ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <m.icon className={`w-8 h-8 mb-3 ${method === m.id ? 'text-indigo-400' : darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{m.title}</p>
                <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{m.desc}</p>
              </button>
            ))}
          </div>
          <button onClick={() => setStep(2)} className="mt-6 px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-colors">
            Continue →
          </button>
        </div>
      )}

      {/* Step 2: Setup */}
      {step === 2 && (
        <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {method === 'totp' ? 'Scan QR Code' : 'Enter Phone Number'}
          </h3>
          {method === 'totp' ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="w-48 h-48 bg-white rounded-xl flex items-center justify-center p-4">
                <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="grid grid-cols-5 gap-1">
                    {Array.from({ length: 25 }).map((_, i) => (
                      <div key={i} className={`w-6 h-6 rounded-sm ${Math.random() > 0.5 ? 'bg-gray-900' : 'bg-white'}`} />
                    ))}
                  </div>
                </div>
              </div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Scan this QR code with your authenticator app</p>
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <code className={`text-sm font-mono ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>JBSWY3DPEHPK3PXP</code>
                <FiCopy className="w-4 h-4 text-gray-400 cursor-pointer hover:text-white" />
              </div>
            </div>
          ) : (
            <input
              type="tel"
              placeholder="+91 XXXXX XXXXX"
              className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:border-indigo-500`}
            />
          )}
          <div className="flex space-x-3 mt-6">
            <button onClick={() => setStep(1)} className={`px-6 py-3 rounded-xl font-medium ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>← Back</button>
            <button onClick={() => setStep(3)} className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-colors">Verify Setup →</button>
          </div>
        </div>
      )}

      {/* Step 3: Verify */}
      {step === 3 && (
        <div className="space-y-6">
          <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Verify Code</h3>
            {!verified ? (
              <div className="space-y-4">
                <input
                  type="text"
                  maxLength={6}
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit code"
                  className={`w-full px-4 py-3 rounded-xl border text-center text-xl tracking-widest font-mono ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:border-indigo-500`}
                />
                <button onClick={handleVerify} disabled={code.length !== 6} className="w-full px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  Verify
                </button>
              </div>
            ) : (
              <div className="text-center py-4">
                <FiCheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>MFA Enabled Successfully!</p>
                <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Your account is now protected with two-factor authentication</p>
              </div>
            )}
          </div>

          {/* Backup Codes */}
          {verified && (
            <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-900 border-amber-700/50' : 'bg-amber-50 border-amber-200'}`}>
              <h3 className={`text-lg font-bold mb-2 ${darkMode ? 'text-amber-400' : 'text-amber-800'}`}>⚠ Save Your Backup Codes</h3>
              <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Keep these in a safe place. Each code can only be used once.</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {backupCodes.map(c => (
                  <div key={c} className={`px-3 py-2 rounded-lg text-center font-mono text-sm ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700 border border-gray-200'}`}>
                    {c}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
