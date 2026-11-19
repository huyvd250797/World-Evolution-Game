import {constructionBusy} from '../construction/model';
import {z} from 'zod';
import {ecologyBlueprint,offerHarvest,survey,syncReservations,cloneEcology,type EcologyCommand} from './model';
import {survivalCommand,FOUNDATION_CAPABILITIES,type Capabilities} from '../survival/model';
import {activityLocks,FOUNDATION_LABOR,type LaborContext} from '../workforce/model';
import {navigation} from '../population/navigation';
import type {SimState} from '../simulation/engine';
const commandSchema=z.discriminatedUnion('type',[z.object({type:z.literal('survey'),targetId:z.string().min(1).max(100)}).strict(),z.object({type:z.literal('harvest'),plantId:z.number().int().min(0).max(65535),citizenId:z.string().min(1).max(100)}).strict(),z.object({type:z.literal('hunt'),animalId:z.string().min(1).max(100),citizenId:z.string().min(1).max(100)}).strict()]);
export function applyEcologyAction(state:SimState,input:EcologyCommand,cap:Capabilities=FOUNDATION_CAPABILITIES,labor:LaborContext=FOUNDATION_LABOR){const cmd=commandSchema.parse(input),ecology=cloneEcology(state.ecology),bp=ecologyBlueprint(state.seed,state.climateId),nav=navigation(state.seed,state.climateId,state.planning);syncReservations(ecology,state.survival.jobs);
 if(cmd.type==='survey'){survey(ecology,bp,state.citizens,cmd.targetId);return {...state,ecology,commandSeq:state.commandSeq+1};}
 if(constructionBusy(state.construction).includes(cmd.citizenId))throw new Error('Cư dân đang thi công/vận chuyển.');const locks=activityLocks(state.workforce,cmd.citizenId,cmd.type==='harvest'?'gather':'hunt',null,labor);if(locks.length)throw new Error(locks.join(' '));const planned=offerHarvest(ecology,bp,nav,cmd,cap.technologies),result=survivalCommand(state.survival,state.citizens,nav,state.tick,{type:'assign',citizenId:cmd.citizenId,kind:planned.kind,source:planned.offer.source},state.seed,cap,planned.offer),job=result.survival.jobs.find(j=>j.citizenId===cmd.citizenId)!;ecology.reservations.push({jobId:job.id,targetId:planned.targetId,kind:cmd.type==='harvest'?'plant':'animal',quantity:planned.quantity,speciesId:cmd.type==='harvest'?bp.plantIndex.get(cmd.plantId)!.speciesId:ecology.animals.find(a=>a.id===cmd.animalId)!.speciesId,committed:false,producedTick:null});return {...state,...result,ecology,commandSeq:state.commandSeq+1};
}
