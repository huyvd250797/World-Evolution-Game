'use client';
import {useEffect,useRef,useState,useCallback} from 'react';
import {PopulationEditor} from '@/components/population/population-editor';
import type {Citizen,CitizenCommand} from '@/game/population/model';
import {PlanningEditor} from '@/components/planning/planning-editor';
import {emptyPlanning,type Planning,type PlanCommand} from '@/game/planning/model';
import type {PlanningOverlay} from '@/game/planning/overlay';
import type {WorldMap} from '@/game/map/world-map';
import {Plus,Minus,House,Maximize2,Minimize2,Expand,Grid2X2,Trees,HelpCircle,X,MapPinned,Users,Pause,Mountain,Layers,RotateCcw,AlertCircle} from 'lucide-react';
import {loadWorldMap} from '@/game/map/load-map';
import {createScene} from '@/game/map/scene';
import {MapController,type MapStatus} from '@/game/map/controller';
import {RESOURCES,TERRAIN,TERRAIN_NAMES,TERRAIN_COLORS,GENERATOR_VERSION} from '@/game/map/world-map';
import {climateById} from '@/game/data';
import type {SceneOptions} from '@/game/map/scene';
export function WorldMapView({worldId,seed,climateId,population,day,paused=true,clockLabel,planning,canPlan=false,onPlanCommand,citizens=[],populationLimit=200,speed=1,onCitizenCommand}:{worldId:string;seed:string;climateId:string;population:number;day:number;paused?:boolean;clockLabel?:string;planning?:Planning;canPlan?:boolean;onPlanCommand?:(command:PlanCommand)=>Promise<void>;citizens?:Citizen[];populationLimit?:number;speed?:number;onCitizenCommand?:(command:CitizenCommand)=>Promise<void>}){
 const [mode,setMode]=useState<'population'|'planning'>('population'),[selectedCitizen,setSelectedCitizen]=useState<string|null>(null);const onFocus=useCallback((id:string)=>controller.current?.focusCitizen(id),[]);
 const [worldMap,setWorldMap]=useState<WorldMap|null>(null);const onOverlay=useCallback((o:PlanningOverlay)=>controller.current?.setPlanning(o),[]);
 const host=useRef<HTMLDivElement>(null),mini=useRef<HTMLCanvasElement>(null),controller=useRef<MapController|null>(null);
 const [status,setStatus]=useState<MapStatus|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState(''),[retry,setRetry]=useState(0),[expanded,setExpanded]=useState(false),[help,setHelp]=useState(false);
 const [grid,setGrid]=useState(false),[resources,setResources]=useState(false),[quality,setQuality]=useState<'auto'|'low'>('auto');
 useEffect(()=>{controller.current?.setPopulation({citizens,paused,speed,selectedId:mode==='population'?selectedCitizen:null});},[citizens,paused,speed,selectedCitizen,mode,worldMap]);
 useEffect(()=>{if(mode==='population')controller.current?.setPlanning({planning:planning??emptyPlanning(),ghost:null});},[mode,planning,worldMap]);
 const optionsRef=useRef<SceneOptions>({quality:'auto',grid:false,resources:false});
 useEffect(()=>{optionsRef.current={quality,grid,resources};controller.current?.setOptions(optionsRef.current);},[quality,grid,resources]);
 useEffect(()=>{
  const abort=new AbortController();let active=true,instance:MapController|null=null;
  async function start(){try{
   const map=await loadWorldMap(seed,climateId,abort.signal);if(!active||!host.current||!mini.current)return;
   const scene=await createScene(map,Math.max(1,host.current.clientWidth),Math.max(1,host.current.clientHeight));
   if(!active||!host.current||!mini.current){scene.destroy();return;}
   instance=new MapController(host.current,mini.current,scene,map,s=>{if(active)setStatus(s);});controller.current=instance;setWorldMap(map);instance.setOptions(optionsRef.current);setLoading(false);
  }catch(e){if(active&&!abort.signal.aborted){setError(e instanceof Error?e.message:'Không mở được bản đồ.');setLoading(false);}}}
  void start();return ()=>{active=false;abort.abort();instance?.destroy();if(controller.current===instance)controller.current=null;};
 },[seed,climateId,worldId,retry]);
 useEffect(()=>{if(!expanded)return;const original=document.body.style.overflow;document.body.style.overflow='hidden';const escape=(e:KeyboardEvent)=>{if(e.key==='Escape')setExpanded(false);};document.addEventListener('keydown',escape);return ()=>{document.body.style.overflow=original;document.removeEventListener('keydown',escape);};},[expanded]);
 const selected=status?.selected,resource=selected?RESOURCES[selected.resource]:null;
 const restart=()=>{setError('');setLoading(true);setStatus(null);setRetry(r=>r+1);};
 return <section className={`map-explorer${expanded?' map-expanded':''}`} aria-label="Bản đồ thế giới 2.5D" aria-busy={loading} data-generator={GENERATOR_VERSION}>
 <div className="map-canvas-host" ref={host}/>
 <div className="world-tool-switch"><button aria-pressed={mode==='population'} onClick={()=>setMode('population')}>Dân cư & chỗ ở</button><button aria-pressed={mode==='planning'} onClick={()=>setMode('planning')}>Quy hoạch</button></div>
 {worldMap&&mode==='population'&&<PopulationEditor map={worldMap} planning={planning??emptyPlanning()} citizens={citizens} day={day} populationLimit={populationLimit} paused={paused} status={status} canEdit={canPlan} onCommand={onCitizenCommand??(async()=>{throw new Error('Chưa kết nối engine.');})} onFocus={onFocus} onSelect={setSelectedCitizen}/>}
 {worldMap&&mode==='planning'&&<PlanningEditor map={worldMap} status={status} planning={planning??emptyPlanning()} canEdit={canPlan} onCommand={onPlanCommand??(async()=>{throw new Error('Chưa kết nối engine.');})} onOverlay={onOverlay}/>}
 <div className="map-hud"><span className="map-era"><MapPinned size={15}/>E0 <i/>Ngày {day}{clockLabel?` · ${clockLabel}`:''}</span><span><Users size={14}/>{population} dân</span><span className="map-climate"><Mountain size={14}/>{climateById(climateId)?.name}</span><span className="map-paused"><Pause size={12}/>{paused?'Tạm dừng':'Đang chạy'}</span></div>
 <div className="map-top-actions"><button className="map-tool" title="Hướng dẫn điều khiển" aria-label="Hướng dẫn điều khiển" aria-expanded={help} onClick={()=>setHelp(!help)}><HelpCircle size={18}/></button><button className="map-tool" title={expanded?'Thu gọn bản đồ':'Mở rộng bản đồ'} aria-label={expanded?'Thu gọn bản đồ':'Mở rộng bản đồ'} onClick={()=>setExpanded(!expanded)}>{expanded?<Minimize2 size={18}/>:<Maximize2 size={18}/>}</button></div>
 <div className="map-controls" aria-label="Điều khiển camera"><button className="map-tool" aria-label="Phóng to bản đồ" disabled={loading||!!error} onClick={()=>controller.current?.zoom(1.3)}><Plus size={19}/></button><span className="map-zoom">{status?`${(status.camera.zoom*100).toFixed(status.camera.zoom<.1?1:0)}%`:'—'}</span><button className="map-tool" aria-label="Thu nhỏ bản đồ" disabled={loading||!!error} onClick={()=>controller.current?.zoom(1/1.3)}><Minus size={19}/></button><div className="map-control-rule"/><button className="map-tool" aria-label="Về điểm khởi đầu" title="Về điểm khởi đầu" disabled={loading||!!error} onClick={()=>controller.current?.home()}><House size={17}/></button><button className="map-tool" aria-label="Xem toàn bản đồ" title="Xem toàn bản đồ" disabled={loading||!!error} onClick={()=>controller.current?.fit()}><Expand size={17}/></button></div>
 <div className="map-mini"><div><span>TOÀN KHU VỰC</span><span>256 × 256</span></div><canvas ref={mini} aria-label="Minimap. Chạm hoặc kéo để di chuyển camera." className="map-mini-canvas"/><small>Chạm để di chuyển</small></div>
 {selected&&<div className="tile-inspector" aria-live="polite"><div className="tile-heading"><span>Ô ({selected.x}, {selected.y})</span><button aria-label="Bỏ chọn ô" className="map-tool" onClick={()=>controller.current?.select(null)}><X size={14}/></button></div><h3><i style={{background:TERRAIN_COLORS[selected.terrain]}}/>{TERRAIN_NAMES[selected.terrain]}</h3><p>Cao độ <strong>Cấp {selected.elevation}</strong></p><p>Nguồn tự nhiên <strong>{resource?.name??'Chưa ghi nhận'}</strong></p>{resource&&<code>{resource.id}</code>}<small>{selected.terrain===TERRAIN.water?'Nguồn nước thô cần xử lý trước khi uống.':selected.terrain===TERRAIN.forest?'Cần khảo sát và khai phá trước khi quy hoạch.':selected.terrain===TERRAIN.mountain?'Địa hình núi đá, cần khảo sát khả năng tiếp cận.':'Chọn ô để khảo sát. Mở Xây dựng để quy hoạch công trình.'}</small></div>}
 {help&&<div className="map-help"><div><strong>Khám phá thế giới</strong><button className="map-tool" aria-label="Đóng hướng dẫn" onClick={()=>setHelp(false)}><X size={16}/></button></div><p><b>PC:</b> Kéo chuột để di chuyển, cuộn để zoom, click một ô để xem thông tin.</p><p><b>Điện thoại:</b> Vuốt một ngón để di chuyển, chụm/mở hai ngón để zoom, chạm để chọn ô.</p><p><b>Bàn phím:</b> Mũi tên/WASD di chuyển, +/− zoom, Home về điểm đầu, Escape bỏ chọn.</p><p>Chạm minimap để đi nhanh. Bản đồ tái lập từ seed; chưa có dân di chuyển hoặc xây dựng trong phiên bản này.</p>{status?.renderer==='Canvas 2D'&&<p className="map-fallback-note">Đang dùng chế độ tương thích Canvas vì WebGL không khả dụng.</p>}</div>}
 <div className="map-bottom"><div className="map-display-options"><button aria-label="Bật tắt lưới ô" aria-pressed={grid} className={grid?'map-option active':'map-option'} onClick={()=>setGrid(!grid)}><Grid2X2 size={14}/><span>Lưới ô</span></button><button aria-label="Bật tắt nguồn tài nguyên" aria-pressed={resources} className={resources?'map-option active':'map-option'} onClick={()=>setResources(!resources)}><Trees size={14}/><span>Tài nguyên</span></button><label className="map-quality"><Layers size={14}/><select aria-label="Chất lượng bản đồ" value={quality} onChange={e=>setQuality(e.target.value as 'auto'|'low')}><option value="auto">Tự động</option><option value="low">Nhẹ</option></select></label></div><span className="map-hint">{selected?`X ${selected.x} · Y ${selected.y}`:'Chọn một ô để khảo sát'}</span></div>
 {loading&&<div className="map-loading" role="status"><span className="loading-spinner"/><strong>Đang mở bản đồ từ seed</strong><p>Sinh địa hình và tải bộ đồ họa E0…</p><code>#{seed}</code></div>}
 {error&&<div className="map-loading map-load-error" role="alert"><AlertCircle size={30}/><strong>Chưa mở được bản đồ</strong><p>{error}</p><button className="button primary" onClick={restart}><RotateCcw size={16}/>Thử lại</button></div>}
 </section>;
}
