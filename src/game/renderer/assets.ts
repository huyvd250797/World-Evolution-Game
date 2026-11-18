// Stable asset IDs; renderer can adopt PixiJS in V0.2.0 without changing saves.
import manifest from '../../../data/generated/assets.json';
export const assetManifest=manifest;
export function assetUrl(id:keyof typeof assetManifest.assets,base=process.env.NEXT_PUBLIC_ASSET_BASE_URL??''){
 if(base && !/^https:\/\//.test(base)) throw new Error('ASSET_BASE_URL cần là URL HTTPS hoặc để trống.');
 return `${base.replace(/\/$/,'')}${assetManifest.assets[id].path}`;
}
