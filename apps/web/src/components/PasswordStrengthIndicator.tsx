'use client';

import { useState, useEffect } from 'react';

interface PasswordStrength {
    score: number;
    label: string;
    color: string;
    requirements: {
        length: boolean;
        uppercase: boolean;
        lowercase: boolean;
        number: boolean;
        special: boolean;
    };
}

interface PasswordStrengthIndicatorProps {
    password: string;
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
    const [strength, setStrength] = useState<PasswordStrength>({
        score: 0,
        label: '',
        color: 'bg-gray-300',
        requirements: {
            length: false,
            uppercase: false,
            lowercase: false,
            number: false,
            special: false,
        },
    });

    useEffect(() => {
        if (!password) {
            setStrength({
                score: 0,
                label: '',
                color: 'bg-gray-300',
                requirements: {
                    length: false,
                    uppercase: false,
                    lowercase: false,
                    number: false,
                    special: false,
                },
            });
            return;
        }

        const requirements = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[^A-Za-z0-9]/.test(password),
        };

        const score = Object.values(requirements).filter(Boolean).length;

        let label = '';
        let color = 'bg-gray-300';

        if (score === 0) {
            label = '';
        } else if (score <= 2) {
            label = 'Weak';
            color = 'bg-red-500';
        } else if (score === 3 || score === 4) {
            label = 'Medium';
            color = 'bg-yellow-500';
        } else if (score === 5) {
            label = 'Strong';
            color = 'bg-green-500';
        }

        setStrength({ score, label, color, requirements });
    }, [password]);

    if (!password) return null;

    return (
        <div className="mt-2 space-y-2">
            {/* Strength Bar */}
            <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-300 ${strength.color}`}
                        style={{ width: `${(strength.score / 5) * 100}%` }}
                    />
                </div>
                {strength.label && (
                    <span className={`text-xs font-medium ${strength.score <= 2 ? 'text-red-600' :
                        strength.score <= 4 ? 'text-yellow-600' :
                            'text-green-600'
                        }`}>
                        {strength.label}
                    </span>
                )}
            </div>

            {/* Requirements Checklist */}
            <div className="text-xs space-y-1">
                <RequirementItem met={strength.requirements.length} text="At least 8 characters" />
                <RequirementItem met={strength.requirements.uppercase} text="Contains uppercase letter (A-Z)" />
                <RequirementItem met={strength.requirements.lowercase} text="Contains lowercase letter (a-z)" />
                <RequirementItem met={strength.requirements.number} text="Contains number (0-9)" />
                <RequirementItem met={strength.requirements.special} text="Contains special character (!@#$%...)" />
            </div>
        </div>
    );
}

function RequirementItem({ met, text }: { met: boolean; text: string }) {
    return (
        <div className={`flex items-center gap-1.5 ${met ? 'text-green-600' : 'text-gray-500'}`}>
            {met ? (
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
            ) : (
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
            )}
            <span>{text}</span>
        </div>
    );
}
