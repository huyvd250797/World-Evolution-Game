import {Shell} from '@/components/shell';
import {WorldManager} from '@/components/world-manager';
import {requireUser} from '@/lib/session';
import {listWorlds} from '@/lib/worlds';
export const dynamic='force-dynamic';
export default async function Worlds(){const {user}=await requireUser();const {worlds,error}=await listWorlds();return <Shell email={user.email}><WorldManager worlds={worlds} error={error}/></Shell>}
