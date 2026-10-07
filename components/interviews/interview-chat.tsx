"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import { endInterviewAction } from "@/app/(app)/interviews/actions";
import {
  ANSWER_MAX_LENGTH,
  INTERVIEW_QUESTION_LIMIT,
} from "@/lib/validation/interview";
import { Button } from "@/components/ui/button";

function textOf(message: UIMessage) {
  return message.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("");
}

function MessageBubble({ message }: { message: UIMessage }) {
  const isInterviewer = message.role === "assistant";
  return (
    <div className={isInterviewer ? "flex justify-start" : "flex justify-end"}>
      <div
        className={
          isInterviewer
            ? "max-w-[85%] rounded-2xl rounded-tl-sm border border-border bg-card px-4 py-3 text-sm text-body"
            : "max-w-[85%] rounded-2xl rounded-tr-sm bg-primary px-4 py-3 text-sm text-primary-foreground"
        }
      >
        <p className="mb-1 text-xs font-medium opacity-60">
          {isInterviewer ? "Entrevistador(a)" : "Você"}
        </p>
        <p className="whitespace-pre-wrap leading-relaxed">{textOf(message)}</p>
      </div>
    </div>
  );
}

export function InterviewChat({
  interviewId,
  initialMessages,
  completed,
}: {
  interviewId: string;
  initialMessages: UIMessage[];
  completed: boolean;
}) {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);
  const [confirmingEnd, setConfirmingEnd] = useState(false);
  const [ending, startEnding] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, error, regenerate, clearError } =
    useChat({
      id: interviewId,
      messages: initialMessages,
      transport: new DefaultChatTransport({
        api: "/api/interview/chat",
        // Only the newest message is sent; the server loads the history.
        prepareSendMessagesRequest: ({ id, messages }) => ({
          body: { id, message: messages.at(-1) },
        }),
      }),
      onFinish: ({ isError, isAbort, isDisconnect }) => {
        if (!isError && !isAbort && !isDisconnect) router.refresh();
      },
    });

  // Interviewer message N asks question N; the one after the last question
  // is the closing message.
  const interviewerMessages = messages.filter(
    (message) => message.role === "assistant" && textOf(message).trim() !== "",
  ).length;
  const closedByInterviewer = interviewerMessages > INTERVIEW_QUESTION_LIMIT;
  const isCompleted = completed || closedByInterviewer;
  const questionNumber = Math.min(interviewerMessages, INTERVIEW_QUESTION_LIMIT);
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = input.trim();
    if (!text) {
      setInputError("Escreva sua resposta antes de enviar.");
      return;
    }
    if (text.length > ANSWER_MAX_LENGTH) {
      setInputError(
        `A resposta deve ter no máximo ${ANSWER_MAX_LENGTH} caracteres.`,
      );
      return;
    }
    setInputError(null);
    sendMessage({ text });
    setInput("");
  }

  function handleEnd() {
    startEnding(async () => {
      await endInterviewAction(interviewId);
      setConfirmingEnd(false);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        {isCompleted ? (
          <span className="rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-body">
            Concluída
          </span>
        ) : (
          <span className="text-sm font-medium text-body">
            Pergunta {questionNumber} de {INTERVIEW_QUESTION_LIMIT}
          </span>
        )}

        {!isCompleted &&
          (confirmingEnd ? (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={handleEnd}
                disabled={ending || busy}
              >
                {ending ? "Encerrando…" : "Confirmar encerramento"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setConfirmingEnd(false)}
                disabled={ending}
              >
                Cancelar
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setConfirmingEnd(true)}
              disabled={busy}
            >
              Encerrar entrevista
            </Button>
          ))}
      </div>

      <div className="flex flex-col gap-3">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {status === "submitted" && (
          <p className="text-sm text-muted-foreground">
            O entrevistador está digitando…
          </p>
        )}
        <div ref={bottomRef} />
      </div>

      {error && (
        <div className="flex flex-wrap items-center gap-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <span>
            Não foi possível obter a resposta do entrevistador.
          </span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              clearError();
              regenerate();
            }}
          >
            Tentar novamente
          </Button>
        </div>
      )}

      {isCompleted ? (
        <p className="text-sm text-muted-foreground">
          Esta entrevista foi concluída. A transcrição acima fica salva para
          consulta.
        </p>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="sticky bottom-0 -mx-4 flex flex-col gap-2 border-t border-border bg-background/90 px-4 pt-3 pb-4 backdrop-blur-md md:-mx-8 md:px-8"
        >
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }
            }}
            rows={4}
            disabled={status !== "ready" || !!error}
            placeholder="Escreva sua resposta… (Enter envia, Shift+Enter quebra linha)"
            className="rounded-lg border border-input bg-input/30 px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-60"
          />
          <div className="flex items-center justify-between gap-4">
            <span
              className={
                input.length > ANSWER_MAX_LENGTH
                  ? "text-xs text-destructive"
                  : "text-xs text-muted-foreground"
              }
            >
              {input.length}/{ANSWER_MAX_LENGTH}
            </span>
            <Button type="submit" disabled={status !== "ready" || !!error}>
              {busy ? "Aguardando…" : "Enviar resposta"}
            </Button>
          </div>
          {inputError && <p className="text-sm text-destructive">{inputError}</p>}
        </form>
      )}
    </div>
  );
}
