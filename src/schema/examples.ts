/**
 * Example form schemas demonstrating various use cases
 */

import type { FormSchema } from '../types';

/**
 * Simple contact form
 */
export const contactFormSchema: FormSchema = {
    version: '1.0.0',
    id: 'contact-form-example',
    metadata: {
        title: 'Contact Us',
        description: 'Get in touch with our team',
        createdAt: '2026-01-09T00:00:00.000Z',
        updatedAt: '2026-01-09T00:00:00.000Z',
    },
    fields: [
        {
            id: 'full-name',
            type: 'text',
            label: 'Full Name',
            order: 0,
            config: {
                placeholder: 'Enter your full name',
                required: true,
                validation: [
                    {
                        type: 'minLength',
                        value: 2,
                        message: 'Name must be at least 2 characters',
                    },
                ],
            },
        },
        {
            id: 'email',
            type: 'email',
            label: 'Email Address',
            order: 1,
            config: {
                placeholder: 'you@example.com',
                required: true,
            },
        },
        {
            id: 'message',
            type: 'textarea',
            label: 'Message',
            order: 2,
            config: {
                placeholder: 'Tell us what you need help with...',
                required: true,
                validation: [
                    {
                        type: 'minLength',
                        value: 10,
                        message: 'Please provide at least 10 characters',
                    },
                ],
            },
        },
    ],
    settings: {
        submitButton: {
            text: 'Send Message',
            enabled: true,
        },
        successMessage: 'Thank you! We will get back to you soon.',
    },
};

/**
 * Job application form with conditionals
 */
export const jobApplicationSchema: FormSchema = {
    version: '1.0.0',
    id: 'job-application-example',
    metadata: {
        title: 'Job Application',
        description: 'Apply for a position at our company',
        createdAt: '2026-01-09T00:00:00.000Z',
        updatedAt: '2026-01-09T00:00:00.000Z',
    },
    fields: [
        {
            id: 'position',
            type: 'select',
            label: 'Position Applying For',
            order: 0,
            config: {
                required: true,
                options: [
                    { label: 'Frontend Developer', value: 'frontend' },
                    { label: 'Backend Developer', value: 'backend' },
                    { label: 'Designer', value: 'designer' },
                ],
            },
        },
        {
            id: 'experience',
            type: 'radio',
            label: 'Years of Experience',
            order: 1,
            config: {
                required: true,
                options: [
                    { label: '0-2 years', value: '0-2' },
                    { label: '3-5 years', value: '3-5' },
                    { label: '5+ years', value: '5+' },
                ],
            },
        },
        {
            id: 'portfolio',
            type: 'text',
            label: 'Portfolio URL',
            order: 2,
            config: {
                placeholder: 'https://your-portfolio.com',
                required: false,
            },
            conditions: {
                show: false,
                rules: [
                    {
                        field: 'position',
                        operator: 'equals',
                        value: 'designer',
                    },
                ],
                logic: 'OR',
            },
        },
        {
            id: 'resume',
            type: 'file',
            label: 'Resume/CV',
            order: 3,
            config: {
                required: true,
                accept: '.pdf,.doc,.docx',
                maxSize: 5 * 1024 * 1024, // 5MB
            },
        },
    ],
    settings: {
        submitButton: {
            text: 'Submit Application',
            enabled: true,
        },
        successMessage: 'Application submitted successfully!',
    },
};

/**
 * Survey form with various field types
 */
export const surveyFormSchema: FormSchema = {
    version: '1.0.0',
    id: 'survey-example',
    metadata: {
        title: 'Customer Satisfaction Survey',
        description: 'Help us improve our service',
        createdAt: '2026-01-09T00:00:00.000Z',
        updatedAt: '2026-01-09T00:00:00.000Z',
    },
    fields: [
        {
            id: 'section-1',
            type: 'section',
            label: 'About Your Experience',
            order: 0,
            config: {
                heading: 'About Your Experience',
                description: 'Please rate your recent interaction with us',
                divider: true,
            },
        },
        {
            id: 'satisfaction',
            type: 'rating',
            label: 'Overall Satisfaction',
            order: 1,
            config: {
                required: true,
                maxRating: 5,
                icon: 'star',
            },
        },
        {
            id: 'recommend',
            type: 'range',
            label: 'How likely are you to recommend us?',
            order: 2,
            config: {
                required: true,
                min: 0,
                max: 10,
                step: 1,
                showValue: true,
            },
        },
        {
            id: 'features',
            type: 'checkbox',
            label: 'Which features do you use?',
            order: 3,
            config: {
                required: false,
                options: [
                    { label: 'Dashboard', value: 'dashboard' },
                    { label: 'Reports', value: 'reports' },
                    { label: 'Analytics', value: 'analytics' },
                    { label: 'Team Collaboration', value: 'collaboration' },
                ],
            },
        },
        {
            id: 'newsletter',
            type: 'switch',
            label: 'Subscribe to Newsletter',
            order: 4,
            config: {
                required: false,
                defaultValue: false,
            },
        },
    ],
    settings: {
        submitButton: {
            text: 'Submit Survey',
            enabled: true,
        },
        successMessage: 'Thank you for your feedback!',
    },
};
