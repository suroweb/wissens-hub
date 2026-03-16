import { WebPartContext } from "@microsoft/sp-webpart-base";
import { spfi, SPFI, SPFx } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/site-users/web";
import "@pnp/sp/site-groups/web";

let _sp: SPFI | undefined;

export const getSP = (context?: WebPartContext): SPFI => {
  if (context !== undefined) {
    _sp = spfi().using(SPFx(context));
  }
  if (_sp === undefined) {
    throw new Error('PnPjs not initialized. Call getSP(context) from onInit() first.');
  }
  return _sp;
};
