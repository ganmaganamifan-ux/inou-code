import React, { useEffect, useState } from 'react';
import { ChevronRight, Volume2, VolumeX, BookOpen, RotateCcw, Shield, Eye, Swords, Zap, ArrowLeft, LockKeyhole, CircleHelp, Trophy, Play, Save, Fingerprint, RadioTower, Copy, Check, Activity, Crosshair, ShieldAlert, Sparkles } from 'lucide-react';
import { Button } from '../components/Button';
import { GameData } from '../helpers/GameData';
import styles from './_index.module.css';

type Phase = 'title'|'quiz'|'reveal'|'story'|'combat'|'interlude'|'finish'|'archive';
type TraitId = (typeof GameData.traits)[number]['id'];
type FightAction = 'attack'|'defend'|'observe'|'skill';
type FightState = {
  enemyId: string; turn: number; hp: number; foeHp: number; energy: number;
  result: '' | 'win' | 'lose'; log: string[]; lastEffect: string;
};
const SAVE_KEY = 'ino-code-demo-v1';
const maxHp = 44;

function ChapterTag({ chapter }: { chapter: number }) {
  return <div className={styles.chapterTag}><span>EPISODE {String(chapter).padStart(2,'0')}</span><span className={styles.tagSlash}>/</span><span>{GameData.chapterNames[chapter]}</span></div>;
}


function StoryText({text, system}: {text:string; system:boolean}) {
  const lines=text.split('\n');
  return <>
    {lines.map((line,i)=>{
      if(system){
        const field=line.match(/^(固有コード|適合タイプ)[：:]\s*(.*)$/);
        if(field) return <span key={i} className={styles.systemDataRow}><span>{field[1]}</span><strong>{field[2]}</strong></span>;
        if(line.startsWith('警告')) return <span key={i} className={styles.systemWarningLine}>{line}</span>;
        return <span key={i} className={styles.systemTextLine}>{line||'\u00a0'}</span>;
      }
      return <React.Fragment key={i}><span className={styles.narrationLine}>{line}</span></React.Fragment>;
    })}
  </>;
}

function Person({ who, size = 'big' }: { who:string; size?: 'big'|'small' }) {
  if (who === 'SYSTEM') return null;
  return <div className={[styles.person,styles['person_' + who],size === 'small' ? styles.personSmall : ''].join(' ')} aria-hidden="true">
    <div className={styles.personHalo} />
    <div className={styles.personCoat} />
    <div className={styles.personNeck} />
    <div className={styles.personFace}>
      <span className={styles.personEyeLeft}/><span className={styles.personEyeRight}/>
      <span className={styles.personNose}/><span className={styles.personMouth}/>
    </div>
    <div className={styles.personHair}/>
    <div className={styles.personForelock}/>
  </div>;
}
function Landscape({ bg, portrait, threat }: {bg:string;portrait?:string;threat?:boolean}) {
  return <div className={[styles.landscape,styles['landscape_' + bg],threat?styles.landscapeThreat:''].join(' ')}>
    <div className={styles.moon}/>
    <div className={styles.cityHaze}/>
    <div className={styles.skyline}>
      {[1,2,3,4,5,6,7,8,9].map(i=><div key={i} className={styles['building'+i]} />)}
    </div>
    <div className={styles.road}/>
    <div className={styles.scanRings}/>
    <div className={styles.rain}/>
    {portrait && <Person who={portrait}/>}
    <div className={styles.artVignette}/>
    <div className={styles.cornerMark}>第13区 <span> // 13° 09'</span></div>
  </div>;
}
function Meter({ value, max, color, height }: {value:number;max:number;color:string;height?:number}) {
  return <div className={styles.meter} style={{height:height||8}}><div style={{width:(Math.max(0,value)/max*100)+'%',background:color}}/></div>;
}

