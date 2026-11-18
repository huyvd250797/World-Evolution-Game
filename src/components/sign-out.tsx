'use client';
import { useState,useTransition } from 'react';
import { LogOut } from 'lucide-react';
import { signOut } from '@/app/actions';
export function SignOutButton(){const [pending,start]=useTransition();const [error,setError]=useState('');return <><button className="icon-button" title="Đăng xuất" aria-label="Đăng xuất" disabled={pending} onClick={()=>start(async()=>{const r=await signOut();setError(r.error??'');})}><LogOut size={18}/></button>{error&&<span role="alert" className="inline-error">{error}</span>}</>}
