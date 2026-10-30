(function () {
  "use strict";
  var one=function(s,r){return (r||document).querySelector(s);};
  var all=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));};
  var reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function activateByKeyboard(el,fn){el.addEventListener("click",fn);el.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();fn(e);}});}
  function choose(items,item){items.forEach(function(x){x.classList.toggle("is-focused",x===item);x.setAttribute("aria-pressed",String(x===item));});}
  function makeSelectable(items,fn){items.forEach(function(item){item.setAttribute("role","button");item.setAttribute("tabindex","0");item.setAttribute("aria-pressed","false");activateByKeyboard(item,function(){choose(items,item);if(fn)fn(item,items.indexOf(item));});});}

  // 1 · O recife acompanha o cursor em paralaxe.
  var cover=one("#imersao");
  if(cover){cover.addEventListener("pointermove",function(e){var r=cover.getBoundingClientRect();cover.style.setProperty("--mouse-x",(((e.clientX-r.left)/r.width)-.5)*-20+"px");cover.style.setProperty("--mouse-y",(((e.clientY-r.top)/r.height)-.5)*-14+"px");cover.classList.add("mouse-active");});cover.addEventListener("pointerleave",function(){cover.classList.remove("mouse-active");});}

  // 2 · Lupa acompanha o cursor; áreas destacam a descrição correspondente.
  var fish=one("#definicao .fish-profile"),topics=all("#definicao .sequence-items .stage-item");
  if(fish){
    var photo=one("img",fish),lens=document.createElement("span"),lensImage=document.createElement("img"),pointerX=0,pointerY=0,scheduled=0;
    var finZones=[[[.24,.16],[.38,.14],[.40,.36],[.40,.62],[.30,.66],[.27,.46]],[[.37,.12],[.47,.12],[.49,.29],[.41,.35]]];
    var gillZone=[[.35,.44],[.49,.44],[.50,.72],[.43,.77],[.35,.70]];
    var fishZones=[[[.58,.02],[.98,.02],[.98,.31],[.82,.36],[.62,.31],[.55,.20]],[[.48,.39],[.99,.37],[.99,.96],[.76,.99],[.52,.88],[.42,.68]]];
    lens.className="fish-focus-ring";lens.setAttribute("aria-hidden","true");lensImage.src=photo.currentSrc||photo.src;lensImage.alt="";lensImage.draggable=false;lens.hidden=true;lens.appendChild(lensImage);fish.appendChild(lens);
    function inPolygon(x,y,points){var inside=false;for(var a=0,b=points.length-1;a<points.length;b=a++){var xa=points[a][0],ya=points[a][1],xb=points[b][0],yb=points[b][1],cross=((ya>y)!==(yb>y))&&(x<(xb-xa)*(y-ya)/(yb-ya)+xa);if(cross)inside=!inside;}return inside;}
    function clearTopic(){delete fish.dataset.focus;topics.forEach(function(t){t.classList.remove("is-focused");});}
    function updateHover(){
      scheduled=0;
      var frame=fish.getBoundingClientRect(),left=frame.left+photo.offsetLeft,top=frame.top+photo.offsetTop,w=photo.offsetWidth,h=photo.offsetHeight,nw=photo.naturalWidth,nh=photo.naturalHeight;
      if(!w||!h||!nw||!nh){lens.hidden=true;clearTopic();return;}
      var fit=Math.min(w/nw,h/nh),drawW=nw*fit,drawH=nh*fit,contentLeft=left+(w-drawW)/2,contentTop=top+(h-drawH)/2;
      var localX=pointerX-contentLeft,localY=pointerY-contentTop;
      if(localX<0||localX>drawW||localY<0||localY>drawH){lens.hidden=true;clearTopic();return;}
      lens.hidden=false;
      var radius=lens.clientWidth/2,zoom=2.6;
      var lensLeft=Math.max(radius,Math.min(fish.clientWidth-radius,pointerX-frame.left-fish.clientLeft)),lensTop=pointerY-frame.top-fish.clientTop-5;lens.style.left=lensLeft+"px";lens.style.top=lensTop+"px";
      lensImage.style.width=(drawW*zoom)+"px";lensImage.style.height=(drawH*zoom)+"px";
      lensImage.style.left=(radius-localX*zoom)+"px";lensImage.style.top=(radius-localY*zoom)+"px";
      var x=localX/drawW,y=localY/drawH;
      var inGills=inPolygon(x,y,gillZone),inFins=finZones.some(function(zone){return inPolygon(x,y,zone);});
      var inFish=fishZones.some(function(zone){return inPolygon(x,y,zone);}),topic=inGills?1:(inFins?2:(inFish?0:-1));
      if(topic<0){clearTopic();return;}
      fish.dataset.focus=String(topic+1);topics.forEach(function(item,index){item.classList.toggle("is-focused",index===topic);});
    }
    fish.addEventListener("pointerenter",function(e){pointerX=e.clientX;pointerY=e.clientY;if(!scheduled)scheduled=requestAnimationFrame(updateHover);});
    fish.addEventListener("pointermove",function(e){pointerX=e.clientX;pointerY=e.clientY;if(!scheduled)scheduled=requestAnimationFrame(updateHover);});
    fish.addEventListener("pointerleave",function(){if(scheduled){cancelAnimationFrame(scheduled);scheduled=0;}lens.hidden=true;clearTopic();});
  }
  // 3 · Cada imagem cresce ao entrar nela e as outras recuam.
  var diversity=one("#diversidade .mosaic-grid"),diversityCards=all("#diversidade .mosaic-grid figure");
  diversityCards.forEach(function(card,i){card.addEventListener("pointerenter",function(){diversity.dataset.species=String(i+1);});});
  if(diversity)diversity.addEventListener("pointerleave",function(){delete diversity.dataset.species;});

  // 4 · Selecionar linhagem ilumina seu ramo a partir da origem.
  var tree=one("#evolucao .evo-tree"),branches=all("#evolucao .evo-branches article"),exampleSets=all("#evolucao .evo-example-set"),examplePrompt=one("#evolucao .evo-examples-prompt");
  makeSelectable(branches,function(item,i){tree.dataset.lineage=String(i+1);if(examplePrompt)examplePrompt.hidden=true;exampleSets.forEach(function(set){set.hidden=set.dataset.example!==String(i+1);});});
  // 5 · Comparar grupos revela um esquema do tipo de esqueleto.
  var groupCards=all("#classificacao .class-branch"),groupTree=one("#classificacao .class-tree");
  var anatomical=[
    {src:"https://commons.wikimedia.org/wiki/Special:FilePath/Lamprey_skeleton_lateral_view.jpg?width=1200",alt:"Esqueleto real de lampreia, vista lateral",label:"ESQUELETO DE LAMPREIA"},
    {src:"https://commons.wikimedia.org/wiki/Special:FilePath/Esqueleto_de_tubar%C3%A3o.png?width=1200",alt:"Ilustração anatômica do esqueleto de tubarão",label:"ESQUELETO CARTILAGINOSO"},
    {src:"https://commons.wikimedia.org/wiki/Special:FilePath/Fischskelett-drawing.jpg?width=1600",alt:"Desenho nítido do esqueleto de uma perca, com ossos e nadadeiras numerados",label:"ESQUELETO ÓSSEO · PERCA"}
  ];
  groupCards.forEach(function(card,i){var overlay=document.createElement("div"),data=anatomical[i];overlay.className="group-skeleton";var image=document.createElement("img");image.src=data.src;image.alt=data.alt;image.loading="lazy";var label=document.createElement("span");label.textContent=data.label;overlay.appendChild(image);overlay.appendChild(label);card.appendChild(overlay);});
  makeSelectable(groupCards,function(item,i){groupTree.dataset.group=String(i+1);});

  // 6 · Arrastar o peixe entre os habitats altera o cenário selecionado.
  var habitatRow=one("#habitats .habitat-row"),habitats=all("#habitats .habitat-card"),specimen=one("#habitats .habitat-specimen");
  if(habitatRow&&specimen){var token=document.createElement("button");token.type="button";token.className="habitat-fish";token.setAttribute("aria-label","Arraste o peixe para escolher um ambiente");token.innerHTML='<svg viewBox="0 0 100 60" aria-hidden="true"><path d="M12 30C27 8 61 8 78 30 61 52 27 52 12 30Zm66 0 18-17v34L78 30Z"/><circle cx="30" cy="25" r="3"/></svg>';habitatRow.appendChild(token);var dragging=false;
    var representatives=[
      {src:"https://commons.wikimedia.org/wiki/Special:FilePath/Arapaima_gigas_at_National_Zoo.jpg?width=1200",alt:"Pirarucu, peixe de rios amazônicos",name:"Pirarucu",place:"Rios amazônicos"},
      {src:"https://www.noaa.gov/sites/default/files/styles/sc_800x450/public/legacy/image/2019/Jun/PHOTO-Chlorurus-microrhinos-KevinLino-Kingman-NOAA-112916-4000x2248-original.jpg?itok=xlFuT9MS",alt:"Peixe-papagaio em recife tropical",name:"Peixe-papagaio",place:"Recifes tropicais"},
      {src:"https://www.noaa.gov/sites/default/files/styles/landscape_width_1275/public/2024-09/20231010-black-seadevil-anglerfish-1000.jpg?h=f5dc67b8&itok=duQ7Hz1W",alt:"Peixe-diabo-negro das águas profundas",name:"Peixe-diabo-negro",place:"Águas profundas"}
    ];
    function restoreHabitats(){habitatRow.classList.remove("habitat-chosen");delete habitatRow.dataset.habitat;habitats.forEach(function(h){h.classList.remove("habitat-target","habitat-ripple");});specimen.hidden=true;token.style.left="50%";token.style.top="-34px";}
    function selectHabitat(card){if(!card)return;var i=habitats.indexOf(card),data=representatives[i];if(!data)return;habitats.forEach(function(h){h.classList.toggle("habitat-target",h===card);});habitatRow.dataset.habitat=String(i+1);habitatRow.classList.add("habitat-chosen");var image=one("img",specimen);image.src=data.src;image.alt=data.alt;one("strong",specimen).textContent=data.name;one("small",specimen).textContent=data.place;specimen.hidden=false;}
    token.addEventListener("pointerdown",function(e){if(habitatRow.classList.contains("habitat-chosen"))restoreHabitats();dragging=true;token.setPointerCapture(e.pointerId);token.classList.add("is-dragging");e.preventDefault();});
    token.addEventListener("pointermove",function(e){if(!dragging)return;var r=habitatRow.getBoundingClientRect();token.style.left=(e.clientX-r.left)+"px";token.style.top=(e.clientY-r.top)+"px";});
    token.addEventListener("pointerup",function(e){if(!dragging)return;dragging=false;token.classList.remove("is-dragging");token.style.pointerEvents="none";var target=document.elementFromPoint(e.clientX,e.clientY),card=target&&target.closest(".habitat-card");token.style.pointerEvents="";selectHabitat(card);if(!card){token.style.left="50%";token.style.top="-34px";}});
    token.addEventListener("pointercancel",function(){dragging=false;token.classList.remove("is-dragging");token.style.left="50%";token.style.top="-34px";});
  }

  // 7 · Clicar em um marcador amplia aquela região da anatomia.
  var anatomyFigure=one("#anatomia .anatomy-figure"),anatomyPhoto=one("#anatomia .anatomy-figure img"),anatomyPoints=all("#anatomia .anatomy-point"),anatomyZoom=one("#anatomia .anatomy-zoom"),anatomyZoomPhoto=one("img",anatomyZoom);
  anatomyPoints.forEach(function(point,i){point.addEventListener("click",function(){anatomyPoints.forEach(function(p){p.classList.toggle("selected",p===point);});if(!anatomyFigure||!anatomyPhoto||!anatomyZoom||!anatomyZoomPhoto)return;var marker=point.getBoundingClientRect(),image=anatomyPhoto.getBoundingClientRect(),sourceRatio=anatomyPhoto.naturalWidth/anatomyPhoto.naturalHeight,boxRatio=image.width/image.height,sourceW=boxRatio>sourceRatio?image.height*sourceRatio:image.width,sourceH=boxRatio>sourceRatio?image.height:image.width/sourceRatio,sourceX=image.left+(image.width-sourceW)/2,sourceY=image.top+(image.height-sourceH)/2,u=Math.max(0,Math.min(1,(marker.left+marker.width/2-sourceX)/sourceW)),v=Math.max(0,Math.min(1,(marker.top+marker.height/2-sourceY)/sourceH));if(i===1){u=.18;v=.50;}else if(i===2){u=Math.min(1,u+.10);v=Math.max(0,v-.08);}delete anatomyZoomPhoto.dataset.centerFocus;anatomyZoomPhoto.style.removeProperty("--centered-anatomy-transform");var zoomBox=anatomyZoom.getBoundingClientRect(),zoomRatio=zoomBox.width/zoomBox.height,zoomW=zoomRatio>sourceRatio?zoomBox.height*sourceRatio:zoomBox.width,zoomH=zoomRatio>sourceRatio?zoomBox.height:zoomBox.width/sourceRatio,originX=((zoomBox.width-zoomW)/2+u*zoomW)/zoomBox.width,originY=((zoomBox.height-zoomH)/2+v*zoomH)/zoomBox.height;anatomyZoom.dataset.focus=String(i+1);anatomyZoomPhoto.style.transformOrigin=(originX*100)+"% "+(originY*100)+"%";});});

  // 8 · Os cartões têm somente um destaque simples ao passar o cursor.

  // 9 · Cliques fazem a energia percorrer os conectores da teia.
  var foodweb=one("#ecossistema .foodweb"),foodNodes=all("#ecossistema .web-node"),links=all("#ecossistema .web-links");
  makeSelectable(foodNodes,function(item,i){foodweb.dataset.activeLevel=String(i+1);links.forEach(function(link){link.classList.remove("flowing");void link.offsetWidth;link.classList.add("flowing");});});

  // 10 · Escolher ameaça aplica sua marca visual sobre o ambiente.
  var threatDetails=one("#ameacas .threat-detail"),threats=all("#ameacas .threat-list>div");
  var threatCopy=[["Sobrepesca","A captura acima da reposição natural reduz populações e pode desequilibrar as relações no ecossistema."],["Captura incidental","Redes e outros equipamentos podem capturar espécies que não eram o alvo, incluindo juvenis e animais ameaçados."],["Poluição","Plásticos, óleo e contaminantes degradam a água e podem ferir, intoxicar ou ser ingeridos pelos peixes."],["Destruição de habitats","A degradação de manguezais, recifes e áreas de reprodução remove abrigo, alimento e locais de crescimento."]];
  makeSelectable(threats,function(item,i){if(threatDetails){one("h3",threatDetails).textContent=threatCopy[i][0];one("p",threatDetails).textContent=threatCopy[i][1];}});

  // 11 · Comparador arrastável já existente, preservado.
  var compare=one("#consequencias .compare-frames"),divider=one("#consequencias .compare-divider");
  if(compare&&divider){divider.setAttribute("role","slider");divider.setAttribute("aria-label","Arraste para comparar os ambientes");divider.setAttribute("tabindex","0");divider.style.cursor="col-resize";divider.style.touchAction="none";var draggingCompare=false;
    function moveCompare(e){if(!draggingCompare)return;var r=compare.getBoundingClientRect(),ratio=Math.max(.28,Math.min(.72,(e.clientX-r.left)/r.width));compare.style.gridTemplateColumns=(ratio*100)+"fr "+((1-ratio)*100)+"fr";divider.style.left="calc("+(ratio*100)+"% - 24px)";divider.setAttribute("aria-valuenow",String(Math.round(ratio*100)));}
    divider.addEventListener("pointerdown",function(e){draggingCompare=true;divider.setPointerCapture(e.pointerId);moveCompare(e);e.preventDefault();});divider.addEventListener("pointermove",moveCompare);divider.addEventListener("pointerup",function(){draggingCompare=false;});divider.addEventListener("pointercancel",function(){draggingCompare=false;});
  }

  // 12 · O Sketchfab mantém rotação nativa pelo ponteiro.
  // 13 · Os fatos alternam entre distribuição, risco, captura e declínio.
  var statusPhoto=one("#estado .status-photo"),statusFacts=all("#estado .status-facts article");
  makeSelectable(statusFacts,function(item,i){statusPhoto.dataset.view=String(i+1);});

  // 14 · Selecionar medida cria uma camada visual de proteção do habitat.
  var preserveCards=all("#preservar .preserve-card"),preserveDetails=one("#preservar .preserve-details");
  var preserveExamples=[
    {axis:"HABITATS",title:"ProManguezal",facts:["Instituído pelo Decreto nº 12.045/2024 para conservar, recuperar e promover o uso sustentável dos manguezais brasileiros.","O mapeamento associado ao programa identificou 1.229.644 hectares de manguezais no Brasil."],sources:[["MMA · ProManguezal","https://www.gov.br/mma/pt-br/composicao/smc/programa-nacional-de-conservacao-e-uso-sustentavel-dos-manguezais-do-brasil-promanguezal"]]},
    {axis:"PESCA",title:"Defeso e PesqBrasil",facts:["O defeso da anchova no litoral Sul (PR, SC e RS) ocorre de 1º de dezembro a 31 de março, protegendo o período reprodutivo.","O PesqBrasil – Mapa de Bordo registra esforço e captura; tornou-se obrigatório para embarcações abrangidas em janeiro de 2024."],sources:[["Ibama · Defesos marinhos","https://www.gov.br/ibama/pt-br/assuntos/biodiversidade/biodiversidade-aquatica/periodos-de-defeso/defesos-marinhos"],["MPA · Monitoramento Pesqueiro","https://www.gov.br/mpa/pt-br/acesso-a-informacao/acoes-e-programas-1/acoes-programas-e-projetos-do-mpa-1/monitoramento-pesqueiro"]]},
    {axis:"CIÊNCIA",title:"Programa Monitora · ICMBio",facts:["Acompanha biodiversidade em mais de 130 Unidades de Conservação Federais.","Inclui os subprogramas Aquático Continental e Marinho e Costeiro; os dados apoiam avaliação e manejo da conservação."],sources:[["ICMBio · Programa Monitora","https://www.gov.br/icmbio/pt-br/assuntos/monitoramento"]]}
  ];
  preserveCards.forEach(function(card,i){card.setAttribute("role","button");card.setAttribute("tabindex","0");card.setAttribute("aria-pressed","false");function showEvidence(){var data=preserveExamples[i];if(!preserveDetails)return;one("span",preserveDetails).textContent=data.axis;one("h3",preserveDetails).textContent=data.title;var list=one("ul",preserveDetails);list.innerHTML="";data.facts.forEach(function(copy){var li=document.createElement("li");li.textContent=copy;list.appendChild(li);});var sources=one(".preserve-sources",preserveDetails);sources.innerHTML="";data.sources.forEach(function(source){var link=document.createElement("a");link.href=source[1];link.textContent=source[0];link.target="_blank";link.rel="noopener";sources.appendChild(link);});preserveDetails.hidden=false;}activateByKeyboard(card,showEvidence);});

  // 15 - cada atitude transforma uma parte do ambiente demonstrativo.
  var actionScene=one("#acao .scene-content"),actionCards=all("#acao .action-cards article"),actionStage=one("#acao .project-materials");
  for(var layer=1;layer<=3;layer++){var visual=document.createElement("i");visual.className="action-layer action-layer-"+layer;visual.setAttribute("aria-hidden","true");actionStage.appendChild(visual);}
  actionCards.forEach(function(card,i){card.setAttribute("role","button");card.setAttribute("tabindex","0");card.setAttribute("aria-pressed","false");activateByKeyboard(card,function(){var done=!card.classList.contains("action-done");card.classList.toggle("action-done",done);card.setAttribute("aria-pressed",String(done));var visual=one(".action-layer-"+(i+1),actionStage);if(visual)visual.classList.toggle("on",done);var chosen=actionCards.map(function(c,n){return c.classList.contains("action-done")?String(n+1):null;}).filter(Boolean);if(chosen.length)actionScene.dataset.actions=chosen.join(" ");else delete actionScene.dataset.actions;});});
  // 16 · O brilho percorre a mensagem sem depender do cursor.
  
})();








