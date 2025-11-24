"use client";

import { useUser } from "@clerk/nextjs";
import { collection, orderBy, query } from "firebase/firestore";
import { Bot, Loader2, Send, User } from "lucide-react";
import Image from "next/image";
import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { useCollection } from "react-firebase-hooks/firestore";
import { askQuestion } from "@/actions/askQuestion";
import { db } from "@/firebase";
import { cn } from "@/lib/utils";
import type { Message } from "@/types/message";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

function Chat({ id }: { id: string }) {
  const { user } = useUser();
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef(0);

  const [snapshot, loading, error] = useCollection(
    user &&
      query(
        collection(db, "users", user?.id, "files", id, "chat"),
        orderBy("createdAt", "asc"),
      ),
  );

  const messages = useMemo<Message[]>(() => {
    if (!snapshot) return [];

    const firebaseMessages = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        role: data.role,
        message: data.message,
        createdAt: data.createdAt?.toDate() ?? new Date(),
      };
    });

    if (isWaitingForResponse && firebaseMessages.length > 0) {
      const lastMessage = firebaseMessages[firebaseMessages.length - 1];
      if (lastMessage.role === "human") {
        return [
          ...firebaseMessages,
          {
            role: "ai" as const,
            message: "Thinking...",
            createdAt: new Date(),
          },
        ];
      }
    }

    return firebaseMessages;
  }, [snapshot, isWaitingForResponse]);

  useLayoutEffect(() => {
    const currentLength = messages.length;
    if (currentLength !== prevMessagesLengthRef.current && currentLength > 0) {
      prevMessagesLengthRef.current = currentLength;
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!input.trim() || isPending) return;

      const question = input.trim();
      setInput("");
      setIsWaitingForResponse(true);

      startTransition(async () => {
        const { success, message: errorMessage } = await askQuestion(
          id,
          question,
        );
        setIsWaitingForResponse(false);
        if (!success) {
          console.error("Failed to ask question:", errorMessage);
        }
      });
    },
    [input, id, isPending],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-destructive">
        <p>Error loading messages. Please refresh the page.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-4"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <Bot className="size-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">Start a conversation</p>
            <p className="text-sm mt-1">
              Ask questions about your document to get started
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={
                message.id ?? `${message.role}-${message.createdAt.getTime()}`
              }
              className={cn(
                "flex gap-3 max-w-[85%]",
                message.role === "human"
                  ? "ml-auto flex-row-reverse"
                  : "mr-auto",
              )}
            >
              <div
                className={cn(
                  "shrink-0 size-8 rounded-full flex items-center justify-center",
                  message.role === "human"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {message.role === "human" ? (
                  user?.imageUrl ? (
                    <Image
                      src={user?.imageUrl}
                      alt="User"
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <User className="size-4" />
                  )
                ) : (
                  <Bot className="size-4" />
                )}
              </div>

              <div
                className={cn(
                  "rounded-2xl px-4 py-2.5 shadow-sm",
                  message.role === "human"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground",
                )}
              >
                {message.message === "Thinking..." ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap wrap-break-words">
                    {message.message}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t bg-background p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about your document..."
            disabled={isPending}
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                const form = e.currentTarget.closest("form");
                if (form) {
                  const formEvent = new Event("submit", {
                    bubbles: true,
                    cancelable: true,
                  });
                  form.dispatchEvent(formEvent);
                }
              }
            }}
          />
          <Button
            type="submit"
            disabled={!input.trim() || isPending}
            size="icon"
            className="shrink-0"
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </div>
    </div>
  );
}

export default Chat;
