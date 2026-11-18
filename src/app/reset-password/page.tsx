import {requireUser} from '@/lib/session';
import {Shell} from '@/components/shell';
import {AuthForm} from '@/components/auth-form';
export const dynamic='force-dynamic';
export default async function Reset(){const {user}=await requireUser();return <Shell email={user.email}><div className="reset-card"><AuthForm configured reset/></div></Shell>}
