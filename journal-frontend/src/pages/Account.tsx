import { AccountView } from '@neondatabase/neon-js/auth/react/ui';
import { useParams } from 'react-router';

export default function AccountPage() {
    const { path } = useParams();
    return (
        <div className="bg-gray-50 flex min-h-screen items-center justify-center p-8">
            <AccountView pathname={path} />
        </div>
    );
}