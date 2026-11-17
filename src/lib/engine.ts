// @ts-nocheck
import { claimEvidence, RELEASE_ID } from './provenance';
/**
 * BorderCover Atlas evidence comparison engine v2.0.
 * Pure functions: accepts the published evidence dataset and a user's selected scenario.
 * Does not assert approval of an individual claim or validate any current policy schedule.
 */
export const HOME_DEFAULT = {uk:'fr',ie:'fr',us:'ca',ca:'us',au:'nz',nz:'au'};
const EUROPE = new Set(['eu','eea','europe','other-europe']);
const ASIA_AFRICA = new Set(['asia','africa']);
const fullLabel = (level) => ({same:'Published equivalent policy cover — conditions apply',minimum:'Minimum compulsory / third-party liability',liability:'Insurer publishes liability; other cover unverified',excluded:'Published exclusion / separate insurance needed',unknown:'Not verified for this policy and country'})[level] || 'Review policy';

export function tripDates(input){
 const parse=(value)=>{
  if(!/^\d{4}-\d{2}-\d{2}$/.test(value ?? ''))return null;
  const time=Date.parse(value+'T00:00:00Z');
  return Number.isFinite(time) && new Date(time).toISOString().slice(0,10)===value ? time : null;
 };
 if(!input.departure && !input.returnDate && !input.renewal)return {days:Number(input.days),crossesRenewal:false};
 if(!input.departure || !input.returnDate)return {error:'Enter both departure and return dates, or clear all dates.'};
 const start=parse(input.departure), end=parse(input.returnDate), renewal=input.renewal ? parse(input.renewal) : null;
 if(start===null || end===null || end<start || (input.renewal && renewal===null))return {error:'Enter valid dates with return on or after departure.'};
 const days=(end-start)/86400000+1;
 if(days>3660)return {error:'Trip dates must span no more than 3,660 days.'};
 return {days,crossesRenewal:renewal!==null && start<renewal && renewal<=end};
}

