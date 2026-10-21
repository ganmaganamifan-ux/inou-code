type Trait = 'insight' | 'empathy' | 'drive' | 'caution' | 'bond' | 'chaos';
type Rarity = 'N' | 'R' | 'SR' | 'SSR' | 'UR';
type Choice = { label: string; next: string; trust?: number; intel?: number };
type Scene = { id: string; ch: number; bg: string; speaker: string; text: string; portrait?: string; next?: string; choices?: Choice[]; battle?: 'hunter' | 'cleaner' | 'observer'; end?: boolean };
type Enemy = { id: 'hunter' | 'cleaner' | 'observer'; name: string; title: string; hp: number; strike: number; pattern: number[]; tells: string[]; portrait: string; desc: string };

const traits: { id: Trait; name: string; kind: string; ability: string; rarity: Rarity; desc: string; skill: string; tip: string; color: string }[] = [
  { id: 'insight', name: '観測者', kind: '洞察', ability: '未来視', rarity: 'SR', desc: '数秒先の攻撃軌道が視える。未来は確定ではない。', skill: '予測反撃', tip: '次の攻撃をかわして9ダメージ。敵の強攻撃に強い。', color: '#8be1f7' },
  { id: 'empathy', name: '共鳴者', kind: '共感', ability: '読心', rarity: 'R', desc: '言葉の裏にある感情や衝動が聞こえる。', skill: '心音同調', tip: '自分を8回復し、敵に6ダメージ。', color: '#b4a0fc' },
  { id: 'drive', name: '突破者', kind: '行動', ability: '限界突破', rarity: 'SR', desc: '自分の限界を超えて短時間だけ力を引き出す。', skill: '超過駆動', tip: '体力3を消費して20ダメージ。', color: '#ff9a77' },
  { id: 'caution', name: '潜行者', kind: '慎重', ability: '注意逸らし', rarity: 'R', desc: '他人の認識の隙間に自分の存在を隠す。', skill: '影に溶ける', tip: '8ダメージを与え、敵の次の攻撃を無効化。', color: '#9db6d4' },
  { id: 'bond', name: '守護者', kind: '協調', ability: '感覚共有', rarity: 'R', desc: '心が通じた相手の感覚を一時的に重ねる。', skill: '共振防壁', tip: '7ダメージ＋次の被ダメージを5軽減。', color: '#85e8c6' },
  { id: 'chaos', name: '変転者', kind: '自由', ability: '残響複写', rarity: 'SSR', desc: '直前に見た能力の性質を不完全な形で再現する。', skill: '残響反転', tip: '敵の攻撃力に応じたダメージを返す。', color: '#f2c47e' },
];

const quiz: { q: string; opts: { text: string; trait: Trait }[] }[] = [
  { q: '知らない誰かが助けを求めている。最初の行動は？', opts: [{text:'周囲の状況を確かめる',trait:'insight'},{text:'すぐに手を差し伸べる',trait:'empathy'},{text:'危険でも飛び込む',trait:'drive'}] },
  { q: '一度だけ特別な才能を得るとしたら？', opts: [{text:'誰にも気づかれず動く力',trait:'caution'},{text:'仲間を守り抜く力',trait:'bond'},{text:'ルールを書き換える力',trait:'chaos'}] },
  { q: '友人が重大な秘密を隠していた。', opts: [{text:'理由を聞いて理解したい',trait:'empathy'},{text:'証拠を集めて確かめる',trait:'insight'},{text:'秘密ごと受け止める',trait:'bond'}] },
  { q: '勝てそうにない敵が現れたら？', opts: [{text:'先に仕掛けて突破口を作る',trait:'drive'},{text:'身を隠し、隙を待つ',trait:'caution'},{text:'予想外の方法を試す',trait:'chaos'}] },
  { q: 'あなたが一番苦手なのは？', opts: [{text:'誰かが傷つくこと',trait:'empathy'},{text:'自分の無力さ',trait:'drive'},{text:'仲間がバラバラになること',trait:'bond'}] },
  { q: '暗号が書かれた扉を見つけた。', opts: [{text:'規則性を探す',trait:'insight'},{text:'危険な仕掛けを警戒する',trait:'caution'},{text:'別の開け方を考える',trait:'chaos'}] },
  { q: '誰かと対立したときに大切なのは？', opts: [{text:'まず相手の気持ち',trait:'empathy'},{text:'譲れない自分の信念',trait:'drive'},{text:'関係を壊さないこと',trait:'bond'}] },
  { q: '三つの鍵がある。どれを選ぶ？', opts: [{text:'詳しい説明のある鍵',trait:'insight'},{text:'誰にも気づかれない鍵',trait:'caution'},{text:'何が起きるかわからない鍵',trait:'chaos'}] },
  { q: '力を手に入れたことを、誰に話す？', opts: [{text:'まず信頼できる友人',trait:'bond'},{text:'何も言わず状況を見る',trait:'caution'},{text:'信じてくれそうな人',trait:'empathy'}] },
  { q: '最後の選択。あなたが欲しい未来は？', opts: [{text:'誰も予想しない未来',trait:'chaos'},{text:'自分で切り拓く未来',trait:'drive'},{text:'真実が明かされる未来',trait:'insight'}] },
];

