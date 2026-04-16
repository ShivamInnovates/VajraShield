import React, { useState } from 'react';
import { FiCheckSquare, FiDownload, FiCalendar, FiCheckCircle, FiClock, FiAlertTriangle, FiFileText, FiShield } from 'react-icons/fi';

const reports = [
  { id: 'RPT-2026-04', period: 'April 2026', type: 'Monthly', status: 'generating', compliance: null, submittedAt: null },
  { id: 'RPT-2026-03', period: 'March 2026', type: 'Monthly', status: 'submitted', compliance: 98.7, submittedAt: '2026-04-01 09:00' },
  { id: 'RPT-2026-02', period: 'February 2026', type: 'Monthly', status: 'submitted', compliance: 97.2, submittedAt: '2026-03-01 09:00' },
  { id: 'RPT-2026-01', period: 'January 2026', type: 'Monthly', status: 'submitted', compliance: 99.1, submittedAt: '2026-02-01 09:00' },
  { id: 'RPT-2025-Q4', period: 'Q4 2025', type: 'Quarterly', status: 'submitted', compliance: 98.3, submittedAt: '2026-01-15 09:00' },
];

const complianceChecks = [
  { rule: 'PCI-DSS 3.2.1 — Encrypt cardholder data', status: 'pass', details: 'AES-256 encryption on all PII fields' },
  { rule: 'PCI-DSS 6.5 — Address common vulnerabilities', status: 'pass', details: 'WAF OWASP CRS active, monthly pen test' },
  { rule: 'PCI-DSS 10.2 — Audit trail for all access', status: 'pass', details: 'PostgreSQL immutable audit log active' },
  { rule: 'RBI KYC — Transaction monitoring', status: 'pass', details: 'Real-time 3-lane risk analysis active' },
  { rule: 'RBI — Suspicious Transaction Reports (STR)', status: 'pass', details: 'Auto-generated for Lane 3 blocks' },
  { rule: 'RBI — Data Localization', status: 'pass', details: 'All data stored in India (Mumbai region)' },
  { rule: 'PCI-DSS 8.3 — Multi-factor authentication', status: 'pass', details: 'TOTP MFA mandatory for all analysts' },
  { rule: 'RBI — Incident Response SLA', status: 'warning', details: 'SLA at 98.5%, target is 99%' },
];

const modelVersions = [
  { version: 'v2.3.2', status: 'canary', deployed: '2026-04-16 18:00', accuracy: 94.8, drift: 0.008 },
  { version: 'v2.3.1', status: 'production', deployed: '2026-04-10 10:00', accuracy: 94.2, drift: 0.012 },
  { version: 'v2.3.0', status: 'archived', deployed: '2026-03-28 10:00', accuracy: 93.8, drift: 0.021 },
  { version: 'v2.2.0', status: 'archived', deployed: '2026-03-01 10:00', accuracy: 92.5, drift: 0.034 },
];

export default function ComplianceReportPage({ darkMode }) {
  const [tab, setTab] = useState('reports');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gradient-to-r from-gray-900 to-blue-950/30 border-gray-800' : 'bg-gradient-to-r from-white to-blue-50 border-gray-200 shadow'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-blue-500/20">
              <FiCheckSquare className="w-7 h-7 text-blue-400" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Compliance & Reports</h1>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>RBI / PCI-DSS Compliance • Reports • Model Versioning</p>
            </div>
          </div>
          <button className="px-4 py-2 rounded-xl bg-blue-600 text-white font-medium text-sm hover:bg-blue-500 transition-colors flex items-center space-x-2">
            <FiFileText className="w-4 h-4" />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className={`flex space-x-1 p-1 rounded-xl ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-gray-100'}`}>
        {[
          { id: 'reports', label: 'Reports', icon: FiFileText },
          { id: 'compliance', label: 'Compliance Checks', icon: FiShield },
          { id: 'models', label: 'Model Versioning', icon: FiCalendar },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
              tab === t.id
                ? darkMode ? 'bg-gray-800 text-white shadow-lg' : 'bg-white text-gray-900 shadow'
                : darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <t.icon className="w-4 h-4" />
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Reports Tab */}
      {tab === 'reports' && (
        <div className="space-y-3">
          {reports.map(report => (
            <div key={report.id} className={`p-5 rounded-xl border ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-2.5 rounded-lg ${report.status === 'submitted' ? 'bg-green-500/10' : 'bg-amber-500/10'}`}>
                    {report.status === 'submitted' ? <FiCheckCircle className="w-5 h-5 text-green-400" /> : <FiClock className="w-5 h-5 text-amber-400 animate-spin" />}
                  </div>
                  <div>
                    <p className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{report.period}</p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{report.id} • {report.type}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {report.compliance && (
                    <div className="text-right">
                      <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Compliance Score</p>
                      <p className={`text-lg font-bold ${report.compliance >= 99 ? 'text-green-400' : report.compliance >= 97 ? 'text-amber-400' : 'text-red-400'}`}>{report.compliance}%</p>
                    </div>
                  )}
                  {report.status === 'submitted' ? (
                    <button className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                      <FiDownload className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                  ) : (
                    <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">Generating...</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Compliance Checks Tab */}
      {tab === 'compliance' && (
        <div className="space-y-3">
          <div className={`p-4 rounded-xl border ${darkMode ? 'bg-green-950/20 border-green-800/30' : 'bg-green-50 border-green-200'}`}>
            <p className={`text-sm font-semibold ${darkMode ? 'text-green-400' : 'text-green-700'}`}>
              ✓ {complianceChecks.filter(c => c.status === 'pass').length}/{complianceChecks.length} checks passing
            </p>
          </div>
          {complianceChecks.map((check, i) => (
            <div key={i} className={`p-4 rounded-xl border flex items-start space-x-3 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              {check.status === 'pass' ? (
                <FiCheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              ) : (
                <FiAlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{check.rule}</p>
                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{check.details}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Model Versioning Tab */}
      {tab === 'models' && (
        <div className="space-y-3">
          {modelVersions.map((model, i) => (
            <div key={i} className={`p-5 rounded-xl border ${
              model.status === 'production' ? darkMode ? 'bg-gray-900 border-green-800/50' : 'bg-white border-green-300' :
              model.status === 'canary' ? darkMode ? 'bg-gray-900 border-amber-800/50' : 'bg-white border-amber-300' :
              darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className={`text-lg font-bold font-mono ${darkMode ? 'text-white' : 'text-gray-900'}`}>{model.version}</span>
                  <span className={`text-xs font-bold uppercase px-2.5 py-1 rounded-lg border ${
                    model.status === 'production' ? 'bg-green-500/10 text-green-400 border-green-500/30' :
                    model.status === 'canary' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                    darkMode ? 'bg-gray-800 text-gray-500 border-gray-700' : 'bg-gray-100 text-gray-500 border-gray-200'
                  }`}>{model.status}</span>
                </div>
                <div className="flex items-center space-x-6 text-right">
                  <div>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Accuracy</p>
                    <p className={`text-sm font-bold ${model.accuracy >= 94 ? 'text-green-400' : 'text-amber-400'}`}>{model.accuracy}%</p>
                  </div>
                  <div>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Drift</p>
                    <p className={`text-sm font-bold ${model.drift > 0.03 ? 'text-amber-400' : 'text-green-400'}`}>{model.drift}</p>
                  </div>
                  <div>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Deployed</p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{model.deployed}</p>
                  </div>
                  {model.status === 'canary' && (
                    <button className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-600 text-white hover:bg-green-500 transition-colors">Promote</button>
                  )}
                  {model.status === 'production' && (
                    <button className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>Current</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
