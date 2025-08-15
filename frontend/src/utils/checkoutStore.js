export function saveCheckoutDraft(draft){
  sessionStorage.setItem("checkoutDraft", JSON.stringify(draft));
}
export function loadCheckoutDraft(){
  try { return JSON.parse(sessionStorage.getItem("checkoutDraft")||"null"); }
  catch { return null; }
}
export function clearCheckoutDraft(){
  sessionStorage.removeItem("checkoutDraft");
}