const archiveEntries: { category: string; entries: {name:string; rarity:Rarity}[] }[] = [
  {category:'身体・変身',entries:[{name:'鋼鉄皮膚',rarity:'N'},{name:'瞬足',rarity:'N'},{name:'獣爪',rarity:'N'},{name:'夜行眼',rarity:'N'},{name:'怪力',rarity:'R'},{name:'反射神経',rarity:'R'},{name:'限界突破',rarity:'SR'},{name:'超再生',rarity:'SR'},{name:'分身',rarity:'SR'},{name:'適応進化',rarity:'SSR'}]},
  {category:'元素・物質',entries:[{name:'火花',rarity:'N'},{name:'水流',rarity:'N'},{name:'砂操作',rarity:'N'},{name:'金属感知',rarity:'N'},{name:'雷撃',rarity:'R'},{name:'氷結',rarity:'R'},{name:'磁力操作',rarity:'R'},{name:'爆裂',rarity:'SR'},{name:'物質造形',rarity:'SR'},{name:'質量変換',rarity:'SSR'}]},
  {category:'感知・情報',entries:[{name:'気配探知',rarity:'N'},{name:'足跡追跡',rarity:'N'},{name:'遠隔聴覚',rarity:'N'},{name:'温度視覚',rarity:'N'},{name:'嘘感知',rarity:'R'},{name:'弱点看破',rarity:'R'},{name:'危険予感',rarity:'R'},{name:'残留記憶',rarity:'SR'},{name:'未来視',rarity:'SR'},{name:'全域観測',rarity:'SSR'}]},
  {category:'支援・拘束',entries:[{name:'防壁',rarity:'N'},{name:'粘着',rarity:'N'},{name:'治癒',rarity:'N'},{name:'声の投影',rarity:'N'},{name:'拘束鎖',rarity:'R'},{name:'感覚共有',rarity:'R'},{name:'能力阻害',rarity:'R'},{name:'傷の転写',rarity:'SR'},{name:'効果反響',rarity:'SR'},{name:'等価交換',rarity:'SSR'}]},
  {category:'精神・幻覚',entries:[{name:'感情視覚',rarity:'N'},{name:'声真似',rarity:'N'},{name:'鎮静',rarity:'N'},{name:'恐怖投影',rarity:'R'},{name:'注意逸らし',rarity:'R'},{name:'読心',rarity:'R'},{name:'幻覚領域',rarity:'SR'},{name:'残響複写',rarity:'SSR'},{name:'強制命令',rarity:'SSR'},{name:'本心契約',rarity:'UR'}]},
  {category:'空間・法則',entries:[{name:'距離測定',rarity:'N'},{name:'小物収納',rarity:'N'},{name:'重力感知',rarity:'N'},{name:'座標交換',rarity:'R'},{name:'無音領域',rarity:'R'},{name:'短距離転移',rarity:'R'},{name:'時間加速',rarity:'SR'},{name:'空間折曲',rarity:'SR'},{name:'空間断裂',rarity:'SSR'},{name:'因果逆転',rarity:'UR'}]},
];