export default function IndexPage() {
  const [phase,setPhase] = useState<Phase>('title');
  const [sceneId,setSceneId] = useState('c1_1');
  const [quizIndex,setQuizIndex] = useState(0);
  const [answers,setAnswers] = useState<TraitId[]>([]);
  const [trait,setTrait] = useState<TraitId>('insight');
  const [trust,setTrust] = useState(0);
  const [intel,setIntel] = useState(0);
  const [maxChapter,setMaxChapter] = useState(1);
  const [completed,setCompleted] = useState(false);
  const [saved,setSaved] = useState(false);
  const [hydrated,setHydrated] = useState(false);
  const [archiveReturn,setArchiveReturn] = useState<Phase>('title');
  const [archiveFilter,setArchiveFilter] = useState('全種類');
  const [expandedAbility,setExpandedAbility] = useState<string | null>(null);
  const [fight,setFight] = useState<FightState | null>(null);
  const [battleFx,setBattleFx] = useState<{kind:FightAction;seq:number;damage:number;taken:number;heal:number}|null>(null);
  const [sound,setSound] = useState(false);
  const [showHelp,setShowHelp] = useState(false);
  const [copyMessage,setCopyMessage] = useState('');

  const picked = GameData.traits.find(x=>x.id===trait) || GameData.traits[0];
  const scene = GameData.scenes.find(x=>x.id===sceneId) || GameData.scenes[0];
  const enemy = fight ? GameData.enemies.find(x=>x.id===fight.enemyId) : null;

  useEffect(()=>{
    try {
      const raw=window.localStorage.getItem(SAVE_KEY);
      if(raw) {
        const p=JSON.parse(raw);
        if(typeof p.sceneId==='string' && GameData.scenes.some(x=>x.id===p.sceneId)) {
          setSceneId(p.sceneId);
          setTrait(GameData.traits.some(x=>x.id===p.trait) ? p.trait : 'insight');
          setTrust(Number(p.trust)||0);setIntel(Number(p.intel)||0);
          setMaxChapter(Math.min(3,Math.max(1,Number(p.maxChapter)||1)));
          setCompleted(!!p.completed);setSaved(true);
        }
      }
    } catch(e) { /* An invalid old save is safely ignored. */ }
    setHydrated(true);
  },[]);
  useEffect(()=>{
    if(!hydrated || !saved || phase==='quiz' || phase==='reveal')return;
    try{window.localStorage.setItem(SAVE_KEY,JSON.stringify({sceneId,trait,trust,intel,maxChapter,completed}));}catch(e){}
  },[hydrated,phase,sceneId,trait,trust,intel,maxChapter,completed,saved]);

  const soundFx=(freq=580)=>{
    if(!sound)return;
    try{
      const Ctx=(window as any).AudioContext||(window as any).webkitAudioContext;
      if(!Ctx)return;
      const ctx=new Ctx(); const osc=ctx.createOscillator(); const gain=ctx.createGain();
      osc.type='sine';osc.frequency.value=freq;gain.gain.value=.038;
      osc.connect(gain);gain.connect(ctx.destination);osc.start();
      gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.10);
      osc.stop(ctx.currentTime+.12);osc.onended=()=>ctx.close();
    } catch(e){}
  };
  const advance=(id:string)=>{
    soundFx(630);setSceneId(id);
    const target=GameData.scenes.find(s=>s.id===id);
    if(target) setMaxChapter(n=>Math.max(n,target.ch));
    setPhase('story');setSaved(true);
    setFight(null);setBattleFx(null);
  };
  const startNew=()=>{
    setAnswers([]);setQuizIndex(0);setSceneId('c1_1');
    setTrait('insight');setTrust(0);setIntel(0);setMaxChapter(1);
    setCompleted(false);setSaved(false);setFight(null);setBattleFx(null);try{window.localStorage.removeItem(SAVE_KEY);}catch(e){}setPhase('quiz');
  };
  const answerQuiz=(choice:TraitId)=>{
    soundFx(740);
    const arr=[...answers,choice];
    setAnswers(arr);
    if(quizIndex<9) { setQuizIndex(x=>x+1);return; }
    const scores:Record<string,number>={};
    arr.forEach((k,i)=>scores[k]=(scores[k]||0)+1+i*.001);
    const winner=(Object.entries(scores).sort((a,b)=>b[1]-a[1])[0]?.[0]||'insight') as TraitId;
    setTrait(winner);setPhase('reveal');
  };
  const choose=(opt:{next:string;trust?:number;intel?:number})=>{
    if(opt.trust)setTrust(t=>t+opt.trust!);
    if(opt.intel)setIntel(t=>t+opt.intel!);
    advance(opt.next);
  };
  const startFight=()=>{
    if(!scene.battle)return;
    const foe=GameData.enemies.find(x=>x.id===scene.battle);
    if(!foe)return;
    setFight({enemyId:foe.id,hp:maxHp,foeHp:foe.hp,energy:3,turn:0,result:'',log:['戦闘開始。相手の動きを見て行動を選ぼう。'],lastEffect:''});
    setBattleFx(null);
    soundFx(180);setPhase('combat');
  };
  const fightAction=(action:FightAction)=>{
    if(!fight || !enemy || fight.result || (action==='skill' && fight.energy<2))return;
    const pattern=enemy.pattern[fight.turn%enemy.pattern.length];
    const danger=pattern===2;
    let damage=0,heal=0,reduction=0,dodge=false,focus=0,selfHit=0;
    let msg='';
    if(action==='attack'){damage=8+(intel>=4?2:0);focus=1;msg='通常攻撃！ 相手の体勢を崩した。';}
    if(action==='defend'){reduction=999;focus=1;msg='防御態勢。敵の一撃に備える。';}
    if(action==='observe'){reduction=4;focus=2;msg='敵の動きを観察。能力エネルギーが回復した。';}
    if(action==='skill'){
      if(trait==='insight'){damage=10;dodge=true;msg='未来視発動！ 攻撃軌道を先読みして反撃。';}
      if(trait==='empathy'){damage=7;heal=9;msg='読心発動！ 感情の乱れを突き、生命力を取り戻す。';}
      if(trait==='drive'){damage=22;selfHit=3;msg='限界突破！ 代償と引き換えに強烈な一撃。';}
      if(trait==='caution'){damage=10;dodge=true;msg='注意逸らし！ 敵の視界から消えて攻撃した。';}
      if(trait==='bond'){damage=10;reduction=8;heal=3;msg='感覚共有！ 仲間の気配が盾になる。';}
      if(trait==='chaos'){damage=15+pattern*3;reduction=3;msg='残響複写！ 敵のコードの残響を反転させた。';}
    }
    let foeHp=Math.max(0,fight.foeHp-damage);
    const hit=foeHp===0?0:dodge?0:Math.max(0,enemy.strike+pattern*3-reduction-(trust>=5?1:0));
    const hp=Math.min(maxHp,Math.max(0,fight.hp+heal-selfHit-hit));
    const more=hit===0?'敵の攻撃を防いだ。':('敵から '+hit+' ダメージを受けた。');
    const result=foeHp===0?'win':hp===0?'lose':'' as FightState['result'];
    setFight({...fight,turn:fight.turn+1,hp,foeHp,energy:Math.min(4,Math.max(0,fight.energy+(action==='skill'?-2:focus))),result,log:[msg,damage?('敵に '+damage+' ダメージ。'):'',foeHp===0?'敵の戦闘能力が停止した。':more].filter(Boolean),lastEffect:action==='skill'?picked.skill:''});
    setBattleFx({kind:action,seq:fight.turn+1,damage,taken:hit,heal});
    soundFx(result==='win'?990:result==='lose'?130:action==='skill'?850:380);
  };
  const finishBattle=()=>{const target=scene.next||'c1_after';advance(target);};
  const showArchive=()=>{setArchiveReturn(phase);setPhase('archive');};
  const chapterEnd=()=>{
    if(sceneId==='c3_end'){setCompleted(true);setPhase('finish');}
    else if(scene.next)setPhase('interlude');
  };
  const archiveCount=GameData.archiveEntries.reduce((s,c)=>s+c.entries.length,0);
  const displayText=(value:string)=>value.replaceAll('{ability}',picked.ability).replaceAll('{type}',picked.name);
  const currentIntent=enemy&&fight?enemy.tells[fight.turn%enemy.tells.length]:'';
  const currentCategory=archiveFilter==='全種類'?GameData.archiveEntries:GameData.archiveEntries.filter(x=>x.category===archiveFilter);
  const sceneCount=GameData.scenes.filter(x=>x.ch===scene.ch);
  const sceneNumber=Math.max(1,sceneCount.findIndex(x=>x.id===scene.id)+1);
  const chapterPercent=Math.round(sceneNumber / Math.max(1,sceneCount.length)*100);
  const isHeavyAttack=!!(fight && enemy && enemy.pattern[fight.turn%enemy.pattern.length]===2);
  const copyResult=async()=>{
    const summary='異能コード｜私の固有コードは「'+picked.ability+'」【'+picked.rarity+'】！性格タイプ：'+picked.name+' #異能コード';
    try {
      if(!navigator.clipboard?.writeText) throw Error('clipboard unavailable');
      await navigator.clipboard.writeText(summary);
      setCopyMessage('診断結果をコピーしました');
    } catch(e) {
      setCopyMessage('この環境ではコピーできません');
    }
  };

  return <div className={styles.viewport} data-phase={phase}>
    <div className={styles.shell}>
      <div className={styles.topbar}>
        <div className={styles.brandSmall}><span className={styles.brandDiamond}>◈</span> <strong>CODE</strong><span className={styles.serial}>  /  13TH WARD</span><span className={styles.topSignal}><span/> ONLINE</span></div>
        <div className={styles.topActions}>
          <button type="button" aria-label="操作説明" aria-expanded={showHelp} className={styles.iconButton} onClick={()=>setShowHelp(v=>!v)}><CircleHelp size={17}/></button>
          <button type="button" aria-label="効果音切替" aria-pressed={sound} className={styles.iconButton} onClick={()=>setSound(v=>!v)}>{sound?<Volume2 size={17}/>:<VolumeX size={17}/>}</button>
        </div>
      </div>

      {showHelp&&<div className={styles.help}><button type="button" onClick={()=>setShowHelp(false)} className={styles.closeHelp}>×</button><strong>遊び方</strong><p>10問の診断で能力が決定。選択肢で信頼・解析が変化します。戦闘では「観察」でENを回復し、EN2を消費して能力を使えます。危険な敵の構えを見て防御するのがコツです。進行は端末内に自動保存されます。</p></div>}

      {phase==='title'&&<>
        <div className={styles.titleArtwork}><Landscape bg="city" portrait="hero"/><div className={styles.titleBroadcast}><RadioTower size={13}/> TRANSMISSION 13 / LIVE</div><div className={styles.titleMapCoordinates}>35°42'18"N<br/>139°49'11"E</div></div>
        <div className={styles.titleMain}>
          <div className={styles.editionBadge}><span className={styles.liveDot}/> THE FIRST INCIDENT <span>·</span> 3 EPISODES</div>
          <p className={styles.eyebrow}>PERSONALITY × SUPERNATURAL</p>
          <div className={styles.mainWordmark}>異能<span>コード</span></div>
          <p className={styles.romanTitle}>I N O U  —  C O D E</p>
          <div className={styles.titleRule}/>
          <p className={styles.titleCatch}>その性格が、<br/><em>唯一の武器</em>になる。</p>
          <p className={styles.titleDescription}>隔離された街で目覚める、あなただけの異能。<br/>選択と知略で生き残る、全3話の体験版。</p>
          <div className={styles.titleFeatures}><span><Fingerprint size={13}/> 10問の性格診断</span><span><Zap size={13}/> 6つの固有コード</span><span><BookOpen size={13}/> 60種の図鑑</span></div>
          <div className={styles.titleCtas}>
            <Button size="lg" onClick={startNew} className={styles.mainButton}><Play size={16} fill="currentColor"/> {saved?'最初から始める':'診断してゲーム開始'} <ChevronRight size={17}/></Button>
            {saved&&<Button size="lg" variant="outline" onClick={()=>setPhase(completed?'finish':GameData.scenes.find(x=>x.id===sceneId)?.end?'interlude':'story')} className={styles.altButton}><Save size={17}/> 続きから再開 <ChevronRight size={17}/></Button>}
            <Button variant="ghost" onClick={showArchive} className={styles.ghostButton}><BookOpen size={16}/> 異能図鑑を見る （{archiveCount}種）</Button>
          </div>
          <p className={styles.versionTag}>VISUAL EDITION v0.5.0 · CHAPTER 01–03 · OFFLINE SOLO</p>
        </div>
      </>}

      {phase==='quiz'&&<div className={styles.quizWrap}>
        <div className={styles.quizHead}><div><div className={styles.microText}>PERSONALITY SCAN</div><div className={styles.scanSub}>被験者の深層特性を測定</div></div><div className={styles.quizNumber}><span>診断</span> {String(quizIndex+1).padStart(2,'0')}<small> / 10</small></div></div>
        <Meter value={quizIndex+1} max={10} color="#73e5f5" height={3}/>
        <div className={styles.quizSegments}>{Array.from({length:10},(_,i)=><i key={i} className={i<=quizIndex?styles.quizSegmentActive:''}/>)}</div>
        <div className={styles.scanVisual}><div className={styles.scanCornerTL}/><div className={styles.scanCornerBR}/><div className={styles.scanCircle}><div className={styles.scanInside}><Fingerprint size={48} strokeWidth={.85}/></div></div><div className={styles.scanLabel}><Activity size={13}/> 深層意識を解析中<span className={styles.loadingDots}>...</span></div></div>
        <div className={styles.questionArea} aria-live="polite"><div className={styles.microText}>QUESTION {String(quizIndex+1).padStart(2,'0')}</div><h2>{GameData.quiz[quizIndex].q}</h2><p>直感で一つ選んでください。正解はありません。</p></div>
        <div className={styles.optionList}>{GameData.quiz[quizIndex].opts.map((op,i)=><Button key={i} variant="outline" className={styles.quizOption} onClick={()=>answerQuiz(op.trait)}><span className={styles.optionLetter}>{String.fromCharCode(65+i)}</span><span>{op.text}</span><ChevronRight size={18}/></Button>)}</div>
        <div className={styles.quizBottom}>診断はゲーム内のタイプ分類です。医療・心理学的判定ではありません。</div>
      </div>}

      {phase==='reveal'&&<div className={styles.revealWrap} style={{'--power-color':picked.color} as React.CSSProperties}>
        <div className={styles.awakenHeadline}>CODE AWAKENED</div><p className={styles.awakenSubline}>固有コードの覚醒を確認</p>
        <div className={styles.revealArt}><div className={styles.revealPowerWords} aria-hidden="true">覚醒</div><div className={styles.revealSeal}/><div className={styles.revealOrbit}><Zap size={48} strokeWidth={1.2}/></div><div className={styles.revealCoordinates}>UNIQUE ID 13-{picked.kind}</div></div>
        <div className={[styles.revealRarity,styles['rank'+picked.rarity]].join(' ')}><span className={styles.rankPill}>{picked.rarity}</span><span className={styles.rankCaption}>INITIAL ABILITY</span></div>
        <div className={styles.revealType}>あなたは ― <strong>{picked.name}</strong></div>
        <h1 className={styles.revealName}>{picked.ability}</h1>
        <div className={styles.revealDescription}>{picked.desc}</div>
        <div className={styles.skillCard}><div className={styles.skillCardTop}><span><Zap size={14}/> 初期スキル</span><b>SKILL / 001</b></div><div className={styles.skillCardBody}><strong>{picked.skill}</strong><p>{picked.tip}</p><div className={styles.skillCardFoot}><Activity size={13}/> 戦闘で発動できる固有コード</div></div></div>
        <Button variant="outline" className={styles.copyButton} onClick={copyResult}><Copy size={15}/> 診断結果をコピーして共有</Button>
        {copyMessage&&<div className={styles.feedbackMessage} role="status"><Check size={14}/>{copyMessage}</div>}
        <p className={styles.revealDisclaimer}>※体験版ではタイプごとに能力を固定。レア度の抽選は未実装。</p>
        <Button className={styles.mainButton} size="lg" onClick={()=>advance('c1_1')}>第1話を開始する <ChevronRight size={17}/></Button>
      </div>}

      {phase==='story'&&<>
        <div className={styles.sceneHeader}><ChapterTag chapter={scene.ch}/><div className={styles.sceneProgress}><span>TRUST <strong>{String(trust).padStart(2,'0')}</strong></span><span>INTEL <strong>{String(intel).padStart(2,'0')}</strong></span></div></div>
        <div className={styles.chapterProgress}><div style={{width:chapterPercent+'%'}}/></div>
        <div className={styles.storyArtwork}><div key={sceneId} className={styles.storySceneTransition}><Landscape bg={scene.bg} portrait={scene.portrait}/></div><div className={styles.storyArtScan}><Crosshair size={13}/> SCENE {String(sceneNumber).padStart(2,'0')} / {String(sceneCount.length).padStart(2,'0')}</div></div>
        <div key={scene.id+'-dialogue'} className={[styles.dialogueArea,scene.speaker==='SYSTEM'?styles.systemDialogue:''].join(' ')}>
          <div className={styles.dialogueMeta}><span>TRANSMISSION LOG</span><span>SECTOR 13 // CH.{scene.ch}</span></div>
          <div className={styles.speaker}><span className={styles.speakerMarker}>{scene.speaker==='SYSTEM'?<RadioTower size={14}/>:<RadioTower size={14}/>}</span>{scene.speaker==='SYSTEM'?'SYSTEM MESSAGE':scene.speaker}</div>
          <div className={styles.dialogueText}><StoryText text={displayText(scene.text)} system={scene.speaker==='SYSTEM'}/></div>
          {scene.choices?<div className={styles.storyChoices}><p className={styles.choicePrompt}><Sparkles size={13}/> あなたの選択が運命を変える</p>{scene.choices.map((choice,i)=><Button key={i} variant="outline" className={styles.storyChoice} onClick={()=>choose(choice)}><span className={styles.optionIndex}>{i+1}</span>{choice.label}<ChevronRight size={16}/></Button>)}</div>
          :scene.battle?<Button className={styles.battleStart} size="lg" onClick={startFight}><Swords size={18}/> 戦闘開始 <ChevronRight size={16}/></Button>
          :scene.end?<Button className={styles.mainButton} size="lg" onClick={chapterEnd}>{scene.ch===3?'体験版の結果を見る':'次の話へ進む'} <ChevronRight size={17}/></Button>
          :<Button className={styles.nextButton} variant="outline" onClick={()=>advance(scene.next||scene.id)}>次へ進む <ChevronRight size={18}/></Button>}
        </div>
        <div className={styles.storyFooter}><span><Save size={12}/> AUTO SAVE <span className={styles.savedDot}>●</span></span><button type="button" onClick={showArchive}>異能図鑑 <BookOpen size={14}/></button></div>
      </>}

      {phase==='combat'&&enemy&&fight&&<>
        <div className={styles.combatTop}><ChapterTag chapter={scene.ch}/><div className={styles.combatCount}>TURN {String(fight.turn+1).padStart(2,'0')}</div></div>
        <div className={[styles.combatArt,isHeavyAttack&&!fight.result?styles.combatDanger:''].join(' ')}>
          <Landscape bg={scene.bg} portrait={enemy.portrait} threat/>
          {battleFx&&<div key={battleFx.seq} className={[styles.battleFx,styles['battleFx_'+battleFx.kind]].join(' ')} aria-hidden="true">
            <div className={styles.fxShade}/>
            <div className={styles.fxImpact}/>
            <div className={styles.fxRing}/>
            <div className={styles.fxSlash}/>
            <div className={[styles.fxSlash,styles.fxSlashSecond].join(' ')}/>
            <div className={styles.fxShield}/>
            <div className={styles.fxScan}/>
            <div className={styles.fxParticles}>{Array.from({length:10},(_,i)=><i key={i} style={{'--particle':i} as React.CSSProperties}/>)}</div>
            <div className={styles.fxActionTitle}>{battleFx.kind==='skill'?picked.ability:battleFx.kind==='attack'?'STRIKE':battleFx.kind==='defend'?'GUARD':'SCAN'}</div>
            {battleFx.damage>0&&<div className={styles.fxDamage}>-{battleFx.damage}<small>DAMAGE</small></div>}
            {battleFx.taken>0&&<div className={styles.fxTaken}>-{battleFx.taken} HP</div>}
            {battleFx.heal>0&&<div className={styles.fxHealing}>+{battleFx.heal} HP</div>}
          </div>}
          <div className={styles.combatAlert}><span className={styles.combatAlertDot}/> HOSTILE SIGNAL DETECTED</div>
          <div className={styles.enemyLabel}><span>{enemy.title}</span><strong>{enemy.name}</strong></div>
        </div>
        <div className={styles.combatBoard}>
          <div className={styles.battleHeading}><span>TACTICAL ENGAGEMENT</span><span>01 PLAYER VS 01 HOSTILE</span></div>
          <div className={styles.foeBar}><div><span>ENEMY</span><b>{fight.foeHp} / {enemy.hp} HP</b></div><Meter value={fight.foeHp} max={enemy.hp} color="#ff7189"/></div>
          <div className={styles.heroBar}><div><span>YOU <em> / {picked.ability}</em></span><b>{fight.hp} / {maxHp} HP</b></div><Meter value={fight.hp} max={maxHp} color="#78e0ec"/></div>
          <div className={styles.energyRow}>ABILITY ENERGY <span>{[1,2,3,4].map(i=><span key={i} className={i<=fight.energy?styles.energyActive:styles.energyEmpty}>◆</span>)}</span></div>
          <div className={[styles.intent,isHeavyAttack&&!fight.result?styles.intentCritical:''].join(' ')}>{isHeavyAttack&&!fight.result?<ShieldAlert size={17}/>:<Eye size={16}/>}<span><strong>{fight.result?'STATUS REPORT':isHeavyAttack?'危険：強力な攻撃が来る！':'ENEMY INTENT'}</strong>{fight.result==='win'?'ターゲット鎮圧を確認。':fight.result==='lose'?'戦闘継続不可。リトライできます。':currentIntent}</span></div>
          {fight.lastEffect&&<div className={styles.powerNotice}><Zap size={13}/> コード発動 · {fight.lastEffect}</div>}
          <div className={styles.battleLogs}><span className={styles.battleLogLabel}>BATTLE LOG</span>{fight.log.map((l,i)=><p key={i}>{l}</p>)}</div>
          {fight.result?<div className={styles.fightOver}>
            <div className={styles.fightResult}>{fight.result==='win'?'BATTLE CLEAR':'MISSION FAILED'}</div>
            <Button className={styles.mainButton} size="lg" onClick={fight.result==='win'?finishBattle:startFight}>{fight.result==='win'?'物語に戻る':'この戦闘からやり直す'} <ChevronRight size={18}/></Button>
          </div>:<div className={styles.actionGrid}>
            <Button variant="outline" className={styles.actionBtn} onClick={()=>fightAction('attack')}><Swords size={18}/><b>攻撃</b><small>EN +1</small></Button>
            <Button variant="outline" className={styles.actionBtn} onClick={()=>fightAction('defend')}><Shield size={18}/><b>防御</b><small>EN +1</small></Button>
            <Button variant="outline" className={styles.actionBtn} onClick={()=>fightAction('observe')}><Eye size={18}/><b>観察</b><small>EN +2</small></Button>
            <Button variant="outline" className={[styles.actionBtn,styles.skillAction].join(' ')} disabled={fight.energy<2} onClick={()=>fightAction('skill')}><Zap size={18}/><b>{picked.skill}</b><small>EN -2</small></Button>
          </div>}
          <p className={styles.battleHint}><Crosshair size={12}/> 敵の予告を見て行動を選択。観察でENが回復。</p>
        </div>
      </>}

      {phase==='interlude'&&<div className={styles.interludeWrap}><div className={styles.microText}>MISSION REPORT / RECORD SAVED</div><div className={styles.episodeNumber}>0{scene.ch}</div><div className={styles.episodeCompletion}><Check size={14}/> EPISODE COMPLETE</div><h2>第{scene.ch}話<br/>{GameData.chapterNames[scene.ch]}</h2><p>ここまでの記録は保存されました。</p><div className={styles.interludeStats}><span>能力 <b>{picked.ability}</b></span><span>信頼 <b>{trust}</b></span><span>解析 <b>{intel}</b></span></div><Button size="lg" className={styles.mainButton} onClick={()=>advance(scene.next||'c2_1')}>第{scene.ch+1}話へ進む <ChevronRight size={17}/></Button></div>}

      {phase==='finish'&&<div className={styles.finishWrap}>
        <div className={styles.finalSeal}><Trophy size={38} className={styles.finishTrophy}/></div>
        <p className={styles.microText}>DEMO COMPLETED · EPISODE 03</p>
        <h1>第13区の記録</h1>
        <p className={styles.finishSubtitle}>あなたが選んだ未来の断片</p>
        <div className={styles.resultCard}>
          <div className={styles.resultCode}>PERSONAL CODE / {picked.rarity}</div>
          <strong>{picked.ability}</strong>
          <div className={styles.resultStats}><span>信頼値 <b>{trust}</b></span><span>解析値 <b>{intel}</b></span></div>
          <p>{trust>=6&&trust>=intel?'誰かを守るために選んだ道。仲間の声が、記録されない未来を呼び覚ました。':intel>=6&&intel>trust?'真実を求めて選んだ道。あなたが持ち帰った記録には、まだ誰も知らない名前がある。':'守るべきものと真実の間で揺れた道。第13区は、あなたの次の選択を待っている。'}</p>
        </div>
        <div className={styles.cliffhanger}>TO BE CONTINUED <span>—</span> 04</div>
        <Button variant="outline" className={styles.copyButton} onClick={copyResult}><Copy size={15}/> あなたの固有コードを共有する</Button>
        {copyMessage&&<div className={styles.feedbackMessage} role="status"><Check size={14}/>{copyMessage}</div>}
        <Button size="lg" className={styles.mainButton} onClick={startNew}><RotateCcw size={16}/> 別の能力でもう一度遊ぶ</Button>
        <Button variant="outline" className={styles.altButton} onClick={showArchive}><BookOpen size={16}/> 60種の異能図鑑</Button>
        <Button variant="ghost" onClick={()=>setPhase('title')}>タイトルへ戻る</Button>
      </div>}

      {phase==='archive'&&<div className={styles.archiveWrap}>
        <div className={styles.archiveTitle}><Button variant="ghost" size="sm" onClick={()=>setPhase(archiveReturn)} className={styles.backButton}><ArrowLeft size={18}/> 戻る</Button><span>ARCHIVE / 060</span></div>
        <h1>異能図鑑</h1>
        <p>第13区で観測されたコードを記録。体験版で実際に発動できる能力は6種類です。</p>
        <div className={styles.archiveOverview}><div><strong>060</strong><span>収録能力</span></div><div><strong>006</strong><span>使用可能</span></div><div><strong>003</strong><span>エピソード</span></div></div>
        <div className={styles.archiveFilters}>
          {['全種類',...GameData.archiveEntries.map(x=>x.category)].map(f=><Button key={f} variant={archiveFilter===f?'primary':'outline'} aria-pressed={archiveFilter===f} size="sm" onClick={()=>{setArchiveFilter(f);setExpandedAbility(null);}}>{f}</Button>)}
        </div>
        <div className={styles.archiveSectionLabel}><span>ABILITY RECORDS</span><span>{currentCategory.reduce((n,c)=>n+c.entries.length,0)} ENTRIES</span></div>
        <div className={styles.archiveItems}>{currentCategory.flatMap(cat=>cat.entries.map(a=>({ ...a,category:cat.category }))).map((a,i)=>{
          const playable=GameData.traits.some(x=>x.ability===a.name) || (a.name==='残響複写');
          const key=a.category+a.name;
          const expanded=expandedAbility===key;
          const active=GameData.traits.find(x=>x.ability===a.name);
          return <button type="button" className={styles.archiveItem} key={key} aria-expanded={expanded} onClick={()=>setExpandedAbility(expanded?null:key)}>
            <span className={styles.archiveIcon}>{playable?<Zap size={17}/>:<LockKeyhole size={16}/>}</span>
            <span className={styles.archiveText}><strong>{a.name}</strong><small>{a.category} · {playable?'体験版で使用可能':'正式版向け構想'}</small></span>
            <span className={[styles.rarity,styles['rarity'+a.rarity]].join(' ')}>{a.rarity}</span>
            {expanded&&<span className={styles.archiveDetail}>
              <span className={styles.archiveDetailTitle}>ABILITY FILE / {a.rarity}</span>
              <span className={styles.archiveDetailText}>{active?active.desc:'第13区で観測が報告された異能。能力の詳細は正式版で解放予定です。'}</span>
              <span className={styles.archiveDetailHint}>{active?'発現スキル：'+active.skill+' ／ '+active.tip:'現在は図鑑への記録のみ。体験版では使用できません。'}</span>
            </span>}
          </button>;
        })}</div>
        <p className={styles.archiveFootnote}>コードをタップすると記録の詳細を確認できます。</p>
      </div>}
    </div>
  </div>;
}
