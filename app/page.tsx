import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  FileText,
  MessagesSquare,
  UserRound,
} from "lucide-react";

import { Brand } from "@/components/layout/brand";
import { buttonVariants } from "@/components/ui/button";

const FEATURES = [
  {
    icon: UserRound,
    title: "Perfil único e completo",
    description:
      "Cadastre sua formação, experiências e habilidades uma única vez. Esses dados alimentam todas as outras funcionalidades da plataforma.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Vagas organizadas automaticamente",
    description:
      "Cole o texto de uma vaga e a IA extrai e estrutura os requisitos, responsabilidades e informações principais para você revisar antes de salvar.",
  },
  {
    icon: FileText,
    title: "Currículo sob medida",
    description:
      "Gere um currículo personalizado para cada vaga, combinando seu perfil com os requisitos da vaga, e exporte o resultado em PDF.",
  },
  {
    icon: MessagesSquare,
    title: "Simulado de entrevista com feedback",
    description:
      "Converse com um entrevistador de IA baseado na vaga e no seu perfil, e receba pontos fortes, pontos a melhorar e uma pontuação ao final.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-background/72 backdrop-blur-[18px] backdrop-saturate-150">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" aria-label="TWJobs AI">
            <Brand />
          </Link>
          <nav className="flex items-center gap-2">
            <Link href="/login" className={buttonVariants({ variant: "ghost" })}>
              Entrar
            </Link>
            <Link
              href="/register"
              className={buttonVariants({ variant: "cta", className: "max-sm:hidden" })}
            >
              Criar conta
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center">
        <section className="relative w-full overflow-hidden">
          <div aria-hidden className="bg-glow absolute inset-0" />
          <div aria-hidden className="bg-grid absolute inset-0" />
          <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-7 px-4 py-24 text-center sm:px-6 sm:py-32">
            <span className="inline-flex items-center gap-2 rounded-full border border-cta/45 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-cta">
              <span className="size-2 rounded-full bg-cta shadow-[0_0_8px_var(--cta)]" />
              TWJobs AI
            </span>
            <h1 className="text-[clamp(2.4rem,6vw,3.6rem)] leading-[1.05] font-bold tracking-[-0.04em] text-foreground">
              Prepare-se para a vaga certa com a{" "}
              <span className="text-primary">IA do seu lado</span>
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-body">
              Monte seu perfil uma única vez, deixe a IA adaptar seu currículo
              para cada vaga, treine para a entrevista e receba um feedback
              honesto antes do dia real.
            </p>
            <div className="flex w-full flex-col justify-center gap-3 pt-2 sm:w-auto sm:flex-row">
              <Link href="/register" className={buttonVariants({ variant: "cta", size: "lg" })}>
                Criar minha conta
                <ArrowRight data-icon="inline-end" />
              </Link>
              <Link href="/login" className={buttonVariants({ variant: "outline", size: "lg" })}>
                Já tenho conta
              </Link>
            </div>
          </div>
        </section>

        <section className="w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">
              Da vaga à entrevista
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              O que a plataforma faz por você
            </h2>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {FEATURES.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group flex flex-col gap-4 rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/40 sm:p-8"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex size-11 items-center justify-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/30">
                      <Icon className="size-5" />
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-base leading-7 text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:px-6">
          <Brand />
          <p>Currículos e entrevistas com IA para quem busca a vaga certa.</p>
        </div>
      </footer>
    </div>
  );
}