const enemies: Enemy[] = [
 {id:'hunter',name:'追跡者・ハウンド',title:'REGISTRY / 009',hp:33,strike:6,pattern:[0,1,0,2],tells:['機械の右腕がこちらを狙っている。','青白い光が銃口に集まっていく……','足を踏み込み、こちらの隙を探っている。','危険！ すべてを薙ぎ払う構えだ。'],portrait:'hunter',desc:'隔離区の巡回機。対象の異能反応を感知する。'},
 {id:'cleaner',name:'清掃者・シロ',title:'REGISTRY / 026',hp:45,strike:7,pattern:[1,0,2,0],tells:['眼鏡の奥に光が宿る。何かを仕込んでいる。','シャッターを下ろすような動き。','危険！ 足元の影がこちらを包み込む。','次の瞬間、鋭い針が飛んでくる。'],portrait:'cleaner',desc:'「街の均衡」を守るという不気味な執行人。'},
 {id:'observer',name:'観測者・ゼロ',title:'UNKNOWN / 000',hp:56,strike:8,pattern:[0,2,1,2,0],tells:['空中の数字が一つずつ消えていく。','危険！ 青い環が大きく開いた。','相手は何もせず、こちらを見ている……','危険！ 地面に黒い亀裂が走る。','ゼロがこちらの行動を模倣しようとしている。'],portrait:'observer',desc:'能力を持つ者の行動を記録する「第零信号」。'},
];

