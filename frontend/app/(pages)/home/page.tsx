'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function HomePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = Cookies.get('token');
        if (!token) {
            router.push('/');
        } else {
            setLoading(false);
        }
    }, [router]);

    if (loading) return null;

}