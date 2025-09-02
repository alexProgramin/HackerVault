
"use client";

import React, { Suspense } from 'react';
import { CredentialForm } from '@/components/credential-form';

function CredentialPageContent() {
    return <CredentialForm />;
}

export default function CredentialPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CredentialPageContent />
        </Suspense>
    );
}

    