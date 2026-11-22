import {defineConfig} from 'vite';

// Vite's development fallback otherwise serves the storefront for a public directory URL.
function launchKitRoute(req,res,next){
  const url=new URL(req.url,'http://localhost');
  if(url.pathname==='/launch-kit'){
    res.writeHead(308,{Location:`/launch-kit/${url.search}`});res.end();return;
  }
  if(url.pathname==='/launch-kit/')req.url=`/launch-kit/index.html${url.search}`;
  next();
}
export default defineConfig({
  plugins:[{
    name:'launch-kit-directory',
    configureServer(server){server.middlewares.use(launchKitRoute);},
    configurePreviewServer(server){server.middlewares.use(launchKitRoute);}
  }]
});
