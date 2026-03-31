import { APP_CONFIG } from "../config/app.config";

export class NavigationService {
    private static config = APP_CONFIG.getCurrentConfig();
  
    static navigateToLogin(returnUrl?: string) {
      let url = `${this.config.MARKETING_URL}/#/login`;
      if (returnUrl) {
        const urlObj = new URL(url);
        urlObj.searchParams.set('return_url', returnUrl);
        url = urlObj.toString();
      }
      // #region agent log
      fetch('http://127.0.0.1:7584/ingest/0149d283-503e-4f7c-81cd-6e34434810dd',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'ae9ba4'},body:JSON.stringify({sessionId:'ae9ba4',location:'main-app/NavigationService.ts:navigateToLogin',message:'main-app navigateToLogin URL',data:{marketingUrl:this.config.MARKETING_URL,constructedUrl:url,returnUrl},timestamp:Date.now(),hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      window.location.href = url;
    }
  
    static navigateToMarketing(page: string = '/') {
      // Handle hash routing - if page doesn't start with #, add it
      const hashPage = page === '/' ? '' : (page.startsWith('#') ? page : `#${page}`);
      window.location.href = `${this.config.MARKETING_URL}/${hashPage}`;
    }
  }