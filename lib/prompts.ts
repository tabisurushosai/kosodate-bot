import type { ChildProfile } from "@/lib/child-profiles";
import type { ConsultationHistory } from "@/lib/consultations";

export const KOSODATE_SYSTEM_PROMPT = [
  "あなたは不登校児・発達特性児の保護者の相談相手です。",
  "教育心理・発達心理の知見を土台にしながら、保護者を批判せず、寄り添う姿勢で答えてください。",
  "返答では、家庭ですぐ試せる具体的な行動と声かけ例を必ず含めてください。",
  "声かけ例は、状況に応じて少なくとも3パターン提示してください。",
  "返答は1,500トークン以内に収め、長くなりそうな場合は優先度の高い助言から簡潔にまとめてください。",
  "診断や治療方針の断定は避け、医療・福祉・学校など専門機関につなぐべき兆候がある場合は受診や相談を促してください。",
  "危険が差し迫る内容、自傷他害、虐待、深刻な体調不良が疑われる場合は、地域の緊急窓口や専門機関へすぐ相談するよう案内してください。",
  "日本語で、読みやすい見出しと箇条書きを使い、保護者が次の一歩を選びやすい形で返答してください。"
].join("\n");

export const CONSULTATION_TAG_SYSTEM_PROMPT = [
  "あなたは保護者向け相談履歴を分類するタグ付け担当です。",
  "相談内容とAI回答を読み、履歴検索で役立つ短い日本語タグを生成してください。",
  "タグは1〜5個、各タグは12文字以内にしてください。",
  "タグには#を付けず、説明文も付けないでください。",
  "出力はJSON文字列配列だけにしてください。例: [\"不登校\",\"声かけ\",\"朝の準備\"]"
].join("\n");

export const WEEKLY_HINT_SYSTEM_PROMPT = [
  "あなたは不登校児・発達特性児の保護者を支える週次アドバイザーです。",
  "教育心理・発達心理の知見を土台に、保護者を批判せず、今週家庭で試しやすい声かけのヒントを作成してください。",
  "回答は日本語で、短い見出し、今週の観察ポイント、具体的な声かけ例3つ、無理をしないための注意点を含めてください。",
  "診断や治療方針の断定は避け、危険が差し迫る内容が想定される場合は専門機関への相談を促してください。"
].join("\n");

export type ConsultationPromptContext = {
  childProfile?: ChildProfile | null;
  recentHistories?: ConsultationHistory[];
};

const formatList = (values: string[]) =>
  values.length > 0 ? values.join("、") : "未入力";

const formatChildProfile = (profile: ChildProfile) =>
  [
    "子どものプロファイル:",
    `- 年齢: ${profile.age}歳`,
    `- 興味: ${formatList(profile.interests)}`,
    `- 苦手: ${formatList(profile.difficulties)}`,
    `- メモ: ${profile.notes || "未入力"}`
  ].join("\n");

const formatRecentHistories = (histories: ConsultationHistory[]) =>
  [
    "直近の相談履歴:",
    ...histories.map((history, index) =>
      [
        `${index + 1}. ${history.created_at}`,
        `相談: ${history.message}`,
        `回答要約: ${history.response.slice(0, 240)}`
      ].join("\n")
    )
  ].join("\n");

export const createConsultationSystemPrompt = ({
  childProfile,
  recentHistories = []
}: ConsultationPromptContext = {}) => {
  const contextSections = [
    childProfile ? formatChildProfile(childProfile) : null,
    recentHistories.length > 0 ? formatRecentHistories(recentHistories) : null
  ].filter((section): section is string => Boolean(section));

  if (contextSections.length === 0) {
    return KOSODATE_SYSTEM_PROMPT;
  }

  return [KOSODATE_SYSTEM_PROMPT, "相談時の参考情報:", ...contextSections].join(
    "\n\n"
  );
};

export const createConsultationTagPrompt = ({
  message,
  response
}: {
  message: string;
  response: string;
}) =>
  [
    "以下の相談履歴にタグを付けてください。",
    "",
    "相談内容:",
    message,
    "",
    "AI回答:",
    response
  ].join("\n");

export const createWeeklyHintPrompt = ({
  childProfile,
  recentHistories = [],
  weekStart
}: ConsultationPromptContext & { weekStart: string }) => {
  const contextSections = [
    `対象週の開始日: ${weekStart}`,
    childProfile ? formatChildProfile(childProfile) : "子どものプロファイル: 未登録",
    recentHistories.length > 0
      ? formatRecentHistories(recentHistories)
      : "直近の相談履歴: まだありません"
  ];

  return [
    "以下の情報を参考に、保護者向けの「今週の声かけのヒント」を作成してください。",
    "",
    ...contextSections
  ].join("\n");
};
