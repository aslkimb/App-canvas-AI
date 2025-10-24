import React from 'react';
import type { Step, StepKey } from '../types';

interface TimelineProps {
    steps: Step[];
    activeStep: StepKey;
    completedSteps: StepKey[];
}

export const Timeline: React.FC<TimelineProps> = ({ steps, activeStep, completedSteps }) => {
    return (
        <ol className="relative border-l border-gray-700">
            {steps.map((step) => {
                const isCompleted = completedSteps.includes(step.id);
                const isActive = activeStep === step.id;

                let ringColor = 'bg-gray-700';
                if (isActive) {
                    ringColor = 'bg-orange-500 ring-4 ring-orange-500/30';
                } else if (isCompleted) {
                    ringColor = 'bg-green-500';
                }

                const textColor = isActive ? 'text-orange-300 font-bold' : isCompleted ? 'text-gray-200' : 'text-gray-400';

                return (
                    <li key={step.id} className="mb-8 ml-4 transition-all duration-300">
                        <div className={`absolute w-3 h-3 ${ringColor} rounded-full mt-1.5 -left-1.5 border border-gray-900 transition-all duration-300`}></div>
                        <time className="mb-1 text-xs font-normal leading-none text-gray-500">{`Step ${step.id}`}</time>
                        <h3 className={`text-base font-semibold ${textColor}`}>{step.name}</h3>
                        <p className="text-sm font-normal text-gray-500">{step.description}</p>
                    </li>
                );
            })}
        </ol>
    );
};