export function evaluate(input, data){
 const insurers=data.insurers, countries=data.countries;
 const market=data.markets.find(x=>x.id===input.market);
 const insurer=insurers.find(x=>x.id===input.insurer && x.market===input.market);
 const tier=insurer?.tiers.find(x=>x.id===input.tier);
 const dest=countries[input.destination];
 const dates=tripDates(input);
 if(dates.error)return dates;
 const days=dates.days, usedKnown=input.used !== null && input.used !== undefined && input.used !== '';
 const used=usedKnown ? Number(input.used) : null;
 if(!market || !insurer || !tier || !dest || !Number.isInteger(days) || days<1 || days>3660 || (usedKnown && (!Number.isInteger(used) || used<0 || used>3660))){
  return {error:'Check your selections. Trip days must be 1–3,660 and used days must be 0–3,660.'};
 }
 const homeCountry=market.countryCode;
 const domestic=homeCountry===dest.code || (market.id==='uk' && dest.code==='ni');
 let level='unknown', reason='', status='needs-check', note='', annual=null, perTrip=null, unspecified=null, basis='unknown';
 const extra=[];
 const sourceIds=[...insurer.sourceIds];
 // Use destination-specific official guidance, not the Canada article as proof of Mexico terms.
 if(insurer.id==='allstate' && dest.code==='mx')sourceIds.splice(0,sourceIds.length,'allstate-mx');
 if(insurer.id==='allstate' && dest.code==='ca')sourceIds.splice(0,sourceIds.length,'allstate-ca');
 if(insurer.id==='state-farm' && dest.code==='mx')sourceIds.splice(0,sourceIds.length,'statefarm-mx');
 const published=insurer.verifiedDestinations?.includes(dest.code) || false;
 const ukStatutory=data.ukMinimumCountries.includes(dest.code);
 const named=!insurer.id.startsWith('other-');
 const green=greenCard({market:market.id, destination:dest.code, data});
 sourceIds.push(...green.sourceIds);
 if(domestic){
  level='unknown'; status='needs-check'; basis='domestic';
  reason=`This is within the country where your policy was issued. Your current schedule—not our international table—controls your home cover.`;
  note='Check your active policy schedule, permitted drivers, vehicle use and exclusions.';
 } else if(!named){
  reason='Insurer-specific terms not researched. Official country guidance does not establish your insurer’s cover, exclusions or allowance.';
 } else if(market.id==='uk'){
  if(dest.code==='ie' && ['direct-line','tesco'].includes(insurer.id)){
   // Direct Line current policy booklet p35; Tesco's current published Ireland exception.
   basis='insurer';level='same';status='confirmed';annual=null;
   perTrip=insurer.id==='tesco'?90:null;
   reason=insurer.id==='tesco'
     ? 'Tesco publishes the cover shown on your policy schedule in the Republic of Ireland for a stay no longer than 90 consecutive days. The EU policy-year allowance is a separate rule.'
     : 'Direct Line policy booklet (12/2025, p35) states that use in the Republic of Ireland receives the same cover as the domestic territorial limits, with specific ancillary exclusions.';
   extra.push('The Republic of Ireland is not Northern Ireland. Check courtesy-car and legal-expenses exclusions and your issued wording.');
  } else if(published && named){
   level=tier.level;
   status=(level==='same' ? 'confirmed' : 'minimum');
   basis='insurer';
   reason=level==='same' ? `${insurer.name} publishes extended cover in ${dest.name} for this tier, at the level of your UK policy. Cover is conditional on your actual schedule and exclusions.` : `${insurer.name} publishes only the local legal minimum for this tier in covered European countries; damage to your own car is not included under that benefit.`;
   annual=insurer.irelandYearExempt && dest.code==='ie' ? null : (tier.annual ?? null);
   perTrip=tier.perTrip ?? null;
   unspecified=tier.unspecified ?? null;
   if(tier.note) note=tier.note;
   if(dest.code==='ie' && insurer.irelandYearExempt){
    extra.push('This insurer excludes the Republic of Ireland from its published foreign-use day allowance.');
   }
  } else if(ukStatutory){
   level='minimum'; status='minimum'; basis='government'; sourceIds.push('uk-government');
   reason= named ? `UK rules provide minimum third-party cover for ${dest.name}, but we cannot verify this insurer’s enhanced protection for this destination.` : `GOV.UK confirms that active UK car insurance provides the legal minimum third-party cover for ${dest.name}. Any extended protection and day cap require your insurer’s wording.`;
   extra.push('The statutory minimum is not the same as comprehensive own-car protection.');
  } else {
   reason=`No verified insurer-specific promise was found for ${insurer.name} in ${dest.name}. Do not rely on your domestic policy without written confirmation.`;
   extra.push('Check transit-country rules and whether locally issued insurance is required.');
  }
 } else if(market.id==='ie'){
  if((dest.code==='gb'||dest.code==='ni') && ['aviva-ie','allianz-ie','123ie'].includes(insurer.id)){
   level='same'; status='confirmed'; basis='insurer';
   reason=`${insurer.name} lists the UK within its normal territorial cover. The overseas EU trip limit below does not apply to this territorial journey.`;
   extra.push('Any optional roadside assistance may have a smaller geographic area than motor insurance.');
  } else if(published && named){
   basis='insurer'; level=tier.level;
   status=level==='same' ? 'confirmed' : 'minimum';
   annual=tier.annual ?? null; perTrip=tier.perTrip ?? null; unspecified=tier.unspecified ?? null;
   if(insurer.id==='123ie' && tier.id==='approved'){
    reason=`123.ie says full EU policy cover can be extended for up to 30 days on request. This outcome applies only if the extension was approved for your exact trip.`;
    extra.push('If you have not received 123.ie’s confirmation, switch to “Standard (no extension)” instead.');
   } else if(insurer.id==='123ie'){
    reason=`123.ie provides the minimum legal motor cover in EU countries automatically. Full Irish policy cover requires you to arrange an extension before departure.`;
   } else if(insurer.id==='aviva-ie'){
    reason=`Aviva Ireland says it automatically extends your existing car-insurance policy within the EU for up to 31 days. Its overview does not specify how those days are counted or every benefit included.`;
   } else {
    reason=`Allianz Ireland states that the policy cover selected at home extends to continental Europe for up to 60 days in the insurance period, subject to its wording.`;
   }
   if(tier.note) note=tier.note;
  } else {
   reason=`An insurer-specific level of cover for ${dest.name} is not confirmed here. Request a territorial-cover statement and the applicable policy booklet.`;
   if(dest.region==='eu') extra.push('EU/EEA motor-insurance minimums may apply, but your individual cover and limits still need confirmation.');
  }
 } else if(market.id==='us'){
  if(dest.code==='ca' && ['allstate','state-farm'].includes(insurer.id)){
   basis='insurer-general';level='unknown';status='needs-check';
   reason=insurer.id==='allstate'
    ? 'Allstate explains that many U.S. auto policies can extend their selected coverages to Canada for short visits, but its article does not certify this individual Allstate policy or a fixed stay limit. Ask Allstate to review your declarations.'
    : 'State Farm educational guidance says Canada can be an exception to typical overseas restrictions; it does not verify your specific personal auto policy. Ask your State Farm agent to confirm all insured coverages and any duration limit.';
   extra.push('Canadian province and residency requirements vary. Confirm liability limits, insured drivers and own-car physical damage separately.');
  } else if(dest.code==='mx' && ['allstate','state-farm'].includes(insurer.id)){
   basis='insurer-general';level='unknown';status='needs-check';
   reason=`${insurer.name} advises that U.S. domestic auto policies should not be relied on to satisfy Mexican motor-liability requirements. Arrange valid Mexican-issued liability insurance before crossing; your own-car damage benefit is not verified here.`;
   extra.push('Mexican border-zone exceptions and cover endorsements require direct confirmation; do not treat them as general Mexican insurance.');
  } else if(dest.code==='ca' && ['progressive','geico','usaa'].includes(insurer.id)){
   basis='insurer'; level=tier.level;
   status=level==='liability' ? 'liability' : 'confirmed';
   if(insurer.id==='usaa') reason='USAA says a USAA-insured personal vehicle meets or exceeds Canadian liability requirements. It does not confirm every own-car damage benefit in this FAQ.';
   else reason=`${insurer.name} confirms that the selected U.S. personal auto policy generally extends to Canada. The actual coverages and limits remain those on your own declarations.`;
   extra.push('For longer stays, registration and residency rules may require a local policy.');
  } else if(dest.code==='mx' && ['progressive','geico','usaa'].includes(insurer.id)){
   basis='insurer'; level='excluded'; status='not-covered';
   reason=`${insurer.name} states that your normal U.S. auto insurance does not provide the Mexican-issued liability insurance required to drive in Mexico. Arrange a qualifying Mexico policy before crossing.`;
   extra.push('A US coverage exception for damage near the Texas border, where applicable, does not replace Mexican liability insurance.');
  } else if(dest.code!=='ca' && ['progressive','geico'].includes(insurer.id)){
   basis='insurer'; level='excluded'; status='not-covered';
   reason=`${insurer.name} advises that its normal U.S. auto policy does not provide standard overseas motor insurance for ${dest.name}. Arrange local or international insurance accepted at your destination.`;
  } else {
   reason=`We cannot verify this U.S. insurer’s coverage for your own car in ${dest.name}. U.S. coverage cannot safely be assumed to follow you internationally.`;
   if(dest.code==='mx') extra.push('Mexico generally requires liability insurance issued by an authorised Mexican insurer.');
  }
 } else if(market.id==='ca'){
  if(insurer.id==='icbc' && dest.code==='us'){
   basis='insurer'; level='liability'; status='liability';
   reason='ICBC confirms that Autoplan Basic insurance covers vacation driving in the United States, including Alaska and Hawaii. Collision, comprehensive and optional benefits depend on what you purchased.';
   extra.push('Check your cover limits when driving in a jurisdiction where lawsuits and damage costs may differ.');
  }else if(insurer.id==='icbc'){
   basis='insurer'; level='excluded'; status='not-covered';
   reason=`ICBC’s Basic Autoplan wording confines its coverage to Canada and the United States. It does not extend to ${dest.name}. Arrange acceptable local insurance before driving.`;
  }else{
   reason=`No verified coverage rule for this Canadian insurer in ${dest.name} is available. Contact your insurer or provincial broker before you travel.`;
  }
 } else if(market.id==='au'){
  if(insurer.id==='racv' && tier.id!=='complete'){
   basis='insurer'; level='excluded';status='not-covered';
   reason=`The cited RACV Motor Insurance policy wording excludes loss or damage occurring outside Australia. It does not provide a verified international own-car benefit for ${dest.name}.`;
   extra.push('If you plan to ship your vehicle, check import permits and a specialist marine/transit policy as well as local road insurance.');
  }else{
   reason=`Australian domestic car cover cannot be presumed to cover your own vehicle in ${dest.name}. Confirm with the insurer and the destination authority before shipping or driving.`;
  }
 } else if(market.id==='nz'){
  if(insurer.id==='ami'){
   basis='insurer'; level='excluded';status='not-covered';
   reason=`The cited AMI car policy wording explicitly excludes incidents outside New Zealand. Obtain separate accepted cover if taking the vehicle to ${dest.name}.`;
   extra.push('Confirm the policy edition and check both transport insurance and destination road-insurance requirements.');
  }else{
   reason=`New Zealand domestic car cover cannot be presumed to extend to your own vehicle in ${dest.name}. Check the current policy wording and local registration rules.`;
  }
 }
 const exceeding=[];
 if(annual!==null && usedKnown && days+used>annual) exceeding.push(`Your ${days}-day trip plus ${used} previously used foreign-use days exceeds the ${annual}-day policy-year allowance.`);
 if(perTrip!==null && days>perTrip) exceeding.push(`Your ${days}-day trip exceeds the ${perTrip}-day per-trip allowance.`);
 if(unspecified!==null && days>unspecified) exceeding.push(`Your ${days}-day trip exceeds the insurer’s published ${unspecified}-day figure. The overview does not clarify whether it is per trip or per policy year.`);
 const exceeded=exceeding.length>0;
 // An annual allowance cannot be assessed when previous foreign-use days are unknown.
 // Never display a positive general-cover outcome as if the remaining allowance were known.
 // A marketing summary with an unspecified counting basis is not enough to
 // determine whether this specific trip fits the published allowance.
 if(unspecified!==null && status==='confirmed'){
  status='needs-check';
  extra.push(`The ${unspecified}-day overseas allowance does not clearly state whether it resets per trip or per policy year. Obtain confirmation for your dates.`);
 }
 // An arranged extension is not a measured allowance without the insurer's approval document.
 if(market.id==='uk' && ((insurer.id==='direct-line' && tier.id==='comp-ext') || (insurer.id==='churchill' && tier.id==='comp-ext')) && status==='confirmed' && dest.code!=='ie'){
  status='needs-check';
  reason=`${insurer.name} describes an arranged foreign-use extension, but no trip-specific approval, duration or conditions have been supplied. Confirm your own extension certificate or endorsement in writing.`;
  extra.push('The foreign-use extension is only relevant if the insurer has approved it for your own policy and travel dates.');
 }
 if(annual!==null && !usedKnown && level==='same' && status==='confirmed'){
  status='needs-check';
  reason=`${insurer.name} publishes up to ${annual} days of extended foreign-use cover per policy year for ${tier.name}. How many days have already been used is unknown, so we cannot tell whether this trip fits the allowance. Check your policy-year total before relying on enhanced cover.`;
  extra.push('Your insurer can confirm the remaining annual allowance and whether an extension is available.');
 }

 if(exceeded){
  reason=exceeding.join(' ') + ' The enhanced-cover outcome no longer applies without an approved extension.';
  if(market.id==='uk' && ukStatutory && tier.level==='same'){
   level='minimum';status='limited';sourceIds.push('uk-government');
   extra.push('UK statutory third-party cover is the baseline, but you must confirm continued legal cover with the insurer before exceeding the published allowance.');
  } else if(market.id==='ie' && insurer.id==='allianz-ie' && dest.region==='eu'){
   level='minimum';status='limited';
   extra.push('Allianz Ireland wording provides an EU legal-minimum baseline; confirm any further limitations directly.');
  }else if(market.id==='ie' && insurer.id==='123ie' && dest.region==='eu'){
   level='minimum';status='limited';
   extra.push('123.ie publishes automatic EU legal-minimum protection separately from the requested full-cover extension.');
  }else{
   level='unknown';status='needs-check';
  }
 }
 const limits=[];
 if(annual!==null) limits.push(`${annual} days total / policy year`);
 if(perTrip!==null) limits.push(`${perTrip} days / single trip`);
 if(unspecified!==null) limits.push(`${unspecified} days (counting basis not specified)`);
 if(annual===null && perTrip===null && unspecified===null){
  limits.push((named && tier.level==='same' && (insurer.id==='saga' && tier.id==='plus')) ? 'No published annual day cap' : 'No verified fixed day limit');
 }
 if(insurer.preTravelNotice){extra.push(insurer.preTravelNotice);}
 const actionList=[];
 if(status==='not-covered') actionList.push('Buy or arrange destination-valid motor liability insurance before driving.');
 if(status==='limited') actionList.push('Ask the insurer to extend your full-cover period and confirm the change in writing.');
 if(status==='needs-check') actionList.push('Ask your insurer to confirm each destination, trip dates, remaining annual days, permitted drivers and cover level in writing.');
 if(status==='minimum') actionList.push('Ask for an optional extension if you want own-car damage, theft or fire cover abroad.');
 if(status==='liability') actionList.push('Check your declarations for collision, comprehensive and roadside assistance outside your home area.');
 if(status==='confirmed') actionList.push('Confirm that your policy schedule and edition explicitly include this tier and destination.');
 if(insurer.preTravelNotice)actionList.push(insurer.preTravelNotice);
 if(['uk','ie'].includes(market.id)) actionList.push('Carry your motor insurance certificate, licence and vehicle registration/ownership papers.');
 if(['us','ca'].includes(market.id)) actionList.push('Carry your current insurance identification/declarations and vehicle registration.');
 if(['au','nz'].includes(market.id)) actionList.push('Confirm temporary import, registration and transit/shipping protection before transport.');
 if(green.kind==='may') actionList.push('Ask your insurer for the required Green Card or border-insurance documents in advance.');
 if(dest.code==='mx' && ['us','ca'].includes(market.id)) actionList.push('Purchase Mexican-issued liability coverage for the specific vehicle and trip.');
 actionList.push('Check insurance rules for every country on your route, plus breakdown/recovery cover.');
 if(annual!==null && dates.crossesRenewal){
  if(status==='confirmed')status='needs-check';
  extra.push('Your trip crosses the entered renewal date. The allowance reset and renewed policy edition are not verified; no automatic split or renewed allowance has been assumed.');
  actionList.unshift('Ask the insurer to confirm cover and day counting on both sides of renewal.');
 }
 const label=!named ? 'Insurer-specific terms not researched' : fullLabel(level);
 const remaining=annual===null || !usedKnown || dates.crossesRenewal ? null : Math.max(0,annual-used);
 const remainingAfterTrip=remaining===null ? null : Math.max(0,annual-used-days);
 const excludedBenefit=market.id==='au' && insurer.id==='racv' ? 'ownCar' : 'liability';
 const unavailable=!named ? 'not-researched' : basis==='insurer-general' ? 'insufficient-evidence' : 'confirmation-required';
 const benefits={
  liability:{state:level==='same'||level==='minimum'||level==='liability' ? 'published' : level==='excluded' && excludedBenefit==='liability' ? 'explicit-exclusion' : unavailable, detail:level==='minimum' ? 'Legal-minimum baseline only; confirm continued validity and applicable limits.' : level==='same'||level==='liability' ? 'Published liability protection; your active policy and limits still apply.' : 'Destination-valid liability must be confirmed separately.'},
  ownCar:{state:!named ? 'not-researched' : level==='same' ? 'published' : level==='minimum' || (level==='excluded' && excludedBenefit==='ownCar') ? 'explicit-exclusion' : 'confirmation-required',detail:level==='same' ? 'Equivalent to the cover you actually purchased, subject to exclusions and overseas allowance.' : level==='minimum' ? 'Own-car damage and theft are not part of the identified legal-minimum benefit.' : 'Own-car damage and theft are not verified for this journey.'},
  breakdown:{state:'not-researched',detail:'Breakdown, recovery, courtesy car and legal costs are not established by motor cover. Check the separate assistance wording.'},
  documents:{state:green.kind==='check'||green.kind==='may'||green.kind==='na' ? 'confirmation-required' : 'published',detail:green.title+' — '+green.detail},
  notification:{state:insurer.preTravelNotice ? 'published' : 'not-researched',detail:insurer.preTravelNotice || 'Pre-travel notification and approval requirements have not been established. Ask your insurer.'}
 };
 const claims=claimEvidence(market.id,insurer.id,tier.id,dest.code,insurer.verifiedDestinations || [],input.asOf || new Date().toISOString().slice(0,10));
 const states=claims.flatMap(c=>c.observations.map(o=>o.state));
 const researchState=states.includes('conflicting') ? 'conflicting' : states.includes('unavailable') ? 'unavailable' : states.includes('overdue') ? 'overdue' : states.length && states.every(s=>s==='current') ? 'partial-reviewed' : named ? 'unreviewed' : 'not-researched';
 if(['conflicting','overdue','unavailable'].includes(researchState)){
  status='needs-check';extra.push('Supporting research is '+researchState+'. Confirm the affected claims before relying on the published outcome.');
 }
 const officialGuidance=!named && market.id==='uk' && ukStatutory ? {sourceIds:['uk-government'],detail:'GOV.UK describes a legal-minimum baseline for active UK motor insurance in this country. It does not verify an unlisted insurer, enhanced cover or your personal policy.'} : null;
 return {
  releaseId:RELEASE_ID,researchState,claims,officialGuidance,
  status, level, label, reason, note, extra, insurer, tier, dest, market,
  days,used,usedKnown,annual,perTrip,unspecified,remaining,remainingAfterTrip,benefits,crossesRenewal:dates.crossesRenewal,exceeded,limitText:limits.join(' · '),
  green,sourceIds:[...new Set(sourceIds)],actionList,checkedOn:data.checkedOn,
  confidence:basis==='insurer' ? 'General insurer wording · not your certificate' : basis==='government' ? 'Government legal-minimum rule · not your certificate' : 'Insurer-specific evidence unavailable',
  disclosure:'Research result only—not confirmation of your personal cover. Check your certificate, policy booklet, schedule, renewal edition and endorsements with your insurer before driving.'
 };
}

