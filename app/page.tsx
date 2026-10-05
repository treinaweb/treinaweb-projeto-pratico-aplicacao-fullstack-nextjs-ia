import Link from "next/link";

const FEATURES = [
  {
    title: "Perfil único e completo",
    description:
      "Cadastre sua formação, experiências e habilidades uma única vez. Esses dados alimentam todas as outras funcionalidades da plataforma.",
  },
  {
    title: "Vagas organizadas automaticamente",
    description:
      "Cole o texto de uma vaga e a IA extrai e estrutura os requisitos, responsabilidades e informações principais para você revisar antes de salvar.",
  },
  {
    title: "Currículo sob medida",
    description:
      "Gere um currículo personalizado para cada vaga, combinando seu perfil com os requisitos da vaga, e exporte o resultado em PDF.",
  },
  {
    title: "Simulado de entrevista com feedback",
    description:
      "Converse com um entrevistador de IA baseado na vaga e no seu perfil, e receba pontos fortes, pontos a melhorar e uma pontuação ao final.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 flex-col items-center">
        <section className="flex w-full max-w-3xl flex-col items-center gap-6 px-6 py-24 text-center sm:py-32">
          <span className="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            TWJobs AI
          </span>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-black sm:text-5xl dark:text-zinc-50">
            Prepare-se para a vaga certa com a IA do seu lado
          </h1>
          <p className="max-w-xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Monte seu perfil uma única vez, deixe a IA adaptar seu currículo
            para cada vaga, treine para a entrevista e receba um feedback
            honesto antes do dia real.
          </p>
          <div className="flex flex-col gap-4 pt-4 text-base font-medium sm:flex-row">
            <Link
              href="/register"
              className="flex h-12 items-center justify-center rounded-full bg-foreground px-6 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
            >
              Criar minha conta
            </Link>
            <Link
              href="/login"
              className="flex h-12 items-center justify-center rounded-full border border-solid border-black/[.08] px-6 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
            >
              Já tenho conta
            </Link>
          </div>
        </section>

        <section className="w-full max-w-5xl px-6 py-16 sm:py-20">
          <h2 className="text-center text-2xl font-semibold tracking-tight text-black sm:text-3xl dark:text-zinc-50">
            O que a plataforma faz por você
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-black/[.08] bg-white p-6 dark:border-white/[.145] dark:bg-zinc-950"
              >
                <h3 className="text-lg font-semibold text-black dark:text-zinc-50">
                  {feature.title}
                </h3>
                <p className="mt-2 text-base leading-7 text-zinc-600 dark:text-zinc-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
