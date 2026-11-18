// Preserve the visited host on localhost/LAN. Next dev can normalize request.url.
export function requestOrigin(request:{url:string;headers:Headers}){
 const url=new URL(request.url);const host=request.headers.get('host');
 if(host&&/^[a-zA-Z0-9.[\]:_-]+$/.test(host))url.host=host;
 return url.origin;
}