export function greenCard({market,destination,data}){
 if(market==='uk'){
  if(destination==='gi')return {kind:'check',title:'Gibraltar proof: confirm separately',detail:'Gibraltar is not an EU member. Ask the insurer and Gibraltar border authorities which policy documents are accepted.',sourceIds:['uk-government']};
  if(data.greenCardFreeUK.includes(destination)) return {kind:'no',title:'No Green Card normally required',detail:'Valid motor insurance is still required. Carry your certificate and check transit countries.',sourceIds:['uk-government','uk-mib']};
  if(data.greenCardMayNeedUK.includes(destination)) return {kind:'may',title:'Green Card / local proof likely needed',detail:'Ask the insurer about proof of cover and whether border insurance is necessary. Confirm paper requirements before travel.',sourceIds:['uk-government','uk-mib']};
  return {kind:'check',title:'Check proof-of-insurance rules',detail:'Your insurer and the destination authority must confirm accepted proof and any mandatory local policy.',sourceIds:['uk-government']};
 }
 if(market==='ie'){
  if(destination==='gb'||destination==='ni') return {kind:'no',title:'No Green Card for Ireland → UK',detail:'Carry an Irish insurance certificate/disc and other relevant vehicle documents.',sourceIds:['axa-ie']};
  if(data.countries[destination]?.region==='eu') return {kind:'no',title:'No Green Card for EU driving',detail:'Valid Irish motor insurance and ordinary proof are still required.',sourceIds:['axa-ie']};
  return {kind:'check',title:'Check Green Card and border proof',detail:'Requirements depend on country, your insurer and where the vehicle is registered.',sourceIds:['axa-ie']};
 }
 if(destination==='mx' && (market==='us'||market==='ca')) return {kind:'local',title:'Mexican liability insurance required',detail:'The European Green Card is not a substitute for Mexican-issued motor liability insurance.',sourceIds:market==='us'?['progressive']:['icbc-booklet']};
 return {kind:'na',title:'European Green Card not applicable',detail:'Check the destination’s insurance-card, local-policy and vehicle-import requirements instead.',sourceIds:[]};
}