const scenes: Scene[] = [
 {id:'c1_1',ch:1,bg:'city',speaker:'SYSTEM',text:'20XX年  8月17日  23:49\n都市外縁「第13区」にて、すべての通信が途絶えた。',next:'c1_2'},
 {id:'c1_2',ch:1,bg:'city',speaker:'主人公',portrait:'hero',text:'……なんだ？ スマホに知らないアプリが入ってる。削除できない。',next:'c1_3'},
 {id:'c1_3',ch:1,bg:'scan',speaker:'SYSTEM',text:'「CODE」起動。あなたの深層特性を検出しました。\n固有異能：{ability}\n適合タイプ：{type}',next:'c1_4'},
 {id:'c1_4',ch:1,bg:'street',speaker:'主人公',portrait:'hero',text:'ふざけてるのか……？ それより、街が静かすぎる。誰も電話に出ない。',next:'c1_5'},
 {id:'c1_5',ch:1,bg:'street',speaker:'？？？',portrait:'aoi',text:'そこの人！ 動かないで。右の路地から、あれが来る！',next:'c1_6'},
 {id:'c1_6',ch:1,bg:'street',speaker:'アオイ',portrait:'aoi',text:'私はアオイ。あなたも能力者でしょ？ あの巡回機に見つかると連れていかれる。',next:'c1_choice'},
 {id:'c1_choice',ch:1,bg:'street',speaker:'主人公',portrait:'hero',text:'どうする？ 見知らぬ少女を信用していいのか。',choices:[
  {label:'アオイと一緒に逃げる',next:'c1_trust',trust:2},
  {label:'状況を観察してから動く',next:'c1_watch',intel:2}
 ]},
 {id:'c1_trust',ch:1,bg:'street',speaker:'アオイ',portrait:'aoi',text:'……ありがとう。信じてくれるんだね。私、必ず出口を見つけるから。',next:'c1_7'},
 {id:'c1_watch',ch:1,bg:'street',speaker:'主人公',portrait:'hero',text:'巡回機のセンサーは、数秒ごとに光っている。……動くなら、その間だ。',next:'c1_7'},
 {id:'c1_7',ch:1,bg:'street',speaker:'SYSTEM',text:'警告：異能反応を検知。\n接近する脅威が存在します。戦闘プログラムを起動。',next:'c1_after',battle:'hunter'},
 {id:'c1_after',ch:1,bg:'street',speaker:'アオイ',portrait:'aoi',text:'勝った……！ あんな相手に一人で勝つなんて。あなた、本当に初めてなの？',next:'c1_8'},
 {id:'c1_8',ch:1,bg:'rooftop',speaker:'アオイ',portrait:'aoi',text:'区画の中央に「塔」がある。みんなそこを目指してる。でも、戻ってきた人はいない。',next:'c1_9'},
 {id:'c1_9',ch:1,bg:'rooftop',speaker:'主人公',portrait:'hero',text:'どのみち、この街に閉じ込められたままじゃ終われない。塔へ行こう。',next:'c1_end'},
 {id:'c1_end',ch:1,bg:'rooftop',speaker:'SYSTEM',text:'第1話 クリア\n称号「はじまりの異能者」を獲得。',next:'c2_1',end:true},

 {id:'c2_1',ch:2,bg:'rooftop',speaker:'アオイ',portrait:'aoi',text:'第13区には三つの勢力がいるの。脱出を目指す連合、能力者を狩る清掃局……そして、素性の分からない「観測者」。',next:'c2_2'},
 {id:'c2_2',ch:2,bg:'station',speaker:'主人公',portrait:'hero',text:'駅の改札で誰かが倒れている。まだ息がある。',next:'c2_3'},
 {id:'c2_3',ch:2,bg:'station',speaker:'カイ',portrait:'kai',text:'待ってくれ……！ 追われているんだ。俺はカイ。清掃局から逃げてきた。',next:'c2_4'},
 {id:'c2_4',ch:2,bg:'station',speaker:'アオイ',portrait:'aoi',text:'その首の刻印……清掃局の関係者じゃないの？ 話が違う。',next:'c2_choice'},
 {id:'c2_choice',ch:2,bg:'station',speaker:'主人公',portrait:'hero',text:'カイを連れていく？ それとも、ここで情報を引き出す？',choices:[
  {label:'カイを仲間に迎える',next:'c2_trust',trust:2},
  {label:'刻印の意味を問い詰める',next:'c2_interrogate',intel:2}
 ]},
 {id:'c2_trust',ch:2,bg:'station',speaker:'カイ',portrait:'kai',text:'……助かった。恩は必ず返す。俺の能力は「反射」。飛び道具なら少しだけ跳ね返せる。',next:'c2_5'},
 {id:'c2_interrogate',ch:2,bg:'station',speaker:'カイ',portrait:'kai',text:'この刻印は……清掃局に記録された証拠だ。俺は逃亡者だよ。嘘ならここで置いていってくれ。',next:'c2_5'},
 {id:'c2_5',ch:2,bg:'station',speaker:'？？？',portrait:'cleaner',text:'感動の再会中に失礼。第13区では「記録外の異能」は認められていません。',next:'c2_6'},
 {id:'c2_6',ch:2,bg:'station',speaker:'清掃者・シロ',portrait:'cleaner',text:'私の仕事は、能力者の数を減らすこと。あなたの {ability} ……観測させてください。',next:'c2_7'},
 {id:'c2_7',ch:2,bg:'station',speaker:'アオイ',portrait:'aoi',text:'あの人、攻撃する直前に眼鏡が光った！ 何かの合図かもしれない。',next:'c2_8'},
 {id:'c2_8',ch:2,bg:'station',speaker:'SYSTEM',text:'警告：高脅威の異能者。\n敵の構えを読み、戦闘を有利に進めてください。',battle:'cleaner',next:'c2_after'},
 {id:'c2_after',ch:2,bg:'station',speaker:'清掃者・シロ',portrait:'cleaner',text:'……記録にない反応。あなたには「名前」があるのですね。ならば塔へ。答えは上にあります。',next:'c2_9'},
 {id:'c2_9',ch:2,bg:'station',speaker:'カイ',portrait:'kai',text:'シロの能力は「視線固定」。先読みできれば恐ろしくない。でも、塔にいる奴は別だ……。',next:'c2_10'},
 {id:'c2_10',ch:2,bg:'rooftop',speaker:'アオイ',portrait:'aoi',text:'ねえ。私たち、この先も一緒に行けるかな。正直、すごく怖い。',next:'c2_choice2'},
 {id:'c2_choice2',ch:2,bg:'rooftop',speaker:'主人公',portrait:'hero',text:'アオイの目は、こちらから逸れない。',choices:[
  {label:'何があっても一緒に帰る',next:'c2_promise',trust:2},
  {label:'まず真実を突き止めよう',next:'c2_truth',intel:2}
 ]},
 {id:'c2_promise',ch:2,bg:'rooftop',speaker:'アオイ',portrait:'aoi',text:'……約束だよ。絶対に、破らないでね。',next:'c2_end'},
 {id:'c2_truth',ch:2,bg:'rooftop',speaker:'アオイ',portrait:'aoi',text:'そうだね。真実がわかれば、きっと帰る方法も見つかる。',next:'c2_end'},
 {id:'c2_end',ch:2,bg:'rooftop',speaker:'SYSTEM',text:'第2話 クリア\n記録：「塔の中枢」が解放されました。',next:'c3_1',end:true},

 {id:'c3_1',ch:3,bg:'tower',speaker:'SYSTEM',text:'第13区・中央観測塔\n異能反応：53体。 うち52体、行動停止。',next:'c3_2'},
 {id:'c3_2',ch:3,bg:'tower',speaker:'カイ',portrait:'kai',text:'ここまで来たのは正解だったのか……。塔の上に、全部の能力の情報が集まってるらしい。',next:'c3_3'},
 {id:'c3_3',ch:3,bg:'tower',speaker:'？？？',portrait:'observer',text:'いらっしゃい、コード保有者。あなたが最後の一人です。',next:'c3_4'},
 {id:'c3_4',ch:3,bg:'tower',speaker:'ゼロ',portrait:'observer',text:'私は「第零信号」。あなたの診断、選択、敗北……すべて観測しました。',next:'c3_5'},
 {id:'c3_5',ch:3,bg:'tower',speaker:'主人公',portrait:'hero',text:'何者だ？ 俺たちを閉じ込めたのは、お前か。',next:'c3_6'},
 {id:'c3_6',ch:3,bg:'tower',speaker:'ゼロ',portrait:'observer',text:'閉じ込めた？ 違います。あなたたちは、外の世界から「忘れられた」のです。',next:'c3_7'},
 {id:'c3_7',ch:3,bg:'tower',speaker:'アオイ',portrait:'aoi',text:'嘘……！ そんなこと、あるはずがない！',next:'c3_8'},
 {id:'c3_8',ch:3,bg:'tower',speaker:'ゼロ',portrait:'observer',text:'証明しましょう。あなたの選択が、本当にあなた自身のものなのか。',next:'c3_9'},
 {id:'c3_9',ch:3,bg:'tower',speaker:'SYSTEM',text:'最終戦闘：第零信号\n警告：敵は戦闘パターンを学習します。危険表示に注意。',battle:'observer',next:'c3_after'},
 {id:'c3_after',ch:3,bg:'tower',speaker:'ゼロ',portrait:'observer',text:'理解しました。観測できないのは、能力ではなく……あなたが誰かを信じた瞬間。',next:'c3_10'},
 {id:'c3_10',ch:3,bg:'tower',speaker:'SYSTEM',text:'【異常発生】\n塔の崩壊まで残り60秒。\n中枢に真実の記録が残されています。',next:'c3_choice'},
 {id:'c3_choice',ch:3,bg:'tower',speaker:'主人公',portrait:'hero',text:'塔が崩れ始めた。倒れたアオイが助けを呼ぶ。一方、目の前では秘密の記録が開こうとしていた。',choices:[
  {label:'アオイを救出する',next:'c3_rescue',trust:3},
  {label:'真実の記録を確保する',next:'c3_record',intel:3}
 ]},
 {id:'c3_rescue',ch:3,bg:'tower',speaker:'アオイ',portrait:'aoi',text:'なんで戻ってきたの……？ もう出口が……。でも、ありがとう。',next:'c3_bridge'},
 {id:'c3_record',ch:3,bg:'tower',speaker:'SYSTEM',text:'極秘記録を取得。\n【観測対象13-001】最初の実験体：アオイ。\n……彼女は、あなたより前から塔を知っていた。',next:'c3_bridge'},
 {id:'c3_bridge',ch:3,bg:'city',speaker:'カイ',portrait:'kai',text:'見ろ。隔離されてた街の向こうに、もう一つの街が見える。……まさか、これが「外」の世界か？',next:'c3_end'},
 {id:'c3_end',ch:3,bg:'city',speaker:'SYSTEM',text:'第3話 クリア\n体験版ストーリー終了。あなたの選択によって、続きの運命は変わる。',end:true}
];

export const GameData = { traits, quiz, archiveEntries, enemies, scenes, chapterNames: ['','覚醒の夜','偽りの仲間','第零信号'] };
