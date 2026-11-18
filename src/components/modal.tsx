'use client';
import {useEffect,useRef} from 'react';
import {X} from 'lucide-react';
export function Modal({title,children,onClose,busy=false}:{title:string;children:React.ReactNode;onClose:()=>void;busy?:boolean}){const ref=useRef<HTMLDialogElement>(null);useEffect(()=>{const d=ref.current;d?.showModal();return ()=>d?.close();},[]);return <dialog className="modal" ref={ref} aria-labelledby="dialog-title" onCancel={e=>{e.preventDefault();if(!busy)onClose();}}><div className="modal-heading"><div><span className="eyebrow">WORLD EVOLUTION</span><h2 id="dialog-title">{title}</h2></div><button className="icon-button" aria-label="Đóng hộp thoại" disabled={busy} onClick={onClose}><X size={20}/></button></div>{children}</dialog>}