export function getMatrixSample(data,market){
 const chosen=data.insurers.filter(x=>x.market===market && !x.id.startsWith('other-'));
 const dests={uk:['fr','ie','es','tr'],ie:['gb','fr','es'],us:['ca','mx','fr'],ca:['us','mx','fr'],au:['nz','us'],nz:['au','us']}[market]||[];
 return {insurers:chosen,destinations:dests.map(x=>data.countries[x]),
  records:chosen.map(i=>({insurer:i,chosenTier:i.tiers[0],cells:dests.map(d=>evaluate({market,insurer:i.id,tier:i.tiers[0].id,destination:d,days:14,used:0},data))}))};
}


/**
 * Checks all declared countries of one single trip. Trip days are NOT added per stop:
 * a 14-day France/Belgium road trip consumes at most one 14-day period, not 28 days.
 * The full trip duration is conservatively applied to every stop because the
 * user has not supplied dates within each country. Unlisted transit stops remain
 * outside scope and require separate checking. Return the worst actionable verdict.
 */
export function evaluateRoute(input,data){
 const stops=Array.isArray(input.stops) ? input.stops : [input.destination];
 if(!stops.length || stops.length>5 || stops.some(v=>typeof v!=='string') || new Set(stops).size!==stops.length){
  return {error:'Choose one to five different countries for this journey.'};
 }
 const results=stops.map(destination=>evaluate({...input,destination},data));
 const invalid=results.find(r=>r.error);
 if(invalid) return invalid;
 const weight={'not-covered':6,'limited':5,'needs-check':4,'minimum':3,'liability':3,'confirmed':1};
 // Stable tie-breaking: keep first occurrence when the severity is equal.
 const most=results.reduce((a,b)=>weight[b.status]>weight[a.status]?b:a);
 if(results.length===1){return {...most,stops:results,route:stops};}
 const counts=results.reduce((acc,r)=>(acc[r.status]=(acc[r.status]||0)+1,acc),{});
 const notReady=results.filter(r=>r.status!=='confirmed');
 const reasons=notReady.length ?
  `${notReady.length} of ${results.length} countries need attention. Highest-priority stop: ${most.dest.name}. ${most.reason}` :
  `Published enhanced cover was located for each selected country and the trip length entered. This is still not a confirmation of your individual policy or any undeclared transit countries.`;
 const actionList=[...new Set(results.flatMap(r=>r.actionList))];
 actionList.unshift('Check the entire route with the insurer, including every transit country and the exact travel dates.');
 const docs=results.filter(r=>r.green.kind==='may'||r.green.kind==='local');
 const green=docs.length ? {kind:'check',title:`${docs.length} stop${docs.length===1?'':'s'} need extra document checks`,detail:docs.map(r=>`${r.dest.name}: ${r.green.title}`).join(' · '),sourceIds:[...new Set(docs.flatMap(r=>r.green.sourceIds))]} : {kind:'na',title:'See documents for each country',detail:'Each country’s evidence and document rules are listed below.',sourceIds:[]};
 return {
  ...most,route:stops,stops:results,routeCounts:counts, reason:reasons,green,actionList,
  dest:results.at(-1).dest,
  label:results.every(r=>r.level===results[0].level) ? results[0].label : 'Cover level varies by country',
  sourceIds:[...new Set(results.flatMap(r=>r.sourceIds))],
  extra:[...new Set([...most.extra, 'Trip days are conservatively applied to each stop, but counted once for the trip. The checker cannot see your route dates or any undeclared transit countries.'])],
  confidence:results.every(r=>r.confidence.startsWith('General insurer')) ? 'Published insurer terms for each listed stop · verify your issued policy' : results.some(r=>r.confidence.startsWith('General insurer')) ? 'Mixed insurer/government evidence · confirm each stop' : 'Insurer-specific evidence missing for this route',
  disclosure:'Whole-route research, not an insurance certificate. Unlisted transit countries and actual trip dates are not assessed. Confirm every border with the insurer and authorities.'
 };
}
