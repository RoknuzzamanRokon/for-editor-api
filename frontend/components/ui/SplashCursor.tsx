'use client';
import { useEffect, useRef } from 'react';

interface SplashCursorProps {
  SIM_RESOLUTION?: number;
  DYE_RESOLUTION?: number;
  CAPTURE_RESOLUTION?: number;
  DENSITY_DISSIPATION?: number;
  VELOCITY_DISSIPATION?: number;
  PRESSURE?: number;
  PRESSURE_ITERATIONS?: number;
  CURL?: number;
  SPLAT_RADIUS?: number;
  SPLAT_FORCE?: number;
  SHADING?: boolean;
  COLOR_UPDATE_SPEED?: number;
  BACK_COLOR?: { r: number; g: number; b: number };
  TRANSPARENT?: boolean;
}

export default function SplashCursor({
  SIM_RESOLUTION = 128,
  DYE_RESOLUTION = 1440,
  CAPTURE_RESOLUTION = 512,
  DENSITY_DISSIPATION = 3.5,
  VELOCITY_DISSIPATION = 2,
  PRESSURE = 0.1,
  PRESSURE_ITERATIONS = 20,
  CURL = 3,
  SPLAT_RADIUS = 0.2,
  SPLAT_FORCE = 6000,
  SHADING = true,
  COLOR_UPDATE_SPEED = 10,
  BACK_COLOR = { r: 0, g: 0, b: 0 },
  TRANSPARENT = true,
}: SplashCursorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    if (!canvas) return;
    let isActive = true;
    let animId: number;

    const config = {
      SIM_RESOLUTION, DYE_RESOLUTION, CAPTURE_RESOLUTION,
      DENSITY_DISSIPATION, VELOCITY_DISSIPATION, PRESSURE,
      PRESSURE_ITERATIONS, CURL, SPLAT_RADIUS, SPLAT_FORCE,
      SHADING, COLOR_UPDATE_SPEED, PAUSED: false, BACK_COLOR, TRANSPARENT,
    };

    // pointer prototype
    function makePointer() {
      return { id: -1, texcoordX: 0, texcoordY: 0, prevTexcoordX: 0, prevTexcoordY: 0, deltaX: 0, deltaY: 0, down: false, moved: false, color: { r: 0, g: 0, b: 0 } };
    }
    const pointers = [makePointer()];

    // WebGL context
    const params = { alpha: true, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false };
    let gl: WebGLRenderingContext = canvas.getContext('webgl2', params) as any || canvas.getContext('webgl', params) as any;
    if (!gl) return;
    const isWebGL2 = !!(gl as any).createVertexArray;

    let halfFloat: any, supportLinearFiltering: any;
    if (isWebGL2) {
      (gl as any).getExtension('EXT_color_buffer_float');
      supportLinearFiltering = gl.getExtension('OES_texture_float_linear');
    } else {
      halfFloat = gl.getExtension('OES_texture_half_float');
      supportLinearFiltering = gl.getExtension('OES_texture_half_float_linear');
    }
    gl.clearColor(0, 0, 0, 1);
    const halfFloatTexType = isWebGL2 ? (gl as any).HALF_FLOAT : halfFloat?.HALF_FLOAT_OES;

    function getSupportedFormat(internalFormat: number, format: number, type: number): { internalFormat: number; format: number } | null {
      if (!supportRenderTextureFormat(internalFormat, format, type)) {
        if (internalFormat === (gl as any).R16F) return getSupportedFormat((gl as any).RG16F, (gl as any).RG, type);
        if (internalFormat === (gl as any).RG16F) return getSupportedFormat((gl as any).RGBA16F, gl.RGBA, type);
        return null;
      }
      return { internalFormat, format };
    }
    function supportRenderTextureFormat(internalFormat: number, format: number, type: number) {
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null);
      const fbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      return gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
    }

    let formatRGBA: any, formatRG: any, formatR: any;
    if (isWebGL2) {
      formatRGBA = getSupportedFormat((gl as any).RGBA16F, gl.RGBA, halfFloatTexType);
      formatRG   = getSupportedFormat((gl as any).RG16F,   (gl as any).RG, halfFloatTexType);
      formatR    = getSupportedFormat((gl as any).R16F,    (gl as any).RED, halfFloatTexType);
    } else {
      formatRGBA = getSupportedFormat(gl.RGBA, gl.RGBA, halfFloatTexType);
      formatRG   = getSupportedFormat(gl.RGBA, gl.RGBA, halfFloatTexType);
      formatR    = getSupportedFormat(gl.RGBA, gl.RGBA, halfFloatTexType);
    }
    if (!supportLinearFiltering) { config.DYE_RESOLUTION = 256; config.SHADING = false; }

    // shaders
    function compileShader(type: number, source: string, keywords?: string[]) {
      let src = keywords ? keywords.map(k => `#define ${k}`).join('\n') + '\n' + source : source;
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      return shader;
    }
    function createProgram(vs: WebGLShader, fs: WebGLShader) {
      const p = gl.createProgram()!;
      gl.attachShader(p, vs); gl.attachShader(p, fs); gl.linkProgram(p);
      return p;
    }
    function getUniforms(program: WebGLProgram) {
      const u: Record<string, WebGLUniformLocation> = {};
      const n = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
      for (let i = 0; i < n; i++) { const name = gl.getActiveUniform(program, i)!.name; u[name] = gl.getUniformLocation(program, name)!; }
      return u;
    }

    const baseVS = compileShader(gl.VERTEX_SHADER, `precision highp float;attribute vec2 aPosition;varying vec2 vUv;varying vec2 vL;varying vec2 vR;varying vec2 vT;varying vec2 vB;uniform vec2 texelSize;void main(){vUv=aPosition*0.5+0.5;vL=vUv-vec2(texelSize.x,0.0);vR=vUv+vec2(texelSize.x,0.0);vT=vUv+vec2(0.0,texelSize.y);vB=vUv-vec2(0.0,texelSize.y);gl_Position=vec4(aPosition,0.0,1.0);}`);
    const copyFS    = compileShader(gl.FRAGMENT_SHADER, `precision mediump float;precision mediump sampler2D;varying highp vec2 vUv;uniform sampler2D uTexture;void main(){gl_FragColor=texture2D(uTexture,vUv);}`);
    const clearFS   = compileShader(gl.FRAGMENT_SHADER, `precision mediump float;precision mediump sampler2D;varying highp vec2 vUv;uniform sampler2D uTexture;uniform float value;void main(){gl_FragColor=value*texture2D(uTexture,vUv);}`);
    const splatFS   = compileShader(gl.FRAGMENT_SHADER, `precision highp float;precision highp sampler2D;varying vec2 vUv;uniform sampler2D uTarget;uniform float aspectRatio;uniform vec3 color;uniform vec2 point;uniform float radius;void main(){vec2 p=vUv-point.xy;p.x*=aspectRatio;vec3 splat=exp(-dot(p,p)/radius)*color;vec3 base=texture2D(uTarget,vUv).xyz;gl_FragColor=vec4(base+splat,1.0);}`);
    const advFS     = compileShader(gl.FRAGMENT_SHADER, `precision highp float;precision highp sampler2D;varying vec2 vUv;uniform sampler2D uVelocity;uniform sampler2D uSource;uniform vec2 texelSize;uniform vec2 dyeTexelSize;uniform float dt;uniform float dissipation;vec4 bilerp(sampler2D sam,vec2 uv,vec2 tsize){vec2 st=uv/tsize-0.5;vec2 iuv=floor(st);vec2 fuv=fract(st);vec4 a=texture2D(sam,(iuv+vec2(0.5,0.5))*tsize);vec4 b=texture2D(sam,(iuv+vec2(1.5,0.5))*tsize);vec4 c=texture2D(sam,(iuv+vec2(0.5,1.5))*tsize);vec4 d=texture2D(sam,(iuv+vec2(1.5,1.5))*tsize);return mix(mix(a,b,fuv.x),mix(c,d,fuv.x),fuv.y);}void main(){#ifdef MANUAL_FILTERING\nvec2 coord=vUv-dt*bilerp(uVelocity,vUv,texelSize).xy*texelSize;vec4 result=bilerp(uSource,coord,dyeTexelSize);#else\nvec2 coord=vUv-dt*texture2D(uVelocity,vUv).xy*texelSize;vec4 result=texture2D(uSource,coord);#endif\nfloat decay=1.0+dissipation*dt;gl_FragColor=result/decay;}`, supportLinearFiltering ? undefined : ['MANUAL_FILTERING']);
    const divFS     = compileShader(gl.FRAGMENT_SHADER, `precision mediump float;precision mediump sampler2D;varying highp vec2 vUv;varying highp vec2 vL;varying highp vec2 vR;varying highp vec2 vT;varying highp vec2 vB;uniform sampler2D uVelocity;void main(){float L=texture2D(uVelocity,vL).x;float R=texture2D(uVelocity,vR).x;float T=texture2D(uVelocity,vT).y;float B=texture2D(uVelocity,vB).y;vec2 C=texture2D(uVelocity,vUv).xy;if(vL.x<0.0){C.x=0.0;L=-C.x;}if(vR.x>1.0){C.x=0.0;R=-C.x;}if(vT.y>1.0){C.y=0.0;T=-C.y;}if(vB.y<0.0){C.y=0.0;B=-C.y;}float div=0.5*(R-L+T-B);gl_FragColor=vec4(div,0.0,0.0,1.0);}`);
    const curlFS    = compileShader(gl.FRAGMENT_SHADER, `precision mediump float;precision mediump sampler2D;varying highp vec2 vUv;varying highp vec2 vL;varying highp vec2 vR;varying highp vec2 vT;varying highp vec2 vB;uniform sampler2D uVelocity;void main(){float L=texture2D(uVelocity,vL).y;float R=texture2D(uVelocity,vR).y;float T=texture2D(uVelocity,vT).x;float B=texture2D(uVelocity,vB).x;float vorticity=R-L-T+B;gl_FragColor=vec4(0.5*vorticity,0.0,0.0,1.0);}`);
    const vortFS    = compileShader(gl.FRAGMENT_SHADER, `precision highp float;precision highp sampler2D;varying vec2 vUv;varying vec2 vL;varying vec2 vR;varying vec2 vT;varying vec2 vB;uniform sampler2D uVelocity;uniform sampler2D uCurl;uniform float curl;uniform float dt;void main(){float L=texture2D(uCurl,vL).x;float R=texture2D(uCurl,vR).x;float T=texture2D(uCurl,vT).x;float B=texture2D(uCurl,vB).x;float C=texture2D(uCurl,vUv).x;vec2 force=0.5*vec2(abs(T)-abs(B),abs(R)-abs(L));force/=length(force)+0.0001;force*=curl*C;force.y*=-1.0;vec2 velocity=texture2D(uVelocity,vUv).xy;velocity+=force*dt;velocity=min(max(velocity,-1000.0),1000.0);gl_FragColor=vec4(velocity,0.0,1.0);}`);
    const pressFS   = compileShader(gl.FRAGMENT_SHADER, `precision mediump float;precision mediump sampler2D;varying highp vec2 vUv;varying highp vec2 vL;varying highp vec2 vR;varying highp vec2 vT;varying highp vec2 vB;uniform sampler2D uPressure;uniform sampler2D uDivergence;void main(){float L=texture2D(uPressure,vL).x;float R=texture2D(uPressure,vR).x;float T=texture2D(uPressure,vT).x;float B=texture2D(uPressure,vB).x;float divergence=texture2D(uDivergence,vUv).x;float pressure=(L+R+B+T-divergence)*0.25;gl_FragColor=vec4(pressure,0.0,0.0,1.0);}`);
    const gradFS    = compileShader(gl.FRAGMENT_SHADER, `precision mediump float;precision mediump sampler2D;varying highp vec2 vUv;varying highp vec2 vL;varying highp vec2 vR;varying highp vec2 vT;varying highp vec2 vB;uniform sampler2D uPressure;uniform sampler2D uVelocity;void main(){float L=texture2D(uPressure,vL).x;float R=texture2D(uPressure,vR).x;float T=texture2D(uPressure,vT).x;float B=texture2D(uPressure,vB).x;vec2 velocity=texture2D(uVelocity,vUv).xy;velocity.xy-=vec2(R-L,T-B);gl_FragColor=vec4(velocity,0.0,1.0);}`);
    const displayFSSrc = `precision highp float;precision highp sampler2D;varying vec2 vUv;varying vec2 vL;varying vec2 vR;varying vec2 vT;varying vec2 vB;uniform sampler2D uTexture;uniform vec2 texelSize;void main(){vec3 c=texture2D(uTexture,vUv).rgb;#ifdef SHADING\nvec3 lc=texture2D(uTexture,vL).rgb;vec3 rc=texture2D(uTexture,vR).rgb;vec3 tc=texture2D(uTexture,vT).rgb;vec3 bc=texture2D(uTexture,vB).rgb;float dx=length(rc)-length(lc);float dy=length(tc)-length(bc);vec3 n=normalize(vec3(dx,dy,length(texelSize)));vec3 l=vec3(0.0,0.0,1.0);float diffuse=clamp(dot(n,l)+0.7,0.7,1.0);c*=diffuse;#endif\nfloat a=max(c.r,max(c.g,c.b));gl_FragColor=vec4(c,a);}`;

    // programs
    const copyProg  = { p: createProgram(baseVS, copyFS),  u: {} as any };
    const clearProg = { p: createProgram(baseVS, clearFS), u: {} as any };
    const splatProg = { p: createProgram(baseVS, splatFS), u: {} as any };
    const advProg   = { p: createProgram(baseVS, advFS),   u: {} as any };
    const divProg   = { p: createProgram(baseVS, divFS),   u: {} as any };
    const curlProg  = { p: createProgram(baseVS, curlFS),  u: {} as any };
    const vortProg  = { p: createProgram(baseVS, vortFS),  u: {} as any };
    const pressProg = { p: createProgram(baseVS, pressFS), u: {} as any };
    const gradProg  = { p: createProgram(baseVS, gradFS),  u: {} as any };
    for (const prog of [copyProg,clearProg,splatProg,advProg,divProg,curlProg,vortProg,pressProg,gradProg]) prog.u = getUniforms(prog.p);

    // display material (supports keywords)
    const displayPrograms: Record<number, { p: WebGLProgram; u: any }> = {};
    function getDisplayProgram() {
      const keywords = config.SHADING ? ['SHADING'] : [];
      let hash = keywords.reduce((h, k) => h + k.split('').reduce((a, c) => a + c.charCodeAt(0), 0), 0);
      if (!displayPrograms[hash]) {
        const fs = compileShader(gl.FRAGMENT_SHADER, displayFSSrc, keywords);
        const p = createProgram(baseVS, fs);
        displayPrograms[hash] = { p, u: getUniforms(p) };
      }
      return displayPrograms[hash];
    }

    // blit quad
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,-1,1,1,1,1,-1]), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0,1,2,0,2,3]), gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);

    function blit(target: any, clear = false) {
      if (target == null) { gl.viewport(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight); gl.bindFramebuffer(gl.FRAMEBUFFER,null); }
      else { gl.viewport(0,0,target.width,target.height); gl.bindFramebuffer(gl.FRAMEBUFFER,target.fbo); }
      if (clear) { gl.clearColor(0,0,0,1); gl.clear(gl.COLOR_BUFFER_BIT); }
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    }

    // FBOs
    function createFBO(w: number, h: number, internalFormat: number, format: number, type: number, param: number) {
      gl.activeTexture(gl.TEXTURE0);
      const texture = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);
      const fbo = gl.createFramebuffer()!;
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
      gl.viewport(0,0,w,h); gl.clear(gl.COLOR_BUFFER_BIT);
      return { texture, fbo, width: w, height: h, texelSizeX: 1/w, texelSizeY: 1/h, attach(id: number) { gl.activeTexture(gl.TEXTURE0+id); gl.bindTexture(gl.TEXTURE_2D, texture); return id; } };
    }
    function createDoubleFBO(w: number, h: number, internalFormat: number, format: number, type: number, param: number) {
      let a = createFBO(w,h,internalFormat,format,type,param), b = createFBO(w,h,internalFormat,format,type,param);
      return { width:w, height:h, texelSizeX:a.texelSizeX, texelSizeY:a.texelSizeY, get read(){return a;}, set read(v){a=v;}, get write(){return b;}, set write(v){b=v;}, swap(){const t=a;a=b;b=t;} };
    }
    function resizeFBO(target: any, w: number, h: number, internalFormat: number, format: number, type: number, param: number) {
      const n = createFBO(w,h,internalFormat,format,type,param);
      gl.useProgram(copyProg.p); gl.uniform1i(copyProg.u.uTexture, target.attach(0)); blit(n); return n;
    }
    function resizeDoubleFBO(target: any, w: number, h: number, internalFormat: number, format: number, type: number, param: number) {
      if (target.width===w && target.height===h) return target;
      target.read = resizeFBO(target.read,w,h,internalFormat,format,type,param);
      target.write = createFBO(w,h,internalFormat,format,type,param);
      target.width=w; target.height=h; target.texelSizeX=1/w; target.texelSizeY=1/h; return target;
    }
    function getResolution(res: number) {
      let w = Math.round(res * canvas.width / canvas.height), h = res;
      if (canvas.width < canvas.height) { w = res; h = Math.round(res * canvas.height / canvas.width); }
      return { width: w, height: h };
    }
    function scaleByPixelRatio(input: number) { return Math.floor(input * (window.devicePixelRatio || 1)); }

    let dye: any, velocity: any, divergence: any, curlFBO: any, pressure: any;
    function initFramebuffers() {
      const simRes = getResolution(config.SIM_RESOLUTION);
      const dyeRes = getResolution(config.DYE_RESOLUTION);
      const type = halfFloatTexType;
      const filtering = supportLinearFiltering ? gl.LINEAR : gl.NEAREST;
      gl.disable(gl.BLEND);
      dye      = dye      ? resizeDoubleFBO(dye,      dyeRes.width, dyeRes.height, formatRGBA.internalFormat, formatRGBA.format, type, filtering) : createDoubleFBO(dyeRes.width, dyeRes.height, formatRGBA.internalFormat, formatRGBA.format, type, filtering);
      velocity = velocity ? resizeDoubleFBO(velocity, simRes.width, simRes.height, formatRG.internalFormat,   formatRG.format,   type, filtering) : createDoubleFBO(simRes.width, simRes.height, formatRG.internalFormat,   formatRG.format,   type, filtering);
      divergence = createFBO(simRes.width, simRes.height, formatR.internalFormat, formatR.format, type, gl.NEAREST);
      curlFBO    = createFBO(simRes.width, simRes.height, formatR.internalFormat, formatR.format, type, gl.NEAREST);
      pressure   = createDoubleFBO(simRes.width, simRes.height, formatR.internalFormat, formatR.format, type, gl.NEAREST);
    }
    initFramebuffers();

    // color helpers
    function HSVtoRGB(h: number, s: number, v: number) {
      const i = Math.floor(h*6), f = h*6-i, p = v*(1-s), q = v*(1-f*s), t = v*(1-(1-f)*s);
      switch(i%6){ case 0:return{r:v,g:t,b:p}; case 1:return{r:q,g:v,b:p}; case 2:return{r:p,g:v,b:t}; case 3:return{r:p,g:q,b:v}; case 4:return{r:t,g:p,b:v}; default:return{r:v,g:p,b:q}; }
    }
    function generateColor() { const c = HSVtoRGB(Math.random(),1,1); return { r:c.r*0.15, g:c.g*0.15, b:c.b*0.15 }; }
    function wrap(v: number, min: number, max: number) { const r=max-min; return r===0?min:v-r*Math.floor((v-min)/r); }
    function correctRadius(r: number) { const ar=canvas.width/canvas.height; return ar>1?r*ar:r; }
    function correctDeltaX(d: number) { const ar=canvas.width/canvas.height; return ar<1?d*ar:d; }
    function correctDeltaY(d: number) { const ar=canvas.width/canvas.height; return ar>1?d/ar:d; }

    function splat(x: number, y: number, dx: number, dy: number, color: any) {
      gl.useProgram(splatProg.p);
      gl.uniform1i(splatProg.u.uTarget, velocity.read.attach(0));
      gl.uniform1f(splatProg.u.aspectRatio, canvas.width/canvas.height);
      gl.uniform2f(splatProg.u.point, x, y);
      gl.uniform3f(splatProg.u.color, dx, dy, 0);
      gl.uniform1f(splatProg.u.radius, correctRadius(config.SPLAT_RADIUS/100));
      blit(velocity.write); velocity.swap();
      gl.uniform1i(splatProg.u.uTarget, dye.read.attach(0));
      gl.uniform3f(splatProg.u.color, color.r, color.g, color.b);
      blit(dye.write); dye.swap();
    }
    function splatPointer(p: any) { splat(p.texcoordX, p.texcoordY, p.deltaX*config.SPLAT_FORCE, p.deltaY*config.SPLAT_FORCE, p.color); }

    function step(dt: number) {
      gl.disable(gl.BLEND);
      gl.useProgram(curlProg.p); gl.uniform2f(curlProg.u.texelSize,velocity.texelSizeX,velocity.texelSizeY); gl.uniform1i(curlProg.u.uVelocity,velocity.read.attach(0)); blit(curlFBO);
      gl.useProgram(vortProg.p); gl.uniform2f(vortProg.u.texelSize,velocity.texelSizeX,velocity.texelSizeY); gl.uniform1i(vortProg.u.uVelocity,velocity.read.attach(0)); gl.uniform1i(vortProg.u.uCurl,curlFBO.attach(1)); gl.uniform1f(vortProg.u.curl,config.CURL); gl.uniform1f(vortProg.u.dt,dt); blit(velocity.write); velocity.swap();
      gl.useProgram(divProg.p); gl.uniform2f(divProg.u.texelSize,velocity.texelSizeX,velocity.texelSizeY); gl.uniform1i(divProg.u.uVelocity,velocity.read.attach(0)); blit(divergence);
      gl.useProgram(clearProg.p); gl.uniform1i(clearProg.u.uTexture,pressure.read.attach(0)); gl.uniform1f(clearProg.u.value,config.PRESSURE); blit(pressure.write); pressure.swap();
      gl.useProgram(pressProg.p); gl.uniform2f(pressProg.u.texelSize,velocity.texelSizeX,velocity.texelSizeY); gl.uniform1i(pressProg.u.uDivergence,divergence.attach(0));
      for(let i=0;i<config.PRESSURE_ITERATIONS;i++){ gl.uniform1i(pressProg.u.uPressure,pressure.read.attach(1)); blit(pressure.write); pressure.swap(); }
      gl.useProgram(gradProg.p); gl.uniform2f(gradProg.u.texelSize,velocity.texelSizeX,velocity.texelSizeY); gl.uniform1i(gradProg.u.uPressure,pressure.read.attach(0)); gl.uniform1i(gradProg.u.uVelocity,velocity.read.attach(1)); blit(velocity.write); velocity.swap();
      gl.useProgram(advProg.p); gl.uniform2f(advProg.u.texelSize,velocity.texelSizeX,velocity.texelSizeY);
      if(!supportLinearFiltering) gl.uniform2f(advProg.u.dyeTexelSize,velocity.texelSizeX,velocity.texelSizeY);
      const vid=velocity.read.attach(0); gl.uniform1i(advProg.u.uVelocity,vid); gl.uniform1i(advProg.u.uSource,vid); gl.uniform1f(advProg.u.dt,dt); gl.uniform1f(advProg.u.dissipation,config.VELOCITY_DISSIPATION); blit(velocity.write); velocity.swap();
      if(!supportLinearFiltering) gl.uniform2f(advProg.u.dyeTexelSize,dye.texelSizeX,dye.texelSizeY);
      gl.uniform1i(advProg.u.uVelocity,velocity.read.attach(0)); gl.uniform1i(advProg.u.uSource,dye.read.attach(1)); gl.uniform1f(advProg.u.dissipation,config.DENSITY_DISSIPATION); blit(dye.write); dye.swap();
    }

    function render() {
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); gl.enable(gl.BLEND);
      const disp = getDisplayProgram();
      gl.useProgram(disp.p);
      if(config.SHADING) gl.uniform2f(disp.u.texelSize, 1/gl.drawingBufferWidth, 1/gl.drawingBufferHeight);
      gl.uniform1i(disp.u.uTexture, dye.read.attach(0));
      blit(null);
    }

    let lastTime = Date.now(), colorTimer = 0;
    function update() {
      if (!isActive) return;
      const now = Date.now(), dt = Math.min((now-lastTime)/1000, 0.016666); lastTime = now;
      colorTimer += dt * config.COLOR_UPDATE_SPEED;
      if (colorTimer >= 1) { colorTimer = wrap(colorTimer,0,1); pointers.forEach(p => { p.color = generateColor(); }); }
      pointers.forEach(p => { if(p.moved){ p.moved=false; splatPointer(p); } });
      const w = scaleByPixelRatio(canvas.clientWidth), h = scaleByPixelRatio(canvas.clientHeight);
      if (canvas.width!==w||canvas.height!==h) { canvas.width=w; canvas.height=h; initFramebuffers(); }
      step(dt); render();
      animId = requestAnimationFrame(update);
    }
    animId = requestAnimationFrame(update);

    // events
    function getPointer(id: number) { return pointers.find(p=>p.id===id) || (() => { const p=makePointer(); pointers.push(p); return p; })(); }
    function onMouseDown(e: MouseEvent) { const p=pointers[0]; p.id=0; p.down=true; p.moved=false; p.texcoordX=e.clientX/canvas.width; p.texcoordY=1-e.clientY/canvas.height; p.prevTexcoordX=p.texcoordX; p.prevTexcoordY=p.texcoordY; p.deltaX=0; p.deltaY=0; p.color=generateColor(); const c=p.color; c.r*=10;c.g*=10;c.b*=10; splat(p.texcoordX,p.texcoordY,10*(Math.random()-0.5),30*(Math.random()-0.5),c); }
    function onMouseMove(e: MouseEvent) { const p=pointers[0]; if(!p.down) return; p.prevTexcoordX=p.texcoordX; p.prevTexcoordY=p.texcoordY; p.texcoordX=e.clientX/canvas.width; p.texcoordY=1-e.clientY/canvas.height; p.deltaX=correctDeltaX(p.texcoordX-p.prevTexcoordX); p.deltaY=correctDeltaY(p.texcoordY-p.prevTexcoordY); p.moved=Math.abs(p.deltaX)>0||Math.abs(p.deltaY)>0; }
    function onMouseUp() { pointers[0].down=false; }
    function onTouchStart(e: TouchEvent) { e.preventDefault(); for(const t of Array.from(e.changedTouches)){ const p=getPointer(t.identifier); p.id=t.identifier; p.down=true; p.texcoordX=t.clientX/canvas.width; p.texcoordY=1-t.clientY/canvas.height; p.prevTexcoordX=p.texcoordX; p.prevTexcoordY=p.texcoordY; p.deltaX=0; p.deltaY=0; p.color=generateColor(); const c={...p.color}; c.r*=10;c.g*=10;c.b*=10; splat(p.texcoordX,p.texcoordY,10*(Math.random()-0.5),30*(Math.random()-0.5),c); } }
    function onTouchMove(e: TouchEvent) { e.preventDefault(); for(const t of Array.from(e.changedTouches)){ const p=getPointer(t.identifier); p.prevTexcoordX=p.texcoordX; p.prevTexcoordY=p.texcoordY; p.texcoordX=t.clientX/canvas.width; p.texcoordY=1-t.clientY/canvas.height; p.deltaX=correctDeltaX(p.texcoordX-p.prevTexcoordX); p.deltaY=correctDeltaY(p.texcoordY-p.prevTexcoordY); p.moved=Math.abs(p.deltaX)>0||Math.abs(p.deltaY)>0; } }
    function onTouchEnd(e: TouchEvent) { for(const t of Array.from(e.changedTouches)){ const p=getPointer(t.identifier); p.down=false; } }

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd);

    return () => {
      isActive = false;
      cancelAnimationFrame(animId);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'auto' }}
    />
  );
}
