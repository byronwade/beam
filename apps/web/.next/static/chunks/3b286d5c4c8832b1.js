(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,97085,43531,74886,e=>{"use strict";var t=e.i(43476),s=e.i(71645),a=e.i(75254);let i=(0,a.default)("check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]]);e.s(["Check",()=>i],43531);let l=(0,a.default)("copy",[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]]);e.s(["Copy",()=>l],74886);var n=e.i(68054);let r=(0,a.default)("file-code",[["path",{d:"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",key:"1oefj6"}],["path",{d:"M14 2v5a1 1 0 0 0 1 1h5",key:"wfsgrz"}],["path",{d:"M10 12.5 8 15l2 2.5",key:"1tg20x"}],["path",{d:"m14 12.5 2 2.5-2 2.5",key:"yinavb"}]]),c=(0,a.default)("file-braces",[["path",{d:"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",key:"1oefj6"}],["path",{d:"M14 2v5a1 1 0 0 0 1 1h5",key:"wfsgrz"}],["path",{d:"M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1",key:"1oajmo"}],["path",{d:"M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1",key:"mpwhp6"}]]),o=(0,a.default)("file-text",[["path",{d:"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",key:"1oefj6"}],["path",{d:"M14 2v5a1 1 0 0 0 1 1h5",key:"wfsgrz"}],["path",{d:"M10 9H8",key:"b1mrlr"}],["path",{d:"M16 13H8",key:"t4e002"}],["path",{d:"M16 17H8",key:"z1uh3a"}]]);var d=e.i(63059);let h={bash:{label:"Terminal",icon:n.Terminal,accent:"green"},javascript:{label:"JavaScript",icon:r,accent:"yellow"},typescript:{label:"TypeScript",icon:r,accent:"blue"},json:{label:"JSON",icon:c,accent:"orange"},python:{label:"Python",icon:r,accent:"cyan"},ruby:{label:"Ruby",icon:r,accent:"red"},text:{label:"Plain Text",icon:o,accent:"white"},output:{label:"Output",icon:n.Terminal,accent:"purple"}};function m({code:e,language:a="bash",filename:n,showLineNumbers:r=!1,title:c,copyable:o=!0}){let[d,m]=(0,s.useState)(!1),x=h[a]||h.text,p=x.icon,u=e.split("\n"),b=r||u.length>5,j=async()=>{try{await navigator.clipboard.writeText("bash"===a?e.split("\n").map(e=>e.trim().startsWith("$ ")?e.replace(/^\s*\$\s*/,""):e.trim().startsWith("# ")?"":e).filter(Boolean).join("\n"):e),m(!0),setTimeout(()=>m(!1),2e3)}catch(e){console.error("Failed to copy:",e)}},g=e.split("\n").map((e,s)=>{if("output"===a||"text"===a)return(0,t.jsx)("span",{className:"text-white/70",children:e},s);if("bash"===a){if(e.trim().startsWith("#"))return(0,t.jsx)("span",{className:"text-white/40 italic",children:e},s);if(e.trim().startsWith("$")){let[a,...i]=e.split(" ");return(0,t.jsxs)("span",{children:[(0,t.jsx)("span",{className:"text-violet-400",children:a}),(0,t.jsxs)("span",{className:"text-emerald-400",children:[" ",i.join(" ")]})]},s)}let a=e.split(" "),i=a[0],l=a.slice(1).join(" "),n=l.split(/(\s+)/).map((e,s)=>e.startsWith("--")||e.startsWith("-")?(0,t.jsx)("span",{className:"text-cyan-400",children:e},s):e.startsWith("http://")||e.startsWith("https://")||e.includes(".onion")?(0,t.jsx)("span",{className:"text-blue-400 underline decoration-blue-400/30",children:e},s):(0,t.jsx)("span",{className:"text-emerald-400",children:e},s));return(0,t.jsxs)("span",{children:[(0,t.jsx)("span",{className:"text-amber-400",children:i}),l&&(0,t.jsx)("span",{children:" "}),n]},s)}if("javascript"===a||"typescript"===a){let a;if(e.trim().startsWith("//"))return(0,t.jsx)("span",{className:"text-white/40 italic",children:e},s);let i=[],l=0,n=RegExp("\\b(const|let|var|function|return|if|else|import|export|from|require|async|await|class|extends|new|this|try|catch|throw|typeof|instanceof)\\b","g"),r=/(['"`])((?:\\.|(?!\1)[^\\])*)\1/g,c=/\b(\d+)\b/g,o=[];for(r.lastIndex=0;null!==(a=r.exec(e));)o.push({type:"string",start:a.index,end:a.index+a[0].length,value:a[0]});for(n.lastIndex=0;null!==(a=n.exec(e));)o.some(e=>a.index>=e.start&&a.index<e.end)||o.push({type:"keyword",start:a.index,end:a.index+a[0].length,value:a[0]});for(c.lastIndex=0;null!==(a=c.exec(e));){let e=o.some(e=>a.index>=e.start&&a.index<e.end),t=o.some(e=>"keyword"===e.type&&a.index>=e.start&&a.index<e.end);e||t||o.push({type:"number",start:a.index,end:a.index+a[0].length,value:a[0]})}o.sort((e,t)=>e.start-t.start);let d=0;return o.forEach(s=>{s.start>d&&i.push((0,t.jsx)("span",{className:"text-white/80",children:e.slice(d,s.start)},`text-${l++}`)),"string"===s.type?i.push((0,t.jsx)("span",{className:"text-emerald-400",children:s.value},`str-${l++}`)):"keyword"===s.type?i.push((0,t.jsx)("span",{className:"text-violet-400",children:s.value},`kw-${l++}`)):"number"===s.type&&i.push((0,t.jsx)("span",{className:"text-amber-400",children:s.value},`num-${l++}`)),d=s.end}),d<e.length&&i.push((0,t.jsx)("span",{className:"text-white/80",children:e.slice(d)},`end-${l++}`)),(0,t.jsx)("span",{children:i.length>0?i:(0,t.jsx)("span",{className:"text-white/80",children:e})},s)}if("json"===a){let a,i=[],l=0,n=/"([^"]+)":/g,r=/:\s*"([^"]*)"/g,c=[];for(n.lastIndex=0;null!==(a=n.exec(e));)c.push({type:"key",start:a.index,end:a.index+a[0].length-1,value:`"${a[1]}"`});for(r.lastIndex=0;null!==(a=r.exec(e));){let t=e.indexOf(`"${a[1]}"`,a.index+1);-1!==t&&c.push({type:"string",start:t,end:t+a[1].length+2,value:`"${a[1]}"`})}c.sort((e,t)=>e.start-t.start);let o=0;return c.forEach(s=>{s.start>o&&i.push((0,t.jsx)("span",{className:"text-white/60",children:e.slice(o,s.start)},`t-${l++}`)),"key"===s.type?i.push((0,t.jsx)("span",{className:"text-cyan-400",children:s.value},`k-${l++}`)):"string"===s.type&&i.push((0,t.jsx)("span",{className:"text-emerald-400",children:s.value},`s-${l++}`)),o=s.end}),o<e.length&&i.push((0,t.jsx)("span",{className:"text-white/60",children:e.slice(o)},`e-${l++}`)),(0,t.jsx)("span",{children:i.length>0?i:(0,t.jsx)("span",{className:"text-white/60",children:e})},s)}if("python"===a){if(e.trim().startsWith("#"))return(0,t.jsx)("span",{className:"text-white/40 italic",children:e},s);let a=e;["def","class","import","from","return","if","elif","else","for","while","try","except","with","as","lambda","yield","async","await","True","False","None"].forEach(e=>{let t=RegExp(`\\b${e}\\b`,"g");a=a.replace(t,`__KW_${e}__`)});let i=[];return a.split(/(__KW_\w+__)/).forEach((e,s)=>{if(e.startsWith("__KW_")&&e.endsWith("__")){let a=e.slice(5,-2);i.push((0,t.jsx)("span",{className:"text-violet-400",children:a},s))}else i.push((0,t.jsx)("span",{className:"text-white/80",children:e},s))}),(0,t.jsx)("span",{children:i},s)}return(0,t.jsx)("span",{className:"text-emerald-400",children:e},s)});return(0,t.jsxs)("div",{className:"group relative rounded-xl overflow-hidden bg-[#0a0a0a] my-4",children:[(0,t.jsx)("div",{className:"absolute inset-0 rounded-xl bg-gradient-to-r from-red-500/20 via-yellow-500/20 via-green-500/20 via-blue-500/20 to-violet-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"}),(0,t.jsx)("div",{className:"absolute inset-[1px] rounded-xl bg-[#0a0a0a]"}),(0,t.jsx)("div",{className:"absolute inset-0 rounded-xl border border-white/10 group-hover:border-white/20 transition-colors"}),(0,t.jsxs)("div",{className:"relative",children:[(0,t.jsxs)("div",{className:"relative",children:[(0,t.jsx)("div",{className:"absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-violet-500 opacity-60"}),(0,t.jsxs)("div",{className:"flex items-center justify-between px-3 py-2 bg-white/[0.02]",children:[(0,t.jsxs)("div",{className:"flex items-center gap-2",children:[(0,t.jsx)(p,{className:"w-3.5 h-3.5 text-white/40"}),(0,t.jsx)("span",{className:"text-xs text-white/50",children:n||c||x.label})]}),o&&(0,t.jsx)("button",{onClick:j,className:"flex items-center gap-1 px-2 py-1 rounded text-xs text-white/40 hover:text-white hover:bg-white/10 transition-all","aria-label":d?"Copied":"Copy to clipboard",children:d?(0,t.jsx)(i,{className:"w-3 h-3 text-emerald-400"}):(0,t.jsx)(l,{className:"w-3 h-3"})})]})]}),(0,t.jsx)("div",{className:"relative overflow-x-auto",children:(0,t.jsx)("pre",{className:"p-4 text-sm font-mono leading-relaxed",children:b?(0,t.jsxs)("div",{className:"flex",children:[(0,t.jsx)("div",{className:"select-none pr-4 text-right border-r border-white/5 mr-4",children:u.map((e,s)=>(0,t.jsx)("div",{className:"text-white/20 text-xs leading-relaxed tabular-nums",children:s+1},s))}),(0,t.jsx)("div",{className:"flex-1 min-w-0",children:g.map((e,s)=>(0,t.jsx)("div",{className:"leading-relaxed hover:bg-white/[0.02] -mx-2 px-2 rounded",children:e},s))})]}):(0,t.jsx)("div",{children:g.map((e,s)=>(0,t.jsx)("div",{className:"leading-relaxed",children:e},s))})})})]})]})}function x({children:e}){return(0,t.jsx)("code",{className:"relative px-1.5 py-0.5 rounded-md bg-white/5 text-white/90 text-sm font-mono border border-white/10 hover:border-white/20 transition-colors",children:e})}function p({children:e}){let[a,n]=(0,s.useState)(!1),r=async()=>{try{await navigator.clipboard.writeText(e),n(!0),setTimeout(()=>n(!1),2e3)}catch(e){console.error("Failed to copy:",e)}};return(0,t.jsxs)("div",{onClick:r,className:"group inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0a0a0a] border border-white/10 hover:border-white/20 cursor-pointer transition-all",children:[(0,t.jsx)(d.ChevronRight,{className:"w-3.5 h-3.5 text-violet-400"}),(0,t.jsx)("code",{className:"text-sm font-mono text-emerald-400",children:e}),(0,t.jsx)("span",{className:"text-white/30 text-xs group-hover:text-white/50 transition-colors",children:a?(0,t.jsx)(i,{className:"w-3.5 h-3.5 text-emerald-400"}):(0,t.jsx)(l,{className:"w-3.5 h-3.5"})})]})}e.s(["CodeBlock",()=>m,"Command",()=>p,"InlineCode",()=>x],97085)},6900,e=>{"use strict";var t=e.i(43476),s=e.i(22016),a=e.i(97085);function i(){return(0,t.jsxs)("article",{className:"mx-auto max-w-4xl px-6 py-12",children:[(0,t.jsxs)("header",{className:"mb-12",children:[(0,t.jsx)("h1",{className:"text-4xl font-bold text-white mb-4",children:"Deployment"}),(0,t.jsx)("p",{className:"text-lg text-white/70 leading-relaxed",children:"This guide covers deploying Beam in various environments, from simple single-machine setups to distributed production deployments. Beam's architecture is designed for resilience — most configurations require minimal setup."})]}),(0,t.jsxs)("section",{className:"mb-12",children:[(0,t.jsx)("h2",{className:"text-2xl font-semibold text-white mb-4",children:"Quick Start"}),(0,t.jsx)("p",{className:"text-white/70 mb-4",children:"For most users, Beam runs directly from npm with no additional deployment needed:"}),(0,t.jsx)("div",{className:"mb-6",children:(0,t.jsx)(a.CodeBlock,{code:`# Install globally
npm install -g @byronwade/beam

# Run a tunnel
beam 3000`,language:"bash"})}),(0,t.jsx)("p",{className:"text-white/70",children:"The CLI handles everything: spawning the tunnel daemon, connecting to Tor, and creating your hidden service. For personal development use, this is all you need."})]}),(0,t.jsxs)("section",{className:"mb-12",children:[(0,t.jsx)("h2",{className:"text-2xl font-semibold text-white mb-4",children:"Docker Deployment"}),(0,t.jsx)("p",{className:"text-white/70 mb-4",children:"For containerized environments, Beam provides Docker images that include all dependencies."}),(0,t.jsxs)("div",{className:"space-y-6",children:[(0,t.jsxs)("div",{children:[(0,t.jsx)("h3",{className:"text-lg font-medium text-white mb-2",children:"Basic Docker Run"}),(0,t.jsx)("div",{className:"mb-3",children:(0,t.jsx)(a.CodeBlock,{code:`# Run Beam in a container
docker run -d \\
  --name beam \\
  -p 3000:3000 \\
  -v beam-data:/app/data \\
  byronwade/beam:latest \\
  beam 3000`,language:"bash"})}),(0,t.jsx)("p",{className:"text-white/60 text-sm",children:"The volume mount persists your .onion address between container restarts."})]}),(0,t.jsxs)("div",{children:[(0,t.jsx)("h3",{className:"text-lg font-medium text-white mb-2",children:"Docker Compose"}),(0,t.jsx)("p",{className:"text-white/70 mb-3",children:"For running Beam alongside your application:"}),(0,t.jsx)("div",{className:"mb-3",children:(0,t.jsx)(a.CodeBlock,{code:`# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"

  beam:
    image: byronwade/beam:latest
    command: beam 3000 --target app:3000
    volumes:
      - beam-data:/app/data
    depends_on:
      - app

volumes:
  beam-data:`,language:"text",title:"docker-compose.yml"})}),(0,t.jsxs)("p",{className:"text-white/60 text-sm",children:["The ",(0,t.jsx)(a.InlineCode,{children:"--target"})," flag tells Beam to forward traffic to the app container instead of localhost."]})]})]})]}),(0,t.jsxs)("section",{className:"mb-12",children:[(0,t.jsx)("h2",{className:"text-2xl font-semibold text-white mb-4",children:"Self-Hosting on a Server"}),(0,t.jsx)("p",{className:"text-white/70 mb-4",children:"Running Beam on a VPS or dedicated server gives you a persistent tunnel that stays up even when your local machine is off."}),(0,t.jsxs)("div",{className:"space-y-6",children:[(0,t.jsxs)("div",{children:[(0,t.jsx)("h3",{className:"text-lg font-medium text-white mb-2",children:"Prerequisites"}),(0,t.jsxs)("ul",{className:"list-disc list-inside space-y-2 text-white/70 ml-4 mb-4",children:[(0,t.jsx)("li",{children:"A Linux server (Ubuntu/Debian recommended)"}),(0,t.jsx)("li",{children:"Node.js 18+ installed"}),(0,t.jsx)("li",{children:"At least 512MB RAM"}),(0,t.jsx)("li",{children:"Outbound network access (Beam doesn't require open inbound ports)"})]})]}),(0,t.jsxs)("div",{children:[(0,t.jsx)("h3",{className:"text-lg font-medium text-white mb-2",children:"Installation"}),(0,t.jsx)("div",{className:"mb-3",children:(0,t.jsx)(a.CodeBlock,{code:`# Install Node.js (if not already installed)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Beam
npm install -g @byronwade/beam

# Verify installation
beam --version`,language:"bash"})})]}),(0,t.jsxs)("div",{children:[(0,t.jsx)("h3",{className:"text-lg font-medium text-white mb-2",children:"Running as a Systemd Service"}),(0,t.jsx)("p",{className:"text-white/70 mb-3",children:"Create a systemd service for automatic startup and restart:"}),(0,t.jsx)("div",{className:"mb-3",children:(0,t.jsx)(a.CodeBlock,{code:`# /etc/systemd/system/beam.service
[Unit]
Description=Beam Tunnel
After=network.target

[Service]
Type=simple
User=beam
WorkingDirectory=/home/beam
ExecStart=/usr/bin/beam 3000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target`,language:"text",title:"/etc/systemd/system/beam.service"})}),(0,t.jsx)("div",{className:"mb-3",children:(0,t.jsx)(a.CodeBlock,{code:`# Create a dedicated user
sudo useradd -r -s /bin/false beam
sudo mkdir -p /home/beam
sudo chown beam:beam /home/beam

# Enable and start the service
sudo systemctl daemon-reload
sudo systemctl enable beam
sudo systemctl start beam

# Check status
sudo systemctl status beam`,language:"bash"})})]})]})]}),(0,t.jsxs)("section",{className:"mb-12",children:[(0,t.jsx)("h2",{className:"text-2xl font-semibold text-white mb-4",children:"Kubernetes Deployment"}),(0,t.jsx)("p",{className:"text-white/70 mb-4",children:"For Kubernetes environments, deploy Beam as a sidecar or standalone pod."}),(0,t.jsxs)("div",{className:"space-y-6",children:[(0,t.jsxs)("div",{children:[(0,t.jsx)("h3",{className:"text-lg font-medium text-white mb-2",children:"Sidecar Pattern"}),(0,t.jsx)("p",{className:"text-white/70 mb-3",children:"Run Beam alongside your application pod:"}),(0,t.jsx)("div",{className:"mb-3",children:(0,t.jsx)(a.CodeBlock,{code:`apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  replicas: 1
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
      - name: app
        image: myapp:latest
        ports:
        - containerPort: 3000

      - name: beam
        image: byronwade/beam:latest
        command: ["beam", "3000", "--target", "localhost:3000"]
        volumeMounts:
        - name: beam-data
          mountPath: /app/data

      volumes:
      - name: beam-data
        persistentVolumeClaim:
          claimName: beam-pvc`,language:"text",title:"deployment.yaml"})})]}),(0,t.jsxs)("div",{children:[(0,t.jsx)("h3",{className:"text-lg font-medium text-white mb-2",children:"Persistent Volume"}),(0,t.jsx)("p",{className:"text-white/70 mb-3",children:"To keep the same .onion address across pod restarts:"}),(0,t.jsx)("div",{className:"mb-3",children:(0,t.jsx)(a.CodeBlock,{code:`apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: beam-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 100Mi`,language:"text",title:"pvc.yaml"})}),(0,t.jsx)("p",{className:"text-white/60 text-sm",children:"The persistent volume stores your hidden service keys, ensuring your .onion address remains stable."})]})]})]}),(0,t.jsxs)("section",{className:"mb-12",children:[(0,t.jsx)("h2",{className:"text-2xl font-semibold text-white mb-4",children:"Configuration"}),(0,t.jsx)("p",{className:"text-white/70 mb-4",children:"Beam can be configured via command-line flags or environment variables."}),(0,t.jsxs)("div",{className:"space-y-6",children:[(0,t.jsxs)("div",{children:[(0,t.jsx)("h3",{className:"text-lg font-medium text-white mb-2",children:"Environment Variables"}),(0,t.jsx)("div",{className:"mb-3",children:(0,t.jsx)(a.CodeBlock,{code:`# Target port
BEAM_PORT=3000

# Target host (for forwarding to another service)
BEAM_TARGET=localhost:3000

# Data directory (where keys are stored)
BEAM_DATA_DIR=/var/lib/beam

# Enable verbose logging
BEAM_VERBOSE=true

# Custom domain (for local DNS)
BEAM_DOMAIN=myapp.local`,language:"bash",title:"Environment variables"})})]}),(0,t.jsxs)("div",{children:[(0,t.jsx)("h3",{className:"text-lg font-medium text-white mb-2",children:"Data Directory"}),(0,t.jsxs)("p",{className:"text-white/70 mb-3",children:["By default, Beam stores data in ",(0,t.jsx)(a.InlineCode,{children:"~/.beam/"}),". This includes:"]}),(0,t.jsxs)("ul",{className:"list-disc list-inside space-y-2 text-white/70 ml-4",children:[(0,t.jsxs)("li",{children:[(0,t.jsx)(a.InlineCode,{children:"keys/"})," — Hidden service private keys (keep these safe!)"]}),(0,t.jsxs)("li",{children:[(0,t.jsx)(a.InlineCode,{children:"certs/"})," — Generated TLS certificates for HTTPS"]}),(0,t.jsxs)("li",{children:[(0,t.jsx)(a.InlineCode,{children:"tor/"})," — Tor data directory"]})]}),(0,t.jsxs)("p",{className:"text-white/60 text-sm mt-3",children:["Back up the ",(0,t.jsx)(a.InlineCode,{children:"keys/"})," directory if you need to preserve your .onion address when migrating to a new server."]})]})]})]}),(0,t.jsxs)("section",{className:"mb-12",children:[(0,t.jsx)("h2",{className:"text-2xl font-semibold text-white mb-4",children:"Production Considerations"}),(0,t.jsxs)("div",{className:"space-y-6",children:[(0,t.jsxs)("div",{children:[(0,t.jsx)("h3",{className:"text-lg font-medium text-white mb-2",children:"Resource Requirements"}),(0,t.jsx)("p",{className:"text-white/70 mb-3",children:"Beam is lightweight, but Tor circuit building and traffic forwarding do consume resources:"}),(0,t.jsxs)("ul",{className:"list-disc list-inside space-y-2 text-white/70 ml-4",children:[(0,t.jsxs)("li",{children:[(0,t.jsx)("strong",{className:"text-white/90",children:"Memory:"})," ~100-200MB under normal load"]}),(0,t.jsxs)("li",{children:[(0,t.jsx)("strong",{className:"text-white/90",children:"CPU:"})," Minimal, mostly idle. Spikes during circuit building"]}),(0,t.jsxs)("li",{children:[(0,t.jsx)("strong",{className:"text-white/90",children:"Disk:"})," ~50MB for Tor data, plus your key storage"]}),(0,t.jsxs)("li",{children:[(0,t.jsx)("strong",{className:"text-white/90",children:"Network:"})," All traffic goes through Tor, so no inbound ports needed"]})]})]}),(0,t.jsxs)("div",{children:[(0,t.jsx)("h3",{className:"text-lg font-medium text-white mb-2",children:"Security"}),(0,t.jsx)("p",{className:"text-white/70 mb-3",children:"In production deployments:"}),(0,t.jsxs)("ul",{className:"list-disc list-inside space-y-2 text-white/70 ml-4",children:[(0,t.jsx)("li",{children:"Run Beam as a non-root user"}),(0,t.jsxs)("li",{children:["Protect the ",(0,t.jsx)(a.InlineCode,{children:"keys/"})," directory — these are your hidden service private keys"]}),(0,t.jsx)("li",{children:"Use firewall rules to restrict which services Beam can forward to"}),(0,t.jsx)("li",{children:"Consider using read-only root filesystem in containers"})]})]}),(0,t.jsxs)("div",{children:[(0,t.jsx)("h3",{className:"text-lg font-medium text-white mb-2",children:"Monitoring"}),(0,t.jsx)("p",{className:"text-white/70 mb-3",children:"Monitor your Beam deployment:"}),(0,t.jsx)("div",{className:"mb-3",children:(0,t.jsx)(a.CodeBlock,{code:`# Check if the process is running
pgrep -f beam-tunnel-daemon

# View logs (when running as systemd service)
journalctl -u beam -f

# Check Tor circuit status (verbose mode)
beam 3000 --verbose`,language:"bash"})})]}),(0,t.jsxs)("div",{children:[(0,t.jsx)("h3",{className:"text-lg font-medium text-white mb-2",children:"High Availability"}),(0,t.jsx)("p",{className:"text-white/70",children:"Each Beam instance gets its own .onion address. For high availability, you can run multiple instances behind a load balancer on the regular network, then expose that load balancer through Beam. Alternatively, use DNS-based failover at the application level if your clients can handle multiple .onion addresses."})]})]})]}),(0,t.jsxs)("section",{className:"mb-12",children:[(0,t.jsx)("h2",{className:"text-2xl font-semibold text-white mb-4",children:"Deployment Troubleshooting"}),(0,t.jsxs)("div",{className:"space-y-6",children:[(0,t.jsxs)("div",{children:[(0,t.jsx)("h3",{className:"text-lg font-medium text-white mb-2",children:"Container Networking Issues"}),(0,t.jsx)("p",{className:"text-white/70 mb-3",children:"If Beam can't reach your application in Docker:"}),(0,t.jsx)("div",{className:"mb-3",children:(0,t.jsx)(a.CodeBlock,{code:`# Make sure containers are on the same network
docker network ls
docker network inspect bridge

# Use service names instead of localhost
beam 3000 --target myapp:3000

# Or use host networking (less isolated)
docker run --network host byronwade/beam:latest beam 3000`,language:"bash"})})]}),(0,t.jsxs)("div",{children:[(0,t.jsx)("h3",{className:"text-lg font-medium text-white mb-2",children:"Tor Connection Fails in Container"}),(0,t.jsx)("p",{className:"text-white/70 mb-3",children:"Some container environments block Tor traffic or don't allow the embedded Tor client to function properly:"}),(0,t.jsxs)("ul",{className:"list-disc list-inside space-y-2 text-white/70 ml-4",children:[(0,t.jsx)("li",{children:"Verify outbound network access from the container"}),(0,t.jsx)("li",{children:"Check if your cloud provider blocks Tor exit nodes"}),(0,t.jsx)("li",{children:"Try a different region if running in cloud infrastructure"})]})]}),(0,t.jsxs)("div",{children:[(0,t.jsx)("h3",{className:"text-lg font-medium text-white mb-2",children:"Permission Denied"}),(0,t.jsx)("p",{className:"text-white/70 mb-3",children:"If you see permission errors:"}),(0,t.jsx)("div",{className:"mb-3",children:(0,t.jsx)(a.CodeBlock,{code:`# Make sure the data directory is writable
chown -R beam:beam /var/lib/beam

# In Docker, check volume permissions
docker run -v beam-data:/app/data --user 1000:1000 ...`,language:"bash"})})]})]})]}),(0,t.jsxs)("section",{className:"mb-12",children:[(0,t.jsx)("h2",{className:"text-2xl font-semibold text-white mb-4",children:"Related Documentation"}),(0,t.jsxs)("ul",{className:"space-y-3 text-white/70",children:[(0,t.jsxs)("li",{children:[(0,t.jsx)(s.default,{href:"/docs/getting-started",className:"text-white underline hover:text-white/80",children:"Getting Started"})," ","— basic usage and first tunnel"]}),(0,t.jsxs)("li",{children:[(0,t.jsx)(s.default,{href:"/docs/cli-reference",className:"text-white underline hover:text-white/80",children:"CLI Reference"})," ","— all command-line options"]}),(0,t.jsxs)("li",{children:[(0,t.jsx)(s.default,{href:"/docs/architecture",className:"text-white underline hover:text-white/80",children:"Architecture"})," ","— how the components work together"]}),(0,t.jsxs)("li",{children:[(0,t.jsx)(s.default,{href:"/docs/troubleshooting",className:"text-white underline hover:text-white/80",children:"Troubleshooting"})," ","— diagnose and fix common issues"]})]})]}),(0,t.jsx)("footer",{className:"pt-8 border-t border-white/10",children:(0,t.jsxs)("p",{className:"text-white/50 text-sm",children:["Need help with deployment?"," ",(0,t.jsx)("a",{href:"https://github.com/byronwade/beam/issues",className:"text-white/70 underline hover:text-white",target:"_blank",rel:"noopener noreferrer",children:"Open an issue on GitHub"})," ","or check the"," ",(0,t.jsx)(s.default,{href:"/docs/troubleshooting",className:"text-white/70 underline hover:text-white",children:"troubleshooting guide"}),"."]})})]})}e.s(["default",()=>i])}]);