import {notFound} from 'next/navigation';
import {z} from 'zod';
import {Shell} from '@/components/shell';
import {WorldDetailView} from '@/components/world-detail';
import {requireUser} from '@/lib/session';
import {getWorld} from '@/lib/worlds';
export const dynamic='force-dynamic';
export default async function WorldPage({params}:{params:Promise<{id:string}>}){const {user}=await requireUser();const {id}=await params;if(!z.uuid().safeParse(id).success)notFound();const world=await getWorld(id);if(!world)notFound();return <Shell email={user.email}><WorldDetailView world={world} ownerId={user.id}/></Shell>}
