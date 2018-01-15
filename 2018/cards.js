const cards=["hellocon.html","submit.html","location.html","coc.html"];async function main(){loadcss("cards.css");const toBehtml=importhtml("cards.html"),cardtemplates=await toBehtml,mastercard=$(".mastercard",cardtemplates).content.children[0];fetchCards(cards).map(parseHtml).map(card=>plugintemplate(card,mastercard)).forEach(card=>listenExpandcard(card)).forEach(globalHandler.addTOC).forEach(globalHandler.addcard)}main();function attachnewcard(mastercard){const newcardmodel=mastercard.cloneNode(!0);cardeditable(newcardmodel,mastercard),listenExpandcard(newcardmodel),globalHandler.addcard(newcardmodel)}function fetchCards(cardmds){return new Promises(cardmds.map(card=>fetch("cards/"+card).then(res=>res.text())))}function plugintemplate(card,mastercard){const target=mastercard.cloneNode(!0),[h2,brief,pimg,...details]=card.children,img=pimg.firstElementChild,thumb=$(".thumbnail",target);$$("iframe",card).forEach(hideiframe),Object.assign($(".cardtitle",target),{textContent:h2.textContent,id:h2.id}),removeAllChildren(thumb),img.setAttribute("crossOrigin","anonymous"),thumb.appendChild(img),$(".brief",target).innerHTML=brief.innerHTML;const detailsTarget=$(".details",target);return removeAllChildren(detailsTarget),details.forEach(d=>detailsTarget.appendChild(d)),target.style.maxHeight=(.9*innerHeight).toString()+"px",target}function listenExpandcard(card){const expand=$(".expand",card),ObsCardTransition=Rx.Observable.fromEvent(card,"transitionend",{passive:!0}).debounceTime(5);return expand.subscribe("click",ev=>{const iframes=$$("iframe",card);mobile||iframes.forEach(showiframe),requestAnimationFrame(()=>{card.classList.toggle("expanded"),mobile||ObsCardTransition.first().subscribe(()=>{ev.target.parentNode.scrollIntoView({behavior:"smooth"})})})})}function cardeditable(card,mastercard){const title=$(".cardtitle",card),brief=$(".brief",card),details=$(".details",card),thumbnail=$(".thumbnail",card),cardcontent=$(".card-content",card);thumbnail.dataset.url=$("img",thumbnail)?$("img",thumbnail).src:"",makeeditable(title,brief,details);let previd=titletoid(title.textContent);cardcontent.onclick=(async()=>{if(!card.classList.contains("editing")){const edited=await enterediting(card);edited?(console.log(edited),card.classList.contains("reviewing")?globalHandler.redirectTOC(previd,card):(requestAnimationFrame(()=>{requestAnimationFrame(()=>{alert("Thank you! We will review your card, but you can preview it in place now.")})}),globalHandler.addTOC(card),attachnewcard(mastercard)),previd=title.id,requestAnimationFrame(()=>{card.classList.add("reviewing")})):cardeditable(card,mastercard)}})}function titletoid(title){return title.toLowerCase().replace(/\s/g,"")}async function enterediting(card){const doneEditingflag=new Awaiter;console.log("entering editing mode",card),requestAnimationFrame(()=>card.classList.add("editing"));const cardtitle=$(".cardtitle",card),cardcontent=$(".card-content",card),cardbackup=cardcontent.cloneNode(!0),label=$("label",cardcontent),imgfileupload=$('input[type="file"]',cardcontent),imglinkinput=$('input[name="imglink"]',cardcontent),done=$(".done",card),cancel=$(".cancel",card),imgcontainer=$(".thumbnail",cardcontent);let thumbnailurl=imgcontainer.dataset.url||"";function changeThumbnail(url){thumbnailurl=url,requestAnimationFrame(()=>{imgcontainer.style.backgroundImage=`url(${url})`,imgcontainer.dataset.url=url,imgcontainer.classList.add("dragover")})}const listenenter=imgcontainer.subscribe("dragenter",ev=>{ev.preventDefault(),console.log("dragenter"),requestAnimationFrame(()=>{imgcontainer.classList.add("dragover")}),setTimeout(()=>{imgcontainer.ondragleave=(ev=>{console.log("dragleave"),ev.preventDefault(),requestAnimationFrame(()=>{imgcontainer.classList.remove("dragover"),imgcontainer.ondragleave=null})})},100)}),listendragover=imgcontainer.subscribe("dragover",ev=>ev.preventDefault()),litendrop=imgcontainer.subscribe("drop",async ev=>{ev.preventDefault();const imgurl=await processimginput(ev.dataTransfer);imgurl&&changeThumbnail(imgurl)}),listenmodifyimg=imgcontainer.subscribe("click",ev=>{requestAnimationFrame(()=>imgcontainer.classList.remove("dragover"))}),labelclick=label.subscribe("click",()=>{imgfileupload.click()}),listenfile=imgfileupload.subscribe("change",async ev=>{const file=ev.target.files[0];isImgfile(file)&&changeThumbnail(await blobtoUrl(file))}),listenpastelink=imglinkinput.subscribe("input",async ev=>{const link=ev.target.value;await isImgLinkValid(link)&&changeThumbnail(link)});done.onclick=(ev=>{ev.stopPropagation(),done.onclick=null;const carddata={title:$("h2",cardcontent).textContent,brief:$(".brief",cardcontent).innerHTML,details:$(".details",cardcontent).innerHTML,thumbnailurl:thumbnailurl};cardtitle.id=titletoid(cardtitle.textContent),doneEditingflag.done(carddata)}),cancel.onclick=(ev=>{ev.stopPropagation(),cancel.onclick=null,card.replaceChild(cardbackup,cardcontent),doneEditingflag.done(!1)});const result=await doneEditingflag.promise;return card.classList.remove("editing"),[listenenter,listendragover,litendrop,listenmodifyimg,labelclick,listenfile,listenpastelink].forEach(listener=>listener.unsubscribe()),result}async function processimginput(dataTransfer){const types=dataTransfer.types;if(console.log(types),types.includes("Files")){const file=dataTransfer.files[0];return isImgfile(file)?await blobtoUrl(file):null}if(types.includes("text/uri-list")){const link=dataTransfer.getData("text/uri-list");return await isImgLinkValid(link)?link:null}return null}function isImgfile(file){return file.type.includes("image")}function isImgLinkValid(url){return url.length>10&&fetch(url).then(res=>res.ok).catch(()=>!1)}