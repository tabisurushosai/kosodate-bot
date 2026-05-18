export default function Home() {
  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground">
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl flex-col justify-center gap-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold text-primary">Kosodate Bot</p>
          <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl">
            保護者と支援者のための週次AI相談ボット
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-700">
            不登校や発達特性に関する悩みを、教育心理・発達心理の視点で整理し、次の声かけにつながる具体的な相談体験を提供します。
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="font-semibold">AI相談</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              悩みを自由テキストで入力し、具体的な声かけ例を受け取れます。
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="font-semibold">相談履歴</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              過去の相談を保存し、タグや時系列で振り返れる設計です。
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="font-semibold">子どもプロファイル</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              年齢、特性、興味、苦手を相談コンテキストに活用します。
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
